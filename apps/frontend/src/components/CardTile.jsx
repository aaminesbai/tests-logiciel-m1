function CardTile({ object, owner, selectable, selected, onToggle }) {
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition ${
        selected ? "border-coral ring-2 ring-coral/40" : "border-slate-200"
      }`}
    >
      <img src={object.image} alt={object.title} className="h-52 w-full object-cover" />
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{object.category}</p>
        <h3 className="text-lg font-bold text-slate-900">{object.title}</h3>
        <p className="text-sm text-slate-600">{object.description}</p>
        <p className="text-xs font-semibold text-slate-500">Proprietaire: {owner?.name || "Inconnu"}</p>
        {selectable && (
          <button
            type="button"
            onClick={onToggle}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold ${
              selected ? "bg-coral text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {selected ? "Retirer" : "Selectionner"}
          </button>
        )}
      </div>
    </article>
  );
}

export default CardTile;
