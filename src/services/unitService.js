import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "../config/firebase"

// Get all units
export const getUnits = async () => {
  try {
    const unitsCollection = collection(db, "units")
    const unitsQuery = query(unitsCollection, orderBy("name"))
    const unitsSnapshot = await getDocs(unitsQuery)
    const units = []

    unitsSnapshot.forEach((doc) => {
      units.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return units
  } catch (error) {
    throw error
  }
}

// Add new unit
export const addUnit = async (unitData) => {
  try {
    const docRef = await addDoc(collection(db, "units"), {
      ...unitData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

// Update unit
export const updateUnit = async (unitId, unitData) => {
  try {
    await updateDoc(doc(db, "units", unitId), {
      ...unitData,
      updatedAt: new Date(),
    })
  } catch (error) {
    throw error
  }
}

// Delete unit
export const deleteUnit = async (unitId) => {
  try {
    await deleteDoc(doc(db, "units", unitId))
  } catch (error) {
    throw error
  }
}
