import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyBUnLKgDUCNk64JDcQhH6Qh9PETfrsQLaw",
  authDomain: "bidangperdagangan-df87e.firebaseapp.com",
  projectId: "bidangperdagangan-df87e",
  storageBucket: "bidangperdagangan-df87e.firebasestorage.app",
  messagingSenderId: "471152903216",
  appId: "1:471152903216:web:6aa04f73bb8a9145b559f5",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
