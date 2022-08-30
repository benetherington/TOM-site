const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// FILTERS
const fullTitle = (attributes) =>
    `Episode ${attributes.ep_num}: ${attributes.title}`;
const wrapTitle = (attributes) =>
    `Episode ${attributes.ep_num}:<br>${attributes.title}`;
const formatNotes = (attributes) => md.render(attributes.show_notes);
const shortDate = (date) =>
    new Date(date).toLocaleDateString('default', {dateStyle: 'long'});

// EXPORTS
module.exports = function (eleventyConfig) {
    // Passthroughs
    eleventyConfig.addPassthroughCopy({'templates/stylesheets': 'stylesheets'});
    eleventyConfig.addPassthroughCopy({'templates/img': 'img'});
    eleventyConfig.addPassthroughCopy({'templates/icon': 'icon'});
    eleventyConfig.addPassthroughCopy({'templates/font': 'font'});
    eleventyConfig.addPassthroughCopy({'templates/app.js': 'app.js'});

    // Filters
    eleventyConfig.addNunjucksFilter('fullTitle', fullTitle);
    eleventyConfig.addNunjucksFilter('wrapTitle', wrapTitle);
    eleventyConfig.addNunjucksFilter('formatNotes', formatNotes);
    eleventyConfig.addNunjucksFilter('shortDate', shortDate);

    // Pptions
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
    };
};
