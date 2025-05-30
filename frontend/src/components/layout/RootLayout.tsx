import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            Natural Language Task Manager
          </h1>
          <p className="text-lg text-gray-300">
            Manage your tasks using natural language and voice commands
          </p>
        </header>
        
        <main className="space-y-8">
          {children}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-400">
          <p>© 2024 Natural Language Task Manager. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 