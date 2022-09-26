const colorThief = require('../../../../../../scripts/color-thief');
const path = require('path');

const brightness = (rgb) => rgb[0] + rgb[1] + rgb[2];
const sortByBrightness = (a, b) => brightness(b) - brightness(a);

const getColors = async (url) => {
    // Get image colors
    const filePath = path.join(process.cwd(), 'public', url);
    const colors = await colorThief.getPalette(filePath);

    // Analyze image as a whole
    const imageTotal = colors
        .map(brightness)
        .reduce((prev, curr) => prev + curr, 0);
    const imageBrightness = imageTotal / colors.length;

    // Take two primary colors, brightest first
    const primaryColors = colors.slice(0, 2).sort(sortByBrightness);

    // Swap primary colors if image is bright
    if (imageBrightness > (255 * 3) / 2) {
        primaryColors.reverse();
    }
    return primaryColors;
};

const updateColors = async (image) => {
    const imageGroup = await strapi.entityService.findOne(
        'image.image-group',
        image.id,
        {populate: {resource: true}},
    );
    const colors = await getColors(imageGroup.resource.url);
    await strapi.entityService.update('image.image-group', image.id, {
        data: {colors},
    });
};

module.exports = async (event) => {
    if (!event.params.data.images) return;
    event.params.data.images.forEach(updateColors);
};

// ID 969
// __component image.image-group
// tableName: episodes_components
