document.querySelectorAll('[data-action]').forEach((sector) => {
    sector.addEventListener('click', () => {
        window.carousel.executeAction(sector.dataset.action);
    });
});

document.querySelector('.center-dot').addEventListener('click', () => {
    window.carousel.hide();
});

function lockPointer() {
    if (!document.pointerLockElement) {
        document.body.requestPointerLock();
    }
}

document.addEventListener('mouseenter', lockPointer);

// Restart the entrance animation each time the background process shows the ring.
window.carousel.onRingShown(() => {
    const ring = document.querySelector('.ring-wrapper');
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
