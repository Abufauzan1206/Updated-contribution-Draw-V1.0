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

// =======================================================
// Part 2 of 4
// User Initialization & Navigation
// =======================================================

async function initializeUser(user) {

    isAdmin =
        user.email?.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase();

    hideSplash();

    app.classList.remove("hidden");

    googleSignInBtn.classList.add("hidden");

    signOutBtn.classList.remove("hidden");

    userGreeting.classList.remove("hidden");

    userSection.classList.remove("hidden");

    userGreeting.textContent =
        `Welcome, ${user.displayName}`;

    if (isAdmin) {

        adminNav.classList.remove("hidden");

    } else {

        adminNav.classList.add("hidden");

    }

    await createParticipantRecord();

    initializeNavigation();

}

// =======================================================
// Participant Record
// =======================================================

async function createParticipantRecord() {

    const participantRef =
        doc(db, "participants", currentUser.uid);

    const snapshot =
        await getDoc(participantRef);

    if (snapshot.exists()) return;

    await setDoc(participantRef, {

        uid: currentUser.uid,

        email: currentUser.email,

        displayName:
            currentUser.displayName,

        beneficiaryName: "",

        assignedMonth: null,

        assignedBox: null,

        hasDrawn: false,

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()

    });

}

// =======================================================
// Navigation
// =======================================================

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(".nav-btn");

    const pages =
        document.querySelectorAll(".page");

    buttons.forEach(button => {

        button.onclick = () => {

            const page =
                button.dataset.page;

            buttons.forEach(btn =>
                btn.classList.remove("active"));

            button.classList.add("active");

            pages.forEach(section =>
                section.classList.remove("active"));

            document
                .getElementById(page + "Page")
                ?.classList.add("active");

        };

    });

}

// =======================================================
// Splash Screen
// =======================================================

function hideSplash() {

    if (!splashScreen) return;

    setTimeout(() => {

        splashScreen.style.display = "none";

    }, 1200);

}

// =======================================================
// Part 3 of 4
// Beneficiary Registration & Events
// =======================================================

const displayNameInput =
    document.getElementById("displayName");

const saveNameBtn =
    document.getElementById("saveNameBtn");

const saveStatus =
    document.getElementById("saveStatus");

const beneficiary1 =
    document.getElementById("beneficiary1");

const beneficiary2 =
    document.getElementById("beneficiary2");

const saveBeneficiariesBtn =
    document.getElementById("saveBeneficiariesBtn");

const beneficiaryStatus =
    document.getElementById("beneficiaryStatus");

// =======================================================
// Save Beneficiary Name
// =======================================================

async function saveBeneficiaryName() {

    if (!currentUser) return;

    const name =
        displayNameInput.value.trim();

    if (name === "") {

        alert(
            "Please enter a beneficiary name."
        );

        return;

    }

    await setDoc(
        doc(db, "participants", currentUser.uid),
        {
            beneficiaryName: name,
            updatedAt: serverTimestamp()
        },
        {
            merge: true
        }
    );

    saveStatus.textContent =
        "Beneficiary name saved successfully.";

}

// =======================================================
// Save Beneficiaries
// =======================================================

async function saveBeneficiaries() {

    await setDoc(
        doc(db, "settings", "beneficiaries"),
        {

            first:
                beneficiary1.value.trim(),

            second:
                beneficiary2.value.trim(),

            updatedAt:
                serverTimestamp()

        },
        {
            merge: true
        }
    );

    beneficiaryStatus.textContent =
        "Beneficiaries updated.";

}

// =======================================================
// Event Listeners
// =======================================================

if (saveNameBtn) {

    saveNameBtn.addEventListener(
        "click",
        saveBeneficiaryName
    );

}

if (saveBeneficiariesBtn) {

    saveBeneficiariesBtn.addEventListener(
        "click",
        saveBeneficiaries
    );

}

if (googleSignInBtn) {

    googleSignInBtn.addEventListener(
        "click",
        signInWithGoogle
    );

}

if (signOutBtn) {

    signOutBtn.addEventListener(
        "click",
        signUserOut
    );

}
