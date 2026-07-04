// =======================================================
// Contribution Draw V2.0 Stable
// draw.js
// Part 1 of 4
// Draw Engine Foundation
// =======================================================

import { db } from "./firebase.js";

import {
    getCurrentUser,
    userIsAdmin,
    getBeneficiaryName
} from "./script.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// =======================================================
// Collections
// =======================================================

const PARTICIPANTS = "participants";
const TRANSPARENCY = "hallOfTransparency";
const SETTINGS = "settings";

// =======================================================
// HTML Elements
// =======================================================

const boxesContainer =
    document.getElementById("boxesContainer");

const latestSelection =
    document.getElementById("latestSelection");

const selectionHistory =
    document.getElementById("selectionHistory");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const totalParticipants =
    document.getElementById("totalParticipants");

const monthsSelected =
    document.getElementById("monthsSelected");

const monthsRemaining =
    document.getElementById("monthsRemaining");

// =======================================================
// Runtime
// =======================================================

let assignedMonths = [];

let drawBusy = false;

let availableMonths = [];

// =======================================================
// Month Generator
// =======================================================

function generateMonths(count) {

    const names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const months = [];

    let year = 2026;

    let index = 5; // June

    while (months.length < count) {

        months.push(
            `${names[index]} ${year}`
        );

        index++;

        if (index > 11) {

            index = 0;

            year++;

        }

    }

    return months;

}

// =======================================================
// Initialize Draw
// =======================================================

export async function initializeDraw() {

    await loadParticipants();

    await createBoxes();

    await refreshDashboard();

}
