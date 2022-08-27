module.exports = ({ env }) => ({
    email: {
      provider: 'mailtrap',
      providerOptions: {
        user: env('MAILTRAP_USER'),
        password: env('MAILTRAP_PASSWORD')
      },
      settings: {
        defaultFrom: env('MAILTRAP_DEFAULT_FROM'),
        defaultReplyTo: env('MAILTRAP_DEFAULT_REPLY_TO'),
      },
    } 
  });