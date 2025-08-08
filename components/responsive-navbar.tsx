"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Search, Calendar, Palette, Users, BookOpen, Phone, X, Heart, Star, Sparkles, LayoutGrid, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "الرئيسية", icon: BookOpen },
  { href: "/martyrs", label: "بطاقات الشهداء", icon: Users },
  { href: "/media-kit", label: "عدّة الإعلام", icon: Palette },
  { href: "/calendar", label: "رزنامة الشهداء", icon: Calendar },
  { href: "/design-generator", label: "مولّد التصميم", icon: Sparkles },
  { href: "/my-designs", label: "تصميماتي", icon: LayoutGrid },
  { href: "/admin", label: "لوحة الإدارة", icon: Plus },
  { href: "/contact", label: "تواصل معنا", icon: Phone },
]

export function ResponsiveNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 20
    setIsScrolled(scrolled)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const closeMenu = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-xl"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="flex items-center space-x-2 space-x-reverse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl font-foda">
                    ع
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg sm:text-xl font-bold text-white font-foda">
                    الارشيف الرقمي
                  </span>
                  <div className="text-xs text-white/60 font-dg-mataryah">
                    للسعداء
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 space-x-reverse">
              {navItems.map((item) => (
                <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-dg-mataryah ${
                      pathname === item.href
                        ? "text-white bg-white/10"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 lg:hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.indexOf(item) * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg text-sm font-medium transition-all duration-200 font-dg-mataryah ${
                        pathname === item.href
                          ? "text-white bg-white/10"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}
