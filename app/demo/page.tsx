"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, TrendingUp, Zap, BarChart3, GitBranch, GitCompare } from "lucide-react"
import Link from "next/link"

// Improved normal distribution functions
function normalCDF(x: number): number {
  // More accurate approximation using Abramowitz and Stegun
  if (x < 0) {
    return 1 - normalCDF(-x)
  }

  // Constants for the approximation
  const a1 = 0.31938153
  const a2 = -0.356563782
  const a3 = 1.781477937
  const a4 = -1.821255978
  const a5 = 1.330274429
  const p = 0.2316419

  const t = 1.0 / (1.0 + p * x)
  const y =
    1.0 -
    (1.0 / Math.sqrt(2 * Math.PI)) *
      Math.exp(-0.5 * x * x) *
      (a1 * t + a2 * t * t + a3 * t * t * t + a4 * t * t * t * t + a5 * t * t * t * t * t)

  return y
}

function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

// Box-Muller transformation for normal random numbers
function normalRandom(): number {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Black-Scholes implementation
function blackScholes(S: number, K: number, T: number, r: number, sigma: number, optionType: string) {
  try {
    // Input validation
    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
      throw new Error("Invalid parameters: all values must be positive")
    }

    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
    const d2 = d1 - sigma * Math.sqrt(T)

    let price: number
    if (optionType === "call") {
      price = S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2)
    } else {
      price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1)
    }

    // Calculate Greeks
    const delta = optionType === "call" ? normalCDF(d1) : normalCDF(d1) - 1
    const gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T))
    const theta =
      optionType === "call"
        ? ((-S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365
        : ((-S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365
    const vega = (S * normalPDF(d1) * Math.sqrt(T)) / 100
    const rho =
      optionType === "call"
        ? (K * T * Math.exp(-r * T) * normalCDF(d2)) / 100
        : (-K * T * Math.exp(-r * T) * normalCDF(-d2)) / 100

    return {
      price: Math.max(0, price),
      greeks: { delta, gamma, theta, vega, rho },
      model: "Black-Scholes",
      debug: { d1, d2, nd1: normalCDF(d1), nd2: normalCDF(d2), S, K, T, r, sigma },
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Calculation error" }
  }
}

// Monte Carlo implementation
function monteCarlo(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  optionType: string,
  numSimulations: number,
) {
  try {
    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0 || numSimulations <= 0) {
      throw new Error("Invalid parameters")
    }

    let payoffSum = 0
    const payoffs: number[] = []

    for (let i = 0; i < numSimulations; i++) {
      const randomShock = normalRandom()
      const ST = S * Math.exp((r - 0.5 * sigma * sigma) * T + sigma * Math.sqrt(T) * randomShock)

      let payoff: number
      if (optionType === "call") {
        payoff = Math.max(ST - K, 0)
      } else {
        payoff = Math.max(K - ST, 0)
      }

      payoffs.push(payoff)
      payoffSum += payoff
    }

    const avgPayoff = payoffSum / numSimulations
    const price = Math.exp(-r * T) * avgPayoff

    // Calculate standard error and confidence interval
    const variance = payoffs.reduce((sum, payoff) => sum + Math.pow(payoff - avgPayoff, 2), 0) / (numSimulations - 1)
    const standardError = Math.sqrt(variance / numSimulations)
    const discountedStdError = Math.exp(-r * T) * standardError

    const confidenceInterval = [Math.max(0, price - 1.96 * discountedStdError), price + 1.96 * discountedStdError]

    return {
      price: Math.max(0, price),
      model: "Monte Carlo",
      simulations: numSimulations,
      confidenceInterval,
      standardError: discountedStdError,
      debug: { avgPayoff, variance, S, K, T, r, sigma },
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Monte Carlo calculation error" }
  }
}

// Binomial Tree implementation
function binomialTree(S: number, K: number, T: number, r: number, sigma: number, optionType: string, steps: number) {
  try {
    if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0 || steps <= 0) {
      throw new Error("Invalid parameters")
    }

    const dt = T / steps
    const u = Math.exp(sigma * Math.sqrt(dt)) // up factor
    const d = 1 / u // down factor
    const p = (Math.exp(r * dt) - d) / (u - d) // risk-neutral probability

    // Validate risk-neutral probability
    if (p < 0 || p > 1) {
      throw new Error("Invalid risk-neutral probability")
    }

    // Initialize option values at maturity
    const optionValues: number[] = new Array(steps + 1)

    for (let i = 0; i <= steps; i++) {
      const ST = S * Math.pow(u, steps - i) * Math.pow(d, i)
      if (optionType === "call") {
        optionValues[i] = Math.max(0, ST - K)
      } else {
        optionValues[i] = Math.max(0, K - ST)
      }
    }

    // Step backwards through the tree
    for (let j = steps - 1; j >= 0; j--) {
      for (let i = 0; i <= j; i++) {
        optionValues[i] = Math.exp(-r * dt) * (p * optionValues[i] + (1 - p) * optionValues[i + 1])
      }
    }

    return {
      price: Math.max(0, optionValues[0]),
      model: "Binomial Tree",
      steps,
      upFactor: u,
      downFactor: d,
      riskNeutralProb: p,
      debug: { dt, S, K, T, r, sigma },
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Binomial tree calculation error" }
  }
}

export default function DemoPage() {
  const [inputs, setInputs] = useState({
    stockPrice: "100",
    strikePrice: "105",
    timeToExpiration: "0.25",
    riskFreeRate: "0.05",
    volatility: "0.20",
    optionType: "call",
    pricingModel: "black_scholes",
    numSimulations: "100000",
    numSteps: "100",
  })

  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [comparison, setComparison] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const calculatePrice = () => {
    setIsCalculating(true)

    // Simulate calculation delay for better UX
    setTimeout(
      () => {
        try {
          const S = Number.parseFloat(inputs.stockPrice)
          const K = Number.parseFloat(inputs.strikePrice)
          const T = Number.parseFloat(inputs.timeToExpiration)
          const r = Number.parseFloat(inputs.riskFreeRate)
          const sigma = Number.parseFloat(inputs.volatility)

          // Validate inputs
          if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(sigma)) {
            throw new Error("Please enter valid numbers for all fields")
          }

          if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
            throw new Error("Stock price, strike price, time, and volatility must be positive")
          }

          if (r < -1 || r > 1) {
            throw new Error("Risk-free rate should be between -100% and 100%")
          }

          let result: any

          switch (inputs.pricingModel) {
            case "black_scholes":
              result = blackScholes(S, K, T, r, sigma, inputs.optionType)
              break
            case "monte_carlo":
              const numSims = Number.parseInt(inputs.numSimulations)
              if (isNaN(numSims) || numSims <= 0) {
                throw new Error("Number of simulations must be a positive integer")
              }
              if (numSims > 10000000) {
                throw new Error("Number of simulations too large (max: 10,000,000)")
              }
              result = monteCarlo(S, K, T, r, sigma, inputs.optionType, numSims)
              break
            case "binomial_tree":
              const numSteps = Number.parseInt(inputs.numSteps)
              if (isNaN(numSteps) || numSteps <= 0) {
                throw new Error("Number of steps must be a positive integer")
              }
              if (numSteps > 10000) {
                throw new Error("Number of steps too large (max: 10,000)")
              }
              result = binomialTree(S, K, T, r, sigma, inputs.optionType, numSteps)
              break
            default:
              throw new Error("Invalid pricing model selected")
          }

          setResults(result)
        } catch (error) {
          setResults({ error: error instanceof Error ? error.message : "Calculation error" })
        }

        setIsCalculating(false)
      },
      inputs.pricingModel === "monte_carlo" ? 1000 : 500,
    )
  }

  const compareAllModels = () => {
    setIsComparing(true)
    setTimeout(() => {
      try {
        const S = Number.parseFloat(inputs.stockPrice)
        const K = Number.parseFloat(inputs.strikePrice)
        const T = Number.parseFloat(inputs.timeToExpiration)
        const r = Number.parseFloat(inputs.riskFreeRate)
        const sigma = Number.parseFloat(inputs.volatility)

        if (isNaN(S) || isNaN(K) || isNaN(T) || isNaN(r) || isNaN(sigma)) {
          throw new Error("Please enter valid numbers for all fields")
        }
        if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) {
          throw new Error("Stock price, strike price, time, and volatility must be positive")
        }

        const numSims = Number.parseInt(inputs.numSimulations) || 100000
        const numSteps = Number.parseInt(inputs.numSteps) || 100

        const bs = blackScholes(S, K, T, r, sigma, inputs.optionType) as any
        const mc = monteCarlo(S, K, T, r, sigma, inputs.optionType, numSims) as any
        const bt = binomialTree(S, K, T, r, sigma, inputs.optionType, numSteps) as any

        if (bs.error || mc.error || bt.error) {
          throw new Error(bs.error || mc.error || bt.error)
        }

        const prices = [bs.price, mc.price, bt.price]
        const avg = prices.reduce((a, b) => a + b, 0) / 3
        const maxDiff = Math.max(...prices) - Math.min(...prices)

        setComparison({ bs, mc, bt, avg, maxDiff, numSims, numSteps })
        setResults(null)
      } catch (error) {
        setComparison({ error: error instanceof Error ? error.message : "Comparison error" })
      }
      setIsComparing(false)
    }, 1200)
  }

  const resetForm = () => {
    setInputs({
      stockPrice: "100",
      strikePrice: "105",
      timeToExpiration: "0.25",
      riskFreeRate: "0.05",
      volatility: "0.20",
      optionType: "call",
      pricingModel: "black_scholes",
      numSimulations: "100000",
      numSteps: "100",
    })
    setResults(null)
  }

  const getModelIcon = (model: string) => {
    switch (model) {
      case "black_scholes":
        return <Zap className="h-4 w-4" />
      case "monte_carlo":
        return <BarChart3 className="h-4 w-4" />
      case "binomial_tree":
        return <GitBranch className="h-4 w-4" />
      default:
        return <Calculator className="h-4 w-4" />
    }
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
                  Advanced <span className="font-semibold">Options Pricing</span>
                </h1>
                <p className="text-gray-600 mt-2">Multiple pricing models with customizable parameters</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="border border-gray-100 shadow-minimal">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                  Option Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Option Type Toggle Buttons */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Option Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={inputs.optionType === "call" ? "default" : "outline"}
                      className={`flex-1 rounded-none ${
                        inputs.optionType === "call"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 bg-transparent"
                      }`}
                      onClick={() => handleInputChange("optionType", "call")}
                    >
                      📈 Call Option
                    </Button>
                    <Button
                      type="button"
                      variant={inputs.optionType === "put" ? "default" : "outline"}
                      className={`flex-1 rounded-none ${
                        inputs.optionType === "put"
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "hover:bg-gray-50 hover:text-black hover:border-black bg-transparent"
                      }`}
                      onClick={() => handleInputChange("optionType", "put")}
                    >
                      📉 Put Option
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {inputs.optionType === "call"
                      ? "Call: Right to BUY the stock at strike price"
                      : "Put: Right to SELL the stock at strike price"}
                  </p>
                </div>

                {/* Pricing Model Selection */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Pricing Model</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      variant={inputs.pricingModel === "black_scholes" ? "default" : "outline"}
                      className={`justify-start rounded-none ${
                        inputs.pricingModel === "black_scholes"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 bg-transparent"
                      }`}
                      onClick={() => handleInputChange("pricingModel", "black_scholes")}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Black-Scholes</div>
                        <div className="text-xs opacity-75">Analytical solution - Fast & precise</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={inputs.pricingModel === "monte_carlo" ? "default" : "outline"}
                      className={`justify-start rounded-none ${
                        inputs.pricingModel === "monte_carlo"
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "hover:bg-gray-50 hover:text-black hover:border-black bg-transparent"
                      }`}
                      onClick={() => handleInputChange("pricingModel", "monte_carlo")}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Monte Carlo</div>
                        <div className="text-xs opacity-75">Simulation-based - Flexible & powerful</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={inputs.pricingModel === "binomial_tree" ? "default" : "outline"}
                      className={`justify-start rounded-none ${
                        inputs.pricingModel === "binomial_tree"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 bg-transparent"
                      }`}
                      onClick={() => handleInputChange("pricingModel", "binomial_tree")}
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Binomial Tree</div>
                        <div className="text-xs opacity-75">Discrete model - Intuitive & visual</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Basic Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stockPrice" className="text-black font-medium">
                      Current Stock Price ($)
                    </Label>
                    <Input
                      id="stockPrice"
                      type="number"
                      step="0.01"
                      value={inputs.stockPrice}
                      onChange={(e) => handleInputChange("stockPrice", e.target.value)}
                      placeholder="100.00"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strikePrice" className="text-black font-medium">
                      Strike Price ($)
                    </Label>
                    <Input
                      id="strikePrice"
                      type="number"
                      step="0.01"
                      value={inputs.strikePrice}
                      onChange={(e) => handleInputChange("strikePrice", e.target.value)}
                      placeholder="105.00"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeToExpiration" className="text-black font-medium">
                      Time to Expiration (Years)
                    </Label>
                    <Input
                      id="timeToExpiration"
                      type="number"
                      step="0.01"
                      value={inputs.timeToExpiration}
                      onChange={(e) => handleInputChange("timeToExpiration", e.target.value)}
                      placeholder="0.25"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.25 = 3 months, 1.0 = 1 year</p>
                  </div>
                  <div>
                    <Label htmlFor="riskFreeRate" className="text-black font-medium">
                      Risk-Free Rate
                    </Label>
                    <Input
                      id="riskFreeRate"
                      type="number"
                      step="0.001"
                      value={inputs.riskFreeRate}
                      onChange={(e) => handleInputChange("riskFreeRate", e.target.value)}
                      placeholder="0.05"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.05 = 5%</p>
                  </div>
                </div>

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
                  <p className="text-xs text-gray-500 mt-1">0.20 = 20%</p>
                </div>

                {/* Model-Specific Parameters */}
                {inputs.pricingModel === "monte_carlo" && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Label className="text-sm font-semibold text-purple-900 mb-2 block">Monte Carlo Parameters</Label>
                    <div>
                      <Label htmlFor="numSimulations" className="text-black font-medium">
                        Number of Simulations
                      </Label>
                      <Input
                        id="numSimulations"
                        type="number"
                        step="1000"
                        value={inputs.numSimulations}
                        onChange={(e) => handleInputChange("numSimulations", e.target.value)}
                        placeholder="100000"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">
                        Higher values = more accuracy but slower calculation (recommended: 10,000 - 1,000,000)
                      </p>
                    </div>
                  </div>
                )}

                {inputs.pricingModel === "binomial_tree" && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">Binomial Tree Parameters</Label>
                    <div>
                      <Label htmlFor="numSteps" className="text-black font-medium">
                        Number of Steps
                      </Label>
                      <Input
                        id="numSteps"
                        type="number"
                        step="10"
                        value={inputs.numSteps}
                        onChange={(e) => handleInputChange("numSteps", e.target.value)}
                        placeholder="100"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-700 mt-1">
                        Higher values = more accuracy (recommended: 50 - 500)
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={calculatePrice}
                      disabled={isCalculating || isComparing}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-none"
                    >
                      {isCalculating
                        ? inputs.pricingModel === "monte_carlo"
                          ? "Running Simulation..."
                          : "Calculating..."
                        : "Calculate Price"}
                    </Button>
                    <Button onClick={resetForm} variant="outline" className="rounded-none bg-transparent">
                      Reset
                    </Button>
                  </div>
                  <Button
                    onClick={compareAllModels}
                    disabled={isCalculating || isComparing}
                    variant="outline"
                    className="w-full rounded-none border-black hover:bg-black hover:text-white bg-transparent"
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    {isComparing ? "Comparing Models..." : "Compare the 3 Models"}
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
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a pricing model and click "Calculate Price" to see results</p>
                  </div>
                ) : results.error ? (
                  <div className="text-center py-12 text-red-600">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-2">{results.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Option Price */}
                    <div
                      className={`text-center p-6 rounded-lg border-2 ${
                        inputs.optionType === "call" ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {getModelIcon(inputs.pricingModel)}
                        <p
                          className={`text-sm font-medium ml-2 ${
                            inputs.optionType === "call" ? "text-purple-700" : "text-gray-700"
                          }`}
                        >
                          {results.model} - {inputs.optionType.charAt(0).toUpperCase() + inputs.optionType.slice(1)}{" "}
                          Option Price
                        </p>
                      </div>
                      <p
                        className={`text-4xl font-bold ${
                          inputs.optionType === "call" ? "text-purple-800" : "text-gray-800"
                        }`}
                      >
                        ${results.price.toFixed(4)}
                      </p>
                    </div>

                    {/* Model-Specific Information */}
                    {results.model === "Monte Carlo" && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Monte Carlo Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-700 font-medium">Simulations:</span>
                            <span className="ml-2">{results.simulations.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Standard Error:</span>
                            <span className="ml-2">${results.standardError.toFixed(4)}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-700 font-medium">95% Confidence Interval:</span>
                            <span className="ml-2">
                              [${results.confidenceInterval[0].toFixed(4)}, ${results.confidenceInterval[1].toFixed(4)}]
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {results.model === "Binomial Tree" && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Binomial Tree Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-700 font-medium">Steps:</span>
                            <span className="ml-2">{results.steps}</span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Up Factor (u):</span>
                            <span className="ml-2">{results.upFactor.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Down Factor (d):</span>
                            <span className="ml-2">{results.downFactor.toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-gray-700 font-medium">Risk-Neutral Prob:</span>
                            <span className="ml-2">{results.riskNeutralProb.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Greeks (only for Black-Scholes) */}
                    {results.greeks && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Option Greeks</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Delta (Δ)</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {results.greeks.delta.toFixed(4)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Price sensitivity to stock price</p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Gamma (Γ)</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {results.greeks.gamma.toFixed(4)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Rate of change of delta</p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Theta (Θ)</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {results.greeks.theta.toFixed(4)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Time decay per day</p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Vega (ν)</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {results.greeks.vega.toFixed(4)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Sensitivity to volatility</p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded col-span-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Rho (ρ)</span>
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                {results.greeks.rho.toFixed(4)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Sensitivity to interest rate</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Model Information */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Model Information</h4>
                      <p className="text-sm text-purple-800">
                        {inputs.pricingModel === "black_scholes" &&
                          "Black-Scholes provides an analytical solution assuming constant volatility and risk-free rate. Greeks are calculated analytically."}
                        {inputs.pricingModel === "monte_carlo" &&
                          "Monte Carlo uses random simulation to estimate option prices. Confidence intervals show the uncertainty in the estimate."}
                        {inputs.pricingModel === "binomial_tree" &&
                          "Binomial Tree models price evolution as a series of up/down movements. More steps provide better accuracy."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Results */}
          {comparison && (
            <Card className="mt-8 border border-gray-100 shadow-minimal">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <GitCompare className="h-5 w-5 mr-2 text-purple-600" />
                  Model Comparison — {inputs.optionType.charAt(0).toUpperCase() + inputs.optionType.slice(1)} Option
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.error ? (
                  <p className="text-red-600 text-sm">{comparison.error}</p>
                ) : (
                  <div className="space-y-6">
                    {/* Price cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Black-Scholes */}
                      <div className="p-5 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Zap className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">Black-Scholes</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-800 my-2">${comparison.bs.price.toFixed(4)}</p>
                        <p className="text-xs text-purple-600">Analytical — exact result</p>
                        <div className="mt-3 pt-3 border-t border-purple-200 text-xs text-purple-700 space-y-1">
                          <p>Delta: {comparison.bs.greeks.delta.toFixed(4)}</p>
                          <p>Gamma: {comparison.bs.greeks.gamma.toFixed(4)}</p>
                          <p>Vega: {comparison.bs.greeks.vega.toFixed(4)}</p>
                        </div>
                      </div>

                      {/* Monte Carlo */}
                      <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <BarChart3 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-700">Monte Carlo</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 my-2">${comparison.mc.price.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">{comparison.numSims.toLocaleString()} simulations</p>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                          <p>Std Error: {comparison.mc.standardError.toFixed(4)}</p>
                          <p>95% CI: [{comparison.mc.confidenceInterval[0].toFixed(3)}, {comparison.mc.confidenceInterval[1].toFixed(3)}]</p>
                          <p className={`font-medium ${Math.abs(comparison.mc.price - comparison.bs.price) < 0.05 ? "text-green-600" : "text-orange-500"}`}>
                            vs B-S: {comparison.mc.price > comparison.bs.price ? "+" : ""}{(comparison.mc.price - comparison.bs.price).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {/* Binomial Tree */}
                      <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <GitBranch className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-700">Binomial Tree</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 my-2">${comparison.bt.price.toFixed(4)}</p>
                        <p className="text-xs text-gray-500">{comparison.numSteps} steps</p>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                          <p>Up Factor: {comparison.bt.upFactor.toFixed(4)}</p>
                          <p>RN Prob: {comparison.bt.riskNeutralProb.toFixed(4)}</p>
                          <p className={`font-medium ${Math.abs(comparison.bt.price - comparison.bs.price) < 0.05 ? "text-green-600" : "text-orange-500"}`}>
                            vs B-S: {comparison.bt.price > comparison.bs.price ? "+" : ""}{(comparison.bt.price - comparison.bs.price).toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">Average Price</p>
                        <p className="text-xl font-bold text-black">${comparison.avg.toFixed(4)}</p>
                      </div>
                      <div className="text-center border-x border-gray-200">
                        <p className="text-gray-500 mb-1">Max Spread</p>
                        <p className={`text-xl font-bold ${comparison.maxDiff < 0.05 ? "text-green-600" : "text-orange-500"}`}>
                          ${comparison.maxDiff.toFixed(4)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 mb-1">Convergence</p>
                        <p className={`text-xl font-bold ${comparison.maxDiff < 0.05 ? "text-green-600" : "text-orange-500"}`}>
                          {comparison.maxDiff < 0.01 ? "Excellent" : comparison.maxDiff < 0.05 ? "Good" : "Fair"}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      All three models are priced using the same parameters. A small spread confirms model convergence — the closer the prices, the higher the confidence in the result.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Model Comparison Educational Content */}
          <Card className="mt-8 border border-gray-100 shadow-minimal">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Pricing Model Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Zap className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-purple-900">Black-Scholes</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Analytical closed-form solution</li>
                    <li>• Fastest computation</li>
                    <li>• Provides Greeks automatically</li>
                    <li>• Assumes constant volatility</li>
                    <li>• Best for European options</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Monte Carlo</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Simulation-based approach</li>
                    <li>• Handles complex payoffs</li>
                    <li>• Provides confidence intervals</li>
                    <li>• Slower but very flexible</li>
                    <li>• Great for exotic options</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <GitBranch className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Binomial Tree</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Discrete time model</li>
                    <li>• Intuitive and visual</li>
                    <li>• Handles American options</li>
                    <li>• Converges to Black-Scholes</li>
                    <li>• Good for educational purposes</li>
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
