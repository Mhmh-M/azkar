let data;
let main_text = document.querySelector(".main-text");
let counter_button = document.querySelector("#counter");
let ziker_done_count = document.querySelector("#ziker_done_count");
let totle_ziker = document.querySelector("#totle_ziker");
let box = document.querySelector(".box");
let counter_track = 0;
let header = document.querySelector("header");
let ul_links = document.querySelector("header ul");
let icon = document.querySelector("header .icon");
let spans = document.querySelector("header .icon span");
let menu_active = false;
let ziker_name = document.querySelector("#ziker_name");
let azkar_names = [
  "أذكار الصباح",
  "أذكار المساء",
  "أذكار الصلاة",
  "صيغ التشهد",
];
let currentAzkarIndex = 0;

let azkar_alsaba7 = document.querySelector("#azkar_alsaba7");
let azkar_almsa2 = document.querySelector("#azkar_almsa2");
let azkar_alslah = document.querySelector("#azkar_alslah");
let azkar_altshhd = document.querySelector("#azkar_altshhd");
let times = document.querySelector("#times");

icon.addEventListener("click", function (e) {
  e.stopPropagation();
  if (!menu_active) {
    menu_active = true;
    icon.classList.add("active-icon");
    ul_links.classList.add("move-to-left");
  } else {
    menu_active = false;
    icon.classList.remove("active-icon");
    ul_links.classList.remove("move-to-left");
  }
});

document.addEventListener("click", (e) => {
  if (!icon.contains(e.target) && !ul_links.contains(e.target)) {
    if (menu_active) {
      menu_active = false;
      icon.classList.remove("active-icon");
      ul_links.classList.remove("move-to-left");
    }
  }
});

document.onkeyup = function (e) {
  if (e.key === "Escape") {
    menu_active = false;
    icon.classList.remove("active-icon");
    ul_links.classList.remove("move-to-left");
  } else if (e.key === "ArrowLeft") {
    next_action();
  } else if (e.key === "ArrowRight") {
    back_action();
  } else if (e.key === " " || e.key === "Enter") {
    count_action();
  }
};

// Theme and Time of day detection
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = themeToggleBtn.querySelector("i");
const currentHour = new Date().getHours();
let isNightTime = currentHour >= 17 || currentHour < 5;

let savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || (!savedTheme && isNightTime)) {
  document.body.classList.add("dark-mode");
  themeIcon.className = "fa-solid fa-sun";
} else {
  document.body.classList.remove("dark-mode");
  themeIcon.className = "fa-solid fa-moon";
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    themeIcon.className = "fa-solid fa-sun";
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.className = "fa-solid fa-moon";
    localStorage.setItem("theme", "light");
  }
});

