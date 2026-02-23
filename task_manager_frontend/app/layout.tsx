import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Organizer",
  description: "A modern task manager for organizing your day."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="header">
            <div className="headerInner container">
              <div className="brand" aria-label="Task Organizer">
                <div className="brandMark" aria-hidden="true" />
                <span>Task Organizer</span>
              </div>

              <nav className="nav" aria-label="Primary navigation">
                <a href="/">Home</a>
              </nav>
            </div>
          </header>

          <main className="main">
            <div className="container">{children}</div>
          </main>

          <footer className="footer">
            <div className="container">Built with a light, modern UI theme.</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
