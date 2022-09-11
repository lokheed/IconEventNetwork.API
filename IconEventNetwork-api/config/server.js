module.exports = ({ env }) => ({
  host: env('HOST'),
  port: env.int('PORT'),
  url: env('URL'),
  proxy: true,
  app: {
    keys: env.array('APP_KEYS'),
  },
});
