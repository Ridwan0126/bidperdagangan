import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"

// Get all commodities
export const getCommodities = async () => {
  try {
    const commoditiesCollection = collection(db, "commodities")
    const commoditiesQuery = query(commoditiesCollection, orderBy("name"))
    const commoditiesSnapshot = await getDocs(commoditiesQuery)
    const commodities = []

    commoditiesSnapshot.forEach((doc) => {
      commodities.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return commodities
  } catch (error) {
    throw error
  }
}

// Add new commodity
export const addCommodity = async (commodityData) => {
  try {
    const docRef = await addDoc(collection(db, "commodities"), {
      ...commodityData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Update commodity
export const updateCommodity = async (commodityId, commodityData) => {
  try {
    await updateDoc(doc(db, "commodities", commodityId), {
      ...commodityData,
      updatedAt: new Date(),
    })
  } catch (error) {
    throw error
  }
}

// Delete commodity
export const deleteCommodity = async (commodityId) => {
  try {
    await deleteDoc(doc(db, "commodities", commodityId))
  } catch (error) {
    throw error
  }
}