// Progress Tracking Methods
function getProgressKey(azkarIndex) {
  const now = new Date();
  
  if (azkarIndex === 2 || azkarIndex === 3) {
    const timingsStr = localStorage.getItem("prayer_timings");
    if (!timingsStr) return `azkar_salah_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
    
    const timings = JSON.parse(timingsStr);
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let lastPrayer = "Isha"; 
    let prayerDate = now.getDate();
    
    for (let p of prayerNames) {
      if (!timings[p]) continue;
      let parts = timings[p].split(":");
      let pTime = new Date();
      pTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      if (now >= pTime) lastPrayer = p;
    }
    
    if (lastPrayer === "Isha" && now.getHours() < 12) {
      prayerDate = new Date(now.getTime() - 24*60*60*1000).getDate();
    }
    return `azkar_salah_${now.getFullYear()}_${now.getMonth()}_${prayerDate}_${lastPrayer}`;
  } 
  else if (azkarIndex === 0) {
    const shifted = new Date(now.getTime() - 4*60*60*1000); // Morning resets at 4 AM
    return `azkar_morning_${shifted.getFullYear()}_${shifted.getMonth()}_${shifted.getDate()}`;
  }
  else {
    const shifted = new Date(now.getTime() - 14*60*60*1000); // Evening resets at 2 PM (Asr)
    return `azkar_evening_${shifted.getFullYear()}_${shifted.getMonth()}_${shifted.getDate()}`;
  }
}

function clearOldProgress() {
  const validKeys = [0, 1, 2, 3].map(getProgressKey);
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith("azkar_salah_") || k.startsWith("azkar_morning_") || k.startsWith("azkar_evening_") || k.startsWith("azkar_progress_"))) {
      if (!validKeys.includes(k)) keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
clearOldProgress();

function loadProgress(azkarIndex) {
  const key = getProgressKey(azkarIndex);
  let progress = localStorage.getItem(key);
  return progress ? JSON.parse(progress) : {};
}

function saveProgress(azkarIndex, zikrId, remainingCount) {
  const key = getProgressKey(azkarIndex);
  let progress = loadProgress(azkarIndex);
  progress[zikrId] = remainingCount;
  localStorage.setItem(key, JSON.stringify(progress));
}

function getZakrProgress(azkarIndex, zikrId, defaultCount) {
  let progress = loadProgress(azkarIndex);
  return progress[zikrId] !== undefined ? progress[zikrId] : defaultCount;
}

function isZakrDone(azkarIndex, zikrId) {
  let progress = loadProgress(azkarIndex);
  return progress[zikrId] === true || progress[zikrId] === 0;
}

// Give each item a stable ID based on original position
[day_data, night_data, azkat_salah, tashahd].forEach((arr) => {
  arr.forEach((item, index) => {
    if (item.id === undefined) {
      item.id = index;
    }
  });
});

// Extra Azkar Toggle
let showExtraAzkar = localStorage.getItem("showExtraAzkar") === "true";
let extraToggle = document.getElementById("toggle-extra-azkar");
extraToggle.checked = showExtraAzkar;

// Full unfiltered copies
const day_data_full = [...day_data];
const night_data_full = [...night_data];
const azkat_salah_full = [...azkat_salah];
const tashahd_full = [...tashahd];

function getFilteredData(fullArr) {
  if (showExtraAzkar) return [...fullArr];
  return fullArr.filter(item => !item.extra);
}

function sortAzkarArray(arr, azkarIndex) {
  arr.sort((a, b) => {
    let aDone = isZakrDone(azkarIndex, a.id) ? 1 : 0;
    let bDone = isZakrDone(azkarIndex, b.id) ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return a.count - b.count;
  });
}

// Filtered + sorted working arrays
let day_filtered = getFilteredData(day_data_full);
let night_filtered = getFilteredData(night_data_full);
let salah_filtered = getFilteredData(azkat_salah_full);
let tashahd_filtered = getFilteredData(tashahd_full);

sortAzkarArray(day_filtered, 0);
sortAzkarArray(night_filtered, 1);
sortAzkarArray(salah_filtered, 2);
sortAzkarArray(tashahd_filtered, 3);

// Select initial data based on time of day
currentAzkarIndex = isNightTime ? 1 : 0;
data = isNightTime ? night_filtered : day_filtered;

function rebuildFilteredData() {
  day_filtered = getFilteredData(day_data_full);
  night_filtered = getFilteredData(night_data_full);
  salah_filtered = getFilteredData(azkat_salah_full);
  tashahd_filtered = getFilteredData(tashahd_full);
  
  sortAzkarArray(day_filtered, 0);
  sortAzkarArray(night_filtered, 1);
  sortAzkarArray(salah_filtered, 2);
  sortAzkarArray(tashahd_filtered, 3);
  
  const allFiltered = [day_filtered, night_filtered, salah_filtered, tashahd_filtered];
  data = allFiltered[currentAzkarIndex];
  counter_track = 0;
  renderZakr();
}

extraToggle.addEventListener("change", () => {
  showExtraAzkar = extraToggle.checked;
  localStorage.setItem("showExtraAzkar", showExtraAzkar);
  rebuildFilteredData();
});

function renderProgressBar() {
  let html = "";
  let doneCount = 0;
  
  let total = data.length;
  // Loop through the sorted array sequentially so the progress bar perfectly matches the current reading sequence
  for (let i = 0; i < total; i++) {
    let item = data[i];
    let isDone = isZakrDone(currentAzkarIndex, item.id);
    if (isDone) doneCount++;
    
    let isActive = (counter_track === i);
    
    let className = "progress-segment";
    if (isDone) className += " done";
    if (isActive) className += " active";
    
    html += `<div class="${className}"></div>`;
  }
  
  document.getElementById("progress-bar").innerHTML = html;
  document.getElementById("ziker_done_count").innerText = doneCount;
}

function renderZakr() {
  // Reset animation
  main_text.classList.remove("fade-in");
  void main_text.offsetWidth; // trigger reflow
  main_text.classList.add("fade-in");

  // Scroll to top for long Azkar
  window.scrollTo({ top: 0, behavior: 'smooth' });

  main_text.innerHTML = data[counter_track]['zakr'];
  totle_ziker.innerHTML = data.length;
  // Render the new progress bar and update completed count
  renderProgressBar();
  
  ziker_name.innerHTML = azkar_names[currentAzkarIndex];
  
  if (isZakrDone(currentAzkarIndex, data[counter_track].id)) {
    counter_button.innerHTML = "✔";
    times.innerHTML = "";
  } else {
    counter_button.innerHTML = getZakrProgress(currentAzkarIndex, data[counter_track].id, data[counter_track]['count']);
    times.innerHTML = data[counter_track]['text_count'];
  }
}

renderZakr();

let next = document.querySelector("#next");
let back = document.querySelector("#back");

next.addEventListener("click", next_action);
back.addEventListener("click", back_action);
azkar_alsaba7.addEventListener("click", () => {
  choose_azkar(day_filtered, 0);
});
azkar_almsa2.addEventListener("click", () => {
  choose_azkar(night_filtered, 1);
});
azkar_alslah.addEventListener("click", () => {
  choose_azkar(salah_filtered, 2);
});
azkar_altshhd.addEventListener("click", () => choose_azkar(tashahd_filtered, 3));

function choose_azkar(azkar_data, azkar_number) {
  data = azkar_data;
  currentAzkarIndex = azkar_number;
  counter_track = 0;
  renderZakr();
  
  // Highlight active menu item
  const menuItems = [azkar_alsaba7, azkar_almsa2, azkar_alslah, azkar_altshhd];
  menuItems.forEach(item => item.classList.remove("active-menu"));
  if (menuItems[azkar_number]) menuItems[azkar_number].classList.add("active-menu");
  
  // Close menu
  menu_active = false;
  header.style.overflow = "";
  icon.classList.remove("active-icon");
  ul_links.classList.remove("move-to-left");
}

function next_action() {
  if (counter_track < data.length - 1) {
    counter_track++;
    renderZakr();
  }
}

function back_action() {
  if (counter_track > 0) {
    counter_track--;
    renderZakr();
  }
}

counter_button.addEventListener("click", count_action);

function count_action() {
  if (counter_button.innerHTML === "✔") {
    let allDone = data.every(item => isZakrDone(currentAzkarIndex, item.id));
    if (allDone) {
      main_text.innerHTML = '<div class="completion-msg">✨ تم الانتهاء ✨<br><small>تقبل الله منا ومنكم صالح الأعمال</small></div>';
      times.innerHTML = "";
    } else {
      next_action();
    }
    return;
  }

  if (counter_button.innerHTML == 1) {
    saveProgress(currentAzkarIndex, data[counter_track].id, 0);
    counter_button.innerHTML = "✔";
    times.innerHTML = "";
    
    // Automatically re-sort and show next after a short delay
    setTimeout(() => {
      sortAzkarArray(data, currentAzkarIndex);
      
      let allDone = data.every(item => isZakrDone(currentAzkarIndex, item.id));
      if (allDone) {
        main_text.innerHTML = '<div class="completion-msg">✨ تم الانتهاء ✨<br><small>تقبل الله منا ومنكم صالح الأعمال</small></div>';
        times.innerHTML = "";
        counter_button.innerHTML = "✔";
      } else {
        if (counter_track >= data.length) counter_track = data.length - 1;
        // If the item at current track is already done (meaning we hit the end of unfinished items)
        if (isZakrDone(currentAzkarIndex, data[counter_track].id)) {
          counter_track = 0; // jump back to the first unfinished item
        }
        renderZakr();
      }
    }, 300);
    
  } else if (parseInt(counter_button.innerHTML) > 0) {
    counter_button.innerHTML--;
    saveProgress(currentAzkarIndex, data[counter_track].id, parseInt(counter_button.innerHTML));
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  box.addEventListener("click", chooseSide);
  fetchPrayerTimesAndUpdate().then(() => {
    // Check if opened from notification
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('category')) {
      choose_azkar_by_index(parseInt(urlParams.get('category')));
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  });
});

// Swipe gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;
box.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

box.addEventListener("touchend", (e) => {
  let touchEndX = e.changedTouches[0].screenX;
  let touchEndY = e.changedTouches[0].screenY;
  let diffX = touchEndX - touchStartX;
  let diffY = touchEndY - touchStartY;
  
  // Only trigger if horizontal swipe is dominant
  if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      // Swipe right → previous (RTL context)
      next_action();
    } else {
      // Swipe left → next (RTL context)
      back_action();
    }
  }
}, { passive: true });

function chooseSide(e) {
  const { clientX } = e;
  const { left, width } = box.getBoundingClientRect();
  const relativeX = clientX - left;

  if (relativeX < width / 2) {
    next_action();
  } else {
    back_action();
  }
}

async function fetchPrayerTimesAndUpdate() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchAndApplyTimings(latitude, longitude);
      },
      async (error) => {
        console.log("Geolocation denied or failed, falling back to IP.");
        await fetchByIP();
      }
    );
  } else {
    await fetchByIP();
  }
}

async function fetchByIP() {
  try {
    const geoResponse = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!geoResponse.ok) return;
    const geoData = await geoResponse.json();
    await fetchAndApplyTimings(geoData.latitude, geoData.longitude);
  } catch (error) {
    console.error("Could not fetch IP location", error);
  }
}

async function fetchAndApplyTimings(latitude, longitude) {
  try {
    const date = new Date();
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}`;

    const adhanResponse = await fetch(url);
    if (!adhanResponse.ok) return;
    const adhanData = await adhanResponse.json();
    const timings = adhanData.data.timings;
    localStorage.setItem("prayer_timings", JSON.stringify(timings));

    const fajrTime = timings.Fajr;
    const asrTime = timings.Asr;

    const fajrParts = fajrTime.split(':');
    const fajrDate = new Date();
    fajrDate.setHours(parseInt(fajrParts[0], 10), parseInt(fajrParts[1], 10), 0, 0);

    const asrParts = asrTime.split(':');
    const asrDate = new Date();
    asrDate.setHours(parseInt(asrParts[0], 10), parseInt(asrParts[1], 10), 0, 0);

    const now = new Date();

    // Day time is from Fajr to Asr
    const isDayTimeAPI = now >= fajrDate && now < asrDate;
    const isNightTimeAPI = !isDayTimeAPI;

    if (isNightTime !== isNightTimeAPI) {
      isNightTime = isNightTimeAPI;
      currentAzkarIndex = isNightTime ? 1 : 0;
      data = isNightTime ? night_filtered : day_filtered;

      counter_track = 0;
      renderZakr();

      if (!localStorage.getItem("theme")) {
        if (isNightTime) {
          document.body.classList.add("dark-mode");
          themeIcon.className = "fa-solid fa-sun";
        } else {
          document.body.classList.remove("dark-mode");
          themeIcon.className = "fa-solid fa-moon";
        }
      }
    }
  } catch (error) {
    console.error("Could not fetch prayer times", error);
  }
}

