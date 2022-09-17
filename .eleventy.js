/*-------*\
  FILTERS
\*-------*/
// Episode attributes
const fullTitle = (attributes) =>
    `Episode ${attributes.ep_num}: ${attributes.title}`;
const wrapTitle = (attributes) =>
    `Episode ${attributes.ep_num}:<br>${attributes.title}`;
const headerImageStyle = (url) =>
    url ? `#header-banner {background-image: url(${url});}` : null;

// Date formats
const shortDate = (date) =>
    new Date(date).toLocaleDateString('default', {dateStyle: 'long'});
const rfcDate = (date) => new Date(date).toUTCString();

// Base URL for absolute links
const isProd = process.env.ELEVENTY_SERVERLESS;
const baseUrl = isProd
    ? 'https://www.theorbitalmechanics.com/'
    : 'http://localhost:8080/';

// Episode pages are nested in show-notes for tidy organization, but the routing
// from /slug to /show-notes/slug only works on Strapi's server. To allow
// Eleventy to serve files (with its nice auto-reload feature), we'll generate
// the real path while in dev, and the pretty path while in prod. Two filters
// required, as only episode pages are affected.
const absoluteSlug = (slug) => {
    const path = isProd ? slug : `/show-notes/${slug}`;
    return new URL(path, baseUrl).href;
};
const absolutePath = (path) => new URL(path, baseUrl).href;

/*---------*\
  RENDERERS
\*---------*/
// MD for episode pages
const websiteMarkdown = new require('markdown-it')();
const formatNotes = (attributes) =>
    websiteMarkdown.render(attributes.show_notes);

// Simplified MD for RSS feed
const rssMarkdown = new require('markdown-it')('zero').enable([
    'link',
    'paragraph',
    'list',
]);
const formatRssNotes = (show_notes) =>
    rssMarkdown.render(show_notes).replace(/\n/g, '');

// CONFIGURE ELEVENTY
module.exports = function (eleventyConfig) {
    // Plugins

    eleventyConfig.addPlugin(require('@11ty/eleventy-plugin-rss'));
    // TODO: when 11ty 2.0 is out, switch to this plugin instead of baseUrl!
    // eleventyConfig.addPlugin(require('@11ty/eleventy').EleventyHtmlBasePlugin);

    // Passthroughs
    eleventyConfig.addPassthroughCopy({'templates/stylesheets': 'stylesheets'});
    eleventyConfig.addPassthroughCopy({'templates/img': 'img'});
    eleventyConfig.addPassthroughCopy({'templates/icon': 'icon'});
    eleventyConfig.addPassthroughCopy({'templates/font': 'font'});
    eleventyConfig.addPassthroughCopy({'templates/js': 'js'});

    // Data
    eleventyConfig.addGlobalData('builtAt', () => new Date().toUTCString());

    // Filters
    eleventyConfig.addNunjucksFilter('fullTitle', fullTitle);
    eleventyConfig.addNunjucksFilter('wrapTitle', wrapTitle);
    eleventyConfig.addNunjucksFilter('formatNotes', formatNotes);
    eleventyConfig.addNunjucksFilter('formatRssNotes', formatRssNotes);
    eleventyConfig.addNunjucksFilter('shortDate', shortDate);
    eleventyConfig.addNunjucksFilter('rfcDate', rfcDate);
    eleventyConfig.addNunjucksFilter('headerImageStyle', headerImageStyle);
    eleventyConfig.addNunjucksFilter('absoluteSlug', absoluteSlug);
    eleventyConfig.addNunjucksFilter('absolutePath', absolutePath);

    // Options
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
        baseUrl,
    };
};
