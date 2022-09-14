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
const isDev = process.env.ELEVENTY_ENV === 'development';
const baseUrl = isDev
    ? `localhost:8080`
    : `https://www.theorbitalmechanics.com/`;
const absoluteSlug = (slug) => new URL(`/show-notes/${slug}`, baseUrl).href;
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
    eleventyConfig.addPassthroughCopy({'templates/app.js': 'app.js'});
    eleventyConfig.addPassthroughCopy({
        'templates/pagination.js': 'pagination.js',
    });
    eleventyConfig.addPassthroughCopy({
        'templates/masonry.pkgd.min.js': 'masonry.pkgd.min.js',
    });
    eleventyConfig.addPassthroughCopy({
        'templates/episode.js': 'episode.js',
    });

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

    eleventyConfig.ignores.add('templates/episode.njk');
    eleventyConfig.ignores.add('templates/index.njk');

    // Options
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
        baseUrl,
    };
};
