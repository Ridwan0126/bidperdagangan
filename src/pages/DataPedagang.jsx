"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaTrash, FaFileExcel, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { exportDataPedagangToExcel } from "../utils/excelExport";
import {
  getAllMarketData,
  deleteMarketData,
  getAvailableDates,
} from "../services/marketDataService";
import { getCommodities } from "../services/commodityService";
import { getMarkets } from "../services/marketService";

const DataPedagang = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);

  // Load data from Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all required data
      const [marketDataResult, marketsResult, commoditiesResult, datesResult] =
        await Promise.all([
          getAllMarketData(),
          getMarkets(),
          getCommodities(),
          getAvailableDates(),
        ]);

      setMarkets(marketsResult);
      setCommodities(commoditiesResult);
      setAvailableDates(datesResult);

      // Transform market data to Data Pedagang format
      const transformedData = transformMarketDataToPedagangFormat(
        marketDataResult,
        marketsResult,
        commoditiesResult
      );

      setData(transformedData);
      setFilteredData(transformedData);

      // Set default date to the most recent one
      if (datesResult.length > 0) {
        setFilterDate(datesResult[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Transform Firebase market data to Data Pedagang format
  const transformMarketDataToPedagangFormat = (
    marketData,
    markets,
    commodities
  ) => {
    const groupedData = {};

    // Group by date and commodity
    marketData.forEach((item) => {
      const key = `${item.date}_${item.commodityId}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          id: key,
          no: String(Object.keys(groupedData).length + 1).padStart(3, "0"),
          subVariant: item.commodity.name,
          satuan: item.commodity.unit,
          marketPrices: {},
          rataKemarin: item.avgYesterday || 0,
          rataHariIni: item.avgToday || 0,
          tanggal: item.date,
          commodityId: item.commodityId,
        };
      }

      // Add market price
      groupedData[key].marketPrices[item.market] = item.avgToday || 0;
    });

    return Object.values(groupedData);
  };

  // Handle search and filter
  useEffect(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.subVariant.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      result = result.filter((item) => item.tanggal === filterDate);
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, filterDate, data]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle delete confirmation
  const confirmDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      // Find all market data entries for this commodity and date
      const marketDataToDelete = await getAllMarketData({
        date: itemToDelete.tanggal,
        commodityId: itemToDelete.commodityId,
      });

      // Delete all related market data entries
      for (const dataItem of marketDataToDelete) {
        await deleteMarketData(dataItem.id);
      }

      // Reload data
      await loadData();
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Error deleting data: " + error.message);
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setExporting(true);
      await exportDataPedagangToExcel(filteredData, {
        searchTerm: searchTerm,
        date: filterDate,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Terjadi kesalahan saat mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Pedagang</h1>
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan Variant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg py-2 px-4 pl-10 w-full md:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border rounded-lg py-2 px-4 w-full md:w-auto"
              >
                <option value="">Semua Tanggal</option>
                {availableDates.map((date, index) => (
                  <option key={index} value={date}>
                    {new Date(date).toLocaleDateString("id-ID", {
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">No</th>
                <th className="py-2 px-4 border">Sub Variant</th>
                <th className="py-2 px-4 border">Satuan</th>
                <th
                  className="py-2 px-4 border text-center"
                  colSpan={markets.length}
                >
                  Nama Pasar
                </th>
                <th className="py-2 px-4 border">Harga Rata-rata Kemarin</th>
                <th className="py-2 px-4 border">Harga Rata-rata Hari ini</th>
                <th className="py-2 px-4 border">Aksi</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border"></th>
                <th className="py-2 px-4 border"></th>
                <th className="py-2 px-4 border"></th>
                {markets.map((market, index) => (
                  <th key={index} className="py-2 px-4 border">
                    {market.name}
                  </th>
                ))}
                <th className="py-2 px-4 border"></th>
                <th className="py-2 px-4 border"></th>
                <th className="py-2 px-4 border"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{item.no}</td>
                    <td className="py-2 px-4 border">{item.subVariant}</td>
                    <td className="py-2 px-4 border">{item.satuan}</td>
                    {markets.map((market, index) => (
                      <td key={index} className="py-2 px-4 border text-right">
                        {item.marketPrices[market.name]
                          ? item.marketPrices[market.name].toLocaleString()
                          : "-"}
                      </td>
                    ))}
                    <td className="py-2 px-4 border text-right">
                      {item.rataKemarin.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border text-right">
                      {item.rataHariIni.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => confirmDelete(item)}
                          className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                          title="Hapus Data"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={markets.length + 5} className="py-4 text-center">
                    {loading ? "Loading..." : "No data found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
          <div className="mb-4 md:mb-0">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border rounded-lg py-2 px-4"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            <span className="ml-2">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} items
            </span>
          </div>

          <div className="flex">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                }
                if (pageNum > totalPages - 4) {
                  pageNum = totalPages - 4 + i;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus data {itemToDelete?.subVariant}{" "}
              tanggal {itemToDelete?.tanggal}? Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="flex justify-end mt-6 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPedagang;
