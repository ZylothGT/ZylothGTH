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
