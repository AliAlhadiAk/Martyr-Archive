"use client"

import { ReactNode } from 'react'
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
  hadyeHadye,
} from './fonts'
import { ClientLayout } from './client-layout'
import './globals.css'



export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
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
    <ClientLayout className={fontClasses}>
      {children}
    </ClientLayout>
  )
}