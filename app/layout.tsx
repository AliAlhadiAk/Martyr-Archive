import type { Metadata } from 'next'
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
  hadyeHadye 
} from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'الارشيف الرقمي للسعداء',
  description: 'أرشيف رقمي شامل للشهداء والسعداء',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`
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
      `}
    >
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
