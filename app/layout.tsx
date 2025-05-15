// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { PyodideProvider } from '@/components/PyodideProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'


export const metadata: Metadata = {
  title: 'Data Science Learning Platform',
  description: 'Interactive Data Science Units with Pyodide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <PyodideProvider>
            <div className="min-h-screen flex flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <Link href="/" className="mr-6 flex items-center space-x-2">
                    <span className="font-bold">DS Learn</span>
                  </Link>
                  <nav className="flex items-center space-x-4 lg:space-x-6">
                    {/* Example: Add links to main unit groups if you have them */}
                    <Link href="/ds-unit-1/01-what-is-data-science" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Unit 1
                    </Link>
                     <Link href="/ds-unit-2/01-data-handling-large-data" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Unit 2
                    </Link>
                     <Link href="/ds-unit-3/01-intro-matplotlib" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      Unit 3
                    </Link>
                  </nav>
                  <div className="flex flex-1 items-center justify-end space-x-4">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="flex-1 container py-6">
                {children}
              </main>
              <footer className="py-6 md:px-8 md:py-0 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built with Next.js, Shadcn UI, and Pyodide.
                  </p>
                </div>
              </footer>
            </div>
          </PyodideProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}