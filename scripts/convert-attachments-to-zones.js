const fetch = require('node-fetch');
const FormData = require('form-data');
const qs = require('qs');

const scrapedEpisodes = require('./square-episode-scrape.json');

// Configure API create episode requests
const baseUrl = 'http://localhost:1337';
const devToken =
    '23c7e1616d446f587c6f872e5d12edf192f47576ef88ab39afa590e2d8ee9c0d71769ffb16c3f964de63b48845fb30a3da6d8c8afad636109b612db4e1a589367ce44671afc32b1a9a297fa41b3fd7bb8ef69b0bfd3af0a7165df8124d5f61e52e88b55a59224a9dfcac204a5d4e1fc248b5223a7d64f4cd4f6874e8f7630508';
const headers = {
    Authorization: `Bearer ${devToken}`,
    'Content-Type': 'application/json',
};

async function* fetchPopulatedEpisodes() {
    let page = 0;
    let pageCount = 1;

    while (page <= pageCount) {
        // Make request
        const query = qs.stringify({
            populate: {
                images: {
                    populate: '*',
                },
                attachments: {
                    populate: '*',
                },
            },
            pagination: {page},
        });
        const response = await fetch(`${baseUrl}/api/episodes?${query}`, {
            headers,
        });
        const jsn = await response.json();

        // Update pagination information
        pageCount = jsn.meta.pagination.pageCount;
        page += 1;

        console.log(
            `page ${jsn.meta.pagination.page}/${jsn.meta.pagination.pageCount}`,
        );

        yield* jsn.data;
    }
}

const associateImages = async (episode, zones) => {
    const body = JSON.stringify({
        data: {images: zones},
    });
    const response = await fetch(`${baseUrl}/api/episodes/${episode.id}`, {
        headers,
        method: 'PUT',
        body,
    });

    // Check response
    if (!response.ok) {
        console.error(
            `${episode.id} ASSOCIATE SERVER ERROR: ${response.statusText}`,
        );
    }

    const jsn = await response.json();
    if (jsn.error) {
        console.error(
            `${episode.id} ASSOCIATE ERROR: ${jsn.error.name} ${jsn.error.message}`,
        );
        if (!jsn.error.details.errors) return;
        jsn.error.details.errors.forEach((detail) =>
            console.error(`${detail.path}: ${detail.message}`),
        );
    } else return jsn;
};

const convertToZone = (attachment) => {
    const resourceId = attachment.attributes.resource.data[0].id;
    const caption = attachment.attributes.caption;
    const attribution = attachment.attributes.attribution;
    const colors = attachment.attributes.colors;

    return {
        __component: 'image.image-group',
        caption,
        attribution,
        colors,
        resource: {
            id: resourceId,
        },
    };
};

const transferEpisode = async (episode) => {
    const attachments = episode.attributes.attachments.data;
    if (attachments.length === 0) return;

    const zones = attachments.map(convertToZone);
    const updatedEpisode = await associateImages(episode, zones);
    if (updatedEpisode) console.log(`${episode.id} ok`);
};

const transferAttachmentsToZones = async () => {
    for await (episode of fetchPopulatedEpisodes()) transferEpisode(episode);
};

transferAttachmentsToZones();
