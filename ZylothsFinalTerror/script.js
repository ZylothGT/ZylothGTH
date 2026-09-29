document.getElementById("year").textContent = new Date().getFullYear();

const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");


/* =========================
   AUDIO SAFETY
========================= */

if (!music) {
    console.error(
        "[Zyloths Final Terror] Audio element #backgroundMusic was not found."
    );
}


/* =========================
   CREATE ENTER SCREEN
========================= */

let enterScreen = document.getElementById("enterScreen");

if (!enterScreen) {

    enterScreen = document.createElement("div");
    enterScreen.id = "enterScreen";

    enterScreen.innerHTML = `
        <div class="enter-screen-content">
            <h1>Click To Enter</h1>
            <p>(To fix this enable audio autoplay)</p>
        </div>
    `;

    document.body.appendChild(enterScreen);
}


/* =========================
   ENTER SCREEN STYLE
========================= */

Object.assign(enterScreen.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "2147483647",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#08060d",
    cursor: "pointer",
    opacity: "1",
    visibility: "visible",
    pointerEvents: "auto"
});


/* =========================
   ENTER SCREEN TEXT STYLE
========================= */

const enterStyle = document.createElement("style");

enterStyle.textContent = `
    #enterScreen {
        box-sizing: border-box !important;
    }

    #enterScreen .enter-screen-content {
        text-align: center;
        user-select: none;
        font-family: Arial, sans-serif;
    }

    #enterScreen h1 {
        margin: 0 0 12px 0;
        color: white;
        font-size: clamp(40px, 7vw, 80px);
        font-weight: 900;
        letter-spacing: -3px;
        text-shadow: 0 0 30px rgba(255, 59, 59, 0.35);
    }

    #enterScreen p {
        margin: 0;
        color: #999999;
        font-size: 14px;
        font-weight: 500;
    }
`;

document.head.appendChild(enterStyle);


/* =========================
   AUDIO ANALYSER
========================= */

let audioContext = null;
let analyser = null;
let audioSource = null;
let frequencyData = null;

function setupAudioAnalyser() {

    if (!music) {
        return false;
    }

    if (audioContext) {
        return true;
    }

    try {

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();

        analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.75;

        frequencyData =
            new Uint8Array(analyser.frequencyBinCount);

        audioSource =
            audioContext.createMediaElementSource(music);

        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);

        return true;

    } catch (error) {

        console.error(
            "[Zyloths Final Terror] Audio analyser failed:",
            error
        );

        return false;
    }
}


/* =========================
   BASS DETECTION
========================= */

function getBassLevel() {

    if (!analyser || !frequencyData) {
        return 0;
    }

    analyser.getByteFrequencyData(frequencyData);

    let bass = 0;

    const bassRange = 12;

    for (let i = 0; i < bassRange; i++) {
        bass += frequencyData[i];
    }

    bass /= bassRange;

    return Math.pow(bass / 255, 1.4);
}


/* =========================
   BACKGROUND REACTION
========================= */

let bgX = 0;
let bgY = 0;
let bgRotation = 0;
let bgScale = 1;

function updateBackground(bass) {

    const maxShake = 13.5;
    const maxRotation = 0.7;

    const targetX =
        (Math.random() - 0.5) *
        maxShake *
        bass;

    const targetY =
        (Math.random() - 0.5) *
        maxShake *
        bass;

    const targetRotation =
        (Math.random() - 0.5) *
        maxRotation *
        bass;

    const targetScale =
        1 + bass * 0.025;

    bgX += (targetX - bgX) * 0.18;
    bgY += (targetY - bgY) * 0.18;

    bgRotation +=
        (targetRotation - bgRotation) * 0.18;

    bgScale +=
        (targetScale - bgScale) * 0.15;

    document.body.style.setProperty(
        "--bg-x",
        `${bgX}px`
    );

    document.body.style.setProperty(
        "--bg-y",
        `${bgY}px`
    );

    document.body.style.setProperty(
        "--bg-rotation",
        `${bgRotation}deg`
    );

    document.body.style.setProperty(
        "--bg-scale",
        bgScale
    );
}


/* =========================
   VISUALIZER
========================= */

function visualizerLoop() {

    requestAnimationFrame(visualizerLoop);

    if (!analyser) {
        return;
    }

    updateBackground(getBassLevel());
}

visualizerLoop();


/* =========================
   HIDE ENTER SCREEN
========================= */

function hideEnterScreen() {

    enterScreen.style.transition =
        "opacity 0.4s ease, visibility 0.4s ease";

    enterScreen.style.opacity = "0";
    enterScreen.style.visibility = "hidden";
    enterScreen.style.pointerEvents = "none";

    setTimeout(() => {
        enterScreen.style.display = "none";
    }, 400);
}


/* =========================
   CLICK TO ENTER
========================= */

enterScreen.addEventListener("click", async () => {

    /* Don't crash if audio is missing */

    if (!music) {

        console.error(
            "[Zyloths Final Terror] Cannot play music: #backgroundMusic is missing."
        );

        hideEnterScreen();

        return;
    }

    try {

        const analyserReady = setupAudioAnalyser();

        if (!analyserReady) {
            console.warn(
                "[Zyloths Final Terror] Audio analyser unavailable. Playing music normally."
            );
        }

        if (
            audioContext &&
            audioContext.state === "suspended"
        ) {
            await audioContext.resume();
        }

        music.muted = false;

        await music.play();

        if (musicToggle) {
            musicToggle.textContent = "🔊";
        }

        hideEnterScreen();

    } catch (error) {

        console.error(
            "[Zyloths Final Terror] Could not start music:",
            error
        );

    }

});


/* =========================
   VOLUME
========================= */

if (music) {
    music.volume = 1;
    music.muted = false;
}

if (volumeSlider) {

    volumeSlider.value = 100;

    volumeSlider.addEventListener("input", () => {

        if (!music) {
            return;
        }

        const volume =
            Number(volumeSlider.value) / 100;

        music.volume = volume;

        if (volume <= 0) {

            music.muted = true;

            if (musicToggle) {
                musicToggle.textContent = "🔇";
            }

        } else {

            music.muted = false;

            if (musicToggle) {
                musicToggle.textContent = "🔊";
            }

        }

    });

}


/* =========================
   MUTE BUTTON
========================= */

if (musicToggle) {

    musicToggle.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            if (!music) {

                console.error(
                    "[Zyloths Final Terror] Cannot mute/unmute: audio element is missing."
                );

                return;
            }

            try {

                setupAudioAnalyser();

                if (
                    audioContext &&
                    audioContext.state === "suspended"
                ) {
                    await audioContext.resume();
                }

            } catch (error) {

                console.error(
                    "[Zyloths Final Terror] Audio setup failed:",
                    error
                );

            }


            /* UNMUTE */

            if (music.muted) {

                music.muted = false;

                if (music.volume <= 0) {

                    music.volume = 1;

                    if (volumeSlider) {
                        volumeSlider.value = 100;
                    }

                }

                musicToggle.textContent = "🔊";

                if (music.paused) {

                    try {
                        await music.play();
                    } catch (error) {

                        console.error(
                            "[Zyloths Final Terror] Music failed:",
                            error
                        );

                    }

                }

                return;
            }


            /* MUTE */

            music.muted = true;

            musicToggle.textContent = "🔇";

        }
    );

}