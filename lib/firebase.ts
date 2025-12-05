import { getApp, getApps, initializeApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

function hasValidConfig() {
  return Object.values(config).every((v) => typeof v === "string" && v.length > 0)
}

let dbInstance: Firestore | null = null
let authInstance: Auth | null = null

try {
  if (hasValidConfig()) {
    const app = getApps().length ? getApp() : initializeApp(config)
    dbInstance = getFirestore(app)
    authInstance = getAuth(app)
  }
} catch {
  dbInstance = null
  authInstance = null
}

export const db = dbInstance
export const auth = authInstance
