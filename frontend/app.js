// API বেস URL
const API_URL = 'http://localhost:5000/api/auth';

// টোকেন লোকাল স্টোরেজে সংরক্ষণ করুন
let token = localStorage.getItem('token');

// পৃষ্ঠা লোড হওয়ার সময়
window.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
        loadUserProfile();
    } else {
        showLoginForm();
    }
});

// ফর্ম টগল করুন
function toggleForms() {
    document.getElementById('login-form').classList.toggle('active');
    document.getElementById('register-form').classList.toggle('active');
    clearMessages();
}

// লগইন হ্যান্ডলার
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // টোকেন সংরক্ষণ করুন
            token = data.token;
            localStorage.setItem('token', token);
            
            showMessage(messageDiv, 'লগইন সফল! ড্যাশবোর্ডে যাচ্ছি...', 'success');
            
            setTimeout(() => {
                showDashboard();
                loadUserProfile();
                document.getElementById('login-form').reset();
            }, 1500);
        } else {
            showMessage(messageDiv, data.message || 'লগইন ব্যর্থ হয়েছে', 'error');
        }
    } catch (error) {
        console.error('লগইন এরর:', error);
        showMessage(messageDiv, 'সার্ভার সংযোগ ব্যর্থ। নিশ্চিত করুন ব্যাকএন্ড চলছে।', 'error');
    }
}

// রেজিস্টার হ্যান্ডলার
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const messageDiv = document.getElementById('register-message');

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // টোকেন সংরক্ষণ করুন
            token = data.token;
            localStorage.setItem('token', token);
            
            showMessage(messageDiv, 'রেজিস্ট্রেশন সফল! ড্যাশবোর্ডে যাচ্ছি...', 'success');
            
            setTimeout(() => {
                showDashboard();
                loadUserProfile();
                document.getElementById('register-form').reset();
            }, 1500);
        } else {
            const errorMsg = data.message || (data.errors && data.errors[0]?.msg) || 'রেজিস্ট্রেশন ব্যর্থ';
            showMessage(messageDiv, errorMsg, 'error');
        }
    } catch (error) {
        console.error('রেজিস্টার এরর:', error);
        showMessage(messageDiv, 'সার্ভার সংযোগ ব্যর্থ। নিশ্চিত করুন ব্যাকএন্ড চলছে।', 'error');
    }
}

// ব্যবহারকারী প্রোফাইল লোড করুন
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            const userInfo = document.getElementById('user-info');
            const user = data.user;
            const joinDate = new Date(user.createdAt).toLocaleDateString('bn-BD');
            
            userInfo.innerHTML = `
                <p><strong>নাম:</strong> ${user.name}</p>
                <p><strong>ইমেইল:</strong> ${user.email}</p>
                <p><strong>অ্যাকাউন্ট তৈরি:</strong> ${joinDate}</p>
                <p><strong>স্ট্যাটাস:</strong> <span style="color: green;">✅ সক্রিয়</span></p>
            `;
        }
    } catch (error) {
        console.error('প্রোফাইল লোড এরর:', error);
    }
}

// লগআউট হ্যান্ডলার
async function handleLogout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            // টোকেন মুছে দিন
            token = null;
            localStorage.removeItem('token');
            
            alert('আপনি সফলভাবে লগআউট হয়েছেন।');
            showLoginForm();
        }
    } catch (error) {
        console.error('লগআউট এরর:', error);
        // জোরপূর্বক লগআউট করুন
        token = null;
        localStorage.removeItem('token');
        showLoginForm();
    }
}

// ড্যাশবোর্ড দেখান
function showDashboard() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
}

// লগইন ফর্ম দেখান
function showLoginForm() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('dashboard').classList.remove('active');
}

// মেসেজ দেখান
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
}

// সকল মেসেজ পরিষ্কার করুন
function clearMessages() {
    document.getElementById('login-message').className = 'message';
    document.getElementById('register-message').className = 'message';
}
