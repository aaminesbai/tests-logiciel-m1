import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CardTile from "../components/CardTile";
import { fetchCardsByIds } from "../services/tcgdex";
import { useTradeStore } from "../store/TradeStore";

function TradePage() {
  const { tradeId } = useParams();
  const {
    currentUserId,
    users,
    cards,
    cardsById,
    setCardsById,
    trades,
    setTradeStatus,
    addMessage,
    createTrade,
    resolveCardForDisplay,
  } = useTradeStore();

  const [selectedMine, setSelectedMine] = useState([]);
  const [selectedOther, setSelectedOther] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [replyText, setReplyText] = useState("");

  const activeTrade = trades.find((trade) => trade.id === tradeId) || trades[0];
  const fromUser = users.find((user) => user.id === activeTrade.fromUserId);
  const toUser = users.find((user) => user.id === activeTrade.toUserId);
  const otherUserId = currentUserId === toUser.id ? fromUser.id : toUser.id;

  const myCards = cards.filter((card) => card.ownerId === currentUserId).map(resolveCardForDisplay);
  const otherCards = cards.filter((card) => card.ownerId === otherUserId).map(resolveCardForDisplay);

  const exchangeCards = useMemo(() => {
    const offered = activeTrade.offeredObjectIds
      .map((id) => cards.find((card) => card.id === id))
      .filter(Boolean)
      .map(resolveCardForDisplay);
    const requested = activeTrade.requestedObjectIds
      .map((id) => cards.find((card) => card.id === id))
      .filter(Boolean)
      .map(resolveCardForDisplay);
    return { offered, requested };
  }, [activeTrade.offeredObjectIds, activeTrade.requestedObjectIds, cards, resolveCardForDisplay]);

  useEffect(() => {
    const missingIds = cards.map((card) => card.tcgId).filter((id) => !cardsById[id]);
    if (!missingIds.length) return;

    fetchCardsByIds(missingIds).then((result) => {
      setCardsById((prev) => ({ ...prev, ...result }));
    });
  }, [cards, cardsById, setCardsById]);

  const toggleSelected = (setFn, current, id) => {
    setFn(current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  };

  const submitOffer = () => {
    if (!selectedMine.length || !selectedOther.length) return;
    const newId = createTrade({
      toUserId: otherUserId,
      offeredObjectIds: selectedMine,
      requestedObjectIds: selectedOther,
      message: draftMessage,
    });
    setDraftMessage(`Nouvelle proposition creee (${newId.slice(0, 8)}).`);
    setSelectedMine([]);
    setSelectedOther([]);
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-5xl uppercase text-ocean">Echange & Negociation</h1>
        <p className="text-slate-600">
          Transaction {activeTrade.id} entre {fromUser.name} et {toUser.name}
        </p>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Statut: {activeTrade.status}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTradeStatus(activeTrade.id, "accepted")}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => setTradeStatus(activeTrade.id, "refused")}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Refuser
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold">Objets proposes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {exchangeCards.offered.map((card) => (
                <CardTile key={card.id} object={card} owner={users.find((u) => u.id === card.ownerId)} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold">Objets demandes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {exchangeCards.requested.map((card) => (
                <CardTile key={card.id} object={card} owner={users.find((u) => u.id === card.ownerId)} />
              ))}
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Historique des messages</h2>
        <div className="mt-4 space-y-3">
          {activeTrade.messages.map((message) => {
            const author = users.find((user) => user.id === message.authorId);
            return (
              <div key={message.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{author?.name}</p>
                <p className="text-sm text-slate-600">{new Date(message.createdAt).toLocaleString()}</p>
                <p className="mt-1 text-slate-800">{message.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Repondre avec un commentaire"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
          />
          <button
            type="button"
            onClick={() => {
              addMessage(activeTrade.id, currentUserId, replyText);
              setReplyText("");
            }}
            className="rounded-xl bg-ink px-4 py-3 font-semibold text-white"
          >
            Envoyer
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Nouvelle proposition d'echange</h2>
        <p className="mt-1 text-sm text-slate-600">Selectionne un ou plusieurs objets de chaque cote et envoie un message.</p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold">Mes objets</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {myCards.map((card) => (
                <CardTile
                  key={card.id}
                  object={card}
                  owner={users.find((u) => u.id === card.ownerId)}
                  selectable
                  selected={selectedMine.includes(card.id)}
                  onToggle={() => toggleSelected(setSelectedMine, selectedMine, card.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Objets de l'autre utilisateur</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherCards.map((card) => (
                <CardTile
                  key={card.id}
                  object={card}
                  owner={users.find((u) => u.id === card.ownerId)}
                  selectable
                  selected={selectedOther.includes(card.id)}
                  onToggle={() => toggleSelected(setSelectedOther, selectedOther, card.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Message pour cette proposition"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
          />
          <button type="button" onClick={submitOffer} className="rounded-xl bg-coral px-5 py-3 font-semibold text-white">
            Envoyer proposition
          </button>
        </div>
      </article>
    </section>
  );
}

export default TradePage;
