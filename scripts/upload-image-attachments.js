const fetch = require('node-fetch');
const FormData = require('form-data');
const qs = require('qs');

require('dotenv').config();

// Configure API create episode requests
const baseUrl = 'http://127.0.0.1:1337';
const headers = {
    Authorization: `Bearer ${process.env.LOCAL_DEV_TOKEN}`,
    'Content-Type': 'application/json',
};

// Load data
const scrapedEpisodes = require('./square-episode-scrape.json');

const getEpisodeId = async (epNum) => {
    const query = qs.stringify({
        filters: {
            ep_num: {
                $eq: epNum,
            },
        },
        fields: ['id'],
    });
    const response = await fetch(`${baseUrl}/api/episodes?${query}`, {headers});
    const jsn = await response.json();

    if (jsn.data.length) return jsn.data[0].id;
};

const fetchImage = async (image, idx) => {
    const response = await fetch(image.url);
    if (!response.ok)
        return console.log(`${idx} SQ SP ERROR: ${response.statusText}`);

    let buffer;
    try {
        buffer = await response.buffer();
    } catch (error) {
        image.buffer = null;
        console.log(`${idx} BUFFER ERROR: ${error}`);
    }
    image.buffer = buffer;
};

const uploadImage = async (image, idx) => {
    // File uploads must be form-data
    const formData = new FormData();
    const data = {caption: image.caption};
    formData.append('data', JSON.stringify(data));

    const fileName = /(?<=\/)[^\/]*$/.exec(image.url)[0];
    formData.append('files.resource', image.buffer, fileName);

    // Create multipart header
    const headers = formData.getHeaders();
    headers.Authorization = `Bearer ${process.env.LOCAL_DEV_TOKEN}`;

    // Send request
    const response = await fetch(`${baseUrl}/api/attachments`, {
        method: 'POST',
        headers,
        body: formData,
    });

    // Check response
    if (!response.ok) {
        console.error(`${idx} UPLOAD SERVER ERROR: ${response.statusText}`);
    }
    const jsn = await response.json();
    if (jsn.error) {
        console.error(
            `${idx} UPLOAD ERROR: ${jsn.error.name} ${jsn.error.message}`,
        );
        if (!jsn.error.details?.errors) return;
        jsn.error.details.errors.forEach((detail) =>
            console.error(`${detail?.path}: ${detail?.message}`),
        );
    } else {
        return jsn.data.id;
    }
};

const associateImages = async (episodeId, imageIds) => {
    const body = JSON.stringify({
        data: {
            attachments: imageIds,
        },
    });
    const response = await fetch(`${baseUrl}/api/episodes/${episodeId}`, {
        headers,
        method: 'PUT',
        body,
    });

    // Check response
    if (!response.ok) {
        return console.error(
            `${idx} ASSOCIATE SERVER ERROR: ${response.statusText}`,
        );
    }

    const jsn = await response.json();
    if (jsn.error) {
        console.error(
            `${idx} ASSOCIATE ERROR: ${jsn.error.name} ${jsn.error.message}`,
        );
        if (!jsn.error.details.errors) return;
        jsn.error.details.errors.forEach((detail) =>
            console.error(`${detail.path}: ${detail.message}`),
        );
    } else {
        return jsn;
    }
};

const attachImages = async (episodeId, images) => {
    const imageIds = await Promise.all(images.map(uploadImage));
    return associateImages(episodeId, imageIds);
};

const uploadScrapedImages = async () => {
    for ([epNum, epProps] of Object.entries(scrapedEpisodes)) {
        // Extract images, skip if none
        const images = epProps.images;
        console.log(`\nEpisode ${epNum} has ${images.length} images`);
        if (!images.length) continue;

        // Fetch episode ID, continue if not found
        const episodeId = await getEpisodeId(epNum);
        console.log(`episodeId: ${episodeId}`);
        if (!episodeId) continue;

        // Download images
        await Promise.all(images.map(fetchImage));

        // Upload images
        await attachImages(episodeId, images);
    }
};

uploadScrapedImages();
