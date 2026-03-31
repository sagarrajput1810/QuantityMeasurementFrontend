// Constants
const API_BASE_URL = 'http://localhost:5139/api/v1'; // Matches launchSettings.json http profile

const UNITS = {
    length: ['INCH', 'FEET', 'YARD', 'CM'],
    weight: ['GRAM', 'KG', 'TONNE'],
    volume: ['ML', 'LITER', 'GALLON'],
    temperature: ['CELSIUS', 'FAHRENHEIT']
};

// DOM Elements
const categorySelect = document.getElementById('category');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const inputValue = document.getElementById('input-value');
const resultText = document.getElementById('result-text');

const sections = {
    home: document.getElementById('section-home'),
    login: document.getElementById('section-login'),
    signup: document.getElementById('section-signup'),
    history: document.getElementById('section-history')
};

const navLinks = {
    home: document.getElementById('nav-home'),
    login: document.getElementById('nav-login'),
    signup: document.getElementById('nav-signup'),
    history: document.getElementById('nav-history'),
    logout: document.getElementById('nav-logout')
};

const authElements = {
    historyLi: document.getElementById('li-history'),
    loginLi: document.getElementById('li-login'),
    signupLi: document.getElementById('li-signup'),
    logoutLi: document.getElementById('li-logout')
};

// State Management
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateUnits();
    updateAuthUI();
    setupEventListeners();
});

function setupEventListeners() {
    // Category Change
    categorySelect.addEventListener('change', updateUnits);

    // Input/Select change for auto-conversion
    [inputValue, fromUnitSelect, toUnitSelect].forEach(el => {
        el.addEventListener('input', debounce(performConversion, 500));
    });

    // Navigation
    Object.keys(navLinks).forEach(key => {
        if (navLinks[key]) {
            navLinks[key].addEventListener('click', (e) => {
                e.preventDefault();
                if (key === 'logout') {
                    handleLogout();
                } else {
                    showSection(key);
                }
            });
        }
    });

    // Forms
    document.getElementById('form-login').addEventListener('submit', handleLogin);
    document.getElementById('form-signup').addEventListener('submit', handleSignup);
}

// UI Functions
function updateUnits() {
    const category = categorySelect.value;
    const units = UNITS[category];
    
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    units.forEach(unit => {
        const opt1 = document.createElement('option');
        opt1.value = unit;
        opt1.textContent = unit;
        fromUnitSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = unit;
        opt2.textContent = unit;
        toUnitSelect.appendChild(opt2);
    });

    // Set default different units if possible
    if (units.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }
    
    performConversion();
}

function showSection(sectionId) {
    // Hide all sections
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });

    // Show selected section
    if (sections[sectionId]) {
        sections[sectionId].classList.remove('hidden');
    }

    // Update active nav link
    Object.values(navLinks).forEach(link => {
        if (link) link.classList.remove('active');
    });
    if (navLinks[sectionId]) {
        navLinks[sectionId].classList.add('active');
    }

    // Special case for history: load data
    if (sectionId === 'history') {
        loadHistory();
    }
}

function updateAuthUI() {
    if (currentUser && currentUser.token) {
        authElements.historyLi.classList.remove('hidden');
        authElements.logoutLi.classList.remove('hidden');
        authElements.loginLi.classList.add('hidden');
        authElements.signupLi.classList.add('hidden');
    } else {
        authElements.historyLi.classList.add('hidden');
        authElements.logoutLi.classList.add('hidden');
        authElements.loginLi.classList.remove('hidden');
        authElements.signupLi.classList.remove('hidden');
    }
}

// Business Logic / AJAX Calls
async function performConversion() {
    const value = parseFloat(inputValue.value);
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;

    if (isNaN(value)) {
        resultText.textContent = 'Please enter a valid number';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/measurements/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Value: value,
                FromUnit: fromUnit,
                ToUnit: toUnit
            })
        });

        const data = await response.json();

        if (response.ok) {
            resultText.textContent = `${data.OriginalValue} ${data.OriginalUnit} = ${data.ConvertedValue} ${data.ConvertedUnit}`;
        } else {
            resultText.textContent = data.message || 'Error in conversion';
        }
    } catch (error) {
        console.error('Conversion Error:', error);
        resultText.textContent = 'Service unavailable. Is the backend running?';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data;
            localStorage.setItem('user', JSON.stringify(data));
            updateAuthUI();
            showSection('home');
            alert('Logged in successfully!');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const userName = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Signup successful! Please login.');
            showSection('login');
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

async function loadHistory() {
    if (!currentUser || !currentUser.token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/measurements/history`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });

        if (response.ok) {
            const history = await response.json();
            const historyBody = document.getElementById('history-body');
            historyBody.innerHTML = '';

            history.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.originalValue}</td>
                        <td>${item.originalUnit}</td>
                        <td>${item.convertedValue}</td>
                        <td>${item.convertedUnit}</td>
                        <td>${new Date(item.timestamp).toLocaleString()}</td>
                    </tr>
                `;
                historyBody.insertAdjacentHTML('beforeend', row);
            });
        } else if (response.status === 401) {
            handleLogout();
        }
    } catch (error) {
        console.error('History load error:', error);
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateAuthUI();
    showSection('home');
}

// Utility: Debounce to prevent too many API calls while typing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
