// Automatically update the copyright year
document.getElementById("year").textContent = new Date().getFullYear();


// Add a small fade-in effect when elements enter the screen
const elements = document.querySelectorAll(
    ".card, .link-card, .section"
);

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.1
    }
);

elements.forEach((element) => {
    observer.observe(element);
});


// =========================
// MUSIC
// =========================

const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");

// Start at 100% volume
music.volume = 1;
volumeSlider.value = 100;


// Change volume
volumeSlider.addEventListener("input", function () {
    const volume = Number(this.value) / 100;

    music.volume = volume;

    if (volume === 0) {
        music.muted = true;
        musicToggle.textContent = "🔇";
    } else {
        music.muted = false;
        musicToggle.textContent = "🔊";
    }
});


// Mute / unmute
musicToggle.addEventListener("click", function () {
    music.muted = !music.muted;

    musicToggle.textContent = music.muted ? "🔇" : "🔊";

    // Start music when button is clicked
    if (music.paused) {
        music.play().catch(() => { });
    }
});


// Start music after the first interaction
document.addEventListener("click", function startMusic() {
    music.play().catch(() => { });
}, { once: true });
