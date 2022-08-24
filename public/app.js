let framePending = false;
let headerLogo, sidebarLogo;

const resizeLogos = () => {
    document.body.style = `--banner-scroll-adjustment: ${window.scrollY}px`;
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
    document.addEventListener('scroll', resizeOncePerFrame);
});