// History Modal Logic
let show_history = document.getElementById("show_history");
let history_modal = document.getElementById("history-modal");
let close_modal = document.querySelector(".close-modal");
let history_stats = document.getElementById("history-stats");

function updateHistoryUI() {
  const allData = [day_filtered, night_filtered, salah_filtered, tashahd_filtered];
  history_stats.innerHTML = "";
  
  azkar_names.forEach((name, index) => {
    let total = allData[index].length;
    let doneCount = 0;
    
    allData[index].forEach(item => {
      if (isZakrDone(index, item.id)) doneCount++;
    });
    
    const div = document.createElement("div");
    div.className = "stat-item";
    div.innerHTML = `<span>${name}</span> <span><b style="color: var(--primary)">${doneCount}</b> / ${total}</span>`;
    history_stats.appendChild(div);
  });
}

show_history.addEventListener("click", () => {
  // Close menu if open
  menu_active = false;
  header.style.overflow = "";
  icon.classList.remove("active-icon");
  ul_links.classList.remove("move-to-left");
  
  updateHistoryUI();
  history_modal.classList.add("show");
});

close_modal.addEventListener("click", () => {
  history_modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target == history_modal) {
    history_modal.classList.remove("show");
  }
});

// Notification System
let notifyBtn = document.getElementById("toggle_notifications");
let notifyIcon = notifyBtn.querySelector("i");
let notificationsEnabled = localStorage.getItem("notificationsEnabled") === "true";

