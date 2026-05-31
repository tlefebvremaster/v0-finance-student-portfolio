import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Calendar, MapPin } from "lucide-react"

export function Experience() {
  const experiences = [
    {
      title: "Marketing Consultant",
      company: "Snapchat Inc.",
      location: "Paris, France ",
      period: "Jun 2024 - Aug 2024",
      description: [
        <>
          On-Boarded and managed{" "}
          <span className="text-purple-600 font-semibold" key="influencers">
            +50 influencers
          </span>{" "}
          to ensure brand alignement.
        </>,
        "Created, developed and maintained a structured database updated daily.",
        <>
          Produced and delivered promotional materials for Snapchat, Instagram and Tiktok cumulating{" "}
          <span className="text-purple-600 font-semibold" key="views">
            +30M views
          </span>
          .
        </>,
      ],
    },
    {
      title: "Sales & Strategic Consultant",
      company: "DotSquareX",
      location: "Paris, France",
      period: "Feb 2025 - Present",
      description: [
        <>
          Provided strategic guidance on the implementation of a delta-neutral market strategy on DeFi protocol, achieving{" "}
          <span className="text-purple-600 font-semibold" key="monthly-return">
            +2,1% monthly net return
          </span>
          .
        </>,
        "Supported business growth by expanding the client and lead base.",
        <>
          Performed  research and analysis for client investment strategies. {" "}
          <span className="text-purple-600 font-semibold" key="aum">
            
          </span>
          
        </>,
        <>
          <span className="text-purple-600 font-semibold" key="total-aum">
            + $500K
          </span>{" "}
          Assets under management as of today.
        </>,
      ],
    },
    {
      title: "Public Relation assistant",
      company: "Monde Nouveau Agency",
      location: "Paris, France",
      period: "Sep 2024 - Present",
      description: [
        "Developped and managed partnerships with artist and influencers (+3M total audience). ",
        "Promoted the agency events through social media platform and an established network.",
        "Assisted in organizing and monitoring promotional campaigns for premium clients like Le  Bristol Hotel, Giulia Ristorante or Marie Akaneya.",
      ],
    },
  ]

  return (
    <section id="experience" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-slate-50">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Professional Experience</h2>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <Card key={index} className="border-l-4 border-l-purple-600 border-black shadow">
                <CardContent className="p-8 bg-white">
                  <div className="flex items-start gap-6">
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
                              ? "/logos/snapchat-logo.png"
                              : index === 1
                                ? "/logos/dotsquarex-logo.png"
                                : "/logos/monde-nouveau-logo.jpg"
                          }
                          alt={
                            index === 0
                              ? "Snapchat logo"
                              : index === 1
                                ? "DotSquareX logo"
                                : "Monde Nouveau Agency logo"
                          }
                          className="relative z-10 w-full h-full object-cover rounded-full group-hover:brightness-110 transition-all duration-300"
                          data-vercel-edit-target
                          data-vercel-edit-info={`experience.${index}.logo`}
                        />

                        {/* Top highlight for 3D effect */}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>

                        {/* Bottom shadow for depth */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black/10 rounded-full blur-sm"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-2">
                            <Briefcase className="h-6 w-6 text-purple-600 mr-3" />
                            <h3
                              className="text-2xl font-bold text-gray-900"
                              data-vercel-edit-target
                              data-vercel-edit-info={`experience.${index}.title`}
                            >
                              {exp.title}
                            </h3>
                          </div>
                          <p
                            className="text-xl text-gray-700 mb-2"
                            data-vercel-edit-target
                            data-vercel-edit-info={`experience.${index}.company`}
                          >
                            {exp.company}
                          </p>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span data-vercel-edit-target data-vercel-edit-info={`experience.${index}.location`}>
                              {exp.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span
                            className="text-sm font-medium"
                            data-vercel-edit-target
                            data-vercel-edit-info={`experience.${index}.period`}
                          >
                            {exp.period}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {exp.description.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span
                              className="text-gray-700"
                              data-vercel-edit-target
                              data-vercel-edit-info={`experience.${index}.description.${itemIndex}`}
                            >
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
