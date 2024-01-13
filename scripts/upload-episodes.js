// const fetch = require('node-fetch');
const TurndownService = require('turndown');

require('dotenv').config();

// Init HTML to markdown engine
const turndown = new TurndownService();

// Configure API create episode requests
const baseUrl = 'http://127.0.0.1:1337';
const url = new URL(baseUrl);
url.pathname = '/api/episodes';
const method = 'POST';
const headers = {
    Authorization: `Bearer ${process.env.LOCAL_DEV_TOKEN}`,
    'Content-type': 'application/json',
};

// Load episode data
const scrapedEpisodes = require('./square-episode-scrape.json');

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
                    ep_num: parseInt(epNum),
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
        jsn.error.details?.errors?.forEach((detail) =>
            console.log(`${detail.path}: ${detail.message}`),
        );
        console.log('\n');
    }
};

uploadScraped();
