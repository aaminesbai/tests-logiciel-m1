function AuthPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="email" placeholder="email@exemple.com" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Mot de passe</span>
            <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="password" placeholder="********" />
          </label>
          <button type="button" className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90">
            Se connecter
          </button>
        </form>
      </article>
    </section>
  );
}

export default AuthPage;
