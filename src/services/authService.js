import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth"
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore"
import { auth, db } from "../config/firebase"

// Sign in user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...userDoc.data(),
      }
    } else {
      throw new Error("User data not found in database")
    }
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

// Create new user (Admin only)
export const createUser = async (userData) => {
  try {
    const { email, password, username, role, pasar } = userData

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update display name
    await updateProfile(user, {
      displayName: username,
    })

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      role,
      pasar: role === "admin" ? null : pasar,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    })

    return {
      id: user.uid,
      uid: user.uid,
      email: user.email,
      username,
      role,
      pasar: role === "admin" ? null : pasar,
      isActive: true,
    }
  } catch (error) {
    console.error("Create user error:", error)
    throw error
  }
}

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users")
    const usersQuery = query(usersCollection, orderBy("createdAt", "desc"))
    const usersSnapshot = await getDocs(usersQuery)
    const users = []

    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return users
  } catch (error) {
    console.error("Get users error:", error)
    throw error
  }
}

// Update user data (Admin only)
export const updateUser = async (userId, userData) => {
  try {
    // Update Firestore document
    await updateDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error("Update user error:", error)
    throw error
  }
}

// Delete user (Admin only)
export const deleteUser = async (userId) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "users", userId))

    // Note: Deleting from Firebase Auth requires the user to be currently signed in
    // For admin deletion, we'll just mark as inactive in Firestore
    // The actual auth user deletion should be handled server-side with Admin SDK

    return true
  } catch (error) {
    console.error("Delete user error:", error)
    throw error
  }
}

// Get current user data
export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        uid: uid,
        ...userDoc.data(),
      }
    }
    return null
  } catch (error) {
    console.error("Get current user data error:", error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error("Update profile error:", error)
    throw error
  }
}

// Change user password (requires current password)
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user signed in")

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)

    return true
  } catch (error) {
    console.error("Change password error:", error)
    throw error
  }
}
