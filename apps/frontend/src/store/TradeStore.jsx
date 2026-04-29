import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { TradeContext } from "./TradeContext";
const authStorageKey = "poketrade:userId";

const userMeta = {
  1: {
    city: "Paris",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80",
    bio: "Je collectionne surtout les cartes feu et dragon. J'echange mes doubles pour completer mes sets.",
  },
  2: {
    city: "Lyon",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    bio: "Fan des cartes vintage. Je cherche des cartes eau et electrik en reverse holo.",
  },
  3: {
    city: "Marseille",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80",
    bio: "Je complete des decks competitifs. Je propose beaucoup de cartes dresseur en double.",
  },
};

function normalizeCard(card) {
  return {
    ...card,
    tcgId: card.cardId,
    title: card.name,
    category: card.rarity || card.types,
    description: card.setName,
    image: card.image || "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=500&q=80",
  };
}

function normalizeUser(user) {
  const meta = userMeta[user.id] || {
    city: "France",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80",
    bio: "Collectionneur Pokemon ouvert aux propositions d'echange.",
  };

  return {
    ...user,
    ...meta,
    name: user.username,
    cards: (user.cards || []).map(normalizeCard),
  };
}

function normalizeTrade(trade) {
  return {
    ...trade,
    fromUserId: trade.senderId,
    toUserId: trade.receiverId,
    offeredObjectIds: (trade.senderCards || []).map((card) => card.id),
    requestedObjectIds: (trade.receiverCards || []).map((card) => card.id),
    senderCards: (trade.senderCards || []).map(normalizeCard),
    receiverCards: (trade.receiverCards || []).map(normalizeCard),
    status: trade.status?.toLowerCase() || "pending",
    messages: (trade.comments || []).map((comment) => ({
      id: comment.id,
      authorId: trade.senderId,
      text: comment.content,
      createdAt: comment.createdAt,
    })),
  };
}

function uniqueCards(users, trades) {
  const byId = new Map();
  users.forEach((user) => user.cards.forEach((card) => byId.set(card.id, card)));
  trades.forEach((trade) => {
    trade.senderCards.forEach((card) => byId.set(card.id, card));
    trade.receiverCards.forEach((card) => byId.set(card.id, card));
  });
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
}

export function TradeProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationPending, setMutationPending] = useState(false);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersResult, tradesResult] = await Promise.all([api.getUsers(), api.getNegotiations()]);
      const normalizedUsers = usersResult.map(normalizeUser);
      setUsers(normalizedUsers);
      setTrades(tradesResult.map(normalizeTrade));
      setCurrentUser((previous) => {
        const storedId = Number(localStorage.getItem(authStorageKey));
        const targetId = previous?.id || storedId;
        return normalizedUsers.find((user) => user.id === targetId) || null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur API inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadInitialData);
  }, [loadInitialData]);

  const refreshTrade = useCallback(async (tradeId) => {
    const refreshed = normalizeTrade(await api.getNegotiation(tradeId));
    setTrades((prev) => {
      const exists = prev.some((trade) => trade.id === refreshed.id);
      if (!exists) return [refreshed, ...prev];
      return prev.map((trade) => (trade.id === refreshed.id ? refreshed : trade));
    });
    return refreshed;
  }, []);

  const currentUserId = currentUser?.id || null;

  const value = useMemo(
    () => ({
      currentUser,
      currentUserId: currentUser?.id || null,
      isAuthenticated: Boolean(currentUser),
      loading,
      error,
      mutationPending,
      users,
      cards: uniqueCards(users, trades),
      trades,
      reload: loadInitialData,
      login: async ({ email, password }) => {
        setMutationPending(true);
        try {
          const loggedUser = normalizeUser(await api.login({ email, password }));
          localStorage.setItem(authStorageKey, String(loggedUser.id));
          setCurrentUser(loggedUser);
          setUsers((prev) => {
            const exists = prev.some((user) => user.id === loggedUser.id);
            if (!exists) return [loggedUser, ...prev];
            return prev.map((user) => (user.id === loggedUser.id ? { ...user, ...loggedUser } : user));
          });
          return loggedUser;
        } finally {
          setMutationPending(false);
        }
      },
      logout: () => {
        localStorage.removeItem(authStorageKey);
        setCurrentUser(null);
      },
      setTradeStatus: async (tradeId, status) => {
        setMutationPending(true);
        try {
          const updated =
            status === "accepted" ? await api.acceptNegotiation(tradeId) : await api.refuseNegotiation(tradeId);
          setTrades((prev) => prev.map((trade) => (trade.id === tradeId ? normalizeTrade(updated) : trade)));
        } finally {
          setMutationPending(false);
        }
      },
      addMessage: async (tradeId, _authorId, text) => {
        if (!text.trim()) return;
        setMutationPending(true);
        try {
          const updated = await api.addComment(tradeId, text.trim());
          setTrades((prev) => prev.map((trade) => (trade.id === tradeId ? normalizeTrade(updated) : trade)));
        } finally {
          setMutationPending(false);
        }
      },
      createTrade: async ({ toUserId, offeredObjectIds, requestedObjectIds, message }) => {
        if (!currentUserId) {
          throw new Error("Connexion requise");
        }

        setMutationPending(true);
        try {
          const created = normalizeTrade(
            await api.createNegotiation({
              senderId: currentUserId,
              receiverId: toUserId,
              senderCardIds: offeredObjectIds,
              receiverCardIds: requestedObjectIds,
              message: message.trim() || "Proposition d'echange envoyee.",
            })
          );
          setTrades((prev) => [created, ...prev.filter((trade) => trade.id !== created.id)]);
          await refreshTrade(created.id);
          return created.id;
        } finally {
          setMutationPending(false);
        }
      },
      resolveCardForDisplay: normalizeCard,
    }),
    [currentUser, currentUserId, error, loadInitialData, loading, mutationPending, refreshTrade, trades, users]
  );

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}
