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
    document
        .getElementById('attachments')
        .addEventListener('transitionend', () => masonry.layout());
};

window.addEventListener('load', () => {
    masonry = Masonry.data(document.getElementById('attachments'));
    addEventListeners();
    masonry.layout();
});
