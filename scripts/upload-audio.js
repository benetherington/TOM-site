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

const getEpisodeAndAudioIds = async (epNum) => {
    const query = qs.stringify({
        filters: {
            ep_num: {
                $eq: epNum,
            },
        },
        fields: 'id',
        populate: {
            audio: {
                fields: 'id',
            },
        },
    });
    const response = await fetch(`${baseUrl}/api/episodes?${query}`, {headers});
    const jsn = await response.json();

    if (jsn.data.length === 0) return [];
    const episodeId = jsn.data[0].id;

    if (!jsn.data[0].attributes.audio.data) return [episodeId, null];
    const audioId = jsn.data[0].attributes.audio.data.id;
    return [episodeId, audioId];
};

const fetchAudio = async (audioUrl) => {
    const response = await fetch(audioUrl);
    if (!response.ok) return console.log(`SQ SP ERROR: ${response.statusText}`);

    try {
        const audioBuffer = await response.buffer();
        return audioBuffer;
    } catch (error) {
        console.log(`BUFFER ERROR: ${error}`);
    }
};

const uploadAudio = async (audioBuffer, episodeId) => {
    // File uploads must be form-data
    const formData = new FormData();
    formData.append('files', audioBuffer, 'audio.mp3');

    // Create multipart header
    const headers = formData.getHeaders();
    headers.Authorization = `Bearer ${process.env.LOCAL_DEV_TOKEN}`;

    // Send request
    const response = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    // Check response
    if (!response.ok) {
        console.error(
            `${episodeId}UPLOAD SERVER ERROR: ${response.statusText}`,
        );
    }
    let jsn;
    try {
        jsn = await response.json();
        return jsn[0].id;
    } catch (error) {
        console.error(`${episodeId} JSON parse error`);
        console.error(jsn);
        console.error(error);
    }
};

const associateAudio = async (episodeId, audioId) => {
    const body = JSON.stringify({
        data: {
            audio: audioId,
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
            `${episodeId}/${audioId} ASSOCIATE SERVER ERROR: ${response.statusText}`,
        );
    }

    const jsn = await response.json();
    if (jsn.error) {
        console.error(
            `${episodeId}/${audioId} ASSOCIATE ERROR: ${jsn.error.name} ${jsn.error.message}`,
        );
        if (!jsn.error.details.errors) return;
        jsn.error.details.errors.forEach((detail) =>
            console.error(`${detail.path}: ${detail.message}`),
        );
    } else {
        return jsn;
    }
};

const downloadAndUploadAudio = async (episode) => {
    console.log(`Starting Episode ${episode.epNum}, id ${episode.episodeId}`);
    // Skip if no audio
    const audioUrl = episode.audio_url;
    if (!audioUrl) {
        console.log(`No url for ${episode.epNum}`);
        return;
    }

    // Download audio
    const audioBuffer = await fetchAudio(audioUrl);
    if (!audioBuffer) return;
    console.log(`Episode ${episode.epNum} download complete`);

    // Upload audio
    const audioId = await uploadAudio(audioBuffer);
    if (!audioId) return;
    console.log(`Episode ${episode.epNum} upload complete`);

    // Associate audio
    await associateAudio(episode.episodeId, audioId);
};

const uploadScrapedImages = async () => {
    const episodePromises = Object.entries(scrapedEpisodes).map(
        async ([epNum, epProps]) => {
            // Fetch episode ID, check for audio
            const ids = await getEpisodeAndAudioIds(epNum);
            const [episodeId, audioId] = ids;

            epProps.epNum = epNum;
            epProps.episodeId = episodeId;
            epProps.audioId = audioId;
            return epProps;
        },
    );
    let episodes = await Promise.all(episodePromises);
    console.log(`Starting with ${episodes.length} episodes.`);
    episodes = episodes.filter((e) => e.episodeId && !e.audioId);
    console.log(`Filtered to ${episodes.length} episodes.`);

    const chunkSize = 10;
    const numChunks = Math.ceil(episodes.length / chunkSize);
    console.log(`${numChunks} chunks...`);

    for (idx = 0; idx <= numChunks; idx++) {
        const chunkStart = idx * chunkSize;
        const chunkEnd = idx * chunkSize + chunkSize;
        console.log(`\nStarting chunk ${idx}`);

        const chunk = episodes.slice(chunkStart, chunkEnd);
        const chunkPromises = chunk.map(downloadAndUploadAudio);
        const chunkResults = await Promise.allSettled(chunkPromises);
        const chunkErrors = chunkResults.filter((p) => p.status === 'rejected');
        chunkErrors.forEach((p) => console.error(p.reason));
    }
};

uploadScrapedImages().then(() => {
    console.log('byeeee');
});
