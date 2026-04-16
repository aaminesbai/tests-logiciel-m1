import { Link } from "react-router-dom";
import { useTradeStore } from "../store/useTradeStore";

function UsersPage() {
  const { users, loading, error, isAuthenticated } = useTradeStore();

  if (loading) return <p className="text-slate-600">Chargement du catalogue...</p>;
  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase text-ocean">Utilisateurs</h1>
        <p className="text-slate-600">Explore les collectionneurs et lance une proposition d'echange.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => {
          const ownCards = user.cards;
          return (
            <article key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <h2 className="text-lg font-bold">{user.name}</h2>
                  <p className="text-sm text-slate-500">{user.city}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{user.bio}</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {ownCards.map((card) => (
                  <img
                    key={card.id}
                    src={card.image}
                    alt={card.title}
                    className="h-20 w-full rounded-lg object-cover"
                    title={card.title}
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/profile/${user.id}`}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold"
                >
                  Voir profil
                </Link>
                {isAuthenticated ? (
                  <Link to="/trade/1" className="flex-1 rounded-xl bg-ocean px-3 py-2 text-center text-sm font-semibold text-white">
                    Negocier
                  </Link>
                ) : (
                  <Link to="/auth" className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-700">
                    Connexion
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default UsersPage;
