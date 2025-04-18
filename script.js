  function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                document.getElementById("location").innerText = "Geolocation tidak didukung.";
            }
        }

        function showPosition(position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            getCityName(lat, lon);
            getIftarTime(lat, lon);
        }

        function showError(error) {
            document.getElementById("location").innerText = "Gagal mendapatkan lokasi.";
        }

        async function getCityName(lat, lon) {
            try {
                let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                let data = await response.json();
                let city = data.address.city || data.address.town || data.address.village || "Lokasi tidak diketahui";
                document.getElementById("location").innerText = `📍 ${city}`;
            } catch (error) {
                document.getElementById("location").innerText = "Gagal mendapatkan nama lokasi.";
            }
        }

        async function getIftarTime(lat, lon) {
            try {
                let response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
                if (!response.ok) {
                    throw new Error("Gagal mengambil data dari API");
                }
                let data = await response.json();
                let maghribTime = data.data.timings.Maghrib;

                document.getElementById("iftar-time").innerText = `🌙 Waktu Berbuka: ${maghribTime}`;
                startCountdown(maghribTime);
            } catch (error) {
                document.getElementById("iftar-time").innerText = "Gagal mengambil waktu iftar.";
            }
        }

        function startCountdown(iftarTime) {
            function updateCountdown() {
                let now = new Date();
                let [hours, minutes] = iftarTime.split(":").map(Number);
                let iftar = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

                let diff = iftar - now;

                if (diff <= 0) {
                    document.getElementById("countdown").innerText = "🍽️ Waktunya berbuka!";
                    return;
                }

                let h = Math.floor(diff / 3600000);
                let m = Math.floor((diff % 3600000) / 60000);
                let s = Math.floor((diff % 60000) / 1000);

                document.getElementById("countdown").innerText = `${h} jam ${m} menit ${s} detik`;
            }

            updateCountdown();
            setInterval(updateCountdown, 1000);
        }

        function toggleMode() {
            let body = document.body;
            let button = document.querySelector(".toggle-btn");

            if (body.classList.contains("dark")) {
                body.classList.remove("dark");
                body.classList.add("light");
                button.innerText = "🌙 Ganti Mode";
            } else {
                body.classList.remove("light");
                body.classList.add("dark");
                button.innerText = "🌞 Ganti Mode";
            }

            localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
        }

        // Atur tema sesuai preferensi sistem atau localStorage
        function setInitialTheme() {
            let savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                document.body.classList.add(savedTheme);
            } else {
                document.body.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
            }
        }

        setInitialTheme();
        getLocation();
