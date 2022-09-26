const fetch = require('node-fetch');
const qs = require('qs');

/*--------------------------------------------------------------------*\
A typical API response.json().data looks like:
[
    {
        id: 123,
        attributes: {
            title, slug, show_notes, etc...
            audio: {
                name: 'audio.mp3',
                alternativeText: null,
                caption: null,
                width: null,
                height: null,
                formats: null,
                hash: 'audio_23f30d2d41',
                ext: '.mp3',
                mime: 'audio/mpeg',
                size: 72036.17,
                url: '/uploads/audio_23f30d2d41.mp3',
                previewUrl: null,
                provider: 'local',
                provider_metadata: null,
                createdAt: '2022-09-14T14:09:51.139Z',
                updatedAt: '2022-09-14T14:09:51.139Z'
            },
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
        publishedAt, title, slug, description, show_notes, audio_duration_sec
        audio: {
            mime: 'audio/mpeg',
            size: 72036.17,
            url: '/uploads/audio_23f30d2d41.mp3',
},
        topics: [],
        attachments: [
            {
                id: 123,
                caption, attribution, index, colors,
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
                images: {
                    populate: {resource: '*'},
                },
                audio: {
                    populate: '*',
                },
            },
            sort: ['ep_num:desc'],
            pagination: {page},
            publicationState: 'live',
        },
        {encodeValuesOnly: true}, // prettify URL
    );

const formatImageGroup = (imageGroup) => {
    const {id, caption, attribution, colors} = imageGroup;
    const resource = imageGroup.resource.data.attributes;
    const full = {
        url: resource.url,
        width: resource.width,
        height: resource.height,
    };
    const aspectRatio =
        Math.trunc((resource.width / resource.height) * 100) / 100;
    const image = {
        id,
        caption,
        attribution,
        colors,
        full,
        aspectRatio,
    };

    if (resource.formats) {
        const formats = Object.entries(resource.formats);
        formats.forEach(([name, attrs]) => {
            image[name] = {
                url: attrs.url,
                width: attrs.width,
                height: attrs.height,
            };
        });
    }

    return image;
};

const formatAudio = (audio) => {
    if (!audio || !audio.data) return;
    return {
        mime: audio.data.attributes.mime,
        size: audio.data.attributes.size,
        url: audio.data.attributes.url,
    };
};

const formatEpisode = ({id, attributes}) => {
    const {
        ep_num,
        publishedAt,
        title,
        slug,
        description,
        show_notes,
        audio_duration_sec,
    } = attributes;

    // Return null if this episode has incomplete data
    const complete = [
        ep_num,
        publishedAt,
        title,
        slug,
        description,
        show_notes,
        audio_duration_sec,
        attributes.audio,
    ].every((e) => e);
    if (!complete) return;

    const audio = formatAudio(attributes.audio);
    const topics = [];
    const attachments = attributes.images
        ? attributes.images.map(formatImageGroup)
        : [];
    return {
        id,
        ep_num,
        publishedAt,
        title,
        slug,
        description,
        show_notes,
        audio_duration_sec,
        audio,
        topics,
        attachments,
    };
};

module.exports = async () => {
    let page = 1;
    let pageCount = 2;
    const episodes = [];

    while (page <= pageCount) {
        // Build and send request
        const response = await fetch(`${baseUrl}/api/episodes?${query(page)}`);
        const jsn = await response.json();

        // Check response
        if (jsn.errors) {
            throw new Error({
                msg: 'Eleventy encountered an issue with Strapi API.',
                errors: jsn.errors,
            });
        }

        // Yield formatted episodes, discard those that fail spec
        const formattedEpisodes = jsn.data.map(formatEpisode);
        const filteredEpisodes = formattedEpisodes.filter((ep) => ep);
        episodes.push(...filteredEpisodes);

        // Update pagination
        page += 1;
        pageCount = jsn.meta.pagination.pageCount;
    }
    return episodes;
};
