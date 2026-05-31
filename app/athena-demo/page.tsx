"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, TrendingUp, BarChart3, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

// Box-Muller transformation for normal random numbers
function normalRandom(): number {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Corrected French Structured Product Pricing Engine (based on your implementation)
function priceFrenchStructuredProduct(
  S0: number,
  performanceTrigger: number,
  capitalProtection: number,
  couponBarrier: number,
  autocallTrigger: number,
  participationRate: number,
  couponRate: number,
  maturity: number,
  riskFreeRate: number,
  volatility: number,
  dividendYield: number,
  numSimulations: number,
) {
  try {
    if (S0 <= 0 || maturity <= 0 || volatility <= 0 || numSimulations <= 0) {
      throw new Error("Invalid parameters")
    }

    // Daily simulation parameters
    const dt = 1 / 252 // Daily time step (252 trading days per year)
    const totalSteps = Math.floor(252 * maturity) // Total daily steps
    const observationDates: number[] = []

    // Quarterly observation dates (every 63 trading days)
    for (let i = 63; i <= totalSteps; i += 63) {
      observationDates.push(i)
    }

    const numObservations = observationDates.length

    let totalPayoff = 0
    let autocallCount = 0
    let capitalLossCount = 0
    const allPayoffs: number[] = []
    const finalPayoffs: number[] = []
    const autocallTimes: number[] = []
    const couponsCollected: number[] = []
    const maturities: number[] = []

    for (let sim = 0; sim < numSimulations; sim++) {
      // Initialize path
      const path = new Array(totalSteps + 1)
      path[0] = S0

      // Generate daily path using geometric Brownian motion
      for (let step = 1; step <= totalSteps; step++) {
        const z = normalRandom()
        path[step] =
          path[step - 1] *
          Math.exp((riskFreeRate - dividendYield - 0.5 * volatility * volatility) * dt + volatility * Math.sqrt(dt) * z)
      }

      let couponPayments = 0
      let autocalled = false
      let autocallTime = 0

      // Check barriers at quarterly observation dates
      for (let obsIdx = 0; obsIdx < numObservations; obsIdx++) {
        const obsDate = observationDates[obsIdx]
        const currentLevel = path[obsDate]

        // Check for coupon payment
        if (currentLevel >= couponBarrier) {
          couponPayments += couponRate * 100 // 1% of notional (100)
        }

        // Check for autocall
        if (currentLevel >= autocallTrigger) {
          autocalled = true
          autocallTime = (obsIdx + 1) / 4 // Time in years (quarterly periods)
          autocallCount++
          autocallTimes.push(autocallTime)
          maturities.push(autocallTime)
          couponsCollected.push(couponPayments / 100)

          // Autocall payoff: 100 + accumulated coupons
          const payoff = 100 + couponPayments
          const discountedPayoff = payoff * Math.exp(-riskFreeRate * autocallTime)
          totalPayoff += discountedPayoff
          allPayoffs.push(discountedPayoff)
          break
        }
      }

      // If not autocalled, calculate final payoff
      if (!autocalled) {
        const finalLevel = path[observationDates[numObservations - 1]]
        let finalPayoff: number

        if (finalLevel >= performanceTrigger) {
          // Above performance trigger: 100 + coupons + participation
          const participationGain = participationRate * (finalLevel / S0 - 1) * 100
          finalPayoff = 100 + couponPayments + participationGain
        } else if (finalLevel >= capitalProtection) {
          // Above capital protection: 100 + coupons
          finalPayoff = 100 + couponPayments
        } else {
          // Below capital protection: proportional loss
          finalPayoff = 100 * (finalLevel / S0)
          capitalLossCount++
        }

        finalPayoffs.push(finalPayoff)
        maturities.push(maturity)
        couponsCollected.push(couponPayments / 100)
        const discountedPayoff = finalPayoff * Math.exp(-riskFreeRate * maturity)
        totalPayoff += discountedPayoff
        allPayoffs.push(discountedPayoff)
      }
    }

    const averagePrice = totalPayoff / numSimulations
    const autocallProbability = autocallCount / numSimulations
    const capitalLossProbability = capitalLossCount / numSimulations

    // Calculate statistics
    const avgAutocallTime =
      autocallTimes.length > 0 ? autocallTimes.reduce((a, b) => a + b, 0) / autocallTimes.length : 0
    const avgFinalPayoff = finalPayoffs.length > 0 ? finalPayoffs.reduce((a, b) => a + b, 0) / finalPayoffs.length : 0
    const avgCouponPayments = couponRate * 100 * numObservations * (1 - autocallProbability)

    // === NEW RISK METRICS ===

    // 1. VaR and CVaR (95%)
    const sortedPayoffs = [...allPayoffs].sort((a, b) => a - b)
    const varIndex = Math.floor(0.05 * numSimulations)
    const var95 = 100 - sortedPayoffs[varIndex] // Loss relative to notional
    const cvarPayoffs = sortedPayoffs.slice(0, varIndex)
    const cvar95 = cvarPayoffs.length > 0 
      ? 100 - cvarPayoffs.reduce((a, b) => a + b, 0) / cvarPayoffs.length 
      : var95

    // 2. Average Expected Maturity (weighted average life)
    const avgExpectedMaturity = maturities.reduce((a, b) => a + b, 0) / numSimulations

    // 3. Coupon Capture Rate (expected coupons / max possible coupons)
    const maxCoupons = couponRate * numObservations // Max coupons as % of notional
    const avgCoupons = couponsCollected.reduce((a, b) => a + b, 0) / numSimulations
    const couponCaptureRate = maxCoupons > 0 ? avgCoupons / maxCoupons : 0

    // 4. Break-Even Barrier (minimum final level to recover capital)
    // Below capital protection, payoff = 100 * (finalLevel / S0)
    // Break-even when payoff = 100, so finalLevel = S0
    // But with coupons, it's lower. Approximate as capital protection level.
    const breakEvenBarrier = capitalProtection / S0 // As percentage of initial

    // 5. Greeks via finite differences
    const bumpSize = 0.01 // 1% bump

    // Delta: bump S0 by 1%
    const priceUp = runSimulation(S0 * (1 + bumpSize), performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate, volatility, dividendYield, Math.min(numSimulations, 5000))
    const priceDown = runSimulation(S0 * (1 - bumpSize), performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate, volatility, dividendYield, Math.min(numSimulations, 5000))
    const delta = (priceUp - priceDown) / (2 * bumpSize * S0)

    // Vega: bump volatility by 1%
    const priceVolUp = runSimulation(S0, performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate, volatility + bumpSize, dividendYield, Math.min(numSimulations, 5000))
    const priceVolDown = runSimulation(S0, performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate, volatility - bumpSize, dividendYield, Math.min(numSimulations, 5000))
    const vega = (priceVolUp - priceVolDown) / (2 * bumpSize)

    // Rho: bump risk-free rate by 1%
    const priceRateUp = runSimulation(S0, performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate + bumpSize, volatility, dividendYield, Math.min(numSimulations, 5000))
    const priceRateDown = runSimulation(S0, performanceTrigger, capitalProtection, couponBarrier, autocallTrigger, participationRate, couponRate, maturity, riskFreeRate - bumpSize, volatility, dividendYield, Math.min(numSimulations, 5000))
    const rho = (priceRateUp - priceRateDown) / (2 * bumpSize)

    return {
      price: averagePrice / 100,
      autocallProbability,
      capitalLossProbability,
      avgAutocallTime,
      avgFinalPayoff: avgFinalPayoff / 100,
      avgCouponPayments: avgCouponPayments / 100,
      simulations: numSimulations,
      model: "Monte Carlo (Daily Simulation)",
      var95: var95 / 100,
      cvar95: cvar95 / 100,
      avgExpectedMaturity,
      couponCaptureRate,
      breakEvenBarrier,
      delta,
      vega,
      rho,
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Structured product pricing error" }
  }
}

// Helper function for Greeks calculation (simplified simulation returning price only)
function runSimulation(
  S0: number,
  performanceTrigger: number,
  capitalProtection: number,
  couponBarrier: number,
  autocallTrigger: number,
  participationRate: number,
  couponRate: number,
  maturity: number,
  riskFreeRate: number,
  volatility: number,
  dividendYield: number,
  numSimulations: number,
): number {
  const dt = 1 / 252
  const totalSteps = Math.floor(252 * maturity)
  const observationDates: number[] = []
  for (let i = 63; i <= totalSteps; i += 63) {
    observationDates.push(i)
  }
  const numObservations = observationDates.length
  let totalPayoff = 0

  for (let sim = 0; sim < numSimulations; sim++) {
    const path = new Array(totalSteps + 1)
    path[0] = S0

    for (let step = 1; step <= totalSteps; step++) {
      const z = normalRandom()
      path[step] = path[step - 1] * Math.exp((riskFreeRate - dividendYield - 0.5 * volatility * volatility) * dt + volatility * Math.sqrt(dt) * z)
    }

    let couponPayments = 0
    let autocalled = false

    for (let obsIdx = 0; obsIdx < numObservations; obsIdx++) {
      const obsDate = observationDates[obsIdx]
      const currentLevel = path[obsDate]

      if (currentLevel >= couponBarrier) {
        couponPayments += couponRate * 100
      }

      if (currentLevel >= autocallTrigger) {
        autocalled = true
        const autocallTime = (obsIdx + 1) / 4
        const payoff = 100 + couponPayments
        totalPayoff += payoff * Math.exp(-riskFreeRate * autocallTime)
        break
      }
    }

    if (!autocalled) {
      const finalLevel = path[observationDates[numObservations - 1]]
      let finalPayoff: number

      if (finalLevel >= performanceTrigger) {
        const participationGain = participationRate * (finalLevel / S0 - 1) * 100
        finalPayoff = 100 + couponPayments + participationGain
      } else if (finalLevel >= capitalProtection) {
        finalPayoff = 100 + couponPayments
      } else {
        finalPayoff = 100 * (finalLevel / S0)
      }

      totalPayoff += finalPayoff * Math.exp(-riskFreeRate * maturity)
    }
  }

  return totalPayoff / numSimulations
}

export default function AthenaDemoPage() {
  const [inputs, setInputs] = useState({
    initialLevel: "100",
    performanceTrigger: "110",
    capitalProtection: "70",
    couponBarrier: "80",
    autocallTrigger: "110",
    participationRate: "0.30",
    couponRate: "0.01",
    maturity: "2.0",
    riskFreeRate: "0.025",
    volatility: "0.20",
    dividendYield: "0.04",
    numSimulations: "10000",
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
        const S0 = Number.parseFloat(inputs.initialLevel)
        const maturity = Number.parseFloat(inputs.maturity)
        const riskFreeRate = Number.parseFloat(inputs.riskFreeRate)
        const volatility = Number.parseFloat(inputs.volatility)
        const numSims = Number.parseInt(inputs.numSimulations)

        if (isNaN(S0) || isNaN(maturity) || isNaN(riskFreeRate) || isNaN(volatility) || isNaN(numSims)) {
          throw new Error("Please enter valid numbers for all fields")
        }

        if (S0 <= 0 || maturity <= 0 || volatility <= 0 || numSims <= 0) {
          throw new Error("Price, maturity, volatility, and simulations must be positive")
        }

        const result = priceFrenchStructuredProduct(
          S0,
          Number.parseFloat(inputs.performanceTrigger),
          Number.parseFloat(inputs.capitalProtection),
          Number.parseFloat(inputs.couponBarrier),
          Number.parseFloat(inputs.autocallTrigger),
          Number.parseFloat(inputs.participationRate),
          Number.parseFloat(inputs.couponRate),
          maturity,
          riskFreeRate,
          volatility,
          Number.parseFloat(inputs.dividendYield),
          numSims,
        )

        setResults(result)
      } catch (error) {
        setResults({ error: error instanceof Error ? error.message : "Calculation error" })
      }

      setIsCalculating(false)
    }, 2000) // Longer delay for daily simulation
  }

  const resetForm = () => {
    setInputs({
      initialLevel: "100",
      performanceTrigger: "110",
      capitalProtection: "70",
      couponBarrier: "80",
      autocallTrigger: "110",
      participationRate: "0.30",
      couponRate: "0.01",
      maturity: "2.0",
      riskFreeRate: "0.025",
      volatility: "0.20",
      dividendYield: "0.04",
      numSimulations: "10000",
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
                  Athena Structured <span className="font-semibold">Product Pricer</span>
                </h1>
                <p className="text-gray-600 mt-2">Advanced Monte Carlo pricing with daily simulation</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <Card className="border border-gray-100 shadow-minimal">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Product Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Index Parameters */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Index Parameters</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="initialLevel" className="text-black font-medium">
                        Initial Index Level
                      </Label>
                      <Input
                        id="initialLevel"
                        type="number"
                        step="0.01"
                        value={inputs.initialLevel}
                        onChange={(e) => handleInputChange("initialLevel", e.target.value)}
                        placeholder="100.00"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
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
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="dividendYield" className="text-black font-medium">
                      Dividend Yield
                    </Label>
                    <Input
                      id="dividendYield"
                      type="number"
                      step="0.01"
                      value={inputs.dividendYield}
                      onChange={(e) => handleInputChange("dividendYield", e.target.value)}
                      placeholder="0.04"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.04 = 4% annual dividend yield</p>
                  </div>
                </div>

                {/* Trigger Levels */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Label className="text-base font-semibold text-purple-900 mb-3 block">Trigger Levels (%)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="performanceTrigger" className="text-black font-medium">
                        Performance Trigger
                      </Label>
                      <Input
                        id="performanceTrigger"
                        type="number"
                        step="1"
                        value={inputs.performanceTrigger}
                        onChange={(e) => handleInputChange("performanceTrigger", e.target.value)}
                        placeholder="110"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">110 = 110% of initial</p>
                    </div>
                    <div>
                      <Label htmlFor="autocallTrigger" className="text-black font-medium">
                        Autocall Trigger
                      </Label>
                      <Input
                        id="autocallTrigger"
                        type="number"
                        step="1"
                        value={inputs.autocallTrigger}
                        onChange={(e) => handleInputChange("autocallTrigger", e.target.value)}
                        placeholder="110"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">110 = 110% of initial</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="couponBarrier" className="text-black font-medium">
                        Coupon Barrier
                      </Label>
                      <Input
                        id="couponBarrier"
                        type="number"
                        step="1"
                        value={inputs.couponBarrier}
                        onChange={(e) => handleInputChange("couponBarrier", e.target.value)}
                        placeholder="80"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">80 = 80% of initial</p>
                    </div>
                    <div>
                      <Label htmlFor="capitalProtection" className="text-black font-medium">
                        Capital Protection
                      </Label>
                      <Input
                        id="capitalProtection"
                        type="number"
                        step="1"
                        value={inputs.capitalProtection}
                        onChange={(e) => handleInputChange("capitalProtection", e.target.value)}
                        placeholder="70"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-purple-700 mt-1">70 = 70% of initial</p>
                    </div>
                  </div>
                </div>

                {/* Participation & Coupons */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label className="text-base font-semibold text-gray-900 mb-3 block">Participation & Coupons</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="participationRate" className="text-black font-medium">
                        Participation Rate
                      </Label>
                      <Input
                        id="participationRate"
                        type="number"
                        step="0.01"
                        value={inputs.participationRate}
                        onChange={(e) => handleInputChange("participationRate", e.target.value)}
                        placeholder="0.30"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-700 mt-1">0.30 = 30% participation</p>
                    </div>
                    <div>
                      <Label htmlFor="couponRate" className="text-black font-medium">
                        Quarterly Coupon Rate
                      </Label>
                      <Input
                        id="couponRate"
                        type="number"
                        step="0.001"
                        value={inputs.couponRate}
                        onChange={(e) => handleInputChange("couponRate", e.target.value)}
                        placeholder="0.01"
                        className="border-gray-200 rounded-none focus:border-purple-600"
                      />
                      <p className="text-xs text-gray-700 mt-1">0.01 = 1% per quarter</p>
                    </div>
                  </div>
                </div>

                {/* Product Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maturity" className="text-black font-medium">
                      Maturity (Years)
                    </Label>
                    <Input
                      id="maturity"
                      type="number"
                      step="0.25"
                      value={inputs.maturity}
                      onChange={(e) => handleInputChange("maturity", e.target.value)}
                      placeholder="2.0"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
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
                      placeholder="0.025"
                      className="border-gray-200 rounded-none focus:border-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.025 = 2.5%</p>
                  </div>
                </div>

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
                    placeholder="10000"
                    className="border-gray-200 rounded-none focus:border-purple-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher values = more accuracy (daily simulation)</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={calculatePrice}
                    disabled={isCalculating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-none"
                  >
                    {isCalculating ? "Running Daily Simulation..." : "Price Product"}
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
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure product parameters and click "Price Product" to see results</p>
                  </div>
                ) : results.error ? (
                  <div className="text-center py-12 text-red-600">
                    <p className="font-semibold">Error</p>
                    <p className="text-sm mt-2">{results.error}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Product Price */}
                    <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 mr-2 text-purple-700" />
                        <p className="text-sm font-medium text-purple-700">Athena Product Fair Value</p>
                      </div>
                      <p className="text-4xl font-bold text-purple-800">{(results.price * 100).toFixed(2)}%</p>
                      <p className="text-sm text-purple-600 mt-1">of notional amount</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-purple-900">Autocall Probability</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">
                          {(results.autocallProbability * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Chance of early redemption</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">Capital Loss Probability</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {(results.capitalLossProbability * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Risk of downside exposure</p>
                      </div>
                    </div>

                    {/* Additional Statistics */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Detailed Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700 font-medium">Avg. Autocall Time:</span>
                          <span className="ml-2">{results.avgAutocallTime.toFixed(2)} years</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Capital Loss Prob:</span>
                          <span className="ml-2">{(results.capitalLossProbability * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Avg. Coupon Payments:</span>
                          <span className="ml-2">{(results.avgCouponPayments * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium">Simulations:</span>
                          <span className="ml-2">{results.simulations.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Greeks */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3">Greeks (Sensitivities)</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white rounded border border-purple-100">
                          <p className="text-purple-600 font-medium mb-1">Delta</p>
                          <p className="text-xl font-bold text-purple-800">{results.delta.toFixed(4)}</p>
                          <p className="text-xs text-purple-600 mt-1">Price sensitivity to 1% spot move</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded border border-purple-100">
                          <p className="text-purple-600 font-medium mb-1">Vega</p>
                          <p className="text-xl font-bold text-purple-800">{results.vega.toFixed(4)}</p>
                          <p className="text-xs text-purple-600 mt-1">Price sensitivity to 1% vol move</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded border border-purple-100">
                          <p className="text-purple-600 font-medium mb-1">Rho</p>
                          <p className="text-xl font-bold text-purple-800">{results.rho.toFixed(4)}</p>
                          <p className="text-xs text-purple-600 mt-1">Price sensitivity to 1% rate move</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk Metrics */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Risk Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded border border-gray-100">
                          <p className="text-gray-600 font-medium text-sm mb-1">Value at Risk (95%)</p>
                          <p className="text-xl font-bold text-gray-800">{(results.var95 * 100).toFixed(2)}%</p>
                          <p className="text-xs text-gray-500 mt-1">Max loss at 95% confidence</p>
                        </div>
                        <div className="p-3 bg-white rounded border border-gray-100">
                          <p className="text-gray-600 font-medium text-sm mb-1">Expected Shortfall (95%)</p>
                          <p className="text-xl font-bold text-gray-800">{(results.cvar95 * 100).toFixed(2)}%</p>
                          <p className="text-xs text-gray-500 mt-1">Avg loss in worst 5% scenarios</p>
                        </div>
                      </div>
                    </div>

                    {/* Product-Specific Metrics */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Product-Specific Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1">Avg. Expected Maturity</p>
                          <p className="text-xl font-bold text-gray-800">{results.avgExpectedMaturity.toFixed(2)}y</p>
                          <p className="text-xs text-gray-500 mt-1">Weighted average life</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1">Coupon Capture Rate</p>
                          <p className="text-xl font-bold text-gray-800">{(results.couponCaptureRate * 100).toFixed(1)}%</p>
                          <p className="text-xs text-gray-500 mt-1">Expected vs max coupons</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded border border-gray-100">
                          <p className="text-gray-600 font-medium mb-1">Break-Even Barrier</p>
                          <p className="text-xl font-bold text-gray-800">{(results.breakEvenBarrier * 100).toFixed(0)}%</p>
                          <p className="text-xs text-gray-500 mt-1">Min level to recover capital</p>
                        </div>
                      </div>
                    </div>

                    {/* Model Information */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Model Information</h4>
                      <p className="text-sm text-purple-800">
                        Priced using Monte Carlo simulation with daily geometric Brownian motion (252 steps/year) and
                        quarterly barrier observations. All cash flows are properly discounted to present value using
                        the risk-free rate.
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
              <CardTitle className="text-xl font-semibold">Understanding Athena Structured Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-purple-900">Autocall Feature</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Automatic early redemption</li>
                    <li>• Triggered when underlying ≥ autocall barrier</li>
                    <li>• Investor receives principal + coupon</li>
                    <li>• Provides upside participation</li>
                    <li>• Reduces duration risk</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Shield className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Downside Protection</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Protected above capital protection level</li>
                    <li>• Principal guaranteed if barrier not breached</li>
                    <li>• Memory coupon accumulation</li>
                    <li>• Partial downside participation</li>
                    <li>• Enhanced yield potential</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Key Risks</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Credit risk of issuer</li>
                    <li>• Early redemption risk</li>
                    <li>• Barrier breach exposure</li>
                    <li>• Limited upside participation</li>
                    <li>• Liquidity constraints</li>
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
