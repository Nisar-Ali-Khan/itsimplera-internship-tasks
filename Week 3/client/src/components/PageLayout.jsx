import Navbar from './Navbar';

const PageLayout = ({ children, wide = false }) => (
  <div className="min-h-screen flex flex-col bg-paper">
    <Navbar />
    <main className={`flex-1 w-full mx-auto px-4 md:px-6 py-8 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>
      {children}
    </main>
    <footer className="border-t border-ink/10 py-6">
      <p className="text-center text-xs font-mono text-inkmuted">Chronicle v1.0.0 — a role-based blogging platform</p>
    </footer>
  </div>
);

export default PageLayout;
