// --- CONFIGURATION ---
const CITY = "Lahore";       // Change to your city
const COUNTRY = "Pakistan";  // Change to your country

// Audio alert for prayer reminders (Uses local audio file)
const reminderAudio = new Audio("assets/medium_bell_ringing_near.ogg");
reminderAudio.loop = true;
// --- UTILITY FUNCTIONS ---

function formatTo12Hr(time24) {
  if (!time24) return "";
  const cleanTime = time24.split(" ")[0];
  let [hours, minutes] = cleanTime.split(":");
  hours = parseInt(hours, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

// --- 1. TRACKER PERSISTENCE (tracker.html) ---
function initTracker() {
  const prayerIds = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const todayKey = getTodayKey();

  let storedData = JSON.parse(localStorage.getItem("namaz_tracker")) || {};
  if (!storedData[todayKey]) {
    storedData[todayKey] = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  }

  prayerIds.forEach((prayer) => {
    const checkbox = document.getElementById(prayer);
    if (!checkbox) return;

    checkbox.checked = storedData[todayKey][prayer] || false;

    checkbox.addEventListener("change", (e) => {
      storedData[todayKey][prayer] = e.target.checked;
      localStorage.setItem("namaz_tracker", JSON.stringify(storedData));
      updateMonthlySummary();
    });
  });

  const now = new Date();
  const dayEl = document.getElementById("day");
  const monthEl = document.getElementById("month");
  const dateEl = document.getElementById("date");

  if (dayEl) dayEl.innerText = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  if (monthEl) monthEl.innerText = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  if (dateEl) dateEl.innerText = now.getDate();
}

// --- 2. MONTHLY TRACK RECORD STATS ---
function updateMonthlySummary() {
  const prayedEl = document.getElementById("monthly-prayed-count");
  const missedEl = document.getElementById("monthly-missed-count");
  if (!prayedEl || !missedEl) return;

  const storedData = JSON.parse(localStorage.getItem("namaz_tracker")) || {};
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;

  let totalPrayed = 0;
  let totalMissed = 0;

  Object.keys(storedData).forEach((dateKey) => {
    if (dateKey.startsWith(currentYearMonth)) {
      const dayRecord = storedData[dateKey];
      Object.values(dayRecord).forEach((isPrayed) => {
        if (isPrayed === true) {
          totalPrayed++;
        } else {
          totalMissed++;
        }
      });
    }
  });

  prayedEl.innerText = totalPrayed;
  missedEl.innerText = totalMissed;
}

// --- 3. HISTORY PAGE LOGIC (history.html) ---
function initHistoryPage() {
  const datePicker = document.getElementById("history-date-picker");
  const historyContainer = document.getElementById("history-prayer-list");
  if (!datePicker || !historyContainer) return;

  datePicker.value = getTodayKey();

  function renderDateHistory(selectedDate) {
    const storedData = JSON.parse(localStorage.getItem("namaz_tracker")) || {};
    const dayRecord = storedData[selectedDate] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };

    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    historyContainer.innerHTML = "";

    prayers.forEach((prayer) => {
      const isPrayed = dayRecord[prayer.toLowerCase()] || false;

      const itemRow = document.createElement("div");
      itemRow.className = "prayer-item";
      itemRow.style.display = "flex";
      itemRow.style.justifyContent = "space-between";
      itemRow.style.padding = "6px 10px";
      itemRow.style.background = "rgba(255, 255, 255, 0.15)";
      itemRow.style.borderRadius = "6px";

      itemRow.innerHTML = `
        <span class="prayer-name" style="margin-right:15px">${prayer}</span>
        <span style="font-weight: bold; color: ${isPrayed ? 'rgba(76, 12, 80, 0.835)' : 'rgb(98, 25, 25)'};">
          ${isPrayed ? 'Prayed' : 'Missed'}
        </span>
      `;

      historyContainer.appendChild(itemRow);
    });
  }

  renderDateHistory(datePicker.value);

  datePicker.addEventListener("change", (e) => {
    renderDateHistory(e.target.value);
  });
}

// --- 4. NAMAZ TIMINGS API (timings.html) ---
async function fetchPrayerTimings() {
  const cachedData = localStorage.getItem(`timings_${getTodayKey()}`);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${CITY}&country=${COUNTRY}&method=1`
    );
    const data = await response.json();
    const timings = data.data.timings;

    localStorage.setItem(`timings_${getTodayKey()}`, JSON.stringify(timings));
    return timings;
  } catch (error) {
    console.error("Error fetching prayer timings:", error);
    return null;
  }
}

async function renderTimings() {
  const timings = await fetchPrayerTimings();
  if (!timings) return;

  const idMap = {
    Fajr: "fajr-time",
    Dhuhr: "dhuhr-time",
    Asr: "asr-time",
    Maghrib: "maghrib",
    Isha: "isha-time"
  };

  Object.keys(idMap).forEach((prayer) => {
    const el = document.getElementById(idMap[prayer]);
    if (el && timings[prayer]) {
      el.innerText = formatTo12Hr(timings[prayer]);
    }
  });
}

// --- 5. REMINDER CHECKER & AUDIO NOTIFICATIONS ---
async function startReminderChecker() {
  const timings = await fetchPrayerTimings();
  if (!timings) return;

  const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  setInterval(() => {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    mainPrayers.forEach((prayer) => {
      const prayerTime24 = timings[prayer].split(" ")[0];
      const notifiedKey = `notified_${getTodayKey()}_${prayer}`;

      if (currentTimeStr === prayerTime24 && !localStorage.getItem(notifiedKey)) {
        localStorage.setItem(notifiedKey, "true");
        triggerReminder(prayer, formatTo12Hr(prayerTime24));
      }
    });
  }, 20000);
}

function triggerReminder(prayerName, prayerTimeFormatted) {
  // Desktop Native Notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`Time for ${prayerName}!`, {
      body: `${prayerName} prayer time is ${prayerTimeFormatted}.`
    });
  }

  // Redirect to reminder.html WITH the playAudio parameter
  if (!document.getElementById("prayer-name")) {
    window.location.href = `reminder.html?prayer=${encodeURIComponent(prayerName)}&time=${encodeURIComponent(prayerTimeFormatted)}&playAudio=true`;
  } else {
    // If already on reminder page, enable loop and play immediately
    reminderAudio.loop = true;
    reminderAudio.currentTime = 0;
    reminderAudio.play().catch((err) => console.error("Audio error:", err));
  }
}

function initReminderPage() {
  const nameEl = document.getElementById("prayer-name");
  if (!nameEl) return; // Guard clause: Exit if not on reminder.html page

  const params = new URLSearchParams(window.location.search);
  const prayerName = params.get("prayer");
  const prayerTime = params.get("time");
  const shouldPlayAudio = params.get("playAudio");

  const timeEl = document.getElementById("prayer-time");
  const markBtn = document.getElementById("mark-prayed-btn");
  const dismissBtn = document.getElementById("dismiss-btn"); // Optional extra dismiss button

  if (nameEl && prayerName) {
    nameEl.innerText = `${prayerName} Time`;
  }
  if (timeEl && prayerTime) {
    timeEl.innerText = prayerTime;
  }

  // PLAY LOOPING AUDIO HERE
  if (shouldPlayAudio === "true") {
    reminderAudio.loop = true; // Enable continuous looping
    reminderAudio.currentTime = 0; // Rewind to start
    reminderAudio.play().catch((err) => console.error("Audio play failed:", err));
  }

  // Helper function to stop and reset audio
  function stopAudio() {
    reminderAudio.pause();
    reminderAudio.currentTime = 0;
  }

  if (markBtn && prayerName) {
    markBtn.addEventListener("click", () => {
      stopAudio(); // Stops audio looping when marked as prayed

      const todayKey = getTodayKey();
      let storedData = JSON.parse(localStorage.getItem("namaz_tracker")) || {};
      if (!storedData[todayKey]) storedData[todayKey] = {};

      storedData[todayKey][prayerName.toLowerCase()] = true;
      localStorage.setItem("namaz_tracker", JSON.stringify(storedData));

      window.location.href = "tracker.html";
    });
  }

  // Handle clicking a standalone Dismiss button (if added to reminder.html)
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      stopAudio(); // Stops audio looping on dismiss
      window.location.href = "tracker.html";
    });
  }
}

// --- SAFE PAGE-SPECIFIC INITIALIZATION (Your DOM Ready Equivalent) ---
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("fajr")) {
    initTracker();
  }
  if (document.getElementById("monthly-prayed-count")) {
    updateMonthlySummary();
  }
  if (document.getElementById("history-date-picker")) {
    initHistoryPage();
  }
  if (document.getElementById("fajr-time")) {
    renderTimings();
  }
  if (document.getElementById("prayer-name")) {
    initReminderPage();
  }

  startReminderChecker();

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});