const fetch = require('node-fetch');
const FormData = require('form-data');
const qs = require('qs');

// Configure API create episode requests
const baseUrl = 'http://localhost:1337';
const devToken =
    '23c7e1616d446f587c6f872e5d12edf192f47576ef88ab39afa590e2d8ee9c0d71769ffb16c3f964de63b48845fb30a3da6d8c8afad636109b612db4e1a589367ce44671afc32b1a9a297fa41b3fd7bb8ef69b0bfd3af0a7165df8124d5f61e52e88b55a59224a9dfcac204a5d4e1fc248b5223a7d64f4cd4f6874e8f7630508';
const headers = {
    Authorization: `Bearer ${devToken}`,
    'Content-Type': 'application/json',
};

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
    headers.Authorization = `Bearer ${devToken}`;

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
    const scrapedEpisodes = require('./square-episode-scrape.json');

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
        await Promise.allSettled(chunkPromises);
    }
};

uploadScrapedImages().then(() => {
    console.log('byeeee');
});
