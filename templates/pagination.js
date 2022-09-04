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
