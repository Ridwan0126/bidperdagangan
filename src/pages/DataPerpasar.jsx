"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import { exportDataPerpasarToExcel } from "../utils/excelExport";
import {
  getMarketData,
  addMarketData,
  updateMarketData,
  getAvailableDates,
} from "../services/marketDataService";
import { getCommodities, addCommodity } from "../services/commodityService";
import { getUnits, addUnit } from "../services/unitService";
import { getMarkets } from "../services/marketService";

const DataPerpasar = () => {
  const { user } = useAuth();
  const [selectedMarket, setSelectedMarket] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [units, setUnits] = useState([]);
  const [currentMarketData, setCurrentMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Modal states
  const [showAddMerchantModal, setShowAddMerchantModal] = useState(false);
  const [currentCommodity, setCurrentCommodity] = useState(null);
  const [merchantPrice, setMerchantPrice] = useState("");
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [merchantToDelete, setMerchantToDelete] = useState(null);
  const [commodityToEdit, setCommodityToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    avgToday: "",
    avgYesterday: "",
    notes: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [addDataForm, setAddDataForm] = useState({
    variant: "",
    satuan: "Kg",
    merchantPrices: [{ id: 1, name: "Pedagang 1", price: "" }],
    avgToday: "",
    avgYesterday: "",
    notes: "",
  });
  const [showNewVariantModal, setShowNewVariantModal] = useState(false);
  const [newVariantForm, setNewVariantForm] = useState({
    name: "",
    unit: "Kg",
  });
  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState("");

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Load market data when market or date changes
  useEffect(() => {
    if (selectedMarket && date) {
      loadMarketData();
    }
  }, [selectedMarket, date]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load data with error handling for each service
      const results = await Promise.allSettled([
        getMarkets(),
        getCommodities(),
        getUnits(),
        getAvailableDates(),
      ]);

      // Handle markets
      if (results[0].status === "fulfilled") {
        setMarkets(results[0].value);

        // Set default market
        if (user?.role === "user" && user?.pasar) {
          setSelectedMarket(user.pasar);
        } else if (user?.role === "admin" && results[0].value.length > 0) {
          setSelectedMarket(results[0].value[0].name);
        }
      } else {
        console.error("Error loading markets:", results[0].reason);
        // Set default market from user data if available
        if (user?.role === "user" && user?.pasar) {
          setSelectedMarket(user.pasar);
          setMarkets([{ id: "user-market", name: user.pasar }]);
        }
      }

      // Handle commodities
      if (results[1].status === "fulfilled") {
        setCommodities(results[1].value);
      } else {
        console.error("Error loading commodities:", results[1].reason);
        // Set default commodities if Firebase fails
        setCommodities([
          { id: "default-1", name: "Beras", unit: "Kg" },
          { id: "default-2", name: "Minyak Goreng", unit: "Liter" },
          { id: "default-3", name: "Gula Pasir", unit: "Kg" },
        ]);
      }

      // Handle units
      if (results[2].status === "fulfilled") {
        setUnits(results[2].value.map((unit) => unit.name));
      } else {
        console.error("Error loading units:", results[2].reason);
        setUnits(["Kg", "Liter", "Ons", "Buah", "Ikat"]);
      }

      // Handle available dates
      if (results[3].status === "fulfilled") {
        setAvailableDates(results[3].value);
        if (results[3].value.length > 0) {
          setDate(results[3].value[0]);
        } else {
          // Set today's date if no dates available
          setDate(new Date().toISOString().split("T")[0]);
          setAvailableDates([new Date().toISOString().split("T")[0]]);
        }
      } else {
        console.error("Error loading available dates:", results[3].reason);
        // Set today's date as default
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
        setAvailableDates([today]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);

      // Set minimal default data
      if (user?.role === "user" && user?.pasar) {
        setSelectedMarket(user.pasar);
        setMarkets([{ id: "user-market", name: user.pasar }]);
      }

      setCommodities([
        { id: "default-1", name: "Beras", unit: "Kg" },
        { id: "default-2", name: "Minyak Goreng", unit: "Liter" },
      ]);

      setUnits(["Kg", "Liter", "Ons"]);

      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setAvailableDates([today]);
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async () => {
    try {
      const marketDataResult = await getMarketData(date, selectedMarket);
      setCurrentMarketData(marketDataResult);
    } catch (error) {
      console.error("Error loading market data:", error);
      setCurrentMarketData({});
    }
  };

  // Filter commodities based on search term
  const filteredCommodities = commodities.filter((commodity) =>
    commodity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setExporting(true);
      await exportDataPerpasarToExcel(currentMarketData, selectedMarket, date);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Terjadi kesalahan saat mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  // Add or update merchant
  const handleSaveMerchant = async () => {
    if (!merchantPrice) {
      alert("Harga harus diisi");
      return;
    }

    const price = Number.parseInt(merchantPrice);
    if (isNaN(price) || price <= 0) {
      alert("Harga harus berupa angka positif");
      return;
    }

    try {
      const marketDataItem = currentMarketData[currentCommodity.commodity.id];
      const updatedMerchantPrices = [...marketDataItem.merchantPrices];

      if (editingMerchant) {
        // Update existing merchant
        const merchantIndex = updatedMerchantPrices.findIndex(
          (m) => m.id === editingMerchant.id
        );
        if (merchantIndex !== -1) {
          updatedMerchantPrices[merchantIndex].price = price;
        }
      } else {
        // Add new merchant
        const newMerchant = {
          id: updatedMerchantPrices.length + 1,
          name: `Pedagang ${updatedMerchantPrices.length + 1}`,
          price,
        };
        updatedMerchantPrices.push(newMerchant);
      }

      // Recalculate average
      const avg =
        updatedMerchantPrices.reduce((sum, m) => sum + m.price, 0) /
        updatedMerchantPrices.length;

      // Update in Firebase
      await updateMarketData(marketDataItem.id, {
        merchantPrices: updatedMerchantPrices,
        avgToday: Math.round(avg),
      });

      // Reload data
      await loadMarketData();
      setShowAddMerchantModal(false);
    } catch (error) {
      console.error("Error saving merchant:", error);
      alert("Error saving merchant: " + error.message);
    }
  };

  // Delete merchant
  const handleDeleteMerchant = async () => {
    try {
      const marketDataItem = currentMarketData[currentCommodity.commodity.id];
      let updatedMerchantPrices = marketDataItem.merchantPrices.filter(
        (m) => m.id !== merchantToDelete.id
      );

      // Rename merchants to maintain sequence
      updatedMerchantPrices = updatedMerchantPrices.map((m, index) => ({
        ...m,
        id: index + 1,
        name: `Pedagang ${index + 1}`,
      }));

      // Recalculate average if there are merchants left
      let avgToday = marketDataItem.avgToday;
      if (updatedMerchantPrices.length > 0) {
        avgToday = Math.round(
          updatedMerchantPrices.reduce((sum, m) => sum + m.price, 0) /
            updatedMerchantPrices.length
        );
      }

      // Update in Firebase
      await updateMarketData(marketDataItem.id, {
        merchantPrices: updatedMerchantPrices,
        avgToday,
      });

      // Reload data
      await loadMarketData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting merchant:", error);
      alert("Error deleting merchant: " + error.message);
    }
  };

  // Save commodity edits
  const handleSaveCommodityEdit = async () => {
    try {
      const marketDataItem = currentMarketData[commodityToEdit.commodity.id];

      await updateMarketData(marketDataItem.id, {
        avgToday: Number.parseInt(editForm.avgToday) || 0,
        avgYesterday: Number.parseInt(editForm.avgYesterday) || 0,
        notes: editForm.notes,
      });

      // Reload data
      await loadMarketData();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving commodity edit:", error);
      alert("Error saving edit: " + error.message);
    }
  };

  // Save new data
  const handleSaveNewData = async () => {
    if (!addDataForm.variant) {
      alert("Variant harus dipilih");
      return;
    }

    // Check if all merchants have prices
    const invalidMerchant = addDataForm.merchantPrices.findIndex(
      (m) => !m.price
    );
    if (invalidMerchant !== -1) {
      alert(
        `Harga untuk ${addDataForm.merchantPrices[invalidMerchant].name} harus diisi`
      );
      return;
    }

    try {
      const commodityId = addDataForm.variant;
      const commodity = commodities.find((c) => c.id === commodityId);

      if (!commodity) {
        alert("Variant tidak ditemukan");
        return;
      }

      // Calculate average price
      const merchantPrices = addDataForm.merchantPrices.map((m) => ({
        ...m,
        price: Number.parseInt(m.price) || 0,
      }));

      const avgToday =
        merchantPrices.reduce((sum, m) => sum + m.price, 0) /
          merchantPrices.length ||
        Number.parseInt(addDataForm.avgToday) ||
        0;

      // Add new market data
      await addMarketData({
        date,
        market: selectedMarket,
        commodityId,
        commodity: {
          id: commodity.id,
          name: commodity.name,
          unit: commodity.unit,
        },
        merchantPrices,
        avgToday: Number.parseInt(addDataForm.avgToday) || Math.round(avgToday),
        avgYesterday: Number.parseInt(addDataForm.avgYesterday) || 0,
        notes: addDataForm.notes || "-",
      });

      // Reload data
      await loadMarketData();
      setShowAddDataModal(false);
    } catch (error) {
      console.error("Error saving new data:", error);
      alert("Error saving data: " + error.message);
    }
  };

  // Save new variant
  const handleSaveNewVariant = async () => {
    if (!newVariantForm.name) {
      alert("Nama variant harus diisi");
      return;
    }

    try {
      const newVariantId = await addCommodity({
        name: newVariantForm.name,
        unit: newVariantForm.unit,
        isActive: true,
      });

      // Reload commodities
      const updatedCommodities = await getCommodities();
      setCommodities(updatedCommodities);

      // Set as selected variant in add data form
      setAddDataForm((prev) => ({
        ...prev,
        variant: newVariantId,
        satuan: newVariantForm.unit,
      }));

      setShowNewVariantModal(false);
    } catch (error) {
      console.error("Error saving new variant:", error);
      alert("Error saving variant: " + error.message);
    }
  };

  // Save new unit
  const handleSaveNewUnit = async () => {
    if (!newUnit.trim()) {
      alert("Nama satuan harus diisi");
      return;
    }

    // Check if unit already exists
    if (units.includes(newUnit.trim())) {
      alert("Satuan sudah ada");
      return;
    }

    try {
      await addUnit({
        name: newUnit.trim(),
        isActive: true,
      });

      // Reload units
      const updatedUnits = await getUnits();
      setUnits(updatedUnits.map((unit) => unit.name));

      // Set as selected unit in add data form
      setAddDataForm((prev) => ({
        ...prev,
        satuan: newUnit.trim(),
      }));

      // If we're in new variant modal, update that too
      if (showNewVariantModal) {
        setNewVariantForm((prev) => ({
          ...prev,
          unit: newUnit.trim(),
        }));
      }

      setShowNewUnitModal(false);
    } catch (error) {
      console.error("Error saving new unit:", error);
      alert("Error saving unit: " + error.message);
    }
  };

  // Helper functions for modals
  const openAddMerchantModal = (commodityData) => {
    setCurrentCommodity(commodityData);
    setMerchantPrice("");
    setEditingMerchant(null);
    setShowAddMerchantModal(true);
  };

  const openEditMerchantModal = (commodityData, merchant) => {
    setCurrentCommodity(commodityData);
    setMerchantPrice(merchant.price.toString());
    setEditingMerchant(merchant);
    setShowAddMerchantModal(true);
  };

  const confirmDeleteMerchant = (commodityData, merchant) => {
    setCurrentCommodity(commodityData);
    setMerchantToDelete(merchant);
    setShowDeleteModal(true);
  };

  const openEditCommodityModal = (commodityData) => {
    setCommodityToEdit(commodityData);
    setEditForm({
      avgToday: commodityData.avgToday.toString(),
      avgYesterday: commodityData.avgYesterday.toString(),
      notes: commodityData.notes,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  // Ganti bagian filteredCommodities dengan commoditiesWithData
  const commoditiesWithData = filteredCommodities.filter((commodity) => {
    return currentMarketData[commodity.id]; // Hanya tampilkan yang ada datanya
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Data Perpasar</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={() => setShowAddDataModal(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Tambah Data
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <FaFileExcel className="mr-2" /> Export Excel
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center w-full md:w-auto">
              <FaFilter className="mr-2 text-gray-500" />
              {user?.role === "admin" ? (
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="border rounded-lg py-2 px-4 w-full md:w-auto"
                >
                  {markets.map((market, index) => (
                    <option key={index} value={market.name}>
                      {market.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="border rounded-lg py-2 px-4 bg-gray-100 w-full md:w-auto">
                  {selectedMarket}
                </span>
              )}
            </div>

            <div className="flex items-center w-full md:w-auto">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg py-2 px-4 w-full md:w-auto"
              >
                {availableDates.map((d, index) => (
                  <option key={index} value={d}>
                    {new Date(d).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Cari komoditas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg py-2 px-4 pl-10 w-full"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-lg md:text-xl font-bold">
              Kertas Kerja Pemantauan Harga Barang Kebutuhan Pokok
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <p>
                  <strong>Pasar:</strong> {selectedMarket}
                </p>
                <p>
                  <strong>Petugas:</strong> {user?.username || "PETUGAS"}
                </p>
              </div>
              <div className="md:text-right">
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredCommodities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Belum ada data komoditas untuk ditampilkan
              </p>
              <button
                onClick={() => setShowAddDataModal(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center mx-auto"
              >
                <FaPlus className="mr-2" /> Tambah Data Pertama
              </button>
            </div>
          ) : (
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">No</th>
                  <th className="py-2 px-4 border">Variant</th>
                  <th className="py-2 px-4 border">Satuan</th>
                  <th className="py-2 px-4 border text-center" colSpan={3}>
                    Harga
                  </th>
                  <th className="py-2 px-4 border">Rata-rata harga hari ini</th>
                  <th className="py-2 px-4 border">Rata-rata harga Kemarin</th>
                  <th className="py-2 px-4 border">Keterangan</th>
                  <th className="py-2 px-4 border">Aksi</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border">Pedagang 1</th>
                  <th className="py-2 px-4 border">Pedagang 2</th>
                  <th className="py-2 px-4 border">Pedagang 3</th>
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border"></th>
                  <th className="py-2 px-4 border"></th>
                </tr>
              </thead>
              <tbody>
                {commoditiesWithData.length > 0 ? (
                  commoditiesWithData.map((commodity, index) => {
                    const data = currentMarketData[commodity.id];
                    const merchants = data.merchantPrices || [];

                    return (
                      <tr key={commodity.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border">{index + 1}</td>
                        <td className="py-2 px-4 border">{commodity.name}</td>
                        <td className="py-2 px-4 border">{commodity.unit}</td>

                        {/* Display up to 3 merchants, with empty cells if fewer */}
                        {[0, 1, 2].map((idx) => (
                          <td key={idx} className="py-2 px-4 border text-right">
                            {merchants[idx] ? (
                              <div className="flex justify-between items-center">
                                <span>
                                  {merchants[idx].price.toLocaleString()}
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() =>
                                      openEditMerchantModal(
                                        data,
                                        merchants[idx]
                                      )
                                    }
                                    className="text-yellow-500 hover:text-yellow-700"
                                    title="Edit"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      confirmDeleteMerchant(
                                        data,
                                        merchants[idx]
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700"
                                    title="Hapus"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        ))}

                        <td className="py-2 px-4 border text-right">
                          {data.avgToday.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border text-right">
                          {data.avgYesterday.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 border">{data.notes}</td>
                        <td className="py-2 px-4 border">
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => openAddMerchantModal(data)}
                              className="bg-blue-500 hover:bg-blue-700 text-white p-1 rounded"
                              title="Tambah Pedagang"
                            >
                              <FaPlus size={14} />
                            </button>
                            <button
                              onClick={() => openEditCommodityModal(data)}
                              className="bg-yellow-500 hover:bg-yellow-700 text-white p-1 rounded"
                              title="Edit Data"
                            >
                              <FaEdit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="py-8 text-center">
                      <div className="text-gray-500 mb-4">
                        {Object.keys(currentMarketData).length === 0
                          ? "Belum ada data untuk tanggal dan pasar yang dipilih"
                          : "Tidak ada komoditas yang sesuai dengan pencarian"}
                      </div>
                      <button
                        onClick={() => setShowAddDataModal(true)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center mx-auto"
                      >
                        <FaPlus className="mr-2" /> Tambah Data
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* All modals remain the same as before... */}
      {/* Add/Edit Merchant Modal */}
      {showAddMerchantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingMerchant ? "Edit Pedagang" : "Tambah Pedagang"}
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Pedagang
              </label>
              <input
                type="text"
                value={
                  editingMerchant
                    ? editingMerchant.name
                    : `Pedagang ${
                        currentCommodity?.merchantPrices?.length + 1 || 1
                      }`
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
                value={merchantPrice}
                onChange={(e) => setMerchantPrice(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Masukkan harga"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddMerchantModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveMerchant}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Merchant Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus data {merchantToDelete?.name}{" "}
              untuk komoditas {currentCommodity?.commodity?.name}?
            </p>
            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMerchant}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commodity Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              Edit Data {commodityToEdit?.commodity?.name}
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rata-rata Harga Hari Ini
              </label>
              <input
                type="number"
                name="avgToday"
                value={editForm.avgToday}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgToday: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Rata-rata Harga Kemarin
              </label>
              <input
                type="number"
                name="avgYesterday"
                value={editForm.avgYesterday}
                onChange={(e) =>
                  setEditForm({ ...editForm, avgYesterday: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Keterangan
              </label>
              <input
                type="text"
                name="notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCommodityEdit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tambah Data Komoditas</h3>
              <button
                onClick={() => setShowAddDataModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Variant <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="variant"
                    value={addDataForm.variant}
                    onChange={(e) =>
                      setAddDataForm({
                        ...addDataForm,
                        variant: e.target.value,
                      })
                    }
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Pilih Variant</option>
                    {commodities.map((commodity) => (
                      <option key={commodity.id} value={commodity.id}>
                        {commodity.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewVariantModal(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <select
                    name="satuan"
                    value={addDataForm.satuan}
                    onChange={(e) =>
                      setAddDataForm({ ...addDataForm, satuan: e.target.value })
                    }
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewUnitModal(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-bold">
                  Harga Pedagang <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newMerchant = {
                      id: addDataForm.merchantPrices.length + 1,
                      name: `Pedagang ${addDataForm.merchantPrices.length + 1}`,
                      price: "",
                    };
                    setAddDataForm({
                      ...addDataForm,
                      merchantPrices: [
                        ...addDataForm.merchantPrices,
                        newMerchant,
                      ],
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Tambah Pedagang
                </button>
              </div>

              <div className="space-y-3">
                {addDataForm.merchantPrices.map((merchant, index) => (
                  <div
                    key={merchant.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="w-1/3">
                      <label className="block text-gray-700 text-xs mb-1">
                        Nama Pedagang
                      </label>
                      <input
                        type="text"
                        value={merchant.name}
                        readOnly
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-gray-700 text-xs mb-1">
                        Harga (Rp)
                      </label>
                      <input
                        type="number"
                        value={merchant.price}
                        onChange={(e) => {
                          const updatedMerchants = [
                            ...addDataForm.merchantPrices,
                          ];
                          updatedMerchants[index] = {
                            ...updatedMerchants[index],
                            price: e.target.value,
                          };
                          setAddDataForm({
                            ...addDataForm,
                            merchantPrices: updatedMerchants,
                          });
                        }}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (addDataForm.merchantPrices.length <= 1) return;
                          const updatedMerchants =
                            addDataForm.merchantPrices.filter(
                              (_, i) => i !== index
                            );
                          const renamedMerchants = updatedMerchants.map(
                            (merchant, i) => ({
                              ...merchant,
                              id: i + 1,
                              name: `Pedagang ${i + 1}`,
                            })
                          );
                          setAddDataForm({
                            ...addDataForm,
                            merchantPrices: renamedMerchants,
                          });
                        }}
                        disabled={addDataForm.merchantPrices.length <= 1}
                        className={`p-2 rounded ${
                          addDataForm.merchantPrices.length <= 1
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rata-rata Harga Hari Ini
                </label>
                <input
                  type="number"
                  name="avgToday"
                  value={addDataForm.avgToday}
                  onChange={(e) =>
                    setAddDataForm({ ...addDataForm, avgToday: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Otomatis dihitung dari harga pedagang"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rata-rata Harga Kemarin
                </label>
                <input
                  type="number"
                  name="avgYesterday"
                  value={addDataForm.avgYesterday}
                  onChange={(e) =>
                    setAddDataForm({
                      ...addDataForm,
                      avgYesterday: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Keterangan
                </label>
                <input
                  type="text"
                  name="notes"
                  value={addDataForm.notes}
                  onChange={(e) =>
                    setAddDataForm({ ...addDataForm, notes: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddDataModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNewData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Variant Modal */}
      {showNewVariantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tambah Variant Baru</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Variant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newVariantForm.name}
                onChange={(e) =>
                  setNewVariantForm({ ...newVariantForm, name: e.target.value })
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Masukkan nama variant"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Satuan <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <select
                  name="unit"
                  value={newVariantForm.unit}
                  onChange={(e) =>
                    setNewVariantForm({
                      ...newVariantForm,
                      unit: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewUnitModal(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-r"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewVariantModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNewVariant}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Unit Modal */}
      {showNewUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Tambah Satuan Baru</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Satuan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Masukkan nama satuan"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewUnitModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNewUnit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPerpasar;