function updateNotifyUI() {
  if (notificationsEnabled) {
    notifyIcon.className = "fa-solid fa-bell";
    notifyIcon.style.color = "var(--primary)";
  } else {
    notifyIcon.className = "fa-solid fa-bell-slash";
    notifyIcon.style.color = "inherit";
  }
}
updateNotifyUI();

// Register Service Worker with correct scope
if ('serviceWorker' in navigator) {
  // Detect base path for GitHub Pages
  let swPath = 'sw.js';
  let swScope = './';
  if (location.pathname.includes('/azkar_m/')) {
    swPath = '/azkar_m/sw.js';
    swScope = '/azkar_m/';
  }
  navigator.serviceWorker.register(swPath, { scope: swScope })
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.log('SW registration failed:', err));

  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SWITCH_CATEGORY') {
      if (typeof choose_azkar_by_index === "function") {
        choose_azkar_by_index(event.data.category);
      }
    }
  });
}

function sendNotification(title, body, targetCategory = null) {
  // Always add to In-App Notification Center
  if (typeof addInAppNotification === "function") {
    addInAppNotification(title, body, targetCategory);
  }

  // Try system notification
  if ("Notification" in window && Notification.permission === "granted") {
    let targetUrl = location.href.split('?')[0];
    if (targetCategory !== null) {
      targetUrl += `?category=${targetCategory}`;
    }

    const options = {
      body: body,
      icon: "assets/images/favicon.png",
      badge: "assets/images/favicon.png",
      vibrate: [200, 100, 200],
      tag: title, // Prevent duplicate notifications
      renotify: true,
      data: { url: targetUrl, category: targetCategory }
    };

    // Try Service Worker first (required for Android)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options);
      }).catch(() => {
        // Fallback to regular notification
        let n = new Notification(title, options);
        if (targetCategory !== null) {
          n.onclick = () => { window.focus(); choose_azkar_by_index(targetCategory); };
        }
      });
    } else {
      // No SW controller, use regular Notification
      let n = new Notification(title, options);
      if (targetCategory !== null) {
        n.onclick = () => { window.focus(); choose_azkar_by_index(targetCategory); };
      }
    }
  }
}

