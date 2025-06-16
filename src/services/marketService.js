import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"

// Get all markets
export const getMarkets = async () => {
  try {
    const marketsCollection = collection(db, "markets")
    const marketsQuery = query(marketsCollection, orderBy("name"))
    const marketsSnapshot = await getDocs(marketsQuery)
    const markets = []

    marketsSnapshot.forEach((doc) => {
      markets.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return markets
  } catch (error) {
    throw error
  }
}

// Add new market
export const addMarket = async (marketData) => {
  try {
    const docRef = await addDoc(collection(db, "markets"), {
      ...marketData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Update market
export const updateMarket = async (marketId, marketData) => {
  try {
    await updateDoc(doc(db, "markets", marketId), {
      ...marketData,
      updatedAt: new Date(),
    })
  } catch (error) {
    throw error
  }
}

// Delete market
export const deleteMarket = async (marketId) => {
  try {
    await deleteDoc(doc(db, "markets", marketId))
  } catch (error) {
    throw error
  }
}
