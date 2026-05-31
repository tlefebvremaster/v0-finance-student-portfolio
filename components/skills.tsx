import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Code,
  TrendingUp,
  Database,
  BarChart3,
  FileSpreadsheet,
  Calculator,
  PieChart,
  Shield,
  Brain,
  LineChart,
  Activity,
  Zap,
  Target,
  GitBranch,
  Monitor,
  Palette,
} from "lucide-react"

export function Skills() {
  const skillCategories = [
    {
      title: "Programming & Technical",
      icon: <Code className="h-6 w-6" />,
      skills: [
        { name: "Python", icon: <Code className="h-5 w-5" /> },
        { name: "R", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "SQL", icon: <Database className="h-5 w-5" /> },
        { name: "MATLAB", icon: <Calculator className="h-5 w-5" /> },
        { name: "Excel/VBA", icon: <FileSpreadsheet className="h-5 w-5" /> },
      ],
    },
    {
      title: "Financial Analysis",
      icon: <TrendingUp className="h-6 w-6" />,
      skills: [
        { name: "Derivatives Pricing", icon: <Calculator className="h-5 w-5" /> },
        { name: "Risk Management", icon: <Shield className="h-5 w-5" /> },
        { name: "Portfolio Management", icon: <PieChart className="h-5 w-5" /> },
        { name: "Financial Modeling", icon: <Target className="h-5 w-5" /> },
        { name: "Valuation Methods", icon: <TrendingUp className="h-5 w-5" /> },
      ],
    },
    {
      title: "Data & Analytics",
      icon: <Database className="h-6 w-6" />,
      skills: [
        { name: "Business analytics", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "Machine Learning", icon: <Brain className="h-5 w-5" /> },
        { name: "Data Visualization", icon: <Palette className="h-5 w-5" /> },
        { name: "Econometrics", icon: <LineChart className="h-5 w-5" /> },
        { name: "Marketing Analysis", icon: <Activity className="h-5 w-5" /> },
      ],
    },
    {
      title: "Tools & Platforms",
      icon: <Monitor className="h-6 w-6" />,
      skills: [
        { name: "Bloomberg Terminal", icon: <Monitor className="h-5 w-5" /> },
        { name: "Reuters", icon: <GitBranch className="h-5 w-5" /> },
        { name: "Tableau", icon: <BarChart3 className="h-5 w-5" /> },
        { name: "Power BI", icon: <Zap className="h-5 w-5" /> },
        { name: "Git/Github", icon: <Code className="h-5 w-5" /> },
      ],
    },
  ]

  return (
    <section id="skills" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-black mb-6">
              Skills & <span className="font-semibold">Expertise</span>
            </h2>
            <div className="w-24 h-px bg-purple-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Technical competencies across quantitative finance, programming, and data analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {skillCategories.map((category, index) => (
              <Card
                key={index}
                className="border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-minimal hover:shadow-card"
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-semibold">
                    <div className="p-2 bg-gray-50 mr-3">
                      <div className="text-black">{category.icon}</div>
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {category.skills.map((skill, skillIndex) => (
                      <div
                        key={skillIndex}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-purple-600 mr-4">{skill.icon}</div>
                        <span className="text-black font-medium">{skill.name}</span>
                      </div>
                    ))}
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
