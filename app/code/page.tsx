"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Download, Github } from "lucide-react"
import Link from "next/link"

export default function CodePage() {
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
from scipy.stats import norm
import math

class OptionPricer:
    """
    Comprehensive Options Pricing Engine
    Implements Black-Scholes, Monte Carlo, and Binomial Tree models
    """
    
    def __init__(self):
        self.models = ['black_scholes', 'monte_carlo', 'binomial_tree']
    
    def black_scholes(self, S, K, T, r, sigma, option_type='call'):
        """
        Black-Scholes Option Pricing Model
        
        Parameters:
        S: Current stock price
        K: Strike price
        T: Time to expiration (in years)
        r: Risk-free rate
        sigma: Volatility
        option_type: 'call' or 'put'
        """
        try:
            # Calculate d1 and d2
            d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
            d2 = d1 - sigma * np.sqrt(T)
            
            if option_type.lower() == 'call':
                price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
            else:  # put
                price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
            
            # Calculate Greeks
            greeks = self.calculate_greeks(S, K, T, r, sigma, option_type)
            
            return {
                'price': round(price, 4),
                'greeks': greeks,
                'model': 'Black-Scholes'
            }
        except Exception as e:
            return {'error': str(e)}
    
    def monte_carlo(self, S, K, T, r, sigma, option_type='call', num_simulations=100000):
        """
        Monte Carlo Option Pricing Model
        """
        try:
            # Generate random price paths
            dt = T
            random_shocks = np.random.normal(0, 1, num_simulations)
            
            # Calculate final stock prices
            ST = S * np.exp((r - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * random_shocks)
            
            # Calculate payoffs
            if option_type.lower() == 'call':
                payoffs = np.maximum(ST - K, 0)
            else:  # put
                payoffs = np.maximum(K - ST, 0)
            
            # Discount back to present value
            price = np.exp(-r * T) * np.mean(payoffs)
            
            return {
                'price': round(price, 4),
                'model': 'Monte Carlo',
                'simulations': num_simulations,
                'confidence_interval': [
                    round(price - 1.96 * np.std(payoffs) / np.sqrt(num_simulations), 4),
                    round(price + 1.96 * np.std(payoffs) / np.sqrt(num_simulations), 4)
                ]
            }
        except Exception as e:
            return {'error': str(e)}
    
    def binomial_tree(self, S, K, T, r, sigma, option_type='call', steps=100):
        """
        Binomial Tree Option Pricing Model
        """
        try:
            dt = T / steps
            u = np.exp(sigma * np.sqrt(dt))  # up factor
            d = 1 / u  # down factor
            p = (np.exp(r * dt) - d) / (u - d)  # risk-neutral probability
            
            # Initialize asset prices at maturity
            asset_prices = np.zeros(steps + 1)
            for i in range(steps + 1):
                asset_prices[i] = S * (u ** (steps - i)) * (d ** i)
            
            # Initialize option values at maturity
            option_values = np.zeros(steps + 1)
            for i in range(steps + 1):
                if option_type.lower() == 'call':
                    option_values[i] = max(0, asset_prices[i] - K)
                else:  # put
                    option_values[i] = max(0, K - asset_prices[i])
            
            # Step backwards through the tree
            for j in range(steps - 1, -1, -1):
                for i in range(j + 1):
                    option_values[i] = np.exp(-r * dt) * (p * option_values[i] + (1 - p) * option_values[i + 1])
            
            return {
                'price': round(option_values[0], 4),
                'model': 'Binomial Tree',
                'steps': steps
            }
        except Exception as e:
            return {'error': str(e)}
    
    def calculate_greeks(self, S, K, T, r, sigma, option_type='call'):
        """
        Calculate option Greeks using Black-Scholes
        """
        try:
            d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
            d2 = d1 - sigma * np.sqrt(T)
            
            if option_type.lower() == 'call':
                delta = norm.cdf(d1)
                theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) 
                        - r * K * np.exp(-r * T) * norm.cdf(d2)) / 365
            else:  # put
                delta = norm.cdf(d1) - 1
                theta = (-S * norm.pdf(d1) * sigma / (2 * np.sqrt(T)) 
                        + r * K * np.exp(-r * T) * norm.cdf(-d2)) / 365
            
            gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
            vega = S * norm.pdf(d1) * np.sqrt(T) / 100
            rho = K * T * np.exp(-r * T) * norm.cdf(d2 if option_type.lower() == 'call' else -d2) / 100
            
            return {
                'delta': round(delta, 4),
                'gamma': round(gamma, 4),
                'theta': round(theta, 4),
                'vega': round(vega, 4),
                'rho': round(rho, 4)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def price_option(self, S, K, T, r, sigma, option_type='call', model='black_scholes', **kwargs):
        """
        Main method to price options using specified model
        """
        if model == 'black_scholes':
            return self.black_scholes(S, K, T, r, sigma, option_type)
        elif model == 'monte_carlo':
            return self.monte_carlo(S, K, T, r, sigma, option_type, 
                                  kwargs.get('num_simulations', 100000))
        elif model == 'binomial_tree':
            return self.binomial_tree(S, K, T, r, sigma, option_type, 
                                    kwargs.get('steps', 100))
        else:
            return {'error': 'Invalid model specified'}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Portfolio
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Python Options Pricing Engine</h1>
                <p className="text-gray-600 mt-2">Complete source code with multiple pricing models</p>
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
              <CardTitle>Features & Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing Models</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Black-Scholes</Badge>
                    <Badge variant="secondary">Monte Carlo</Badge>
                    <Badge variant="secondary">Binomial Tree</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Greeks Calculation</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">Delta</Badge>
                    <Badge variant="secondary">Gamma</Badge>
                    <Badge variant="secondary">Theta</Badge>
                    <Badge variant="secondary">Vega</Badge>
                    <Badge variant="secondary">Rho</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Option Types</h3>
                  <div className="space-y-2">
                    <Badge variant="secondary">European Calls</Badge>
                    <Badge variant="secondary">European Puts</Badge>
                    <Badge variant="secondary">Risk Analysis</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>option_pricer.py</span>
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
                    <code className="text-sm">pip install numpy scipy</code>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Basic Usage</h3>
                  <div className="bg-gray-100 rounded p-3">
                    <code className="text-sm whitespace-pre-line">
                      {`pricer = OptionPricer()
result = pricer.price_option(
    S=100,      # Stock price
    K=105,      # Strike price  
    T=0.25,     # Time to expiration
    r=0.05,     # Risk-free rate
    sigma=0.2,  # Volatility
    option_type='call',
    model='black_scholes'
)`}
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
