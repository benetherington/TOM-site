module.exports = ({env}) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', 'ddbc42c9b9644f7d9c343bc098f5db58'),
    },
});
