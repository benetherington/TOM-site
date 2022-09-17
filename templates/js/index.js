const addClickEvents = () => {
    document.querySelectorAll('.episode-card').forEach((el) => {
        const href = el.dataset.href;
        el.addEventListener('click', () => window.open(href));
    });
};

document.addEventListener('DOMContentLoaded', addClickEvents);
