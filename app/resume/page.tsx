"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ExternalLink, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function ResumePage() {
  const handlePrint = () => {
    window.print()
  }

  const downloadAsHTML = () => {
    const resumeContent = document.getElementById("resume-content")
    if (resumeContent) {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Thomas LEFEBVRE - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: bold; color: #000; border-bottom: 1px solid #8b5cf6; padding-bottom: 5px; margin-bottom: 15px; }
        .job { margin-bottom: 20px; }
        .job-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .company { font-size: 18px; font-weight: bold; }
        .position { font-size: 16px; color: #666; }
        .date { color: #666; font-weight: bold; }
        .highlight { color: #8b5cf6; font-weight: bold; }
        .education-item { margin-bottom: 20px; }
        .education-header { display: flex; gap: 20px; margin-bottom: 10px; }
        .education-date { min-width: 100px; color: #666; font-weight: bold; }
        @media print { body { margin: 0; padding: 15px; } }
    </style>
</head>
<body>
${resumeContent.innerHTML}
</body>
</html>`

      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Thomas_Lefebvre_Resume.html"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header - Hidden when printing */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </Button>
              <Button onClick={downloadAsHTML} className="bg-purple-600 hover:bg-purple-700 text-white rounded-none">
                <ExternalLink className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
            </div>
          </div>

          {/* Resume Content */}
          <div
            id="resume-content"
            className="bg-white shadow-card border border-gray-200 p-12 print:shadow-none print:border-none"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-purple-600 pb-8 mb-8">
              <h1 className="text-4xl font-bold text-black mb-4">Thomas LEFEBVRE</h1>
              <p className="text-lg text-gray-700 mb-4">
                Étudiant en MSc AI Applied to Business à Eugenia School, en recherche d'alternance
              </p>
              <p className="text-gray-600 mb-4">(Pour septembre 2025 / novembre 2025)</p>
              <p className="text-sm text-gray-600 mb-6">
                Rythme d'alternance : 4 jours par semaine en entreprise, le mercredi en classe
              </p>

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +33769501852
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Thomasl7513@hotmail.fr
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black border-b border-purple-600 pb-2 mb-6">
                EXPÉRIENCE PROFESSIONNELLE
              </h2>

              {/* Snapchat */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-black">Snapchat Inc'</h3>
                    <p className="text-base text-gray-700">Consultant</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p className="font-bold">Octobre-Mars 2022</p>
                    <p className="text-sm">(6 mois)</p>
                  </div>
                </div>

                <div className="ml-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-gray-900">• On-boarding :</h4>
                    <p className="text-gray-700 ml-4">
                      Prise de contact, accompagnement stratégique et management de{" "}
                      <span className="text-purple-600 font-bold">+50 influenceurs</span> afin de garantir l'alignement
                      avec les objectifs de la marque.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">• Content création :</h4>
                    <p className="text-gray-700 ml-4">
                      Conception et production de contenus promotionnel générant{" "}
                      <span className="text-purple-600 font-bold">+ 30M d'impressions</span> à destination des réseaux
                      sociaux (Snapchat, Instagram, TikTok).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">• Reporting :</h4>
                    <p className="text-gray-700 ml-4">
                      Création, développement et mise à jour quotidienne d'une base de données structurées.
                    </p>
                  </div>
                </div>
              </div>

              {/* DotSquareX */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-black">DotSquareX AM</h3>
                    <p className="text-base text-gray-700">Sales et Consultant stratégie</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p className="font-bold">Feb.2025-Actuel</p>
                    <p className="text-sm">(4 mois)</p>
                  </div>
                </div>

                <div className="ml-4 space-y-2">
                  <p className="text-gray-700">
                    • Participation à l'élaboration d'une stratégie delta-neutre sur protocole DeFi ayant permis
                    d'atteindre une performance nette mensuelle de{" "}
                    <span className="text-purple-600 font-bold">+2,1 %</span>.
                  </p>
                  <p className="text-gray-700">
                    • Contribution à la croissance commerciale par l'acquisition de nouveaux clients et prospects.
                  </p>
                  <p className="text-gray-700">
                    • Participation à la définition de stratégies d'investissement pour un portefeuille de plus de{" "}
                    <span className="text-purple-600 font-bold">500 000 $</span> d'actifs sous gestion (AUM).
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black border-b border-purple-600 pb-2 mb-6">ÉDUCATION</h2>

              <div className="space-y-6">
                {/* Eugenia School */}
                <div className="flex gap-6">
                  <div className="text-gray-600 font-bold min-w-[100px]">
                    <p>Paris 10</p>
                    <p>2025-2027</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">Eugenia School</h3>
                    <p className="text-base text-gray-700 mb-2">MSc AI Applied to Business</p>
                    <p className="text-gray-700 mb-2">
                      <strong>Cours principaux :</strong> Business analytics, Data visualisation, CRM, Nocode, Marketing
                      analytique
                    </p>
                    <p className="text-gray-700">
                      <strong>Langages et outils :</strong> Python, SQL, PowerBI, Hubspot, Dataiku, ChatGPT, Google
                      Analytics, Airtable, Notion, Zapier
                    </p>
                  </div>
                </div>

                {/* CNAM */}
                <div className="flex gap-6">
                  <div className="text-gray-600 font-bold min-w-[100px]">
                    <p>Paris 03</p>
                    <p>2023-2024</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">Conservatoire National des Arts et Métiers (CNAM)</h3>
                    <p className="text-base text-gray-700 mb-2">Master 1 Finance</p>
                    <p className="text-gray-700 mb-2">
                      <strong>Cours principaux :</strong> Finance et informatique de salle de marché, (Calcul
                      Stochastique, Mouvement Brownien Géométrique, Black Scholes, Lemme Ito, Monte Carlo...) Actions
                      gestion de portefeuille et produits Dérivés, Taux d'intérêts, Produits monétaires et obligataires,
                      Marchés des changes et gestion des risques Internationaux
                    </p>
                    <p className="text-gray-700">
                      <strong>Langage et outils :</strong> Python, Matlab, Excel, VBA, R studio.
                    </p>
                  </div>
                </div>

                {/* Université Paris Cité */}
                <div className="flex gap-6">
                  <div className="text-gray-600 font-bold min-w-[100px]">
                    <p>Paris 14</p>
                    <p>2020-2023</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">Université Paris Cité (Ex. Descartes)</h3>
                    <p className="text-base text-gray-700 mb-2">Licence Économie-Gestion</p>
                    <p className="text-gray-700 mb-2">
                      <strong>Cours principaux :</strong> Statistiques, Macroéconomie, Économétrie, Politique
                      économique, Économie publique, Économie industrielle, Comptabilité, Management.
                    </p>
                    <p className="text-gray-700">
                      <strong>Langages et outils :</strong> R studio, Excel, PowerPoint
                    </p>
                  </div>
                </div>

                {/* Lycée */}
                <div className="flex gap-6">
                  <div className="text-gray-600 font-bold min-w-[100px]">
                    <p>Paris 18</p>
                    <p>2015-2018</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black">Lycée Charles de Foucauld</h3>
                    <p className="text-base text-gray-700">Baccalauréat Scientifique</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages & Interests */}
            <div>
              <h2 className="text-xl font-bold text-black border-b border-purple-600 pb-2 mb-6">
                LANGUES & CENTRES D'INTÉRÊT
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Langues :</strong> Français – Natif, Anglais – Bilingue
                </p>
                <p className="text-gray-700">
                  <strong>Hobbies :</strong> Piano, Sports (Football, Golf, Boxe Anglaise), Économie
                </p>
                <p className="text-gray-700">
                  <strong>Projets :</strong> Pricer d'options avec Monte Carlo et Black Scholes, affichage des Greeks,
                  Extraction IV
                </p>
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 print:bg-gray-100">
                  <p className="text-purple-800 font-bold flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Please see my Project Portfolio at:
                    <span className="ml-2 text-purple-600 underline">
                      https://v0-thomas-lefebvre-portfolio-seven.vercel.app
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Print Instructions */}
          <div className="mt-8 text-center text-gray-600 print:hidden">
            <p className="text-sm">
              To save as PDF: Click "Print / Save as PDF" and select "Save as PDF" in your browser's print dialog.
              <br />
              This resume is optimized for printing and will look professional on paper or as a PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
