// script.js

// --- 1. SETUP LENIS (SMOOTH SCROLL) ---
// Ini membuat website terasa "berat" dan premium saat discroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// --- 2. SETUP ANIMASI GSAP ---
gsap.registerPlugin(ScrollTrigger);

// Animasi Hero Parallax (Background bergerak lambat)
gsap.to(".parallax-bg", {
    scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    },
    yPercent: 30, // Background turun 30% saat discroll
    scale: 1.1
});

// Animasi Elemen Muncul (Reveal)
const revealElements = document.querySelectorAll(".reveal-type");
revealElements.forEach(element => {
    gsap.fromTo(element, 
        { y: 50, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1, ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Mulai animasi saat elemen masuk layar
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Animasi Teks Hero saat Loading
gsap.from(".anim-text", {
    y: 30, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out"
});


// --- 3. LOGIKA NAVBAR ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// --- 4. SETUP PETA BERWARNA ---
const map = L.map('map').setView([-7.942493, 112.953012], 10); // Default Bromo

// Menggunakan Peta Berwarna (Voyager)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
}).addTo(map);

// Tambah Marker
L.marker([-7.942493, 112.953012]).addTo(map).bindPopup("<b>Gunung Bromo</b><br>Jalur Penanjakan.").openPopup();


// --- 5. LOGIKA CUACA ---
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // API Demo
const weatherResult = document.getElementById('weatherResult');
const errorMsg = document.getElementById('errorMsg');
const loading = document.getElementById('loading');

function getLocation() {
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    weatherResult.classList.add('hidden');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'coords'),
            err => showError("Gagal mendeteksi lokasi. Pastikan GPS aktif.")
        );
    } else {
        showError("Browser tidak mendukung Geolocation.");
    }
}

function getWeatherByCity() {
    const city = document.getElementById('cityInput').value;
    if(!city) return;
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    weatherResult.classList.add('hidden');
    fetchWeather(city, null, 'city');
}

async function fetchWeather(p1, p2, type) {
    let url = type === 'coords' 
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${p1}&lon=${p2}&appid=${API_KEY}&units=metric&lang=id`
        : `https://api.openweathermap.org/data/2.5/weather?q=${p1}&appid=${API_KEY}&units=metric&lang=id`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200) throw new Error("Lokasi tidak ditemukan");

        document.getElementById('wTemp').innerText = Math.round(data.main.temp) + "°C";
        document.getElementById('wDesc').innerText = data.weather[0].description;
        document.getElementById('wCity').innerText = data.name;
        document.getElementById('wWind').innerText = data.wind.speed + " m/s";
        document.getElementById('wHum').innerText = data.main.humidity + "%";
        document.getElementById('wIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        loading.classList.add('hidden');
        weatherResult.classList.remove('hidden');
    } catch (err) {
        showError(err.message);
    }
}

function showError(msg) {
    loading.classList.add('hidden');
    errorMsg.classList.remove('hidden');
    errorMsg.innerText = msg;
}
