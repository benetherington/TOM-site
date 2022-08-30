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

const paginationSlideLeft = () => {
    document.getElementById('nav-container').scrollLeft -= 400;
};
const paginationSlideRight = () => {
    document.getElementById('nav-container').scrollLeft += 400;
};

document.addEventListener('DOMContentLoaded', () => {
    setScrollProperties();
    window.addEventListener('scroll', setScrollOncePerFrame);
    document
        .querySelector('#page-bar .slide-left')
        .addEventListener('click', paginationSlideLeft);
    document
        .querySelector('#page-bar .slide-right')
        .addEventListener('click', paginationSlideRight);
    setTimeout(() => {
        document
            .querySelector('a[aria-current="page"]')
            .scrollIntoView({inline: 'center'});
    }, 0);
});
