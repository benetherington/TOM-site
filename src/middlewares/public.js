const koaStatic = require('koa-static');

const notesDir = 'show-notes';

module.exports = (config, {strapi}) => {
    const serve = koaStatic(notesDir);

    // SLUG
    strapi.server.router.get(
        'slug',
        '/:slug((?!admin)[a-z]+(?:-[a-z0-9]+)*)',
        async (ctx, next) => {
            const {slug} = ctx.params;

            // Store original path, set "real" path
            const oldPath = ctx.path;
            const newPath = '/show-notes/' + slug;
            ctx.path = newPath;

            // Let Koa serve real file, let other middlwares do their thing
            await serve(ctx, async () => {
                ctx.path = oldPath;
                await next();
                ctx.path = newPath;
            });
        },
    );

    // EPISODE NUMBER
    strapi.server.router.get(
        'ep_num',
        '/:ep_num([0-9]{1,4})',
        async (ctx, next) => {
            const {ep_num} = ctx.params;

            // Look up slug
            const episodes = await strapi.entityService.findMany(
                'api::episode.episode',
                {filters: {ep_num}, fields: 'slug'},
            );
            if (!episodes.length) {
                return ctx.redirect('/');
            }
            const episode = episodes[0];

            // Redirect to slug
            const newPath = '/show-notes/' + episode.slug;
            ctx.redirect(newPath);
        },
    );
};