function isCategoryDone(azkarIndex, dataArray) {
  for (let i = 0; i < dataArray.length; i++) {
    if (!isZakrDone(azkarIndex, dataArray[i].id)) return false;
  }
  return true;
}

notifyBtn.addEventListener("click", () => {
  if (!notificationsEnabled) {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          notificationsEnabled = true;
          localStorage.setItem("notificationsEnabled", "true");
          updateNotifyUI();
          // Send immediate test notification to prove it works
          setTimeout(() => {
            sendNotification("تم تفعيل التنبيهات ✅", "سيتم تذكيرك بالأذكار بعد كل صلاة بإذن الله.");
          }, 500);
        } else {
          alert("الرجاء السماح بالإشعارات من إعدادات المتصفح.");
        }
      }).catch(() => {
        alert("حدث خطأ في طلب الإشعارات. تأكد أنك تستخدم HTTPS.");
      });
    } else {
      alert("متصفحك لا يدعم الإشعارات.");
    }
  } else {
    notificationsEnabled = false;
    localStorage.setItem("notificationsEnabled", "false");
    updateNotifyUI();
  }
});

// Prayer time notification checker - runs every 30 seconds
setInterval(() => {
  const now = new Date();
  
  // Daily Cleanup
  const todayDateStr = now.toDateString();
  let lastCleanup = localStorage.getItem("last_cleanup_date");
  if (lastCleanup !== todayDateStr) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("notified_") || k.startsWith("reminder_"))) {
        localStorage.removeItem(k);
      }
    }
    localStorage.removeItem("azkar_inapp_notifications");
    if (typeof renderInAppNotifications === "function") renderInAppNotifications();
    localStorage.setItem("last_cleanup_date", todayDateStr);
  }

  if (!notificationsEnabled) return;
  const timingsStr = localStorage.getItem("prayer_timings");
  if (!timingsStr) return;
  
  const timings = JSON.parse(timingsStr);
  const prayerNames = { "Fajr": "الفجر", "Dhuhr": "الظهر", "Asr": "العصر", "Maghrib": "المغرب", "Isha": "العشاء" };
  
  let activeKey = null;
  let activeName = "";
  let activeDiffMinutes = -1;
  
  for (let [key, name] of Object.entries(prayerNames)) {
    if (!timings[key]) continue;
    let parts = timings[key].split(":");
    let pTime = new Date();
    pTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    
    let diffMs = now.getTime() - pTime.getTime();
    let diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMs >= 0) {
      activeKey = key;
      activeName = name;
      activeDiffMinutes = diffMinutes;
    }
    
    // 1. Notify at prayer time (within 0-2 min window to not miss it)
    if (diffMinutes >= 0 && diffMinutes < 2) {
      let notifiedKey = `notified_${now.getDate()}_${key}`;
      if (!localStorage.getItem(notifiedKey)) {
        localStorage.setItem(notifiedKey, "true");
        let title = `حان وقت أذكار ما بعد صلاة ${name}`;
        let body = "لا تنس قراءة أذكار الصلاة.";
        let targetCat = 2; // Salah by default
        if (key === "Fajr") { body = "حان وقت أذكار ما بعد صلاة الفجر وأذكار الصباح."; targetCat = 0; }
        if (key === "Asr") { body = "حان وقت أذكار ما بعد صلاة العصر وأذكار المساء."; targetCat = 1; }
        sendNotification(title, body, targetCat);
      }
    }
  }
  
  // 2. Reminder every 30 minutes if not finished (based on the current active prayer)
  if (activeKey && activeDiffMinutes >= 30) {
    let intervals = Math.floor(activeDiffMinutes / 30);
    let reminderKey = `reminder_${now.getDate()}_${activeKey}_${intervals}`;
    if (!localStorage.getItem(reminderKey)) {
      localStorage.setItem(reminderKey, "true");
      
      let pending = [];
      let targetCat = null;
      
      // Salah Azkar reminder for the current active prayer
      if (!isCategoryDone(2, salah_filtered)) { 
        pending.push(`أذكار صلاة ${activeName}`); 
        targetCat = 2; 
      }
      
      // Morning/Evening Azkar reminder based on time
      if (activeKey === "Fajr" || activeKey === "Dhuhr") {
        if (!isCategoryDone(0, day_filtered)) { 
          pending.push("أذكار الصباح"); 
          targetCat = 0; 
        }
      } else {
        if (!isCategoryDone(1, night_filtered)) { 
          pending.push("أذكار المساء"); 
          targetCat = 1; 
        }
      }
      
      if (pending.length > 0) {
        sendNotification("تذكير بالأذكار 📿", `تذكير: لم تنتهِ بعد من قراءة: ${pending.join(" و ")}. اغتنم الأجر!`, targetCat);
      }
    }
  }
}, 30000);

