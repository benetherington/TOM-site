const headers = [
    {
        full: {
            url: '/img/header--cygnus_iss.jpg',
        },
        textStyle: 'light-text',
    },
    {
        full: {
            url: '/img/header--jwst_first_deep_field.png',
        },
        textStyle: 'light-text',
    },
    {
        full: {
            url: '/img/header--sls_flower.jpg',
        },
        textStyle: 'dark-text',
    },
];

const randomHeaders = headers.sort(() => {
    return 0.5 - Math.random();
});

module.exports = {
    randomHeaders,
};
