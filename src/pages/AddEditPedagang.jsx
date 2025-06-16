"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { FaPlus, FaTrash } from "react-icons/fa"

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

// Mock data for existing items
const mockItems = [
  {
    id: 1,
    no: "001",
    variant: "Beras Cap C4 (Medium)",
    satuan: "kg",
    pasar: "Sumowono",
    petugas: "WINARNO",
    hargaPedagang: [
      { id: 1, nama: "Pedagang 1", harga: 13000 },
      { id: 2, nama: "Pedagang 2", harga: 14000 },
      { id: 3, nama: "Pedagang 3", harga: 13000 },
    ],
    rataHariIni: 15000,
    rataKemarin: 14000,
    keterangan: "-",
    tanggal: "2025-05-07",
  },
  {
    id: 2,
    no: "002",
    variant: "Beras Cap C4 (Premium)",
    satuan: "kg",
    pasar: "Bandarjo",
    petugas: "AHMAD",
    hargaPedagang: [
      { id: 1, nama: "Pedagang 1", harga: 15000 },
      { id: 2, nama: "Pedagang 2", harga: 14500 },
    ],
    rataHariIni: 16000,
    rataKemarin: 15000,
    keterangan: "-",
    tanggal: "2025-05-07",
  },
]

const AddEditPedagang = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = !!id

  // Form state
  const [formData, setFormData] = useState({
    no: "",
    variant: "",
    satuan: "kg",
    pasar: user.role === "admin" ? "" : user.pasar,
    petugas: "",
    hargaPedagang: [{ id: 1, nama: "Pedagang 1", harga: "" }],
    rataHariIni: "",
    rataKemarin: "",
    keterangan: "",
    tanggal: new Date().toISOString().split("T")[0],
  })

  const [formErrors, setFormErrors] = useState({})

  // Load data if editing
  useEffect(() => {
    if (isEditing) {
      const item = mockItems.find((item) => item.id === Number.parseInt(id))
      if (item) {
        setFormData({
          ...item,
          hargaPedagang: item.hargaPedagang.map((p) => ({
            ...p,
            harga: p.harga.toString(),
          })),
          rataHariIni: item.rataHariIni.toString(),
          rataKemarin: item.rataKemarin.toString(),
        })
      } else {
        navigate("/data-pedagang")
      }
    }
  }, [id, isEditing, navigate])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle merchant price changes
  const handleMerchantChange = (index, field, value) => {
    const updatedMerchants = [...formData.hargaPedagang]
    updatedMerchants[index] = {
      ...updatedMerchants[index],
      [field]: value,
    }

    setFormData({
      ...formData,
      hargaPedagang: updatedMerchants,
    })
  }

  // Add new merchant
  const addMerchant = () => {
    const newMerchant = {
      id: formData.hargaPedagang.length + 1,
      nama: `Pedagang ${formData.hargaPedagang.length + 1}`,
      harga: "",
    }

    setFormData({
      ...formData,
      hargaPedagang: [...formData.hargaPedagang, newMerchant],
    })
  }

  // Remove merchant
  const removeMerchant = (index) => {
    if (formData.hargaPedagang.length <= 1) {
      return // Keep at least one merchant
    }

    const updatedMerchants = formData.hargaPedagang.filter((_, i) => i !== index)

    // Rename merchants to maintain sequence
    const renamedMerchants = updatedMerchants.map((merchant, i) => ({
      ...merchant,
      id: i + 1,
      nama: `Pedagang ${i + 1}`,
    }))

    setFormData({
      ...formData,
      hargaPedagang: renamedMerchants,
    })
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.no.trim()) {
      errors.no = "No is required"
    }

    if (!formData.variant.trim()) {
      errors.variant = "Variant is required"
    }

    if (!formData.satuan.trim()) {
      errors.satuan = "Unit is required"
    }

    if (!formData.pasar.trim()) {
      errors.pasar = "Market is required"
    }

    if (!formData.petugas.trim()) {
      errors.petugas = "Officer name is required"
    }

    // Check if all merchants have prices
    const invalidMerchants = formData.hargaPedagang.findIndex((m) => !m.harga.trim())
    if (invalidMerchants !== -1) {
      errors.merchants = `Price for ${formData.hargaPedagang[invalidMerchants].nama} is required`
    }

    return errors
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Process form data (in a real app, this would be an API call)
    const processedData = {
      ...formData,
      hargaPedagang: formData.hargaPedagang.map((p) => ({
        ...p,
        harga: Number.parseInt(p.harga),
      })),
      rataHariIni: Number.parseInt(formData.rataHariIni),
      rataKemarin: Number.parseInt(formData.rataKemarin),
    }

    console.log("Submitting data:", processedData)

    // Redirect back to data page
    navigate("/data-pedagang")
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/data-pedagang")}
          className="mr-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Data Pedagang" : "Tambah Data Pedagang"}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="no" className="block text-gray-700 text-sm font-bold mb-2">
                No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="no"
                name="no"
                value={formData.no}
                onChange={handleInputChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formErrors.no ? "border-red-500" : ""
                }`}
              />
              {formErrors.no && <p className="text-red-500 text-xs italic">{formErrors.no}</p>}
            </div>

            <div>
              <label htmlFor="variant" className="block text-gray-700 text-sm font-bold mb-2">
                Variant <span className="text-red-500">*</span>
              </label>
              <select
                id="variant"
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formErrors.variant ? "border-red-500" : ""
                }`}
              >
                <option value="">Select Variant</option>
                {commodities.map((commodity) => (
                  <option key={commodity.id} value={commodity.name}>
                    {commodity.name}
                  </option>
                ))}
              </select>
              {formErrors.variant && <p className="text-red-500 text-xs italic">{formErrors.variant}</p>}
            </div>

            <div>
              <label htmlFor="satuan" className="block text-gray-700 text-sm font-bold mb-2">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                id="satuan"
                name="satuan"
                value={formData.satuan}
                onChange={handleInputChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formErrors.satuan ? "border-red-500" : ""
                }`}
              >
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="ons">Ons</option>
                <option value="buah">Buah</option>
                <option value="ikat">Ikat</option>
              </select>
              {formErrors.satuan && <p className="text-red-500 text-xs italic">{formErrors.satuan}</p>}
            </div>

            <div>
              <label htmlFor="pasar" className="block text-gray-700 text-sm font-bold mb-2">
                Pasar <span className="text-red-500">*</span>
              </label>
              {user.role === "admin" ? (
                <select
                  id="pasar"
                  name="pasar"
                  value={formData.pasar}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.pasar ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Market</option>
                  {markets.map((market, index) => (
                    <option key={index} value={market}>
                      {market}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="pasar"
                  name="pasar"
                  value={formData.pasar}
                  readOnly
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                />
              )}
              {formErrors.pasar && <p className="text-red-500 text-xs italic">{formErrors.pasar}</p>}
            </div>

            <div>
              <label htmlFor="petugas" className="block text-gray-700 text-sm font-bold mb-2">
                Petugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="petugas"
                name="petugas"
                value={formData.petugas}
                onChange={handleInputChange}
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formErrors.petugas ? "border-red-500" : ""
                }`}
              />
              {formErrors.petugas && <p className="text-red-500 text-xs italic">{formErrors.petugas}</p>}
            </div>

            <div>
              <label htmlFor="tanggal" className="block text-gray-700 text-sm font-bold mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="tanggal"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label htmlFor="rataHariIni" className="block text-gray-700 text-sm font-bold mb-2">
                Rata-rata Harga Hari Ini (Rp)
              </label>
              <input
                type="number"
                id="rataHariIni"
                name="rataHariIni"
                value={formData.rataHariIni}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label htmlFor="rataKemarin" className="block text-gray-700 text-sm font-bold mb-2">
                Rata-rata Harga Kemarin (Rp)
              </label>
              <input
                type="number"
                id="rataKemarin"
                name="rataKemarin"
                value={formData.rataKemarin}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="keterangan" className="block text-gray-700 text-sm font-bold mb-2">
              Keterangan
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                Harga Pedagang <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addMerchant}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
              >
                <FaPlus className="mr-1" /> Tambah Pedagang
              </button>
            </div>

            {formErrors.merchants && <p className="text-red-500 text-xs italic mb-2">{formErrors.merchants}</p>}

            <div className="space-y-3">
              {formData.hargaPedagang.map((merchant, index) => (
                <div key={merchant.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                  <div className="w-1/3">
                    <label className="block text-gray-700 text-xs mb-1">Nama Pedagang</label>
                    <input
                      type="text"
                      value={merchant.nama}
                      readOnly
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-gray-700 text-xs mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      value={merchant.harga}
                      onChange={(e) => handleMerchantChange(index, "harga", e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMerchant(index)}
                      disabled={formData.hargaPedagang.length <= 1}
                      className={`p-2 rounded ${
                        formData.hargaPedagang.length <= 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-700 text-white"
                      }`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/data-pedagang")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>

            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditPedagang
