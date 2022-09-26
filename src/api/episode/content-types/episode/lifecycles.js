const updateDuration = require('./lifecycle/audio');
const updateColors = require('./lifecycle/image-group');
const doEleventyBuild = require('./lifecycle/11ty');

const configRefreshEleventy = process.env.auto_refresh_11ty === 'true';

const updateContent = async (event) => {
    await updateDuration(event);
    await updateColors(event);

    if (configRefreshEleventy) {
        doEleventyBuild();
    }
};

module.exports = {
    beforeCreate: updateContent,
    beforeUpdate: updateContent,
    // Not listening to create/updateMany. If a workflow involves these calls,
    // they'll need to be updated by hand.
};
