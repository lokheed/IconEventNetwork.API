module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'strapi-provider-email-smtp',
      providerOptions: {
        host: 'smtp.mailtrap.io',
        port: 2525   , 
        secure: false,
        username: env('MAILTRAP_USER'),
        password: env('MAILTRAP_PASSWORD'),
        rejectUnauthorized: false,
        requireTLS: true,
        connectionTimeout: 10,
      },
      settings: {
        defaultFrom: 'no-reply@IconEventNetwork.com',
        defaultReplyTo: 'no-reply@IconEventNetwork.com',
      }, 
    },
  },    
});