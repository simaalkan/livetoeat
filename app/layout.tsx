import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Favorite Restaurants',
  description: 'Track your favorite restaurants with notes and photos.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between py-4">
              <h1 className="text-lg font-semibold tracking-tight">
                Favorite Restaurants
              </h1>
              <span className="text-xs text-muted-foreground">
                Simple tracking app • SQLite + Prisma
              </span>
            </div>
          </header>
          <main className="flex-1">
            <div className="container mx-auto py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

