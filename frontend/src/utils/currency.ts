export type Currency = 'USD' | 'INR'

const currencyConfig: Record<Currency, { symbol: string; code: string; label: string }> = {
  USD: { symbol: '$', code: 'USD', label: 'USD ($)' },
  INR: { symbol: '₹', code: 'INR', label: 'INR (₹)' },
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
  const c = getCurrency()
  const sym = currencyConfig[c].symbol
  if (c === 'INR') {
    return `${sym}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${sym}${amount.toFixed(2)}`
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