// Font Size Adjuster
let fontSlider = document.getElementById("font-size-slider");

// Load saved font size
let savedFontSize = localStorage.getItem("azkar_font_size");
if (savedFontSize) {
  fontSlider.value = savedFontSize;
  main_text.style.fontSize = savedFontSize + "px";
} else {
  // Default is 26px
  main_text.style.fontSize = "26px";
  fontSlider.value = "26";
}

fontSlider.addEventListener("input", (e) => {
  let newSize = e.target.value;
  main_text.style.fontSize = newSize + "px";
  localStorage.setItem("azkar_font_size", newSize);
});

// In-App Notification Center Logic
let inappBell = document.getElementById("inapp-bell");
let notifDropdown = document.getElementById("notifications-dropdown");
let notifList = document.getElementById("notifications-list");
let unreadBadge = document.getElementById("unread-badge");
let clearNotifBtn = document.getElementById("clear-notifications");

function loadInAppNotifications() {
  let notifs = localStorage.getItem("azkar_inapp_notifications");
  return notifs ? JSON.parse(notifs) : [];
}

function saveInAppNotifications(notifs) {
  localStorage.setItem("azkar_inapp_notifications", JSON.stringify(notifs));
}

function addInAppNotification(title, body, category = null) {
  let notifs = loadInAppNotifications();
  let timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  notifs.unshift({ title, body, time: timeStr, read: false, category });
  // Keep only last 20
  if (notifs.length > 20) notifs.pop();
  saveInAppNotifications(notifs);
  renderInAppNotifications();
}

