const LINKS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "tasks", label: "Tugas" },
  { key: "courses", label: "Mata Kuliah" }
];

export default function Navbar({ page, onNavigate, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">Task Management</div>
      <nav className="navbar-links">
        {LINKS.map((l) => (
          <button
            key={l.key}
            className={page === l.key ? "nav-btn active" : "nav-btn"}
            onClick={() => onNavigate(l.key)}
          >
            {l.label}
          </button>
        ))}
      </nav>
      <div className="navbar-user">
        <span className="user-email">{user?.email}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
