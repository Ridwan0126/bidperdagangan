// Format number to Indonesian Rupiah
export const formatRupiah = (number) => {
  if (number === null || number === undefined) return "-"

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number)
}

// Format date to Indonesian format
export const formatDate = (dateString) => {
  if (!dateString) return "-"

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}
