const fetch = require('node-fetch');

const devToken =
    '23c7e1616d446f587c6f872e5d12edf192f47576ef88ab39afa590e2d8ee9c0d71769ffb16c3f964de63b48845fb30a3da6d8c8afad636109b612db4e1a589367ce44671afc32b1a9a297fa41b3fd7bb8ef69b0bfd3af0a7165df8124d5f61e52e88b55a59224a9dfcac204a5d4e1fc248b5223a7d64f4cd4f6874e8f7630508';
const headers = {
    Authorization: `Bearer ${devToken}`,
    'Content-Type': 'application/json',
};

const getAudioDuration = async (audioId) => {
    // Use the upload API to access the file before it is associated with the episode.
    const {host, port} = strapi.config;
    const infoResponse = await fetch(
        `http://${host}:${port}/api/upload/files/${audioId}`,
        {headers},
    );
    const audioInfo = await infoResponse.json();

    // Fetch audio file
    const fileResponse = await fetch(`http://${host}:${port}${audioInfo.url}`);
    const audioBuffer = await fileResponse.buffer();

    // Parse metadata
    const {parseBuffer} = await import('music-metadata');
    const parsed = await parseBuffer(audioBuffer);
    return Math.round(parsed.format.duration);
};

const updateDuration = async (event) => {
    const {data, where} = event.params;

    // Check that we have enough data to update this episode
    if (!where.id) return;

    // Check that there's audio, clear duration if not
    if (!data.audio) {
        data.audio_duration_sec = null;
        return;
    }

    // Edit episode data
    data.audio_duration_sec = await getAudioDuration(data.audio.id);
};

module.exports = {
    beforeCreate: updateDuration,
    beforeUpdate: updateDuration,
    // Not listening to create/updateMany. If a workflow involves these calls,
    // they'll need to be updated by hand.
};
