import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Calendar } from "lucide-react"

export function Education() {
  const education = [
    {
      id: "education-1",
      degree: "MSc AI applied to business",
      school: "Eugenia School",
      period: "2025 - Present",
      coursework: [
        "Business analitycs",
        "CRM",
        "Data visualisation ",
        "Marketing analytics",
        "No code",
        "Entrepreneurship",
      ],
    },
    {
      id: "education-2",
      degree: "Master in Finance",
      school: "Conservatoire National des Arts et Métiers",
      period: "2023 - 2024",
      coursework: [
        "Trading room finance & IT",
        "Assets and derivatives pricing models (Stochastics, BGM, Lemme Ito, Monte carlo, Black Scholes) ",
        "Portfolio management",
        " Interest rates products",
        "Equity derivatives ",
        "FX Markets & Internationnal Risk management",
      ],
    },
    {
      id: "education-3",
      degree: "Bachelor in Economics and Management",
      school: "Université Paris Cité ",
      period: "2020 - 2023",
      coursework: [
        "Microeconomics & Macroeconomics",
        "Statistics and Econometrics",
        "Financial Accounting",
        "Investment Analysis",
        "Business Mathematics",
        "Quantitative methods",
      ],
    },
  ]

  return (
    <section id="education" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Education</h2>

          <div className="space-y-8">
            {education.map((edu, index) => {
              const { degree, school, period, coursework } = edu
              return (
                <Card key={index} className="border-l-4 border-l-purple-600 border-black opacity-100">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6 mb-4">
                      {/* Logo Circle with 3D Shiny Effect */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300 group">
                          {/* 3D Base with gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-200 rounded-full"></div>

                          {/* Shine overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full"></div>

                          {/* Logo image */}
                          <img
                            src={
                              index === 0
                                ? "/logos/ens-logo.png"
                                : index === 1
                                  ? "/logos/cnam-logo.png"
                                  : "/logos/paris-cite-logo.png"
                            }
                            alt={
                              index === 0
                                ? "École Normale Supérieure logo"
                                : index === 1
                                  ? "CNAM logo"
                                  : "Université Paris Cité logo"
                            }
                            className="relative z-10 w-full h-full object-cover rounded-full group-hover:brightness-110 transition-all duration-300"
                            data-vercel-edit-target
                            data-vercel-edit-info={`education.${index}.logo`}
                          />

                          {/* Top highlight for 3D effect */}
                          <div className="absolute top-2 left-2 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>

                          {/* Bottom shadow for depth */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black/10 rounded-full blur-sm"></div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div className="mb-2 md:mb-0">
                            <div className="flex items-center mb-2">
                              <GraduationCap className="h-6 w-6 text-purple-600 mr-3" />
                              <h3
                                className="text-2xl font-bold text-gray-900"
                                data-vercel-edit-target
                                data-vercel-edit-info={`education.${index}.degree`}
                              >
                                {degree}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span data-vercel-edit-target data-vercel-edit-info={`education.${index}.period`}>
                              {period}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p
                            className="text-xl text-gray-700 mb-2"
                            data-vercel-edit-target
                            data-vercel-edit-info={`education.${index}.school`}
                          >
                            {school}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Relevant Coursework:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {coursework.map((course, courseIndex) => (
                              <div key={courseIndex} className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-3 bg-violet-600"></div>
                                <span
                                  className="text-gray-700"
                                  data-vercel-edit-target
                                  data-vercel-edit-info={`education.${index}.coursework.${courseIndex}`}
                                >
                                  {course}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
