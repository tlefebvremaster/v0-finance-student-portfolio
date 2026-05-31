import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Shield, Eye, ExternalLink, Github } from "lucide-react"
import Link from "next/link"

export function Projects() {
  const projects = [
    {
      title: "Python Options Pricing Engine",
      description:
        "Comprehensive options pricing tool implementing Black-Scholes, Monte Carlo, and Binomial Tree models with real-time Greeks calculation and risk analytics.",
      icon: <Calculator className="h-6 w-6" />,
      technologies: ["Python", "NumPy", "SciPy", "Matplotlib", "Streamlit"],
      features: [
        "Multiple pricing models implementation",
        "Advanced Greeks computation",
        "Interactive risk dashboard",
        "Portfolio-level analytics",
      ],
      github: "/code",
      demo: "/demo",
    },
    {
      title: "Lookback Call Option Pricer",
      description:
        "Advanced Monte Carlo pricing engine for lookback call options with path-dependent payoff calculation and comprehensive statistical validation.",
      icon: <Eye className="h-6 w-6" />,
      technologies: ["Python", "NumPy", "Monte Carlo", "Statistical Analysis"],
      features: [
        "Path-dependent Monte Carlo simulation",
        "Maximum price tracking algorithm",
        "Delta calculation with confidence intervals",
        "Statistical error estimation",
        "High-performance trajectory generation",
      ],
      github: "/lookback-code",
      demo: "/lookback-demo",
    },
    {
      title: "Athena Structured Product Pricer",
      description:
        "Sophisticated Monte Carlo pricing engine for Athena autocallable notes with barrier features, memory coupons, and comprehensive risk analysis.",
      icon: <Shield className="h-6 w-6" />,
      technologies: ["Python", "NumPy", "SciPy", "Matplotlib", "Monte Carlo"],
      features: [
        "Autocallable barrier monitoring",
        "Memory coupon accumulation",
        "Downside protection analysis",
        "Daily simulation engine",
        "Comprehensive risk metrics",
      ],
      github: "/athena-code",
      demo: "/athena-demo",
    },
  ]

  return (
    <section id="projects" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
              Featured <span className="font-semibold">Projects</span>
            </h2>
            <div className="w-24 h-px bg-purple-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {"Take a quick look at what I can do !"}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="border border-gray-100 hover:border-gray-200 transition-all duration-300 hover-lift shadow-minimal hover:shadow-card"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-50 mr-4">
                      <div className="text-black">{project.icon}</div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-black">{project.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-black mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {project.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-black mb-3">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-gray-50 text-gray-700 border-0 text-xs font-normal"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {index === 0 ? (
                        <>
                          <Link href="/code" className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </Button>
                          </Link>
                          <Link href="/demo" className="flex-1">
                            <Button
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Demo
                            </Button>
                          </Link>
                        </>
                      ) : index === 1 ? (
                        <>
                          <Link href="/lookback-code" className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </Button>
                          </Link>
                          <Link href="/lookback-demo" className="flex-1">
                            <Button
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Demo
                            </Button>
                          </Link>
                        </>
                      ) : index === 2 ? (
                        <>
                          <Link href="/athena-code" className="flex-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
                            >
                              <Github className="h-4 w-4 mr-2" />
                              Code
                            </Button>
                          </Link>
                          <Link href="/athena-demo" className="flex-1">
                            <Button
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Demo
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:border-black hover:text-black rounded-none bg-transparent"
                          >
                            <Github className="h-4 w-4 mr-2" />
                            Code
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-none"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Demo
                          </Button>
                        </>
                      )}
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
