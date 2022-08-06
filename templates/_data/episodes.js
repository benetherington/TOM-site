const fetch = require('node-fetch');

const baseUrl = 'http://localhost:1337';

module.exports = async () => {
    let page = 1;
    let doneFetching = false;
    const episodes = [];

    while (!doneFetching) {
        // Perform request
        const response = await fetch(
            `${baseUrl}/api/episodes?pagination[page]=${page}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            },
        );
        const jsn = await response.json();

        // Check response
        if (jsn.errors) {
            throw new Error({
                msg: 'Eleventy encountered an issue with CMS API.',
                errors: jsn.errors,
            });
        }

        // Store response
        episodes.push(...jsn.data);

        // Are we done?
        if (jsn.meta.pagination.pageCount < page) ++page;
        else doneFetching = true;
    }

    return episodes;
};
