module.exports = ({ env }) => ({
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: env('SENDGRID_API_KEY'),
        },
        settings: {
          defaultFrom: 'no-reply@IconEventNetwork.com',
          defaultReplyTo: 'no-reply@IconEventNetwork.com',
        }, 
      },
    },    
  });