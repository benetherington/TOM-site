const fetch = require('node-fetch');

const headers = {
    Authorization: `Bearer ${process.env.api_token_full_access}`,
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

module.exports = async (event) => {
    // Check that we have enough data to update this episode
    if (!event.params.where.id) return;

    // Check that there's audio, clear duration if not
    if (!event.params.data.audio) {
        event.params.data.audio_duration_sec = null;
        return;
    }

    // Edit episode data
    event.params.data.audio_duration_sec = await getAudioDuration(
        event.params.data.audio,
    );
};
