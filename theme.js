// DARK MODE RAJA GADAI
(function () {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    function applyTheme(theme) {
        document.body.classList.toggle(
            "dark-mode",
            theme === "dark"
        );

        if (themeIcon) {
            themeIcon.textContent =
                theme === "dark" ? "☀️" : "🌙";
        }
    }

    // Ambil tema terakhir yang digunakan
    const savedTheme = localStorage.getItem("rg-theme") || "light";
    applyTheme(savedTheme);

    // Aktifkan tombol jika tersedia di halaman
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const isDark =
                document.body.classList.contains("dark-mode");

            const newTheme = isDark ? "light" : "dark";

            localStorage.setItem("rg-theme", newTheme);
            applyTheme(newTheme);
        });
    }
})();