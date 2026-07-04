// =======================================================
// Contribution Draw V2.0 Stable
// script.js
// Part 1 of 4
// Authentication & Initialization
// =======================================================

import { auth, db } from "./firebase.js";

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// =======================================================
// Configuration
// =======================================================

// Replace this email with the administrator's Google account.
const ADMIN_EMAIL = "youradmin@gmail.com";

// =======================================================
// HTML Elements
// =======================================================

const splashScreen = document.getElementById("splashScreen");
const app = document.getElementById("app");

const googleSignInBtn =
    document.getElementById("googleSignInBtn");

const signOutBtn =
    document.getElementById("signOutBtn");

const userGreeting =
    document.getElementById("userGreeting");

const userSection =
    document.getElementById("userSection");

const adminNav =
    document.getElementById("adminNav");

// =======================================================
// Runtime Variables
// =======================================================

let currentUser = null;

let isAdmin = false;

// =======================================================
// Google Sign In
// =======================================================

async function signInWithGoogle() {

    try {

        const provider =
            new GoogleAuthProvider();

        await signInWithPopup(
            auth,
            provider
        );

    } catch (error) {

        console.error(error);

        alert(
            "Google Sign-In failed."
        );

    }

}

// =======================================================
// Google Sign Out
// =======================================================

async function signUserOut() {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(error);

    }

}

// =======================================================
// Authentication State
// =======================================================

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (!user) {

        showSignedOutState();

        return;

    }

    await initializeUser(user);

});
