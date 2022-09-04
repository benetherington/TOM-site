/*--------------*\
  Logo scrolling
\*--------------*/
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

/*--------------*\
  Mobile sidebar
\*--------------*/
const showSidebar = () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
};
document.addEventListener('DOMContentLoaded', () => {
    // Menu hamburger
    document.getElementById('hamburger').addEventListener('click', showSidebar);
});
