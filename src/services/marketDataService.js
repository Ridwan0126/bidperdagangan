import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Get market data by date and market
export const getMarketData = async (date, market) => {
  try {
    const marketDataCollection = collection(db, "marketData");
    const marketDataQuery = query(
      marketDataCollection,
      where("date", "==", date),
      where("market", "==", market)
    );
    const marketDataSnapshot = await getDocs(marketDataQuery);
    const marketData = {};

    marketDataSnapshot.forEach((doc) => {
      const data = doc.data();
      marketData[data.commodityId] = {
        id: doc.id,
        ...data,
      };
    });

    return marketData;
  } catch (error) {
    console.error("Error getting market data:", error);
    throw error;
  }
};

// Get all market data with filters
export const getAllMarketData = async (filters = {}) => {
  try {
    const marketDataCollection = collection(db, "marketData");
    let marketDataQuery = query(marketDataCollection, orderBy("date", "desc"));

    if (filters.date) {
      marketDataQuery = query(
        marketDataCollection,
        where("date", "==", filters.date),
        orderBy("date", "desc")
      );
    }

    if (filters.market) {
      marketDataQuery = query(
        marketDataCollection,
        where("market", "==", filters.market),
        orderBy("date", "desc")
      );
    }

    if (filters.commodityId) {
      marketDataQuery = query(
        marketDataCollection,
        where("commodityId", "==", filters.commodityId),
        orderBy("date", "desc")
      );
    }

    const marketDataSnapshot = await getDocs(marketDataQuery);
    const marketData = [];

    marketDataSnapshot.forEach((doc) => {
      marketData.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return marketData;
  } catch (error) {
    console.error("Error getting all market data:", error);
    throw error;
  }
};

// Add market data
export const addMarketData = async (marketDataItem) => {
  try {
    const docRef = await addDoc(collection(db, "marketData"), {
      ...marketDataItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding market data:", error);
    throw error;
  }
};

// Update market data
export const updateMarketData = async (marketDataId, marketDataItem) => {
  try {
    await updateDoc(doc(db, "marketData", marketDataId), {
      ...marketDataItem,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating market data:", error);
    throw error;
  }
};

// Delete market data
export const deleteMarketData = async (marketDataId) => {
  try {
    await deleteDoc(doc(db, "marketData", marketDataId));
  } catch (error) {
    console.error("Error deleting market data:", error);
    throw error;
  }
};

// Get available dates
export const getAvailableDates = async () => {
  try {
    const marketDataCollection = collection(db, "marketData");
    const marketDataSnapshot = await getDocs(marketDataCollection);
    const dates = new Set();

    marketDataSnapshot.forEach((doc) => {
      dates.add(doc.data().date);
    });

    return Array.from(dates).sort().reverse();
  } catch (error) {
    console.error("Error getting available dates:", error);
    throw error;
  }
};

// Get market data by ID
export const getMarketDataById = async (marketDataId) => {
  try {
    const docRef = doc(db, "marketData", marketDataId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error("Market data not found");
    }
  } catch (error) {
    console.error("Error getting market data by ID:", error);
    throw error;
  }
};
