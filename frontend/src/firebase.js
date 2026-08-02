import { initializeApp } from "firebase/app"
import { getStorage } from "firebase/storage"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAG0Lqa1SXHO1ibu8rLrYrh4HrElx3EvkA",
  authDomain: "dinamik-platform.firebaseapp.com",
  projectId: "dinamik-platform",
  storageBucket: "dinamik-platform.firebasestorage.app",
  messagingSenderId: "186016628534",
  appId: "1:186016628534:web:373f64c85b58087b50fd97"
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()