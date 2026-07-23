import type { Metadata } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { Providers } from '@/components/providers/Providers'
import { Nav } from '@/components/nav/Nav'
import { Footer } from '@/components/footer/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hipótesis',
  description: 'Proyecciones de crecimiento poblacional de hipopótamos — Colombia',
}

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
