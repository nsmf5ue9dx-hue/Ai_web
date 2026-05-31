// টাইম জোন ডাটা - গিটহাব ডাটাবেইজ (LocalStorage এ সংরক্ষিত)
const GITHUB_TIMEZONE_DB_KEY = 'github_timezones_db';
const GITHUB_FORMAT_KEY = 'github_clock_format';

// বৈধ টাইম জোন তালিকা
const VALID_TIMEZONES = [
    'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Singapore',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland', 'Asia/Shanghai',
    'Asia/Hong_Kong', 'Asia/Manila', 'Asia/Jakarta', 'Asia/Seoul',
    'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo',
    'Africa/Cairo', 'Africa/Johannesburg', 'Australia/Melbourne'
];

let timezones = [];
let is24HourFormat = true;
let updateInterval = null;

// পেজ লোড হওয়ার সময়
window.addEventListener('DOMContentLoaded', () => {
    loadFromGitHubDB();
    renderTimezones();
    startClock();
});

// গিটহাব ডাটাবেইজ থেকে ডাটা লোড করুন
function loadFromGitHubDB() {
    try {
        const saved = localStorage.getItem(GITHUB_TIMEZONE_DB_KEY);
        if (saved) {
            timezones = JSON.parse(saved);
        } else {
            // ডিফল্ট টাইম জোন যোগ করুন
            timezones = ['Asia/Dhaka', 'America/New_York', 'Europe/London'];
            saveToGitHubDB();
        }
        
        const formatSaved = localStorage.getItem(GITHUB_FORMAT_KEY);
        if (formatSaved !== null) {
            is24HourFormat = JSON.parse(formatSaved);
        }
    } catch (error) {
        console.error('লোড এরর:', error);
        timezones = ['Asia/Dhaka'];
    }
}

// গিটহাব ডাটাবেইজে ডাটা সংরক্ষণ করুন
function saveToGitHubDB() {
    try {
        localStorage.setItem(GITHUB_TIMEZONE_DB_KEY, JSON.stringify(timezones));
        localStorage.setItem(GITHUB_FORMAT_KEY, JSON.stringify(is24HourFormat));
    } catch (error) {
        console.error('সংরক্ষণ এরর:', error);
        alert('ডাটা সংরক্ষণ করা যাচ্ছে না!');
    }
}

// দ্রুত টাইম জোন যোগ করুন
function quickAddTimezone(timezone) {
    if (!timezones.includes(timezone)) {
        timezones.push(timezone);
        saveToGitHubDB();
        renderTimezones();
        document.getElementById('timezone-input').value = '';
    } else {
        alert('এই টাইম জোন ইতিমধ্যে যোগ করা আছে!');
    }
}

// কাস্টম টাইম জোন যোগ করুন
function addTimezone() {
    const input = document.getElementById('timezone-input');
    const timezone = input.value.trim();

    if (!timezone) {
        alert('অনুগ্রহ করে একটি টাইম জোন প্রবেश করুন!');
        return;
    }

    // বৈধতা যাচাই করুন
    try {
        new Date().toLocaleString('en-US', { timeZone: timezone });
    } catch (error) {
        alert('অবৈধ টাইম জোন: ' + timezone);
        return;
    }

    if (timezones.includes(timezone)) {
        alert('এই টাইম জোন ইতিমধ্যে যোগ করা আছে!');
        return;
    }

    timezones.push(timezone);
    saveToGitHubDB();
    renderTimezones();
    input.value = '';
}

// টাইম জোন সরান
function removeTimezone(timezone) {
    timezones = timezones.filter(tz => tz !== timezone);
    saveToGitHubDB();
    renderTimezones();
}

// ফরম্যাট টগল করুন (12 ঘন্টা / 24 ঘন্টা)
function toggleFormat() {
    is24HourFormat = !is24HourFormat;
    saveToGitHubDB();
    renderTimezones();
}

// সব টাইম জোন মুছুন
function clearAllTimezones() {
    if (confirm('সব টাইম জোন মুছে দিতে চান?')) {
        timezones = [];
        saveToGitHubDB();
        renderTimezones();
    }
}

// সময় পান এবং প্রদর্শন করুন
function getTimeForTimezone(timezone) {
    try {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { timeZone: timezone });
        return new Date(timeString);
    } catch (error) {
        console.error('টাইম এরর:', error);
        return null;
    }
}

// টাইম অফসেট পান
function getTimezoneOffset(timezone) {
    try {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', { timeZone: timezone });
        const tzTime = new Date(timeString);
        const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const offset = (tzTime - utcTime) / (1000 * 60 * 60);
        return offset;
    } catch (error) {
        return 0;
    }
}

// সময় ফরম্যাট করুন
function formatTime(date) {
    if (!date) return 'N/A';

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    if (!is24HourFormat) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
}

// তারিখ ফরম্যাট করুন
function formatDate(date) {
    if (!date) return 'N/A';
    
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('bn-BD', options);
}

// টাইম জোন কার্ড রেন্ডার করুন
function renderTimezones() {
    const grid = document.getElementById('timezones-grid');
    grid.innerHTML = '';

    if (timezones.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>কোন টাইম জোন যোগ করা হয়নি। উপরে থেকে যোগ করুন!</p></div>';
        document.getElementById('saved-count').textContent = '0';
        return;
    }

    timezones.forEach(timezone => {
        const time = getTimeForTimezone(timezone);
        const offset = getTimezoneOffset(timezone);
        const offsetSign = offset >= 0 ? '+' : '';
        const offsetHours = Math.floor(Math.abs(offset));
        const offsetMinutes = Math.round((Math.abs(offset) % 1) * 60);
        const offsetString = `UTC${offsetSign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;

        const card = document.createElement('div');
        card.className = 'timezone-card';
        card.innerHTML = `
            <div class="timezone-name">${timezone}</div>
            <div class="timezone-time">${formatTime(time)}</div>
            <div class="timezone-date">${formatDate(time)}</div>
            <div class="timezone-offset">${offsetString}</div>
            <button class="remove-btn" onclick="removeTimezone('${timezone}')">🗑️ সরান</button>
        `;
        grid.appendChild(card);
    });

    document.getElementById('saved-count').textContent = timezones.length;
}

// ঘড়ি শুরু করুন
function startClock() {
    // প্রথম আপডেট
    renderTimezones();

    // প্রতি সেকেন্ডে আপডেট করুন
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => {
        updateClocks();
    }, 1000);
}

// ঘড়ি আপডেট করুন
function updateClocks() {
    const cards = document.querySelectorAll('.timezone-card');
    cards.forEach((card, index) => {
        const timezone = timezones[index];
        const time = getTimeForTimezone(timezone);
        const timeElement = card.querySelector('.timezone-time');
        if (timeElement && time) {
            timeElement.textContent = formatTime(time);
        }
    });
}

// পেজ আনলোড হওয়ার সময় ইন্টারভাল বন্ধ করুন
window.addEventListener('beforeunload', () => {
    if (updateInterval) clearInterval(updateInterval);
});
