export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function uniqueCount(values: string[]) {
  return new Set(values).size
}

export function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function percent(value: number) {
  return `${Math.round(value)}%`
}

export function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

export function monthKey(dateIso: string) {
  return dateIso.slice(0, 7)
}

export function monthLabel(key: string) {
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
  })
    .format(date)
    .replace('.', '')
}
