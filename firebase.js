// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Your Firebase configuration
 // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC1Z98ZG6uN9fSBYGfP_fH9pfmIEO2iWxw",
    authDomain: "updated-contribution-draw-v1-0.firebaseapp.com",
    projectId: "updated-contribution-draw-v1-0",
    storageBucket: "updated-contribution-draw-v1-0.firebasestorage.app",
    messagingSenderId: "479138192263",
    appId: "1:479138192263:web:f95352f52bd27b2a60d122",
    measurementId: "G-DBJ8EX98ZS"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
