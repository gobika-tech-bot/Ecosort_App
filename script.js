// App State Management
const state = {
    isLoggedIn: false,
    totalPoints: 0,
    currentWasteType: null,
    currentWeight: 0,
    firebaseUrl: "https://ecosort-ai-b72fb-default-rtdb.firebaseio.com/scans.json"
};

// Fixed Weights
const possibleWeights = [120, 170, 220, 250, 300];

// Feedback Quotes
const quotes = [
    "“Small action. Big impact. Keep going! 💚”",
    "“Every correct sort counts towards a cleaner tomorrow. ✨”",
    "“Smart sorting, smarter future! 🤖🌍”",
    "“EcoSort AI says: Perfectly sorted! The Earth approves. 🌍✅”",
    "“Mission accomplished! Waste successfully sorted.”",
    "“You didn’t just sort waste — you sorted the future! 🚀♻️”"
];

// Badges
const getBadge = (points) => {
    if (points < 20) return { title: "Beginner", icon: "🌱", desc: "Start your eco journey!" };
    if (points < 50) return { title: "Eco Saver", icon: "♻️", desc: "Great job saving the planet!" };
    if (points < 100) return { title: "Green Hero", icon: "🌍", desc: "You are making a massive impact!" };
    return { title: "Eco Champion", icon: "🏆", desc: "Top tier environmentalist!" };
};

// Smooth Navigation Scroll Helper
const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// Screen Navigation
const showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
};

// Login Logic
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    
    if (password === "123456" || password.trim() !== "") {
        state.isLoggedIn = true;
        errorMsg.textContent = "";
        showScreen('scan-screen');
    } else {
        errorMsg.textContent = "Invalid password. Try again.";
    }
});

// QR Scan Logic
document.getElementById('btn-scan').addEventListener('click', () => {
    const scanner = document.querySelector('.scanner-container');
    const btn = document.getElementById('btn-scan');
    const successMsg = document.getElementById('scan-success-msg');
    
    successMsg.classList.add('hidden');
    scanner.classList.add('scanning');
    btn.disabled = true;
    btn.textContent = "Scanning...";

    setTimeout(() => {
        scanner.classList.remove('scanning');
        successMsg.classList.remove('hidden');
        btn.textContent = "Continue";
        
        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = "Scan QR";
            successMsg.classList.add('hidden');
            showScreen('type-screen');
        }, 1200);
    }, 1800);
});

// Waste Type Logic
document.querySelectorAll('.waste-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.waste-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        state.currentWasteType = card.dataset.type;
        
        setTimeout(() => {
            card.classList.remove('selected');
            startWeightMeasurement();
        }, 500);
    });
});

// Weight Measurement Logic
const startWeightMeasurement = () => {
    showScreen('weight-screen');
    const loader = document.getElementById('measuring-loader');
    const result = document.getElementById('weight-result');
    const valueEl = document.getElementById('weight-value');
    
    loader.classList.remove('hidden');
    result.classList.add('hidden');
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * possibleWeights.length);
        state.currentWeight = possibleWeights[randomIndex];
        
        valueEl.textContent = state.currentWeight;
        
        loader.classList.add('hidden');
        result.classList.remove('hidden');
        
        setTimeout(() => {
            startSorting();
        }, 1800);
        
    }, 1200);
};

// Sorting Logic
const startSorting = () => {
    showScreen('sorting-screen');
    const status = document.getElementById('sorting-status');
    const success = document.getElementById('sorting-success');
    const animation = document.querySelector('.sorting-animation');
    
    status.classList.remove('hidden');
    success.classList.add('hidden');
    animation.style.display = 'flex';
    
    setTimeout(() => {
        status.classList.add('hidden');
        success.classList.remove('hidden');
        animation.style.display = 'none';
        
        logToFirebase();
        
        setTimeout(() => {
            showPoints();
            animation.style.display = 'flex';
            status.classList.remove('hidden');
            success.classList.add('hidden');
        }, 1400);
        
    }, 2000);
};

// Points Logic
const showPoints = () => {
    showScreen('points-screen');
    state.totalPoints += 10;
    
    document.getElementById('total-points').textContent = state.totalPoints;
    
    const progress = Math.min((state.totalPoints / 100) * 100, 100);
    document.getElementById('points-progress').style.width = progress + '%';
};

document.getElementById('btn-next-badge').addEventListener('click', () => {
    showBadge();
});

// Badge Logic
const showBadge = () => {
    showScreen('badge-screen');
    const badge = getBadge(state.totalPoints);
    
    document.getElementById('badge-icon').textContent = badge.icon;
    document.getElementById('badge-title').textContent = badge.title;
    document.getElementById('badge-desc').textContent = badge.desc;
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('random-quote').textContent = randomQuote;
};

document.getElementById('btn-sort-another').addEventListener('click', () => {
    showScreen('scan-screen');
});

// Firebase Logging
const logToFirebase = async () => {
    try {
        const payload = {
            timestamp: new Date().toISOString(),
            wasteType: state.currentWasteType,
            weightGrams: state.currentWeight,
            pointsAwarded: 10,
            totalPoints: state.totalPoints + 10,
            user: "Eco User"
        };
        
        fetch(state.firebaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Firebase error:', err));
    } catch (e) {
        console.error("Error preparing firebase log", e);
    }
};

// Interactive Public QR Generator Logic
const generatePublicQR = () => {
    const inputUrl = document.getElementById('public-url-input').value.trim();
    if (!inputUrl) return;
    
    const qrImg = document.getElementById('generated-qr-img');
    const downloadBtn = document.getElementById('download-qr-btn');
    
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(inputUrl)}`;
    const highResQrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(inputUrl)}`;
    
    qrImg.src = qrApiUrl;
    downloadBtn.href = highResQrApiUrl;
};

document.getElementById('btn-generate-qr').addEventListener('click', generatePublicQR);
document.getElementById('public-url-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generatePublicQR();
});
