import * as XLSX from "xlsx"

// Format date for Excel file name
export const formatDateForFileName = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Export data to Excel for DataPedagang (admin view)
export const exportDataPedagangToExcel = (data, filters = {}) => {
  // Create worksheet data
  const headers = [["DATA PEDAGANG"], [], ["No", "Sub Variant", "Satuan"]]

  // Get all markets from the first item
  const markets = data.length > 0 ? Object.keys(data[0].marketPrices || {}) : []

  // Add market names to headers
  headers[2].push(...markets, "Harga Rata-rata Kemarin", "Harga Rata-rata Hari ini")

  const worksheet = XLSX.utils.aoa_to_sheet(headers)

  // Merge cells for the title
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers[2].length - 1 } }]

  // Add data rows
  data.forEach((item, index) => {
    const row = [item.no, item.subVariant, item.satuan]

    // Add market prices
    markets.forEach((market) => {
      row.push(item.marketPrices[market] ? item.marketPrices[market] : "-")
    })

    // Add averages
    row.push(item.rataKemarin, item.rataHariIni)

    // Add row to worksheet
    XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 })
  })

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet["!ref"])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let max_width = 0
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (!worksheet[cell_ref]) continue
      const cell_value = worksheet[cell_ref].v
      const cell_text = String(cell_value)
      const width = cell_text.length
      if (width > max_width) max_width = width
    }
    worksheet["!cols"] = worksheet["!cols"] || []
    worksheet["!cols"][C] = { wch: max_width + 2 }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pedagang")

  // Generate file name with filters
  let fileName = "Data_Pedagang"
  if (filters.pasar) {
    fileName += `_${filters.pasar}`
  }
  if (filters.date) {
    fileName += `_${formatDateForFileName(filters.date)}`
  } else {
    fileName += `_${formatDateForFileName(new Date())}`
  }
  fileName += ".xlsx"

  // Export to Excel
  XLSX.writeFile(workbook, fileName)
}

// Export data to Excel for DataPerpasar (user view)
export const exportDataPerpasarToExcel = (marketData, selectedMarket, date) => {
  // Create worksheet data
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Kertas Kerja Pemantauan Harga Barang Kebutuhan Pokok"],
    [`Pasar: ${selectedMarket}`],
    [
      `Tanggal: ${new Date(date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    ],
    [],
    [
      "No",
      "Variant",
      "Satuan",
      "Pedagang 1",
      "Pedagang 2",
      "Pedagang 3",
      "Rata-rata Hari Ini",
      "Rata-rata Kemarin",
      "Keterangan",
    ],
  ])

  // Get commodities for the selected market
  const commodityIds = Object.keys(marketData)

  // Add data rows
  commodityIds.forEach((id, index) => {
    const data = marketData[id]
    if (!data) return

    const merchants = data.merchantPrices || []

    // Add row to worksheet
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          index + 1,
          data.commodity.name,
          data.commodity.unit,
          merchants[0] ? `Rp ${merchants[0].price.toLocaleString()}` : "-",
          merchants[1] ? `Rp ${merchants[1].price.toLocaleString()}` : "-",
          merchants[2] ? `Rp ${merchants[2].price.toLocaleString()}` : "-",
          `Rp ${data.avgToday.toLocaleString()}`,
          `Rp ${data.avgYesterday.toLocaleString()}`,
          data.notes || "-",
        ],
      ],
      { origin: -1 },
    )
  })

  // Auto-size columns
  const range = XLSX.utils.decode_range(worksheet["!ref"])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let max_width = 0
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (!worksheet[cell_ref]) continue
      const cell_value = worksheet[cell_ref].v
      const cell_text = String(cell_value)
      const width = cell_text.length
      if (width > max_width) max_width = width
    }
    worksheet["!cols"] = worksheet["!cols"] || []
    worksheet["!cols"][C] = { wch: max_width + 2 }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perpasar")

  // Generate file name
  const fileName = `Data_Pasar_${selectedMarket}_${formatDateForFileName(date)}.xlsx`

  // Export to Excel
  XLSX.writeFile(workbook, fileName)
}
