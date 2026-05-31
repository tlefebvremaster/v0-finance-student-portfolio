"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [language, setLanguage] = useState("EN")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FR" : "EN")
    // Here you would implement the actual language switching logic
    console.log(`Language switched to: ${language === "EN" ? "FR" : "EN"}`)
  }

  const menuItems =
    language === "EN"
      ? ["About", "Education", "Experience", "Skills", "Projects", "Contact"]
      : ["À propos", "Formation", "Expérience", "Compétences", "Projets", "Contact"]

  const menuItemIds = ["about", "education", "experience", "skills", "projects", "contact"]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-sm border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold text-black">TL</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <button
                key={item}
                onClick={() => scrollToSection(menuItemIds[index])}
                className="text-gray-600 hover:text-black transition-colors font-medium"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden md:flex items-center space-x-1 hover:bg-gray-50"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language}</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2 pt-4">
              {/* Mobile Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center justify-start space-x-2 py-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language === "EN" ? "Français" : "English"}</span>
              </Button>

              {menuItems.map((item, index) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(menuItemIds[index])}
                  className="text-left text-gray-600 hover:text-black py-2 transition-colors font-medium"
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
