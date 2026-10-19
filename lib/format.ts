const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatPrice = (price: number) => priceFormatter.format(price)

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export const formatListedDate = (date: Date) => dateFormatter.format(date)
