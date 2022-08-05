module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/:slug([a-z0-9]+(?:-[a-z0-9]+)*)',
            handler: 'slug.get',
        },
    ],
};
