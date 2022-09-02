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

/*----------*\
  Pagination
\*----------*/
const paginationSlideLeft = () => {
    document.getElementById('pagination-container').scrollLeft -= 400;
};
const paginationSlideRight = () => {
    document.getElementById('pagination-container').scrollLeft += 400;
};
const setInitialPaginationSlider = () => {
    const currentPageLeft = document
        .querySelector('a[aria-current="page"]')
        .getClientRects()[0].left;
    const paginationContainer = document.getElementById('pagination-container');
    const paginationContainerLeft =
        paginationContainer.getClientRects()[0].left;
    const paginationContainerWidth =
        paginationContainer.getClientRects()[0].width;
    const scrollTo =
        (currentPageLeft -
            paginationContainerLeft -
            paginationContainerWidth / 2) *
        1.1;
    setTimeout(() => {
        paginationContainer.scrollTo({
            behavior: 'instant',
            left: scrollTo,
        });
    }, 20);
    setTimeout(() => {
        console.log(scrollTo);
        console.log(paginationContainer.scrollLeft);
    }, 40);
};
document.addEventListener('DOMContentLoaded', () => {
    document
        .querySelector('#pagination-bar .slide-left')
        .addEventListener('click', paginationSlideLeft);

    document
        .querySelector('#pagination-bar .slide-right')
        .addEventListener('click', paginationSlideRight);

    setInitialPaginationSlider();
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
