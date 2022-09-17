/*-------------*\
  Initial State
\*-------------*/
let paginationSlider, sliderWidth;
const setInitialPaginationSlider = () => {
    // Find position of highlighted page
    const currentPage = document.querySelector('a[aria-current="page"]');
    const currentPageLeft = currentPage.getBoundingClientRect().left;
    const currentPageWidth = currentPage.getBoundingClientRect().width;

    // Find position, size of pagination slider
    const sliderLeft = paginationSlider.getBoundingClientRect().left;
    sliderWidth = paginationSlider.getBoundingClientRect().width;

    // Calculate scroll position to center highlighted page
    const scrollTo =
        currentPageLeft + currentPageWidth / 2 - sliderLeft - sliderWidth / 2;

    // Scroll after a short delay
    paginationSlider.scrollTo({
        left: scrollTo,
        behavior: 'instant',
    });
};

/*-------*\
  Buttons
\*-------*/
const paginationSlideLeft = () =>
    paginationSlider.scrollBy({left: -400, behavior: 'smooth'});
const paginationSlideRight = () =>
    paginationSlider.scrollBy({left: 400, behavior: 'smooth'});
const setScrollButtonState = () => {
    const scrollPosition = paginationSlider.scrollLeft;
    const maxScroll = Math.floor(paginationSlider.scrollWidth - sliderWidth);
    if (scrollPosition === 0) {
        leftButton.classList.add('disabled');
        rightButton.classList.remove('disabled');
    } else if (scrollPosition >= maxScroll) {
        rightButton.classList.add('disabled');
        leftButton.classList.remove('disabled');
    } else {
        leftButton.classList.remove('disabled');
        rightButton.classList.remove('disabled');
    }
};

/*--------------*\
  Click-and-Drag
\*--------------*/
let prevX, clickState;
const onPointerMove = (e) => {
    // If no button, clear drag event
    if (!e.buttons) {
        prevX = null;
        clickState = null;
        return;
    }

    // Make it a little easier to click page buttons
    if (!clickState) {
        clickState = 'wait';
        setTimeout(() => {
            clickState = 'ready';
        }, 50);
        return;
    } else if (clickState === 'wait') {
        return;
    }

    // Capture event, pointer
    e.stopPropagation();
    paginationSlider.setPointerCapture(e.pointerId);

    // Scroll element
    if (prevX === null) {
        // Start a scroll
        prevX = e.x;
    } else {
        // Do a scroll
        const left = prevX - e.x;
        prevX = e.x;
        paginationSlider.scrollBy({left, behavior: 'instant'});
    }
};

let leftButton, rightButton;
document.addEventListener('DOMContentLoaded', () => {
    paginationSlider = document.getElementById('pagination-slider');

    // Button actions
    leftButton = document.querySelector('#pagination-bar .slide-left');
    rightButton = document.querySelector('#pagination-bar .slide-right');
    leftButton.addEventListener('click', paginationSlideLeft);
    rightButton.addEventListener('click', paginationSlideRight);
    // Button appearance
    paginationSlider.addEventListener('scroll', setScrollButtonState);
    // Center current page
    if (document.readyState === 'complete') {
        setInitialPaginationSlider();
    } else {
        window.addEventListener('load', setInitialPaginationSlider);
    }

    // Click-drag
    document
        .getElementById('pagination-bar')
        .addEventListener('pointermove', onPointerMove);
});
