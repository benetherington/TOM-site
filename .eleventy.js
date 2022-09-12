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
const headerImageStyle = (url) =>
    url ? `#header-banner {background-image: url(${url});}` : null;

// EXPORTS
module.exports = function (eleventyConfig) {
    // CSS, image Passthroughs
    eleventyConfig.addPassthroughCopy({'templates/stylesheets': 'stylesheets'});
    eleventyConfig.addPassthroughCopy({'templates/img': 'img'});
    eleventyConfig.addPassthroughCopy({'templates/icon': 'icon'});
    eleventyConfig.addPassthroughCopy({'templates/font': 'font'});

    // JS passthroughs
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

    // Filters
    eleventyConfig.addNunjucksFilter('fullTitle', fullTitle);
    eleventyConfig.addNunjucksFilter('wrapTitle', wrapTitle);
    eleventyConfig.addNunjucksFilter('formatNotes', formatNotes);
    eleventyConfig.addNunjucksFilter('shortDate', shortDate);
    eleventyConfig.addNunjucksFilter('headerImageStyle', headerImageStyle);

    // Options
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
    };
};
