const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

// FILTERS
const fullTitle = (attributes) =>
    `Episode ${attributes.ep_num}: ${attributes.title}`;
const formatNotes = (attributes) => md.render(attributes.show_notes);

// EXPORTS
module.exports = function (eleventyConfig) {
    // Passthroughs
    eleventyConfig.addPassthroughCopy({'templates/stylesheets': 'stylesheets'});
    eleventyConfig.addPassthroughCopy({'templates/img': 'img'});

    // Filters
    eleventyConfig.addNunjucksFilter('fullTitle', fullTitle);
    eleventyConfig.addNunjucksFilter('formatNotes', formatNotes);

    // Pptions
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
    };
};
