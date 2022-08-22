const fetch = require('node-fetch');
const qs = require('qs');

/*--------------------------------------------------------------------*\
                        SINGLE EPISODE PAGES
Despite the file name, this data set fetches and returns ALL episodes.
It is used to generate each individual episode page.
\*--------------------------------------------------------------------*/

const baseUrl = 'http://localhost:1337';

module.exports = async () => {
    let page = 1;
    let doneFetching = false;
    const episodes = [];

    while (!doneFetching) {
        // Build and send request
        const query = qs.stringify(
            {
                sort: ['ep_num:desc'],
                pagination: {
                    page,
                },
                publicationState: 'live',
            },
            {encodeValuesOnly: true}, // prettify URL
        );
        const response = await fetch(`${baseUrl}/api/episodes?${query}`, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
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
