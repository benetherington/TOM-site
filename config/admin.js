module.exports = ({env}) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
    },
    watchIgnoreFiles: [
        '**/templates/**',
        '**/public/**',
        '**/scripts/**',
        '**/config/sync/**',
    ],
});
