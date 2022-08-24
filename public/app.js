let framePending;

const resizeLogos = () => {
    document.body.style = `--scroll-position: ${window.scrollY}px`;
    framePending = false;
};

const resizeOncePerFrame = () => {
    if (!framePending) {
        framePending = true;
        requestAnimationFrame(resizeLogos);
    } else {
        console.log('skipped');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    resizeLogos();
    document.addEventListener('scroll', resizeOncePerFrame);
});
