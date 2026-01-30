// script.js

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. INISIALISASI SMOOTH SCROLL (LENIS) ---
    // Konfigurasi untuk perasaan 'berat' dan mewah saat menggulir
    const lenis = new Lenis({
        duration: 1.2, // Durasi animasi gulir (detik)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Fungsi pelonggaran fisika
        direction: 'vertical',
        smooth: true,
        smoothTouch: false, // Matikan di sentuh untuk UX mobile native yang lebih baik
    });

    // Menghubungkan Lenis ke siklus rendering browser
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrasi Penting: Sinkronisasi Lenis dengan GSAP ScrollTrigger
    // Tanpa ini, animasi scroll trigger akan 'lag' atau tidak sinkron
    gsap.registerPlugin(ScrollTrigger);
    
    
    // --- 2. ANIMASI PARALLAX (GSAP) ---
    // Membuat garis waktu (timeline) untuk hero section
    const heroTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true // Animasi mengikuti posisi scrollbar (bukan durasi waktu)
        }
    });

    // Gunung (Latar Tengah) bergerak lebih lambat dari scroll (efek jauh)
    heroTimeline.to("#mountains", {
        yPercent: 30, // Turun 30%
        ease: "none"
    }, 0);

    // Langit (Latar Belakang) bergerak sangat lambat
    heroTimeline.to("#sky", {
        yPercent: 15,
        ease: "none"
    }, 0);

    // Teks Hero memudar dan bergerak naik lebih cepat
    heroTimeline.to(".hero-content", {
        yPercent: -50,
        opacity: 0,
        ease: "none"
    }, 0);

    // Hutan Depan (Foreground) bisa diperbesar sedikit untuk efek masuk
    heroTimeline.to("#forest", {
        scale: 1.1,
        yPercent: 10,
        ease: "none"
    }, 0);


    // --- 3. ANIMASI TEKS REVEAL ---
    // Menganimasi elemen saat muncul di viewport (viewport entry)
    const revealElements = document.querySelectorAll(".reveal-type");
    revealElements.forEach(element => {
        gsap.fromTo(element, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%", // Mulai animasi saat elemen 80% dari atas viewport
                    toggleActions: "play none none reverse"
                }
            }
        );
    });


    // --- 4. INTEGRASI PETA (LEAFLET.JS) ---
    // Koordinat default: Gunung Rinjani, Lombok
    const defaultLat = -8.4113;
    const defaultLng = 116.4573;
    
    const map = L.map('trekking-map').setView([defaultLat, defaultLng], 13);

    // Menggunakan tile OpenStreetMap (Gratis)
    // Opsi lain yang bagus untuk alam: 'Stamen Terrain' atau 'Esri WorldImagery'
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Menambahkan Marker Kustom
    const marker = L.marker([defaultLat, defaultLng]).addTo(map)
       .bindPopup('<b>Basecamp Rinjani</b><br>Titik awal pendakian.')
       .openPopup();

    // Menambahkan lingkaran area kemah
    L.circle([defaultLat - 0.005, defaultLng + 0.005], {
        color: '#d8ba8c',
        fillColor: '#d8ba8c',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);


    // --- 5. WIDGET CUACA (OPENWEATHERMAP API) ---
    const apiKey = 'GANTI_DENGAN_API_KEY_ANDA'; // Dapatkan gratis di openweathermap.org
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value;
        if(city) fetchWeather(city);
    });

    async function fetchWeather(city) {
        // Tampilkan loader, sembunyikan data lama
        document.querySelector('.loader').classList.remove('hidden');
        document.querySelector('.weather-data').classList.add('hidden');

        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=id`);
            
            if (!response.ok) throw new Error('Kota tidak ditemukan');
            
            const data = await response.json();
            
            // Update UI dengan data
            document.getElementById('temp-display').textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById('desc-display').textContent = data.weather.description;
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
            
            // Icon dinamis dari API
            const iconCode = data.weather.icon;
            document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            // Tampilkan hasil
            document.querySelector('.weather-data').classList.remove('hidden');
        } catch (error) {
            alert(error.message);
        } finally {
            document.querySelector('.loader').classList.add('hidden');
        }
    }
});
