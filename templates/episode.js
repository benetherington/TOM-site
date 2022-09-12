let masonry;

const resizeAttachment = ({target}) => {
    const attachment = target.closest('.attachment');
    attachment.classList.toggle('expanded');
    masonry.layout();
};

const addEventListeners = () => {
    const attchs = document.querySelectorAll('.attachment');
    attchs.forEach((attch) => {
        attch.addEventListener('click', resizeAttachment);
    });
};

window.addEventListener('load', () => {
    masonry = new Masonry('#attachments', {
        itemSelector: '.attachment',
        columnWidth: '.aspect-tall',
        initLayout: false,
        percentPosition: true,
        gutter: 2,
        transitionDuration: 0,
    });
    addEventListeners();
    masonry.layout();
});
