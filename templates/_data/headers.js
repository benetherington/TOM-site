const fs = require('fs');

const imgFileNames = Array.from(fs.readdirSync('./templates/img'));
const fileNames = imgFileNames.filter((fn) => fn.startsWith('header--'));
const urls = fileNames.map((fn) => `/img/${fn}`);
const randomHeaders = urls.sort(() => {
    return 0.5 - Math.random();
});

module.exports = {
    randomHeaders,
};
