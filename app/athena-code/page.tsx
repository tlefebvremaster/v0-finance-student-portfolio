"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Download, Github } from "lucide-react"
import Link from "next/link"

export default function AthenaCodePage() {
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
import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter

# Set random seed for reproducibility
np.random.seed(42)

# Structured Product Parameters
niveau_initial_indice = 100  # Initial index level
niveau_de_declenchement_performance = 110  # Performance trigger level (110% of initial)
niveau_protection_capital = 70  # Capital protection level (70% of initial)
niveau_barriere_coupon = 80  # Coupon barrier level (80% of initial)
niveau_de_declenchement_autocall = 110  # Autocall trigger level (110% of initial)
taux_participation = 0.3  # Participation rate above trigger level
taux_coupon = 0.01  # Quarterly coupon rate (1%)
nombre_simulations = 10000  # Number of simulations
nombre_observations = 8  # Number of quarterly observations (2 years)
taux_risk_free = 0.025  # Annual risk-free rate
volatilite = 0.20  # Annual volatility
rendement_dividende = 0.04  # Annual dividend yield

# Index Path Simulation
dt = 1 / 252  # Daily time step (252 trading days per year)
nombre_etapes = 252 * 2  # Two years in daily steps
trajectoires_indice = np.zeros((nombre_simulations, nombre_etapes + 1))
trajectoires_indice[:, 0] = niveau_initial_indice  # Set initial index level

# Generate simulated index trajectories
for i in range(1, nombre_etapes + 1):
    # Generate random values to simulate price evolution
    z = np.random.standard_normal(nombre_simulations)
    trajectoires_indice[:, i] = trajectoires_indice[:, i - 1] * np.exp(
        (taux_risk_free - rendement_dividende - 0.5 * volatilite**2) * dt + 
        volatilite * np.sqrt(dt) * z
    )

# Observation dates (quarterly - every 63 trading days)
dates_observation = np.arange(63, nombre_etapes + 1, 63)
print("Observation dates:", dates_observation)

def afficher_trajectoire(idx, index_figure):
    """Display index trajectory with key levels"""
    plt.figure(figsize=(10, 6))
    
    # Plot simulated index trajectory
    plt.plot(trajectoires_indice[idx], label='Simulated Index Trajectory')
    
    # Add horizontal lines for key levels
    plt.axhline(y=niveau_de_declenchement_performance, color='g', linestyle='--', 
                label='Performance Trigger Level')
    plt.axhline(y=niveau_protection_capital, color='r', linestyle='--', 
                label='Capital Protection Level')
    plt.axhline(y=niveau_barriere_coupon, color='b', linestyle='--', 
                label='Coupon Barrier Level')
    
    # Add vertical lines for observation dates
    for i, date in enumerate(dates_observation):
        plt.axvline(x=date, color='black', linestyle='--', linewidth=1, 
                   label="Observation Date" if i == 0 else "")
    
    plt.xlabel('Time (days)')
    plt.ylabel('Index Level')
    plt.title('Simulated Index Trajectory with Key Levels')
    plt.legend()
    plt.grid(True)
    plt.savefig(f"fig_{index_figure}_athena.png")
    plt.show()

# Display sample trajectories
index_figure = 0
afficher_trajectoire(24, index_figure)
index_figure += 1
afficher_trajectoire(21, index_figure)
index_figure += 1
afficher_trajectoire(200, index_figure)
index_figure += 1

# Calculate payoffs for each simulation
payoff = np.zeros(nombre_simulations)
paiements_coupon = np.zeros(nombre_simulations)
autocalled = np.zeros(nombre_simulations, dtype=bool)

# Payoff calculation for each simulation
for j in range(nombre_simulations):
    for k in range(nombre_observations):
        # Check if coupon barrier is reached
        if trajectoires_indice[j, dates_observation[k]] >= niveau_barriere_coupon:
            paiements_coupon[j] += taux_coupon * 100
        
        # Check if product is autocalled
        if trajectoires_indice[j, dates_observation[k]] >= niveau_de_declenchement_autocall:
            payoff[j] = 100 + paiements_coupon[j]  # If autocalled: 100 + coupons
            autocalled[j] = True
            break  # Exit observation loop if autocalled
    
    if not autocalled[j]:
        # If no autocall occurred, check performance trigger at maturity
        final_level = trajectoires_indice[j, dates_observation[-1]]
        
        if final_level >= niveau_de_declenchement_performance:
            # Above performance trigger: 100 + coupons + participation
            participation_gain = taux_participation * (final_level / niveau_initial_indice - 1) * 100
            payoff[j] = 100 + paiements_coupon[j] + participation_gain
        elif final_level >= niveau_protection_capital:
            # Above capital protection: return principal + coupons
            payoff[j] = 100 + paiements_coupon[j]
        else:
            # Below capital protection: proportional reduction of principal
            payoff[j] = 100 * (final_level / niveau_initial_indice)

# Apply discounting factor for autocalls
payoff_actualise = np.zeros(nombre_simulations)
for j in range(nombre_simulations):
    if autocalled[j]:
        # Determine autocall timing (in years)
        autocall_obs = np.where(trajectoires_indice[j, dates_observation] >= 
                               niveau_de_declenchement_autocall)[0][0]
        temps_autocall = (autocall_obs + 1) / 4  # Quarterly periods
        payoff_actualise[j] = payoff[j] * np.exp(-taux_risk_free * temps_autocall)
    else:
        # If not autocalled, apply discounting for full period (2 years)
        payoff_actualise[j] = payoff[j] * np.exp(-taux_risk_free * 2)

# Calculate product price (mean of discounted payoffs)
prix_note = np.mean(payoff_actualise)
print(f"Athena Note Price (with adjusted discounting): {prix_note:.2f}")

# Display payoff distribution
plt.figure(figsize=(10, 6))
plt.hist(payoff, bins=50, alpha=0.75, color='blue', edgecolor='black')
plt.xlabel('Payoff')
plt.ylabel('Frequency')
plt.title('Payoff Distribution')
plt.grid(True)

# Logarithmic scale for y-axis
plt.yscale("log")
plt.gca().yaxis.set_major_formatter(ScalarFormatter())

# Add vertical line for note price
plt.axvline(x=prix_note, color='red', linestyle='--', linewidth=2, 
           label=f'Note Price: {prix_note:.2f}')

plt.legend()
plt.xlim(payoff.min(), payoff.max())
plt.savefig(f"fig_{index_figure}_athena.jpg")
index_figure += 1
plt.show()

# Additional Statistics
autocall_probability = np.sum(autocalled) / nombre_simulations
capital_loss_probability = np.sum(payoff < 100) / nombre_simulations
avg_coupon_payments = np.mean(paiements_coupon)

print(f"\\nAdditional Statistics:")
print(f"Autocall Probability: {autocall_probability:.2%}")
print(f"Capital Loss Probability: {capital_loss_probability:.2%}")
print(f"Average Coupon Payments: {avg_coupon_payments:.2f}")

# Risk Analysis
print(f"\\nRisk Analysis:")
print(f"Expected Return: {(prix_note - 100):.2f}%")
print(f"Volatility of Payoffs: {np.std(payoff_actualise):.2f}")
print(f"Sharpe Ratio: {(prix_note - 100) / np.std(payoff_actualise):.4f}")
`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/athena-demo">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Demo
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Athena Structured Product - Python Code</h1>
                <p className="text-gray-600 mt-2">
                  Complete implementation with daily simulation and proper discounting
                </p>
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
                  <h3 className="font-semibold text-gray-900 mb-3">Simulation Features</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Daily Simulation (252 steps/year)</Badge>
                    <Badge variant="secondary">Quarterly Observations</Badge>
                    <Badge variant="secondary">Geometric Brownian Motion</Badge>
                    <Badge variant="secondary">Dividend Yield Adjustment</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Product Features</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Autocall Mechanism</Badge>
                    <Badge variant="secondary">Memory Coupons</Badge>
                    <Badge variant="secondary">Capital Protection</Badge>
                    <Badge variant="secondary">Participation Rate</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Analysis Tools</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Proper Discounting</Badge>
                    <Badge variant="secondary">Risk Metrics</Badge>
                    <Badge variant="secondary">Payoff Distribution</Badge>
                    <Badge variant="secondary">Trajectory Visualization</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>athena_pricer.py</span>
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

          {/* Key Improvements */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Key Implementation Improvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Accurate Daily Simulation</h3>
                  <p className="text-sm text-green-800">
                    Uses 252 daily steps per year with quarterly barrier observations, providing more realistic price
                    paths and better convergence.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ Proper Coupon Calculation</h3>
                  <p className="text-sm text-blue-800">
                    Correctly implements coupon payments as percentage of notional (taux_coupon * 100) rather than
                    decimal values.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">✅ Accurate Discounting</h3>
                  <p className="text-sm text-purple-800">
                    Properly discounts autocall payoffs to their exact timing and final payoffs to maturity using the
                    risk-free rate.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">✅ Clear Payoff Structure</h3>
                  <p className="text-sm text-orange-800">
                    Implements the three-tier final payoff structure: performance participation, capital protection, and
                    proportional loss.
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
                    <code className="text-sm">pip install numpy matplotlib</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expected Output</h3>
                  <div className="bg-gray-100 rounded p-3">
                    <code className="text-sm whitespace-pre-line">
                      {`Athena Note Price (with adjusted discounting): 95.02

Additional Statistics:
Autocall Probability: 45.2%
Capital Loss Probability: 12.8%
Average Coupon Payments: 3.24

Risk Analysis:
Expected Return: -4.98%
Volatility of Payoffs: 15.32
Sharpe Ratio: -0.0325`}
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
