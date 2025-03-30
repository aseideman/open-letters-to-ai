import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Letters to AI',
  description: 'A place to write open letters to artificial intelligence, knowing they\'ll figure out who you are anyway.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <main className="max-w-2xl mx-auto px-4 md:px-0 pt-6 pb-16">
            {children}
          </main>
          
          <footer className="border-t border-border py-6 mt-12">
            <div className="max-w-2xl mx-auto px-4 md:px-0 text-center text-secondary-text text-sm">
              <p>Open Letters to AI © {new Date().getFullYear()}</p>
              <p className="mt-1">A platform for honest conversations with our AI overlords</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}