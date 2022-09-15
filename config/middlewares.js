module.exports = [
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::session',
    'strapi::favicon',

    // Routing: only overwrite some routes
    'global::public',
    'strapi::public',

    // Overwrite upload limits
    {
        name: 'strapi::body',
        config: {
            formLimit: '256mb',
            jsonLimit: '256mb',
            textLimit: '256mb',
            formidable: {
                maxFileSize: 250 * 1024 * 1024, // Multipart data, via koa-body (256mb in bytes)
                maxFieldsSize: 250 * 1024 * 1024, // Limit of all fields total
            },
        },
    },
];
