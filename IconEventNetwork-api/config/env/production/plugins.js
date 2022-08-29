module.exports = ({ env }) => ({
    email: {
      config: {
        provider: 'strapi-provider-email-smtp',
        providerOptions: {
          host: 'smtp.office365.com',
          port: 587   , 
          secure: false,
          username: env('SMTP_USER'),
          password: env('SMTP_PASSWORD'),
          rejectUnauthorized: false,
          requireTLS: true,
          connectionTimeout: 10,
        },
      },
      settings: {
        defaultFrom: 'no-reply@IconEventNetwork.com',
        defaultReplyTo: 'no-reply@IconEventNetwork.com',
      }, 
    },    
  });