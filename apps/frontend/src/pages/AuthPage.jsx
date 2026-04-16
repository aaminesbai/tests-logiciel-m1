import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTradeStore } from "../store/useTradeStore";

function AuthPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, login, logout, mutationPending } = useTradeStore();
  const [email, setEmail] = useState("test@poketrade.dev");
  const [password, setPassword] = useState("test");
  const [error, setError] = useState("");

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login({ email, password });
      navigate("/profile/me");
    } catch {
      setError("Email ou mot de passe invalide.");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-soft">
        <p className="font-display text-5xl uppercase tracking-wide text-ocean">Bienvenue</p>
        <p className="mt-4 text-slate-600">
          Plateforme d'echange de cartes Pokemon en double. Connecte-toi pour proposer, negocier et valider tes echanges.
        </p>
        <div className="mt-8">
          <span className="inline-flex rounded-xl bg-ocean px-4 py-3 font-semibold text-white">Connexion</span>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        {isAuthenticated ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Connecte</h1>
            <p className="text-slate-600">
              Session active pour <span className="font-semibold">{currentUser.name}</span>.
            </p>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/users");
              }}
              className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Se deconnecter
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
            <form className="mt-6 space-y-4" onSubmit={submitLogin}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Mot de passe</span>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
              <button
                type="submit"
                disabled={mutationPending}
                className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Se connecter
              </button>
            </form>
          </>
        )}
      </article>
    </section>
  );
}

export default AuthPage;
