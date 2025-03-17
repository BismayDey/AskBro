import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyClrm30Yxzz0MHPmeTGx644JZjZ0doI838",
  authDomain: "chat-fcaae.firebaseapp.com",
  projectId: "chat-fcaae",
  storageBucket: "chat-fcaae.firebasestorage.app",
  messagingSenderId: "108316124283",
  appId: "1:108316124283:web:f54df132b6b189ddc7aede"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const firestore = getFirestore(app);