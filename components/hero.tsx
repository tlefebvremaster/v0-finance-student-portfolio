"use client"
import { Button } from "@/components/ui/button"
import { ArrowDown, FolderOpen, GraduationCap, FileText, Linkedin, Mail } from "lucide-react"

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const openLinkedIn = () => {
    window.open("https://linkedin.com/in/thomas-lefebvre-a1311017a", "_blank")
  }

  const openEmail = () => {
    window.location.href = "mailto:thomasl7513@hotmail.fr"
  }

  const openResume = () => {
    window.open("/resume", "_blank")
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Content */}
      <div className="container mx-auto px-6 relative" style={{ zIndex: 2 }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in">
            <h1 className="text-6xl md:text-7xl font-light text-black mb-6 leading-tight">
              <span className="font-semibold">Thomas Lefebvre</span>
            </h1>

            <h2 className="text-2xl md:text-3xl text-gray-600 mb-8 font-light">
              {""}
            </h2>

            <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-2xl mx-auto font-semibold">
              {"Finance. Tech. People."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-none font-medium"
                onClick={() => scrollToSection("projects")}
              >
                <FolderOpen className="mr-2 h-5 w-5" />
                View Projects
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white px-8 py-4 rounded-none font-medium bg-transparent"
                onClick={() => scrollToSection("experience")}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Experience
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-8 py-4 rounded-none font-medium bg-transparent"
                onClick={openResume}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Resume
              </Button>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 mb-16 justify-center">
              <button
                onClick={openLinkedIn}
                className="p-3 border border-gray-200 hover:border-black transition-colors hover-lift"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5 text-gray-600 hover:text-black" />
              </button>
              <button
                onClick={openEmail}
                className="p-3 border border-gray-200 hover:border-purple-600 transition-colors hover-lift"
                aria-label="Send Email"
              >
                <Mail className="h-5 w-5 text-gray-600 hover:text-purple-600" />
              </button>
            </div>
          </div>

          <div className="text-center mt-16">
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-400 hover:text-black transition-colors"
            >
              <ArrowDown className="h-6 w-6 mx-auto animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
