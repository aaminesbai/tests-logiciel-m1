import { createContext, useContext, useMemo, useState } from "react";
import { cardPool, tradeSeed, users } from "../data/mockData";

const TradeContext = createContext(null);
const currentUserId = "u1";

function withImage(card, tcgData) {
  const image = tcgData?.image ? `${tcgData.image}/high.webp` : null;
  return {
    ...card,
    image: image || "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=500&q=80",
  };
}

export function TradeProvider({ children }) {
  const [trades, setTrades] = useState(tradeSeed);
  const [cardsById, setCardsById] = useState({});

  const value = useMemo(
    () => ({
      currentUserId,
      users,
      cards: cardPool,
      cardsById,
      setCardsById,
      trades,
      setTradeStatus: (tradeId, status) => {
        setTrades((prev) => prev.map((trade) => (trade.id === tradeId ? { ...trade, status } : trade)));
      },
      addMessage: (tradeId, authorId, text) => {
        if (!text.trim()) return;
        setTrades((prev) =>
          prev.map((trade) =>
            trade.id === tradeId
              ? {
                  ...trade,
                  messages: [
                    ...trade.messages,
                    {
                      id: `m-${crypto.randomUUID()}`,
                      authorId,
                      text: text.trim(),
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : trade
          )
        );
      },
      createTrade: ({ toUserId, offeredObjectIds, requestedObjectIds, message }) => {
        const newTrade = {
          id: `t-${crypto.randomUUID()}`,
          fromUserId: currentUserId,
          toUserId,
          offeredObjectIds,
          requestedObjectIds,
          status: "pending",
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: `m-${crypto.randomUUID()}`,
              authorId: currentUserId,
              text: message.trim() || "Proposition d'echange envoyee.",
              createdAt: new Date().toISOString(),
            },
          ],
        };
        setTrades((prev) => [newTrade, ...prev]);
        return newTrade.id;
      },
      resolveCardForDisplay: (card) => withImage(card, cardsById[card.tcgId]),
    }),
    [cardsById, trades]
  );

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>;
}

export function useTradeStore() {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTradeStore must be used inside TradeProvider");
  }
  return context;
}
