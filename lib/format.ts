const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatPrice = (price: number) => priceFormatter.format(price)

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export const formatListedDate = (date: Date) => dateFormatter.format(date)

// Stay dates are stored as UTC midnight (@db.Date), so format in UTC to avoid showing the day before
const stayDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export const formatStayDate = (date: Date) => stayDateFormatter.format(date)

export const formatStayDates = (checkIn: Date, checkOut: Date) => stayDateFormatter.formatRange(checkIn, checkOut)
