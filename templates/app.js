let framePending;

const setScrollProperties = () => {
    document.body.style.setProperty(
        '--scroll-position-num',
        window.scrollY / (window.innerHeight / 100),
    );
    framePending = false;
};

const setScrollOncePerFrame = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(setScrollProperties);
};

document.addEventListener('DOMContentLoaded', () => {
    setScrollProperties();
    window.addEventListener('scroll', setScrollOncePerFrame);
});
