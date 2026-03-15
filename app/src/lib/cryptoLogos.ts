// ============================================
// SHARED CRYPTO LOGO MAP
// ============================================
// Real crypto logos served from /crypto-logos/
// Usage: <CryptoLogo symbol="BTC" size={40} />

export const CRYPTO_LOGOS: Record<string, string> = {
  BTC: '/crypto-logos/btc.png',
  ETH: '/crypto-logos/eth.png',
  USDT: '/crypto-logos/usdt.png',
  BNB: '/crypto-logos/bnb.png',
  SOL: '/crypto-logos/sol.png',
  DOGE: '/crypto-logos/doge.png',
  SHIB: '/crypto-logos/shib.png',
  TRX: '/crypto-logos/trx.png',
  USDC: '/crypto-logos/usdc.png',
}

export const CRYPTO_COLORS: Record<string, string> = {
  BTC: 'from-orange-500 to-yellow-500',
  ETH: 'from-blue-500 to-indigo-500',
  USDT: 'from-emerald-500 to-green-500',
  BNB: 'from-yellow-500 to-orange-500',
  SOL: 'from-purple-500 to-violet-500',
  DOGE: 'from-yellow-400 to-amber-500',
  SHIB: 'from-red-500 to-orange-500',
  TRX: 'from-red-500 to-rose-500',
  USDC: 'from-blue-400 to-blue-600',
  XRP: 'from-blue-400 to-cyan-500',
  ADA: 'from-blue-600 to-purple-500',
  GHS: 'from-emerald-500 to-teal-500',
  USD: 'from-green-500 to-emerald-500',
}

export const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  BNB: 'BNB',
  SOL: 'Solana',
  DOGE: 'Dogecoin',
  SHIB: 'Shiba Inu',
  TRX: 'TRON',
  USDC: 'USD Coin',
  XRP: 'Ripple',
  ADA: 'Cardano',
  DOT: 'Polkadot',
  GHS: 'Ghana Cedis',
  USD: 'US Dollar',
}

/**
 * Get the logo URL for a crypto symbol.
 * Returns undefined if no logo is available.
 */
export function getCryptoLogo(symbol: string): string | undefined {
  return CRYPTO_LOGOS[symbol.toUpperCase()]
}
