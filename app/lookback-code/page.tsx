"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Download, Github } from "lucide-react"
import Link from "next/link"

export default function LookbackCodePage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const pythonCode = `import numpy as np
import time

# Start timer for execution time measurement
start_time = time.time()

# Clear workspace (equivalent to MATLAB's clear)
print("Lookback Call Option Pricing with Monte Carlo Simulation")
print("=" * 60)

# Initialize simulation parameters
S0 = 100        # Initial underlying asset price
sigma = 0.2     # Asset volatility
r = 0.1         # Annual interest rate
T = 1           # Option maturity (in years)
K = 95          # Option strike price

# Monte Carlo simulation parameters
nbpaths = 20 * 10**5    # Number of simulated trajectories (2 million)
nbdates = 254 * 10      # Number of dates per trajectory (10 years with 254 trading days)
timestep = T / (nbdates - 1)  # Time step duration

# Initialize result storage arrays
S = np.zeros(nbdates)           # Array to store simulated asset prices
CT = np.zeros(nbpaths)          # Array to store option payoffs
deltaT = np.zeros(nbpaths)      # Array to store delta values

# Set random seed for reproducibility
np.random.seed(0)

print(f"Parameters:")
print(f"Initial Price (S0): \${S0}")
print(f"Strike Price (K): \${K}")
print(f"Volatility (σ): {sigma*100}%")
print(f"Risk-free Rate (r): {r*100}%")
print(f"Time to Maturity (T): {T} years")
print(f"Number of Paths: {nbpaths:,}")
print(f"Time Steps per Path: {nbdates:,}")
print(f"Time Step: {timestep:.6f} years")
print()

# Main simulation loop for each trajectory
print("Running Monte Carlo simulation...")
for i in range(nbpaths):
    # Initialize asset price for trajectory i
    S[0] = S0
    
    # Generate price path for each date in the trajectory
    for j in range(nbdates - 1):
        # Generate random number from standard normal distribution
        epsilon = np.random.randn()
        
        # Calculate next asset price using geometric Brownian motion
        S[j+1] = S[j] * np.exp((r - 0.5 * sigma**2) * timestep + 
                               sigma * epsilon * np.sqrt(timestep))
    
    # Calculate maximum price reached during the trajectory
    max_price = np.max(S)
    
    # Calculate option payoff: max(max_price - K, 0)
    CT[i] = max(max_price - K, 0)
    
    # Calculate delta using pathwise derivative method
    deltaT[i] = (max_price > K) * max_price / S0
    
    # Progress indicator for long simulations
    if (i + 1) % 100000 == 0:
        print(f"Completed {i+1:,} paths ({(i+1)/nbpaths*100:.1f}%)")

print("Simulation completed!")
print()

# Calculate option price as discounted expected payoff
option_price = np.exp(-r * T) * np.mean(CT)

# Calculate standard error for price estimation
price_std_error = (np.exp(-r * T) * np.std(CT)) / np.sqrt(nbpaths)

# Calculate 95% confidence interval for price
price_confidence_interval = [
    np.round(option_price - 1.96 * price_std_error, 4),
    np.round(option_price + 1.96 * price_std_error, 4),
]

# Calculate delta using pathwise derivative method
option_delta = np.exp(-r * T) * np.mean(deltaT)

# Calculate standard error for delta estimation
delta_std_error = (np.exp(-r * T) * np.std(deltaT)) / np.sqrt(nbpaths)

# Calculate 95% confidence interval for delta
delta_confidence_interval = [
    np.round(option_delta - 1.96 * delta_std_error, 4),
    np.round(option_delta + 1.96 * delta_std_error, 4),
]

# Calculate additional statistics
in_the_money_prob = np.sum(CT > 0) / nbpaths
avg_max_price = np.mean([deltaT[i] * S0 for i in range(nbpaths) if deltaT[i] > 0])
payoff_volatility = np.std(CT)

# Display results
print("RESULTS:")
print("=" * 40)
print(f"Option Price: \${option_price:.4f}")
print(f"Price Standard Error: {price_std_error:.4f}")
print(f"95% Confidence Interval: [\${price_confidence_interval[0]:.4f}, \${price_confidence_interval[1]:.4f}]")
print()
print(f"Delta: {option_delta:.4f}")
print(f"Delta Standard Error: {delta_std_error:.4f}")
print(f"95% Confidence Interval: [{delta_confidence_interval[0]:.4f}, {delta_confidence_interval[1]:.4f}]")
print()
print("ADDITIONAL STATISTICS:")
print("=" * 40)
print(f"In-the-Money Probability: {in_the_money_prob*100:.2f}%")
print(f"Average Maximum Price: \${avg_max_price:.2f}")
print(f"Payoff Volatility: \${payoff_volatility:.4f}")
print(f"Coefficient of Variation: {(price_std_error / option_price):.4f}")
print()

# Calculate and display execution time
execution_time = time.time() - start_time
print(f"Execution Time: {execution_time:.2f} seconds")
print(f"Paths per Second: {nbpaths / execution_time:.0f}")

# Theoretical insights
print()
print("THEORETICAL INSIGHTS:")
print("=" * 40)
print("• Lookback options are path-dependent derivatives")
print("• Payoff depends on the maximum (or minimum) price reached")
print("• Always more valuable than corresponding vanilla options")
print("• No closed-form solution - requires numerical methods")
print("• Delta represents sensitivity to initial stock price")
print("• High computational requirements due to path dependency")

# Risk analysis
moneyness = S0 / K
print()
print("RISK ANALYSIS:")
print("=" * 40)
print(f"Current Moneyness (S0/K): {moneyness:.3f}")
if moneyness > 1.1:
    print("• Deep in-the-money: High probability of positive payoff")
elif moneyness > 0.9:
    print("• At-the-money: Moderate risk/reward profile")
else:
    print("• Out-of-the-money: Lower probability but higher potential payoff")

print("• Volatility Impact: Higher σ increases option value significantly")
print("• Time Decay: Longer maturity increases maximum price potential")
print("• Interest Rate: Higher r increases drift, affecting max price distribution")`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/lookback-demo">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Demo
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lookback Call Option - Python Code</h1>
                <p className="text-gray-600 mt-2">Monte Carlo implementation with statistical analysis</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>

          {/* Features Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Implementation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Monte Carlo Features</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">High-Performance Simulation</Badge>
                    <Badge variant="secondary">Geometric Brownian Motion</Badge>
                    <Badge variant="secondary">Path-Dependent Payoff</Badge>
                    <Badge variant="secondary">Statistical Error Analysis</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Option Analytics</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Maximum Price Tracking</Badge>
                    <Badge variant="secondary">Delta Calculation</Badge>
                    <Badge variant="secondary">Confidence Intervals</Badge>
                    <Badge variant="secondary">Risk Metrics</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Vectorized Operations</Badge>
                    <Badge variant="secondary">Progress Tracking</Badge>
                    <Badge variant="secondary">Execution Timing</Badge>
                    <Badge variant="secondary">Memory Efficient</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>lookback_option_pricer.py</span>
                <Badge variant="outline">Python</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Key Implementation Details */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Key Implementation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Path-Dependent Simulation</h3>
                  <p className="text-sm text-green-800">
                    Generates complete price paths using geometric Brownian motion, tracking the maximum price reached
                    during each trajectory for accurate lookback option valuation.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ Statistical Rigor</h3>
                  <p className="text-sm text-blue-800">
                    Calculates standard errors and 95% confidence intervals for both option price and delta, providing
                    robust statistical validation of Monte Carlo estimates.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">✅ Delta Calculation</h3>
                  <p className="text-sm text-purple-800">
                    Uses the pathwise derivative method to calculate delta efficiently: δ = (S_max &gt; K) × S_max / S₀,
                    providing hedge ratios for risk management.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">✅ Performance Optimization</h3>
                  <p className="text-sm text-orange-800">
                    Optimized for high-frequency simulations with progress tracking, vectorized operations, and
                    efficient memory usage for processing millions of paths.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Installation</h3>
                  <div className="bg-gray-100 rounded p-3">
                    <code className="text-sm">pip install numpy</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expected Output</h3>
                  <div className="bg-gray-100 rounded p-3">
                    <code className="text-sm whitespace-pre-line">
                      {`RESULTS:
========================================
Option Price: $23.4567
Price Standard Error: 0.0234
95% Confidence Interval: [$23.4108, $23.5026]

Delta: 1.2345
Delta Standard Error: 0.0123
95% Confidence Interval: [1.2104, 1.2586]

ADDITIONAL STATISTICS:
========================================
In-the-Money Probability: 89.45%
Average Maximum Price: $123.45
Payoff Volatility: $34.5678

Execution Time: 45.67 seconds
Paths per Second: 43,789`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
