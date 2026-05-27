export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'

interface CurrencyInfo {
  symbol: string
  code: string
  label: string
  locale: string
  decimals: number
}

const currencyConfig: Record<Currency, CurrencyInfo> = {
  USD: { symbol: '$', code: 'USD', label: 'USD ($)', locale: 'en-US', decimals: 2 },
  INR: { symbol: '₹', code: 'INR', label: 'INR (₹)', locale: 'en-IN', decimals: 2 },
  EUR: { symbol: '€', code: 'EUR', label: 'EUR (€)', locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '£', code: 'GBP', label: 'GBP (£)', locale: 'en-GB', decimals: 2 },
  JPY: { symbol: '¥', code: 'JPY', label: 'JPY (¥)', locale: 'ja-JP', decimals: 0 },
  CAD: { symbol: 'C$', code: 'CAD', label: 'CAD (C$)', locale: 'en-CA', decimals: 2 },
  AUD: { symbol: 'A$', code: 'AUD', label: 'AUD (A$)', locale: 'en-AU', decimals: 2 },
}

export function getCurrency(): Currency {
  return (localStorage.getItem('currency') as Currency) || 'USD'
}

export function setCurrency(c: Currency) {
  localStorage.setItem('currency', c)
}

export function currencySymbol(): string {
  return currencyConfig[getCurrency()].symbol
}

export function formatCurrency(amount: number): string {
  const c = currencyConfig[getCurrency()]
  try {
    return amount.toLocaleString(c.locale, {
      style: 'currency',
      currency: c.code,
      minimumFractionDigits: c.decimals,
      maximumFractionDigits: c.decimals,
    })
  } catch {
    return `${c.symbol}${amount.toFixed(c.decimals)}`
  }
}

export function currencyLabel(): string {
  return currencyConfig[getCurrency()].label
}

export function currencyOptions() {
  return Object.entries(currencyConfig).map(([key, val]) => ({
    value: key as Currency,
    label: val.label,
  }))
}
