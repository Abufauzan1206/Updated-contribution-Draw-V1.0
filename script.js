// =======================================
// Contribution Draw v1.0
// Main Script
// =======================================

// Firebase
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
// =======================================
// Constants
// =======================================

const ADMIN_EMAIL = "ababdussalam1206@gmail.com";

const provider = new GoogleAuthProvider();

// =======================================
// DOM Elements
// =======================================

const splashScreen = document.getElementById("splashScreen");
const app = document.getElementById("app");

const googleSignInBtn = document.getElementById("googleSignInBtn");
const signOutBtn = document.getElementById("signOutBtn");

const agreeTerms = document.getElementById("agreeTerms");

const userGreeting = document.getElementById("userGreeting");

const userSection = document.getElementById("userSection");

const adminNav = document.getElementById("adminNav");

const displayName = document.getElementById("displayName");
const saveNameBtn = document.getElementById("saveNameBtn");
const saveStatus = document.getElementById("saveStatus");
const beneficiary1 = document.getElementById("beneficiary1");
const beneficiary2 = document.getElementById("beneficiary2");
const saveBeneficiariesBtn = document.getElementById("saveBeneficiariesBtn");
const beneficiaryStatus = document.getElementById("beneficiaryStatus");

// =======================================
// Pages
// =======================================

const pages = {
    home: document.getElementById("homePage"),
    draw: document.getElementById("drawPage"),
    transparency: document.getElementById("transparencyPage"),
    statistics: document.getElementById("statisticsPage"),
    admin: document.getElementById("adminPage"),
    about: document.getElementById("aboutPage")
};

const navButtons = document.querySelectorAll(".nav-btn");

// =======================================
// Splash Screen
// =======================================

window.addEventListener("load", () => {

    setTimeout(() => {

        splashScreen.style.display = "none";

        app.classList.remove("hidden");

    }, 2000);

});

// =======================================
// Navigation
// =======================================

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active");
        page.classList.add("hidden");

    });

    const selectedPage =
        document.getElementById(pageName + "Page");

    if (selectedPage) {

        selectedPage.classList.remove("hidden");
        selectedPage.classList.add("active");

    }

    navButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });

}

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        showPage(button.dataset.page);

    });

});

// =======================================
// Google Authentication
// =======================================

googleSignInBtn.addEventListener("click", async () => {

    if (!agreeTerms.checked) {

        alert("Please accept the Terms & Conditions first.");

        return;

    }

    try {

        await signInWithPopup(auth, provider);

    } catch (error) {

        alert(error.message);

    }

});

// =======================================
// Sign Out
// =======================================

signOutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        alert(error.message);

    }

});

// =======================================
// Authentication State
// =======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        googleSignInBtn.classList.remove("hidden");
        signOutBtn.classList.add("hidden");

        userGreeting.classList.add("hidden");
        userSection.classList.add("hidden");
        adminNav.classList.add("hidden");

        displayName.value = "";
        displayName.disabled = false;
        saveNameBtn.disabled = false;
        saveStatus.textContent = "";

        return;

    }

    // User signed in

    googleSignInBtn.classList.add("hidden");
    signOutBtn.classList.remove("hidden");

    userGreeting.classList.remove("hidden");
    userGreeting.textContent = `Welcome, ${user.displayName}`;

    userSection.classList.remove("hidden");

    // Admin check

    if (
        user.email &&
        user.email.toLowerCase() ===
        ADMIN_EMAIL.toLowerCase()
    ) {

        adminNav.classList.remove("hidden");

    } else {

        adminNav.classList.add("hidden");

    }

    // Load participant

    try {

        const participantRef =
            doc(db, "participants", user.uid);

        const participantSnap =
            await getDoc(participantRef);

        if (participantSnap.exists()) {

            const data = participantSnap.data();

            displayName.value =
                data.beneficiaryName || "";

            displayName.disabled = true;

            saveNameBtn.disabled = true;

            saveStatus.textContent =
                "Beneficiary name already saved.";

        }

    } catch (error) {

        console.error(error);

    }

});

// =======================================
// Save Beneficiary Name
// =======================================

saveNameBtn.addEventListener("click", async () => {

    const beneficiaryName = displayName.value.trim();

    if (!beneficiaryName) {

        alert("Please enter a beneficiary name.");

        return;

    }

    const user = auth.currentUser;

    if (!user) {

        alert("Please sign in first.");

        return;

    }

    try {

        const participantRef =
            doc(db, "participants", user.uid);

        await setDoc(participantRef, {

            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            beneficiaryName: beneficiaryName,

            // Reserved for Phase 3
            selectedMonth: null,

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()

        });

        displayName.disabled = true;

        saveNameBtn.disabled = true;

        saveStatus.textContent =
            "✅ Beneficiary name saved successfully.";

    } catch (error) {

        console.error(error);

        alert("Failed to save beneficiary name.");

    }

});

// =======================================
// Save Current Draw Beneficiaries
// =======================================

saveBeneficiariesBtn.addEventListener("click", async () => {

    const first = beneficiary1.value.trim();
    const second = beneficiary2.value.trim();

    if (!first || !second) {
        alert("Please enter both beneficiary names.");
        return;
    }

    try {

        await setDoc(doc(db, "draw", "current"), {

            beneficiary1: first,
            beneficiary2: second,
            updatedAt: serverTimestamp()

        });

        beneficiaryStatus.textContent =
            "✅ Beneficiaries saved successfully.";

    } catch (error) {

        console.error(error);

        alert("Failed to save beneficiaries.");

    }

});

// =======================================
// End of Phase 2
// =======================================

console.log("Contribution Draw v1.0 loaded successfully.");
