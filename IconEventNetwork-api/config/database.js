const path = require('path');

module.exports = ({ env }) => {
  if (env('NODE_ENV') === 'development') {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', env('DATABASE_FILENAME')),
        },
        useNullAsDefault: true,
      },
    }
  } else if (env('NODE_ENV') === 'qa' || env('NODE_ENV') === 'stg' || env('NODE_ENV') === 'production') {
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST'),
          port: env.int('DATABASE_PORT'),
          database: env('DATABASE_NAME'),
          user: env('DATABASE_USERNAME'),
          password: env('DATABASE_PASSWORD'),
        },
        useNullAsDefault: true,
      },
    }
  } else  {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    }
  }
};