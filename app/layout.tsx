import { ReactNode } from 'react'
import {
  adoody,
  mjGhalam,
  dgMataryah,
  entezar5,
  entezar2,
  foda,
  abuhmeda,
  dgTofanAlaqsa,
  dimaShakasta,
  hadyeHadye,
} from './fonts'
import { Providers } from './providers'
import './globals.css'



export default function RootLayout({ children }: { children: ReactNode }) {
  const fontClasses = `
    ${adoody.variable} 
    ${mjGhalam.variable} 
    ${dgMataryah.variable} 
    ${entezar5.variable} 
    ${entezar2.variable} 
    ${foda.variable} 
    ${abuhmeda.variable} 
    ${dgTofanAlaqsa.variable}
    ${dimaShakasta.variable}
    ${hadyeHadye.variable}
  `

  return (
    <html lang="ar" dir="rtl" className={fontClasses}>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}