function renderInAppNotifications() {
  let notifs = loadInAppNotifications();
  notifList.innerHTML = "";
  let unreadCount = 0;
  
  if (notifs.length === 0) {
    notifList.innerHTML = '<div class="no-notifications">لا توجد إشعارات جديدة</div>';
  } else {
    notifs.forEach(n => {
      if (!n.read) unreadCount++;
      let div = document.createElement("div");
      div.className = "notification-item";
      if (n.category !== null && n.category !== undefined) {
        div.style.cursor = "pointer";
        div.onclick = () => {
          if (typeof choose_azkar_by_index === "function") {
            choose_azkar_by_index(n.category);
          }
          notifDropdown.classList.remove("show");
        };
      }
      div.innerHTML = `
        <div class="notification-title">${n.title}</div>
        <div class="notification-body">${n.body}</div>
        <div class="notification-time">${n.time}</div>
      `;
      notifList.appendChild(div);
    });
  }
  
  if (unreadCount > 0) {
    unreadBadge.classList.remove("hidden");
    unreadBadge.innerText = unreadCount > 9 ? "+9" : unreadCount;
  } else {
    unreadBadge.classList.add("hidden");
  }
}

inappBell.addEventListener("click", (e) => {
  e.stopPropagation();
  notifDropdown.classList.remove("hidden");
  notifDropdown.classList.toggle("show");
  
  if (notifDropdown.classList.contains("show")) {
    let notifs = loadInAppNotifications();
    notifs.forEach(n => n.read = true);
    saveInAppNotifications(notifs);
    renderInAppNotifications();
  }
});

clearNotifBtn.addEventListener("click", () => {
  saveInAppNotifications([]);
  renderInAppNotifications();
});

window.addEventListener("click", (e) => {
  if (!notifDropdown.contains(e.target) && !inappBell.contains(e.target)) {
    notifDropdown.classList.remove("show");
  }
});

// Initialize rendering on load
renderInAppNotifications();

function choose_azkar_by_index(index) {
  if (index === 0) choose_azkar(day_filtered, 0);
  else if (index === 1) choose_azkar(night_filtered, 1);
  else if (index === 2) choose_azkar(salah_filtered, 2);
  else if (index === 3) choose_azkar(tashahd_filtered, 3);
}
