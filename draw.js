// =======================================================
// Contribution Draw v1.1
// draw.js
// Section 1 of 4
// Compatible with Firebase 11.9.1
// =======================================================

import { auth, db } from "./firebase.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


// =======================================================
// Configuration
// =======================================================

// June is reserved for the administrator.
const RESERVED_MONTH = "June";

// Public months available for assignment.
const MONTHS = [
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March"
];

const PARTICIPANTS = "participants";
const TRANSPARENCY = "hallOfTransparency";

// =======================================================
// HTML Elements
// =======================================================

const boxesContainer = document.getElementById("boxesContainer");
const latestSelection = document.getElementById("latestSelection");
const selectionHistory = document.getElementById("selectionHistory");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const totalParticipants = document.getElementById("totalParticipants");
const monthsSelected = document.getElementById("monthsSelected");
const monthsRemaining = document.getElementById("monthsRemaining");

const unlockJuneBtn =
    document.getElementById("unlockJuneBtn");

const lockJuneBtn =
    document.getElementById("lockJuneBtn");

const resetDrawBtn =
    document.getElementById("resetDrawBtn");


// =======================================================
// Runtime Variables
// =======================================================

let currentUser = null;

let assignedMonths = [];

let drawBusy = false;

function getParticipantName() {

    const input = document.getElementById("displayName");

    if (input && input.value.trim() !== "") {
        return input.value.trim();
    }

    return currentUser.displayName || "Participant";
}
    
// =======================================================
// Authentication
// =======================================================

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (!user) {
        console.log("Waiting for Google Sign-In...");
        return;
    }

    console.log("Signed in:", user.displayName);

    await initializeDraw();

});


// =======================================================
// Initialize
// =======================================================

async function initializeDraw() {

    createGiftBoxes();

    await loadAssignedMonths();

    await finishDraw();

}


// =======================================================
// Create Gift Boxes
// =======================================================

function createGiftBoxes() {

    boxesContainer.innerHTML = "";

    for (let i = 1; i <= 10; i++) {

        const box = document.createElement("button");

        box.className = "gift-box";

        box.type = "button";

        box.innerHTML = `
            <div class="gift-icon">🎁</div>
            <div class="gift-number">Gift ${i}</div>
        `;

        box.addEventListener("click", handleDraw);

        boxesContainer.appendChild(box);

    }

}


// =======================================================
// Load Assigned Months
// =======================================================

async function loadAssignedMonths() {

    assignedMonths = [];

    const snapshot = await getDocs(
        collection(db, PARTICIPANTS)
    );

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        if (data.assignedMonth) {

            assignedMonths.push(data.assignedMonth);

        }

    });

}

async function getAvailableMonths() {

    const settingsRef =
        doc(db, "settings", "drawSettings");

    const settingsSnap =
        await getDoc(settingsRef);

    let months = [...MONTHS];

    if (
        settingsSnap.exists() &&
        settingsSnap.data().juneUnlocked
    ) {

        months.unshift("June");

    }

    return months.filter(
        month => !assignedMonths.includes(month)
    );

}

// =======================================================
// Contribution Draw v1.1
// draw.js
// Section 2 of 4
// Draw Engine
// =======================================================


// =======================================================
// Handle Draw
// =======================================================

async function handleDraw() {

    if (!currentUser) {

        alert("Please sign in with Google first.");

        return;

    }

    if (drawBusy) return;

    drawBusy = true;

    try {

        // Check whether participant already has a month
        const participantRef = doc(
            db,
            PARTICIPANTS,
            currentUser.uid
        );

        const participantSnap =
            await getDoc(participantRef);

        if (participantSnap.exists()) {

            const data = participantSnap.data();

            if (data.assignedMonth) {

                alert(
                    `You already own ${data.assignedMonth}.`
                );

                drawBusy = false;

                return;

            }

        }

        // Refresh assigned months
        await loadAssignedMonths();

        // Determine available months
        const availableMonths =
    await getAvailableMonths();

        if (availableMonths.length === 0) {

            alert("All public months have been assigned.");

            drawBusy = false;

            return;

        }

        // Secret random assignment
        const assignedMonth =
            availableMonths[
                Math.floor(
                    Math.random() *
                    availableMonths.length
                )
            ];

        await saveAssignment(assignedMonth);

    } catch (error) {

        console.error(error);

        alert("Unable to complete draw.");

    }

    drawBusy = false;

}



// =======================================================
// Save Assignment
// =======================================================

async function saveAssignment(month) {

    const participant = {

    assignedMonth: month,

    assignedBox: null,

    hasDrawn: true,

    assignedAt: serverTimestamp(),

    updatedAt: serverTimestamp()

};
    // Save participant
    await setDoc(

        doc(
            db,
            PARTICIPANTS,
            currentUser.uid
        ),

        participant

    );

    // Hall of Transparency
    await addDoc(

        collection(
            db,
            TRANSPARENCY
        ),

        participant

    );

    assignedMonths.push(month);

    if (month === "June") {

    await lockJune();

}

    latestSelection.textContent =
        `${participant.name} selected ${month}`;

    alert(
        `Congratulations!\n\nYour assigned month is ${month}.`
    );

    await loadTransparency();

    updateProgress();

    updateStatistics();

    }

