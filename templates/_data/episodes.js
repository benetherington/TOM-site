const fetch = require('node-fetch');
const qs = require('qs');

/*--------------------------------------------------------------------*\
A typical API response.json().data looks like:
[
    {
        id: 123,
        attributes: {
            title, slug, show_notes, etc...
            topics: [],
            attachments: {
                data: [{
                        id: 123,
                        attributes: {
                            caption, attribution,
                            resource: {
                                data: {
                                    id: 123,
                                    attributes: {
                                        name, alternativeText, caption,
                                        width: 879,
                                        height: 485,
                                        url: '/uploads/axiom_segment_879x485_43aa1eb362.jpg',
                                        previewUrl: null,
                                        provider: 'local',
                                        formats: {
                                            medium: {width, height, url},
                                            small: {width, height, url},
                                            thumbnail: {width, height, url},
                                        },
                                    }
                                }
                            }
                        }
                }, ...]
            },
        },
    },
]

A typical return value from this function looks like:
[
    {
        id:123, ep_num: 123,
        publishedAt, title, slug, description, show_notes,
        audio: {},
        topics: [],
        attachments: [
            {
                id: 123,
                caption, attribution,
                full: {url, width, height},
                medium: {url, width, height},
                small: {url, width, height},
                thumbnail: {url, width, height},
            },
        ],
    }
]
\*--------------------------------------------------------------------*/

const baseUrl = 'http://localhost:1337';

const query = (page) =>
    qs.stringify(
        {
            fields: '*',
            populate: {
                attachments: {
                    populate: {
                        caption: true,
                        attribution: true,
                        resource: '*',
                    },
                },
            },
            sort: ['ep_num:desc'],
            pagination: {page},
            publicationState: 'live',
        },
        {encodeValuesOnly: true}, // prettify URL
    );

const formatAttachment = ({id, attributes}) => {
    const {caption, attribution} = attributes;
    const resource = attributes.resource.data[0].attributes;
    const full = {
        url: resource.url,
        width: resource.width,
        height: resource.height,
    };
    const aspectRatio =
        Math.trunc((resource.width / resource.height) * 100) / 100;
    const attachment = {id, caption, attribution, full, aspectRatio};

    if (resource.formats) {
        const formats = Object.entries(resource.formats);
        formats.forEach(([name, attrs]) => {
            attachment[name] = {
                url: attrs.url,
                width: attrs.width,
                height: attrs.height,
            };
        });
    }

    return attachment;
};

const formatEpisode = ({id, attributes}) => {
    const {ep_num, publishedAt, title, slug, description, show_notes} =
        attributes;
    const audio = {};
    const topics = [];
    const attachments = attributes.attachments.data.map(formatAttachment);
    return {
        id,
        ep_num,
        publishedAt,
        title,
        slug,
        description,
        show_notes,
        audio,
        topics,
        attachments,
    };
};

module.exports = async () => {
    let page = 1;
    let doneFetching = false;
    const episodes = [];

    while (!doneFetching) {
        // Build and send request
        const response = await fetch(`${baseUrl}/api/episodes?${query(page)}`);
        const jsn = await response.json();

        // Check response
        if (jsn.errors) {
            throw new Error({
                msg: 'Eleventy encountered an issue with CMS API.',
                errors: jsn.errors,
            });
        }

        // Format response
        const formattedEpisodes = jsn.data.map(formatEpisode);

        // Store response
        episodes.push(...formattedEpisodes);

        // Are we done?
        if (jsn.meta.pagination.pageCount > page) ++page;
        else doneFetching = true;
    }

    return episodes;
};
