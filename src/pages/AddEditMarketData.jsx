"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa"

// Mock data for commodities
const commodities = [
  { id: 1, name: "Beras Cap C4 (Medium)", unit: "kg" },
  { id: 2, name: "Beras Cap C4 (Premium)", unit: "kg" },
  { id: 3, name: "Beras SPHP Bulog", unit: "kg" },
  { id: 4, name: "Kedelai Impor", unit: "kg" },
  { id: 5, name: "Cabai Merah Keriting", unit: "kg" },
  { id: 6, name: "Cabai Rawit", unit: "kg" },
  { id: 7, name: "Bawang Merah", unit: "kg" },
  { id: 8, name: "Bawang Putih", unit: "kg" },
  { id: 9, name: "Minyak Goreng Curah", unit: "liter" },
  { id: 10, name: "Gula Pasir", unit: "kg" },
]

// Mock data for markets
const markets = ["Sumowono", "Bandarjo", "Projo", "Ambarawa", "Jimbaran", "Bandungan", "Bergas", "Ungaran"]

// Mock data for existing entries (would come from API in real app)
const mockEntries = [
  {
    id: 1,
    date: "2025-05-07",
    market: "Sumowono",
    officer: "WINARNO",
    phone: "087855095948",
    commodities: [
      {
        id: 1,
        name: "Beras Cap C4 (Medium)",
        unit: "kg",
        merchants: [
          { id: 1, name: "Pedagang 1", price: 13000 },
          { id: 2, name: "Pedagang 2", price: 14000 },
          { id: 3, name: "Pedagang 3", price: 13000 },
        ],
        avgToday: 15000,
        avgYesterday: 14000,
        notes: "-",
      },
      {
        id: 2,
        name: "Beras Cap C4 (Premium)",
        unit: "kg",
        merchants: [
          { id: 1, name: "Pedagang 1", price: 15000 },
          { id: 2, name: "Pedagang 2", price: 16000 },
        ],
        avgToday: 15500,
        avgYesterday: 15000,
        notes: "-",
      },
    ],
    lastUpdated: new Date().toISOString(),
  },
]

