const colorThief = require('../../../../../scripts/color-thief');
const path = require('path');

const devToken =
    '23c7e1616d446f587c6f872e5d12edf192f47576ef88ab39afa590e2d8ee9c0d71769ffb16c3f964de63b48845fb30a3da6d8c8afad636109b612db4e1a589367ce44671afc32b1a9a297fa41b3fd7bb8ef69b0bfd3af0a7165df8124d5f61e52e88b55a59224a9dfcac204a5d4e1fc248b5223a7d64f4cd4f6874e8f7630508';
const headers = {
    Authorization: `Bearer ${devToken}`,
    'Content-Type': 'application/json',
};

/*-----------*\
  COLOR UTILS
\*-----------*/
const brightness = (rgb) => rgb[0] + rgb[1] + rgb[2];
const sortByBrightness = (a, b) => brightness(b) - brightness(a);

/*--------*\
  CALLBACK
\*--------*/
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

const updateColors = async (event) => {
    const resourceUrl = event.params.data.resource[0].url;
    const colors = await getColors(resourceUrl);
    event.params.data.colors = JSON.stringify(colors);
};

module.exports = {
    beforeCreate: updateColors,
    beforeUpdate: updateColors,
};
