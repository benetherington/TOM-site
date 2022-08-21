const fetch = require('node-fetch');
const TurndownService = require('turndown');
const scrapedEpisodes = require('./square-episode-scrape.json');

// Init HTML to markdown engine
const turndown = new TurndownService();

// Configure API create episode requests
const baseUrl = 'http://localhost:1337';
const url = new URL(baseUrl);
url.pathname = '/api/episodes';
const method = 'POST';
const devToken =
    '23c7e1616d446f587c6f872e5d12edf192f47576ef88ab39afa590e2d8ee9c0d71769ffb16c3f964de63b48845fb30a3da6d8c8afad636109b612db4e1a589367ce44671afc32b1a9a297fa41b3fd7bb8ef69b0bfd3af0a7165df8124d5f61e52e88b55a59224a9dfcac204a5d4e1fc248b5223a7d64f4cd4f6874e8f7630508';
const headers = {
    Authorization: `Bearer ${devToken}`,
    'Content-type': 'application/json',
};

const uploadScraped = async () => {
    for ([epNum, epProps] of Object.entries(scrapedEpisodes)) {
        console.log(epNum);
        // Convert HTML to markdown
        const notes = turndown.turndown(epProps.notes);

        // Build and send request
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify({
                data: {
                    ep_num: epNum,
                    title: epProps.title,
                    slug: epProps.slug,
                    description: epProps.description,
                    show_notes: notes,
                },
            }),
        });
        if (response.ok) continue;

        const jsn = await response.json();
        console.log(`ERROR: ${jsn.error.name} ${jsn.error.message}`);
        jsn.error.details.errors.forEach((detail) =>
            console.log(`${detail.path}: ${detail.message}`),
        );
    }
};

uploadScraped();
