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

// =======================================================
// Part 2 of 4
// Participants & Dynamic Gift Boxes
// =======================================================

// =======================================================
// Load Participants
// =======================================================

async function loadParticipants() {

    assignedMonths = [];

    const snapshot = await getDocs(
        collection(db, PARTICIPANTS)
    );

    snapshot.forEach(docSnap => {

        const data = docSnap.data();

        if (data.assignedMonth) {

            assignedMonths.push(
                data.assignedMonth
            );

        }

    });

    availableMonths =
        generateMonths(snapshot.size);

}

// =======================================================
// Dynamic Gift Boxes
// =======================================================

async function createBoxes() {

    if (!boxesContainer) return;

    boxesContainer.innerHTML = "";

    const participantSnapshot =
        await getDocs(
            collection(db, PARTICIPANTS)
        );

    const totalBoxes =
        Math.max(participantSnapshot.size, 1);

    for (let i = 0; i < totalBoxes; i++) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "gift-box";

        button.dataset.index = i;

        let hiddenText = "";

        if (userIsAdmin()) {

            hiddenText = `
                <div class="hidden-month">
                    ${availableMonths[i] ?? ""}
                </div>
            `;

        }

        button.innerHTML = `

            <div class="gift-icon">

                🎁

            </div>

            <div class="gift-number">

                Gift Box ${i + 1}

            </div>

            ${hiddenText}

        `;

        button.addEventListener(
            "click",
            handleDraw
        );

        boxesContainer.appendChild(button);

    }

}

// =======================================================
// Random Month
// =======================================================

function getRandomMonth() {

    const remaining =
        availableMonths.filter(

            month =>
                !assignedMonths.includes(month)

        );

    if (remaining.length === 0) {

        return null;

    }

    return remaining[
        Math.floor(
            Math.random() *
            remaining.length
        )
    ];

                     }

                                         // =======================================================
// Part 3 of 4
// Draw Engine
// =======================================================

// =======================================================
// Handle Draw
// =======================================================

async function handleDraw() {

    const user = getCurrentUser();

    if (!user) {

        alert("Please sign in first.");

        return;

    }

    if (drawBusy) return;

    drawBusy = true;

    try {

        const participantRef =
            doc(db, PARTICIPANTS, user.uid);

        const participantSnap =
            await getDoc(participantRef);

        if (
            participantSnap.exists() &&
            participantSnap.data().assignedMonth
        ) {

            alert(
                `You have already been assigned ${participantSnap.data().assignedMonth}.`
            );

            drawBusy = false;

            return;

        }

        const assignedMonth =
            getRandomMonth();

        if (!assignedMonth) {

            alert(
                "No available months remain."
            );

            drawBusy = false;

            return;

        }

        await saveAssignment(
            assignedMonth
        );

    } catch (error) {

        console.error(error);

        alert(
            "Unable to complete the draw."
        );

    }

    drawBusy = false;

}

// =======================================================
// Save Assignment
// =======================================================

async function saveAssignment(month) {

    const user =
        getCurrentUser();

    await setDoc(

        doc(
            db,
            PARTICIPANTS,
            user.uid
        ),

        {

            beneficiaryName:
                getBeneficiaryName(),

            assignedMonth:
                month,

            hasDrawn: true,

            assignedAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        },

        {
            merge: true
        }

    );

    await addDoc(

        collection(
            db,
            TRANSPARENCY
        ),

        {

            uid: user.uid,

            email: user.email,

            name:
                getBeneficiaryName(),

            assignedMonth:
                month,

            assignedAt:
                serverTimestamp()

        }

    );

    assignedMonths.push(month);

    latestSelection.textContent =
        `${getBeneficiaryName()} selected ${month}`;

    alert(
        `Congratulations!\n\nYour assigned month is ${month}.`
    );

    await refreshDashboard();

    }