const AddEditMarketData = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = !!id

  // Form state for officer info
  const [officerInfo, setOfficerInfo] = useState({
    market: user.role === "admin" ? "" : user.pasar,
    officer: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
  })

  // Form state for commodities
  const [selectedCommodities, setSelectedCommodities] = useState([])
  const [availableCommodities, setAvailableCommodities] = useState([...commodities])
  const [newCommodity, setNewCommodity] = useState("")

  // Form errors
  const [errors, setErrors] = useState({})

  // Modal state for merchant management
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [currentCommodity, setCurrentCommodity] = useState(null)
  const [editingMerchantIndex, setEditingMerchantIndex] = useState(null)
  const [merchantForm, setMerchantForm] = useState({
    price: "",
  })

  // Load data if editing
  useEffect(() => {
    if (isEditing) {
      const entry = mockEntries.find((entry) => entry.id === Number(id))
      if (entry) {
        setOfficerInfo({
          market: entry.market,
          officer: entry.officer,
          phone: entry.phone,
          date: entry.date,
        })

        setSelectedCommodities(
          entry.commodities.map((commodity) => ({
            ...commodity,
            merchants: commodity.merchants.map((merchant) => ({
              ...merchant,
              price: merchant.price.toString(),
            })),
          })),
        )

        // Update available commodities
        const selectedIds = entry.commodities.map((c) => c.id)
        setAvailableCommodities(commodities.filter((c) => !selectedIds.includes(c.id)))
      } else {
        navigate("/data-perpasar")
      }
    }
  }, [id, isEditing, navigate])

  // Handle officer info changes
  const handleOfficerInfoChange = (e) => {
    const { name, value } = e.target
    setOfficerInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add commodity to selected list
  const handleAddCommodity = () => {
    if (!newCommodity) return

    const commodity = availableCommodities.find((c) => c.id === Number(newCommodity))
    if (!commodity) return

    setSelectedCommodities((prev) => [
      ...prev,
      {
        ...commodity,
        merchants: [],
        avgToday: "",
        avgYesterday: "",
        notes: "",
      },
    ])

    setAvailableCommodities((prev) => prev.filter((c) => c.id !== Number(newCommodity)))
    setNewCommodity("")
  }

  // Remove commodity from selected list
  const handleRemoveCommodity = (commodityId) => {
    const commodity = selectedCommodities.find((c) => c.id === commodityId)

    setSelectedCommodities((prev) => prev.filter((c) => c.id !== commodityId))

    if (commodity) {
      setAvailableCommodities((prev) =>
        [
          ...prev,
          {
            id: commodity.id,
            name: commodity.name,
            unit: commodity.unit,
          },
        ].sort((a, b) => a.id - b.id),
      )
    }
  }

  // Update commodity data
  const handleCommodityChange = (commodityId, field, value) => {
    setSelectedCommodities((prev) => prev.map((c) => (c.id === commodityId ? { ...c, [field]: value } : c)))
  }

  // Open merchant modal for a commodity
  const handleOpenMerchantModal = (commodity, merchantIndex = null) => {
    setCurrentCommodity(commodity)
    setEditingMerchantIndex(merchantIndex)

    if (merchantIndex !== null) {
      setMerchantForm({
        price: commodity.merchants[merchantIndex].price,
      })
    } else {
      setMerchantForm({
        price: "",
      })
    }

    setShowMerchantModal(true)
  }

  // Add or update merchant
  const handleSaveMerchant = () => {
    if (!merchantForm.price) {
      alert("Harga harus diisi")
      return
    }

    setSelectedCommodities((prev) =>
      prev.map((c) => {
        if (c.id === currentCommodity.id) {
          const updatedMerchants = [...c.merchants]

          if (editingMerchantIndex !== null) {
            // Update existing merchant
            updatedMerchants[editingMerchantIndex] = {
              ...updatedMerchants[editingMerchantIndex],
              price: merchantForm.price,
            }
          } else {
            // Add new merchant
            updatedMerchants.push({
              id: updatedMerchants.length + 1,
              name: `Pedagang ${updatedMerchants.length + 1}`,
              price: merchantForm.price,
            })
          }

          return {
            ...c,
            merchants: updatedMerchants,
          }
        }
        return c
      }),
    )

    setShowMerchantModal(false)
  }

  // Remove merchant
  const handleRemoveMerchant = (commodityId, merchantId) => {
    setSelectedCommodities((prev) =>
      prev.map((c) => {
        if (c.id === commodityId) {
          // Remove the merchant
          const filteredMerchants = c.merchants.filter((m) => m.id !== merchantId)

          // Rename merchants to maintain sequence
          const renamedMerchants = filteredMerchants.map((merchant, i) => ({
            ...merchant,
            id: i + 1,
            name: `Pedagang ${i + 1}`,
          }))

          return {
            ...c,
            merchants: renamedMerchants,
          }
        }
        return c
      }),
    )
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!officerInfo.market) newErrors.market = "Pasar harus dipilih"
    if (!officerInfo.officer) newErrors.officer = "Nama petugas harus diisi"
    if (!officerInfo.phone) newErrors.phone = "Nomor HP harus diisi"
    if (!officerInfo.date) newErrors.date = "Tanggal harus diisi"

    if (selectedCommodities.length === 0) {
      newErrors.commodities = "Minimal satu komoditas harus dipilih"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // Process form data (in a real app, this would be an API call)
    const formData = {
      ...officerInfo,
      commodities: selectedCommodities.map((c) => ({
        ...c,
        merchants: c.merchants.map((m) => ({
          ...m,
          price: Number(m.price),
        })),
        avgToday: c.avgToday ? Number(c.avgToday) : 0,
        avgYesterday: c.avgYesterday ? Number(c.avgYesterday) : 0,
      })),
      lastUpdated: new Date().toISOString(),
    }

    console.log("Submitting data:", formData)

    // Redirect back to data page
    navigate("/data-perpasar")
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/data-perpasar")}
          className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          &larr; Kembali
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Data Pasar" : "Tambah Data Pasar"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Officer Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informasi Petugas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="market" className="block text-gray-700 text-sm font-bold mb-2">
                Pasar <span className="text-red-500">*</span>
              </label>
              {user.role === "admin" ? (
                <select
                  id="market"
                  name="market"
                  value={officerInfo.market}
                  onChange={handleOfficerInfoChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    errors.market ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Pilih Pasar</option>
                  {markets.map((market, index) => (
                    <option key={index} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="market"
                  name="market"
                  value={officerInfo.market}
                  readOnly
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                />
              )}
              {errors.market && <p className="text-red-500 text-xs italic">{errors.market}</p>}
            </div>

            <div>
              <label htmlFor="officer" className="block text-gray-700 text-sm font-bold mb-2">
                Nama Petugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="officer"
                name="officer"
                value={officerInfo.officer}
                onChange={handleOfficerInfoChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.officer ? "border-red-500" : ""
                }`}
              />
              {errors.officer && <p className="text-red-500 text-xs italic">{errors.officer}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                Nomor HP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={officerInfo.phone}
                onChange={handleOfficerInfoChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.phone ? "border-red-500" : ""
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={officerInfo.date}
                onChange={handleOfficerInfoChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.date ? "border-red-500" : ""
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs italic">{errors.date}</p>}
            </div>
          </div>
        </div>

        {/* Commodities */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Data Komoditas</h2>

            <div className="flex items-center">
              <select
                value={newCommodity}
                onChange={(e) => setNewCommodity(e.target.value)}
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              >
                <option value="">Pilih Komoditas</option>
                {availableCommodities.map((commodity) => (
                  <option key={commodity.id} value={commodity.id}>
                    {commodity.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddCommodity}
                disabled={!newCommodity}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                <FaPlus className="inline mr-1" /> Tambah
              </button>
            </div>
          </div>

          {errors.commodities && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.commodities}
            </div>
          )}

          {selectedCommodities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada komoditas yang dipilih</div>
          ) : (
            <div className="space-y-6">
              {selectedCommodities.map((commodity) => (
                <div key={commodity.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {commodity.name} ({commodity.unit})
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveCommodity(commodity.id)}
                      className="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Rata-rata Harga Hari Ini</label>
                      <input
                        type="number"
                        value={commodity.avgToday}
                        onChange={(e) => handleCommodityChange(commodity.id, "avgToday", e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Rata-rata Harga Kemarin</label>
                      <input
                        type="number"
                        value={commodity.avgYesterday}
                        onChange={(e) => handleCommodityChange(commodity.id, "avgYesterday", e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Keterangan</label>
                      <input
                        type="text"
                        value={commodity.notes}
                        onChange={(e) => handleCommodityChange(commodity.id, "notes", e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Data Pedagang</h4>
                      <button
                        type="button"
                        onClick={() => handleOpenMerchantModal(commodity)}
                        className="bg-green-500 hover:bg-green-700 text-white text-sm py-1 px-2 rounded flex items-center"
                      >
                        <FaPlus className="mr-1" /> Tambah Pedagang
                      </button>
                    </div>
                  </div>

                  {commodity.merchants.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">Belum ada data pedagang</div>
                  ) : (
                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border">Nama</th>
                          <th className="py-2 px-4 border">Harga</th>
                          <th className="py-2 px-4 border">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commodity.merchants.map((merchant, index) => (
                          <tr key={merchant.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{merchant.name}</td>
                            <td className="py-2 px-4 border text-right">
                              Rp {Number(merchant.price).toLocaleString()}
                            </td>
                            <td className="py-2 px-4 border">
                              <div className="flex space-x-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleOpenMerchantModal(commodity, index)}
                                  className="bg-yellow-500 hover:bg-yellow-700 text-white p-1 rounded"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMerchant(commodity.id, merchant.id)}
                                  className="bg-red-500 hover:bg-red-700 text-white p-1 rounded"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/data-perpasar")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Batal
          </button>

          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            {isEditing ? "Perbarui" : "Simpan"}
          </button>
        </div>
      </form>

      {/* Merchant Modal */}
      {showMerchantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingMerchantIndex !== null ? "Edit Pedagang" : "Tambah Pedagang"}
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Nama Pedagang</label>
              <input
                type="text"
                value={
                  editingMerchantIndex !== null
                    ? currentCommodity.merchants[editingMerchantIndex].name
                    : `Pedagang ${currentCommodity?.merchants?.length + 1 || 1}`
                }
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Harga <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={merchantForm.price}
                onChange={(e) => setMerchantForm({ ...merchantForm, price: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="flex justify-end mt-6 gap-4">
              <button
                type="button"
                onClick={() => setShowMerchantModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMerchant}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddEditMarketData
