import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"

// Get merchant data by filters
export const getMerchantData = async (filters = {}) => {
  try {
    const merchantDataCollection = collection(db, "merchantData")
    let merchantDataQuery = query(merchantDataCollection, orderBy("date", "desc"))

    if (filters.date) {
      merchantDataQuery = query(merchantDataCollection, where("date", "==", filters.date))
    }

    const merchantDataSnapshot = await getDocs(merchantDataQuery)
    const merchantData = []

    merchantDataSnapshot.forEach((doc) => {
      merchantData.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return merchantData
  } catch (error) {
    throw error
  }
}

// Add merchant data
export const addMerchantData = async (merchantDataItem) => {
  try {
    const docRef = await addDoc(collection(db, "merchantData"), {
      ...merchantDataItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Update merchant data
export const updateMerchantData = async (merchantDataId, merchantDataItem) => {
  try {
    await updateDoc(doc(db, "merchantData", merchantDataId), {
      ...merchantDataItem,
      updatedAt: new Date(),
    })
  } catch (error) {
    throw error
  }
}

// Delete merchant data
export const deleteMerchantData = async (merchantDataId) => {
  try {
    await deleteDoc(doc(db, "merchantData", merchantDataId))
  } catch (error) {
    throw error
  }
}
