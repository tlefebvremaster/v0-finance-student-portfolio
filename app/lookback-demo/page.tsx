"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, TrendingUp, BarChart3, Target, Activity } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

// Box-Muller transformation for normal random numbers
function normalRandom(): number {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

const DISPLAY_STEPS = 100  // number of points to display on the chart
const SAMPLE_PATHS = 20    // number of trajectories to show on the chart

// Lookback Call Option Pricing Engine
function priceLookbackCallOption(
  S0: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  numPaths: number,
  numDates: number,
) {
  try {
    if (S0 <= 0 || K <= 0 || T <= 0 || sigma <= 0 || numPaths <= 0 || numDates <= 0) {
      throw new Error("Invalid parameters")
    }

    const timestep = T / (numDates - 1)
    const payoffs: number[] = []
    const deltas: number[] = []

    // We'll keep a sample of full paths for the chart (downsampled to DISPLAY_STEPS)
    const samplePaths: number[][] = []
    const stride = Math.max(1, Math.floor(numDates / DISPLAY_STEPS))

    for (let i = 0; i < numPaths; i++) {
      const path = new Array(numDates)
      path[0] = S0

      for (let j = 1; j < numDates; j++) {
        const epsilon = normalRandom()
        path[j] = path[j - 1] * Math.exp((r - 0.5 * sigma * sigma) * timestep + sigma * epsilon * Math.sqrt(timestep))
      }

      // Store downsampled path for the first SAMPLE_PATHS simulations
      if (i < SAMPLE_PATHS) {
        const downsampled: number[] = []
        for (let j = 0; j < numDates; j += stride) downsampled.push(path[j])
        // Always include last point
        if ((numDates - 1) % stride !== 0) downsampled.push(path[numDates - 1])
        samplePaths.push(downsampled)
      }

      const maxPrice = Math.max(...path)
      const payoff = Math.max(maxPrice - K, 0)
      payoffs.push(payoff)

      const delta = maxPrice > K ? maxPrice / S0 : 0
      deltas.push(delta)
    }

    const optionPrice = Math.exp(-r * T) * (payoffs.reduce((sum, p) => sum + p, 0) / numPaths)
    const optionDelta = Math.exp(-r * T) * (deltas.reduce((sum, d) => sum + d, 0) / numPaths)

    const payoffStd = Math.sqrt(
      payoffs.reduce((sum, p) => sum + Math.pow(p - payoffs.reduce((s, x) => s + x, 0) / numPaths, 2), 0) /
        (numPaths - 1),
    )
    const deltaStd = Math.sqrt(
      deltas.reduce((sum, d) => sum + Math.pow(d - deltas.reduce((s, x) => s + x, 0) / numPaths, 2), 0) /
        (numPaths - 1),
    )

    const priceError = (Math.exp(-r * T) * payoffStd) / Math.sqrt(numPaths)
    const deltaError = (Math.exp(-r * T) * deltaStd) / Math.sqrt(numPaths)
    const priceCI = [optionPrice - priceError, optionPrice + priceError]
    const deltaCI = [optionDelta - deltaError, optionDelta + deltaError]
    const inTheMoneyProb = payoffs.filter((p) => p > 0).length / numPaths
    const avgMaxPrice = payoffs.map((_, i) => deltas[i] * S0).reduce((sum, p) => sum + p, 0) / numPaths

    // Build chart data: each row is a time step, columns are the sampled paths
    const chartLength = samplePaths[0]?.length ?? 0
    const chartData = Array.from({ length: chartLength }, (_, idx) => {
      const t = parseFloat(((idx / (chartLength - 1)) * T).toFixed(3))
      const row: Record<string, number> = { t }
      samplePaths.forEach((p, pi) => { row[`p${pi}`] = parseFloat(p[idx].toFixed(2)) })
      return row
    })

    return {
      price: optionPrice,
      delta: optionDelta,
      priceError,
      deltaError,
      priceCI,
      deltaCI,
      inTheMoneyProb,
      avgMaxPrice,
      simulations: numPaths,
      timeSteps: numDates,
      model: "Monte Carlo Lookback",
      chartData,
      K,
      S0,
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Lookback option pricing error" }
  }
}

export default function LookbackDemoPage() {
  const [inputs, setInputs] = useState({
    initialPrice: "100",
    strikePrice: "95",
    maturity: "1.0",
    riskFreeRate: "0.10",
    volatility: "0.20",
    numPaths: "200000",
    numDates: "2540",
  })

  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const calculatePrice = () => {
    setIsCalculating(true)

    setTimeout(() => {
      try {
        const S0 = Number.parseFloat(inputs.initialPrice)
        const K = Number.parseFloat(inputs.strikePrice)
        const T = Number.parseFloat(inputs.maturity)
        const r = Number.parseFloat(inputs.riskFreeRate)
        const sigma = Number.parseFloat(inputs.volatility)
        const numPaths = Number.parseInt(inputs.numPaths)
        const numDates = Number.parseInt(inputs.numDates)

        if (isNaN(S0) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(sigma) || isNaN(numPaths) || isNaN(numDates)) {
          throw new Error("Please enter valid numbers for all fields")
        }

        if (S0 <= 0 || K <= 0 || T <= 0 || sigma <= 0 || numPaths <= 0 || numDates <= 0) {
          throw new Error("All parameters must be positive")
        }

        const result = priceLookbackCallOption(S0, K, T, r, sigma, numPaths, numDates)
        setResults(result)
      } catch (error) {
        setResults({ error: error instanceof Error ? error.message : "Calculation error" })
      }

      setIsCalculating(false)
    }, 2500) // Longer delay for intensive Monte Carlo simulation
  }

  const resetForm = () => {
    setInputs({
      initialPrice: "100",
      strikePrice: "95",
      maturity: "1.0",
      riskFreeRate: "0.10",
      volatility: "0.20",
      numPaths: "200000",
      numDates: "2540",
    })
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portfolio
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-light text-black">
                  Lookback Call <span className="font-semibold">Option Pricer</span>
                </h1>
                <p className="text-gray-600 mt-2">Monte Carlo pricing for path-dependent options</p>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Pricing Disclaimer</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    <strong>Warning:</strong> The prices displayed are indicative only and may not be accurate due to
                    the high computational power required for precise lookback option pricing. For production use,
                    significantly more Monte Carlo paths (10M+) and finer time discretization would be needed to achieve
                    institutional-grade accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="border border-gray-100 shadow-minimal">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Option Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Market Parameters */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Market Parameters</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="initialPrice" className="text-black font-medium">
                        Initial Stock Price (S₀)
                      </Label>
                      <Input
                        id="initialPrice"
                        type="number"
                        step="0.01"
                        value={inputs.initialPrice}
                        onChange={(e) => handleInputChange("initialPrice", e.target.value)}
                        placeholder="100.00"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="strikePrice" className="text-black font-medium">
                        Strike Price (K)
                      </Label>
                      <Input
                        id="strikePrice"
                        type="number"
                        step="0.01"
                        value={inputs.strikePrice}
                        onChange={(e) => handleInputChange("strikePrice", e.target.value)}
                        placeholder="95.00"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="volatility" className="text-black font-medium">
                        Volatility (σ)
                      </Label>
                      <Input
                        id="volatility"
                        type="number"
                        step="0.01"
                        value={inputs.volatility}
                        onChange={(e) => handleInputChange("volatility", e.target.value)}
                        placeholder="0.20"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">0.20 = 20% annual volatility</p>
                    </div>
                    <div>
                      <Label htmlFor="riskFreeRate" className="text-black font-medium">
                        Risk-Free Rate (r)
                      </Label>
                      <Input
                        id="riskFreeRate"
                        type="number"
                        step="0.001"
                        value={inputs.riskFreeRate}
                        onChange={(e) => handleInputChange("riskFreeRate", e.target.value)}
                        placeholder="0.10"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">0.10 = 10% annual rate</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maturity" className="text-black font-medium">
                      Time to Maturity (T)
                    </Label>
                    <Input
                      id="maturity"
                      type="number"
                      step="0.01"
                      value={inputs.maturity}
                      onChange={(e) => handleInputChange("maturity", e.target.value)}
                      placeholder="1.0"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0 = 1 year</p>
                  </div>
                </div>

                {/* Simulation Parameters */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Label className="text-base font-semibold text-purple-900 mb-3 block">Monte Carlo Parameters</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numPaths" className="text-black font-medium">
                        Number of Paths
                      </Label>
                      <Input
                        id="numPaths"
                        type="number"
                        step="10000"
                        value={inputs.numPaths}
                        onChange={(e) => handleInputChange("numPaths", e.target.value)}
                        placeholder="200000"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">Higher = more accuracy</p>
                    </div>
                    <div>
                      <Label htmlFor="numDates" className="text-black font-medium">
                        Time Steps per Path
                      </Label>
                      <Input
                        id="numDates"
                        type="number"
                        step="100"
                        value={inputs.numDates}
                        onChange={(e) => handleInputChange("numDates", e.target.value)}
                        placeholder="2540"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">Daily steps for 10 years</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={calculatePrice}
                    disabled={isCalculating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-none"
                  >
                    {isCalculating ? "Running Monte Carlo..." : "Price Option"}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="rounded-none bg-transparent">
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border border-gray-100 shadow-minimal">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Pricing Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!results ? (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure option parameters and click "Price Option" to see results</p>
                  </div>
                ) : results.error ? (
                  <div className="text-center py-12 text-red-600">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-2">{results.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Simulation Trajectories Chart */}
                    {results.chartData && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          Simulation Trajectories ({SAMPLE_PATHS} sample paths)
                        </h4>
                        <div className="w-full h-56 bg-gray-50 rounded-lg p-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                              <XAxis
                                dataKey="t"
                                tickFormatter={(v) => `${v}y`}
                                tick={{ fontSize: 10, fill: "#6b7280" }}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={false}
                              />
                              <YAxis
                                tickFormatter={(v) => `$${v}`}
                                tick={{ fontSize: 10, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                                width={48}
                              />
                              <Tooltip
                                formatter={(v: any, name: string) => [`$${Number(v).toFixed(2)}`, `Path ${name.replace("p", "")}`]}
                                labelFormatter={(l) => `t = ${l}y`}
                                contentStyle={{ fontSize: 11, borderRadius: 4, border: "1px solid #e5e7eb" }}
                              />
                              <ReferenceLine y={results.K} stroke="#9333ea" strokeDasharray="4 2" label={{ value: "Strike", position: "insideTopRight", fontSize: 10, fill: "#9333ea" }} />
                              {Array.from({ length: SAMPLE_PATHS }, (_, i) => (
                                <Line
                                  key={i}
                                  type="monotone"
                                  dataKey={`p${i}`}
                                  dot={false}
                                  strokeWidth={1}
                                  stroke={i === 0 ? "#9333ea" : `hsl(${260 + i * 8}, 60%, ${55 + i * 1.5}%)`}
                                  opacity={0.6}
                                  isAnimationActive={false}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Option Price */}
                    <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-center mb-2">
                        <Target className="h-5 w-5 mr-2 text-purple-700" />
                        <p className="text-sm font-medium text-purple-700">Lookback Call Option Price</p>
                      </div>
                      <p className="text-4xl font-bold text-purple-800">${results.price.toFixed(4)}</p>
                      <p className="text-sm text-purple-600 mt-1">
                        ± ${results.priceError.toFixed(4)} (95% confidence)
                      </p>
                    </div>

                    {/* Delta */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center mb-2">
                        <Activity className="h-4 w-4 mr-2 text-gray-700" />
                        <p className="text-sm font-medium text-gray-700">Delta (Δ)</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{results.delta.toFixed(4)}</p>
                      <p className="text-xs text-gray-600 mt-1">± {results.deltaError.toFixed(4)} (95% confidence)</p>
                    </div>

                    {/* Key Statistics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-purple-900">In-the-Money Prob.</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">
                          {(results.inTheMoneyProb * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Probability of positive payoff</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Avg. Max Price</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">${results.avgMaxPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-1">Average maximum during paths</p>
                      </div>
                    </div>

                    {/* Confidence Intervals */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">95% Confidence Intervals</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700 font-medium">Option Price:</span>
                          <span className="ml-2">
                            [${results.priceCI[0].toFixed(4)}, ${results.priceCI[1].toFixed(4)}]
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Delta:</span>
                          <span className="ml-2">
                            [{results.deltaCI[0].toFixed(4)}, {results.deltaCI[1].toFixed(4)}]
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Simulations:</span>
                          <span className="ml-2">{results.simulations.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Time Steps:</span>
                          <span className="ml-2">{results.timeSteps.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Model Information */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Model Information</h4>
                      <p className="text-sm text-purple-800">
                        Priced using Monte Carlo simulation with geometric Brownian motion. The lookback call option
                        payoff is max(S_max - K, 0) where S_max is the maximum stock price reached during the option's
                        life. Delta is calculated using the pathwise derivative method.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Educational Content */}
          <Card className="mt-8 border border-gray-100 shadow-minimal">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Understanding Lookback Call Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Eye className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-purple-900">Path Dependency</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Payoff depends on maximum price reached</li>
                    <li>• Not just final stock price at expiration</li>
                    <li>• Requires full path simulation</li>
                    <li>• Higher value than vanilla options</li>
                    <li>• Perfect hindsight advantage</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Target className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Fixed Strike Feature</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Strike price is predetermined</li>
                    <li>• Payoff = max(S_max - K, 0)</li>
                    <li>• Always non-negative payoff</li>
                    <li>• Higher strike = lower option value</li>
                    <li>• Optimal exercise at maximum</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Pricing Challenges</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• No closed-form solution</li>
                    <li>• Requires Monte Carlo simulation</li>
                    <li>• High computational intensity</li>
                    <li>• Statistical error estimation</li>
                    <li>• Delta calculation complexity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
