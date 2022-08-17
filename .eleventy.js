module.exports = function (eleventyConfig) {
    // Passthroughs
    eleventyConfig.addPassthroughCopy({'templates/stylesheets': 'stylesheets'});
    eleventyConfig.addPassthroughCopy({'templates/img': 'img'});

    // Pptions
    return {
        dir: {
            input: 'templates',
            output: 'public',
        },
    };
};
