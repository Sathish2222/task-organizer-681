export default function HomePage() {
  return (
    <section className="card hero" aria-labelledby="welcome-title">
      <div className="kicker">
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)"
          }}
        />
        Welcome
      </div>

      <h1 id="welcome-title" className="title">
        Welcome to Task Organizer
      </h1>

      <p className="subtitle">
        Stay on top of what matters. Create tasks, set due dates and priorities,
        add tags, and quickly find what you need with search and filters.
      </p>

      <div className="grid" aria-label="Highlights">
        <div className="card" style={{ padding: 18 }}>
          <div className="pill">
            <div>
              <div className="pillTitle">Get started</div>
              <div className="pillDesc">
                Your tasks will appear here once connected to the backend API.
              </div>
            </div>
          </div>

          <ul className="featureList">
            <li>Create, edit, and delete tasks</li>
            <li>Mark tasks complete</li>
            <li>Due dates, priorities, and tags</li>
            <li>Search and filter your task list</li>
          </ul>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="pill">
            <div>
              <div className="pillTitle">Light & modern</div>
              <div className="pillDesc">
                Blue/cyan accents on a clean, responsive layout.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
            This is the app shell. Future screens (task list, filters, auth) will
            plug into this layout while keeping consistent styling.
          </div>
        </div>
      </div>
    </section>
  );
}
