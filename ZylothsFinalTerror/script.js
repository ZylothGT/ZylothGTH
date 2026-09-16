document.getElementById("year").textContent = new Date().getFullYear();

const elements = document.querySelectorAll(".card, .link-card, .section");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.1 });

elements.forEach((element) => observer.observe(element));

const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");

music.volume = 0;
volumeSlider.value = 0;

let audioContext = null;
let analyser = null;
let audioSource = null;
let frequencyData = null;

function setupAudioAnalyser() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;

    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    audioSource = audioContext.createMediaElementSource(music);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
}

function getBassLevel() {
    if (!analyser) return 0;

    analyser.getByteFrequencyData(frequencyData);

    let bass = 0;
    const bassRange = 12;

    for (let i = 0; i < bassRange; i++) {
        bass += frequencyData[i];
    }

    bass /= bassRange;

    return Math.pow(bass / 255, 1.4);
}

let bgX = 0;
let bgY = 0;
let bgRotation = 0;
let bgScale = 1;

function updateBackground(bass) {
    const maxShake = 13.5;
    const maxRotation = 0.7;

    const targetX = (Math.random() - 0.5) * maxShake * bass;
    const targetY = (Math.random() - 0.5) * maxShake * bass;
    const targetRotation = (Math.random() - 0.5) * maxRotation * bass;
    const targetScale = 1 + bass * 0.025;

    bgX += (targetX - bgX) * 0.18;
    bgY += (targetY - bgY) * 0.18;
    bgRotation += (targetRotation - bgRotation) * 0.18;
    bgScale += (targetScale - bgScale) * 0.15;

    document.body.style.setProperty("--bg-x", `${bgX}px`);
    document.body.style.setProperty("--bg-y", `${bgY}px`);
    document.body.style.setProperty("--bg-rotation", `${bgRotation}deg`);
    document.body.style.setProperty("--bg-scale", bgScale);
}

function visualizerLoop() {
    requestAnimationFrame(visualizerLoop);

    if (!analyser) return;

    updateBackground(getBassLevel());
}

visualizerLoop();

async function playMusic() {
    try {
        setupAudioAnalyser();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        await music.play();

        return true;
    } catch (error) {
        console.error("Music failed to play:", error);
        return false;
    }
}

window.addEventListener("load", async () => {
    music.muted = true;

    const started = await playMusic();

    if (!started) {
        const startOnInteraction = async () => {
            await playMusic();

            document.removeEventListener("click", startOnInteraction);
            document.removeEventListener("touchstart", startOnInteraction);
        };

        document.addEventListener("click", startOnInteraction);
        document.addEventListener("touchstart", startOnInteraction);
    }
});

volumeSlider.addEventListener("input", function () {
    const volume = Number(this.value) / 100;

    music.volume = volume;

    if (volume === 0) {
        music.muted = true;
        musicToggle.textContent = "🔇";
    } else {
        music.muted = false;
        musicToggle.textContent = "🔊";

        if (music.paused) {
            playMusic();
        }
    }
});

musicToggle.addEventListener("click", async function (event) {
    event.stopPropagation();

    setupAudioAnalyser();

    if (audioContext.state === "suspended") {
        await audioContext.resume();
    }

    if (music.muted) {
        music.muted = false;
        musicToggle.textContent = "🔊";

        if (music.paused) {
            await music.play();
        }
    } else {
        music.muted = true;
        musicToggle.textContent = "🔇";
    }
});