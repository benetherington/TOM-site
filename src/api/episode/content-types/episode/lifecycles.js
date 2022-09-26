const updateDuration = require('./lifecycle/audio');
const updateColors = require('./lifecycle/image-group');

const updateContent = async (event) => {
    await updateDuration(event);
    await updateColors(event);
};

module.exports = {
    beforeCreate: updateContent,
    beforeUpdate: updateContent,
    // Not listening to create/updateMany. If a workflow involves these calls,
    // they'll need to be updated by hand.
};
