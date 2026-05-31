import numpy as np
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
        Black-Scholes Option Pricing Model for European Options
        
        Parameters:
        S: Current stock price
        K: Strike price  
        T: Time to expiration (in years)
        r: Risk-free rate (annual)
        sigma: Volatility (annual)
        option_type: 'call' for Call Option or 'put' for Put Option
        
        Returns:
        Dictionary containing option price and Greeks
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
            return {'error': 'Invalid model specified'}

# Example usage and testing
if __name__ == "__main__":
    pricer = OptionPricer()
    
    # Example parameters
    S = 100  # Current stock price
    K = 105  # Strike price
    T = 0.25  # 3 months to expiration
    r = 0.05  # 5% risk-free rate
    sigma = 0.2  # 20% volatility
    
    print("=== Option Pricing Results ===")
    print(f"Stock Price: ${S}")
    print(f"Strike Price: ${K}")
    print(f"Time to Expiration: {T} years")
    print(f"Risk-free Rate: {r*100}%")
    print(f"Volatility: {sigma*100}%")
    print()
    
    # Test both call and put options
    print("=== CALL OPTION ===")
    call_result = pricer.price_option(S, K, T, r, sigma, 'call', 'black_scholes')
    print(f"Call Price: ${call_result.get('price', 'Error')}")

    print("\n=== PUT OPTION ===") 
    put_result = pricer.price_option(S, K, T, r, sigma, 'put', 'black_scholes')
    print(f"Put Price: ${put_result.get('price', 'Error')}")

    # Show put-call parity verification
    if 'price' in call_result and 'price' in put_result:
        call_price = call_result['price']
        put_price = put_result['price']
        parity_check = call_price - put_price - (S - K * np.exp(-r * T))
        print(f"\nPut-Call Parity Check: {round(parity_check, 6)} (should be ~0)")
    
    # Test all models
    for model in ['black_scholes', 'monte_carlo', 'binomial_tree']:
        print(f"--- {model.replace('_', ' ').title()} ---")
        call_result = pricer.price_option(S, K, T, r, sigma, 'call', model)
        put_result = pricer.price_option(S, K, T, r, sigma, 'put', model)
        
        print(f"Call Price: ${call_result.get('price', 'Error')}")
        print(f"Put Price: ${put_result.get('price', 'Error')}")
        print()
