import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import CardTile from "../components/CardTile";
import { fetchCardsByIds } from "../services/tcgdex";
import { useTradeStore } from "../store/TradeStore";

function ProfilePage() {
  const { userId } = useParams();
  const { currentUserId, users, cards, cardsById, setCardsById, resolveCardForDisplay } = useTradeStore();

  const effectiveId = userId === "me" ? currentUserId : userId;
  const user = users.find((entry) => entry.id === effectiveId) || users[0];
  const userCards = cards.filter((card) => card.ownerId === user.id).map(resolveCardForDisplay);

  useEffect(() => {
    const missingIds = userCards.map((card) => card.tcgId).filter((id) => !cardsById[id]);
    if (!missingIds.length) return;

    fetchCardsByIds(missingIds).then((result) => {
      setCardsById((prev) => ({ ...prev, ...result }));
    });
  }, [cardsById, setCardsById, userCards]);

  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-3xl object-cover" />
          <div className="flex-1">
            <h1 className="font-display text-5xl uppercase text-ocean">{user.name}</h1>
            <p className="text-slate-500">
              {user.email} - {user.city}
            </p>
            <p className="mt-2 text-slate-600">{user.bio}</p>
          </div>
          {user.id !== currentUserId && (
            <Link to="/trade/t1" className="rounded-xl bg-coral px-4 py-3 font-semibold text-white">
              Proposer un echange
            </Link>
          )}
        </div>
      </article>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cartes disponibles</h2>
        <span className="rounded-full bg-sky px-3 py-1 text-sm font-semibold text-ocean">{userCards.length} objets</span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {userCards.map((card) => (
          <CardTile key={card.id} object={card} owner={user} />
        ))}
      </div>
    </section>
  );
}

export default ProfilePage;
