let masonry;

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
