import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/auth", label: "Auth" },
  { to: "/users", label: "Users" },
  { to: "/profile/me", label: "Mon profil" },
  { to: "/trade/t1", label: "Echange" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-3xl uppercase tracking-wide text-ocean">Poketrade</p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MVP Echange de doubles</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-ocean bg-ocean text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-ocean hover:text-ocean"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
