// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChppUrsnFVpzz5gsYj5CaOp1-XM-ps0Yo",
  authDomain: "contribution-draw.firebaseapp.com",
  projectId: "contribution-draw",
  storageBucket: "contribution-draw.firebasestorage.app",
  messagingSenderId: "979502527071",
  appId: "1:979502527071:web:3a0f546b1cab8ae23161ea",
  measurementId: "G-70F2W982NF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
