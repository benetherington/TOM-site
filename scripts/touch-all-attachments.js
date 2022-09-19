attachments = await strapi.entityService.findMany(
    'api::attachment.attachment',
    {populate: {resource: true}},
);
('');

attachments.forEach(async (attch) => {
    attachment = {
        resource: [
            {
                id: attch.resource[0].id,
                url: attch.resource[0].url,
            },
        ],
    };

    await strapi.entityService.update('api::attachment.attachment', attch.id, {
        data: attachment,
    });
});
