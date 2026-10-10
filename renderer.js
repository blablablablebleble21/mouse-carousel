const ring = document.querySelector('.ring-wrapper');

document.addEventListener('click', (event) => {
    // Dismiss the ring when the transparent window is clicked outside it.
    if (!ring.contains(event.target)) {
        window.carousel.hide();
    }
});

document.querySelectorAll('[data-action]').forEach((sector) => {
    sector.addEventListener('click', () => {
        window.carousel.executeAction(sector.dataset.action);
    });
});

document.querySelector('.center-dot').addEventListener('click', () => {
    window.carousel.hide();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        window.carousel.hide();
    }
});

function lockPointer() {
    if (!document.pointerLockElement) {
        document.body.requestPointerLock();
    }
}

document.addEventListener('mouseenter', lockPointer);

// Restart the entrance animation each time the background process shows the ring.
window.carousel.onRingShown(() => {
    ring.classList.remove('is-visible');
    void ring.offsetWidth;
    ring.classList.add('is-visible');
    lockPointer();
});

window.carousel.onRingHidden(() => {
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
});