// =======================================================
// Contribution Draw v1.1
// draw.js
// Section 3 of 4
// Transparency, Progress & Statistics
// =======================================================


// =======================================================
// Load Hall of Transparency
// =======================================================

async function loadTransparency() {

    if (!selectionHistory) return;

    selectionHistory.innerHTML = "";

    const q = query(
        collection(db, TRANSPARENCY),
        orderBy("assignedAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

        selectionHistory.innerHTML = `
            <p class="empty-message">
                No selections have been recorded yet.
            </p>
        `;

        latestSelection.textContent =
            "No month has been selected yet.";

        return;
    }

    let latestShown = false;

    snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        if (!latestShown) {

            latestSelection.textContent =
                `${data.name} selected ${data.assignedMonth}`;

            latestShown = true;

        }

        const item = document.createElement("div");

        item.className = "history-item";

        item.innerHTML = `
            <strong>${data.name}</strong><br>
            <span>${data.assignedMonth}</span>
        `;

        selectionHistory.appendChild(item);

    });

}



// =======================================================
// Progress
// =======================================================

function updateProgress() {

    const selected = assignedMonths.length;

    const total = 10;

    progressText.textContent =
        `${selected} of ${total} months selected`;

    if (progressFill) {

        progressFill.style.width =
            `${(selected / total) * 100}%`;

    }

}



// =======================================================
// Statistics
// =======================================================

function updateStatistics() {

    const selected = assignedMonths.length;

    if (totalParticipants)
        totalParticipants.textContent = selected;

    if (monthsSelected)
        monthsSelected.textContent = selected;

    if (monthsRemaining)
        monthsRemaining.textContent =
            10 - selected;

}

async function unlockJune() {

    await setDoc(
        doc(db, "settings", "drawSettings"),
        {
            juneUnlocked: true
        },
        { merge: true }
    );

    alert("June has been unlocked.");
}

async function resetDraw() {

    const confirmed = confirm(
        "Are you sure you want to reset the draw?\n\nThis will permanently delete all participant selections and the Hall of Transparency."
    );

    if (!confirmed) return;

    // Delete all participant documents
    const participantsSnapshot = await getDocs(
        collection(db, PARTICIPANTS)
    );

    for (const docSnap of participantsSnapshot.docs) {

        await deleteDoc(docSnap.ref);

    }

    // Delete all transparency records
    const transparencySnapshot = await getDocs(
        collection(db, TRANSPARENCY)
    );

    for (const docSnap of transparencySnapshot.docs) {

        await deleteDoc(docSnap.ref);

    }

    // Lock June again
    await setDoc(
        doc(db, "settings", "drawSettings"),
        {
            juneUnlocked: false
        },
        { merge: true }
    );

    // Refresh the application
    assignedMonths = [];

    await finishDraw();

    alert("Contribution Draw has been reset successfully.");

}

async function lockJune() {

    await setDoc(
        doc(db, "settings", "drawSettings"),
        {
            juneUnlocked: false
        },
        { merge: true }
    );

    alert("June has been locked.");
}

// =======================================================
// Contribution Draw v1.1
// draw.js
// Section 4 of 4
// Final Utilities
// =======================================================


// =======================================================
// Refresh Everything
// =======================================================

async function refreshDraw() {

    await loadAssignedMonths();

    await loadTransparency();

    updateProgress();

    updateStatistics();

}


// =======================================================
// Disable Draw When Complete
// =======================================================

function checkDrawCompleted() {

    if (assignedMonths.length < MONTHS.length) return;

    const boxes =
        document.querySelectorAll(".gift-box");

    boxes.forEach(box => {

        box.disabled = true;

        box.classList.add("disabled");

    });

}


// =======================================================
// Refresh After Successful Draw
// =======================================================

async function finishDraw() {

    await refreshDraw();

    checkDrawCompleted();

}


// =======================================================
// Replace saveAssignment()
// ending
//
// Replace ONLY these four lines:
//
// await loadTransparency();
// updateProgress();
// updateStatistics();
//
// with:
//
// await finishDraw();
//
// =======================================================


// =======================================================
// Manual Refresh (Developer)
// =======================================================

window.refreshContributionDraw =
    refreshDraw;

if (unlockJuneBtn) {

    unlockJuneBtn.addEventListener(
        "click",
        unlockJune
    );

}

if (lockJuneBtn) {

    lockJuneBtn.addEventListener(
        "click",
        lockJune
    );

}

if (resetDrawBtn) {

    resetDrawBtn.addEventListener(
        "click",
        resetDraw
    );

}

// =======================================================
// Startup Check
// =======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Contribution Draw v1.1 loaded successfully."
        );

    }
);
