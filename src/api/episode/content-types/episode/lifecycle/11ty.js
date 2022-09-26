const {spawn} = require('child_process');

module.exports = () => {
    strapi.log.info('Starting Eleventy build...');

    const eleventy = spawn('npx @11ty/eleventy', [], {
        shell: true,
        cwd: strapi.dirs.app.root,
        timeout: 60 * 1000,
    });

    eleventy.addListener('close', () =>
        strapi.log.info(`Eleventy exited with code ${eleventy.exitCode}`),
    );

    eleventy.addListener('error', (err) =>
        strapi.log.error(
            `Eleventy encountered an error: ${err}, and exited with code ${eleventy.exitCode}`,
        ),
    );
};
