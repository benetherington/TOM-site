'use strict';

/**
 * `public` middleware.
 */

module.exports = (config, {strapi}) => {
    // Add your own logic here.
    strapi.server.router.get(
        'slug',
        '/:slug([a-z0-9]+(?:-[a-z0-9]+)*)',
        async (ctx) => {
            // Determine if this is a slug or episode number
            const {slug} = ctx.params;

            // Build filter to find this episode
            let filters;
            if (/^\d+$/.test(slug)) {
                filters = {ep_num: slug};
            } else {
                filters = {slug: slug};
            }

            // Fetch episode
            const episodes = await strapi.entityService.findMany(
                'api::episode.episode',
                {filters, limit: 1},
            );

            // Return the page
            ctx.body = episodes[0];
        },
    );
};
