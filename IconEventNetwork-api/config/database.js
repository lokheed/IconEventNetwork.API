const path = require('path');

module.exports = ({ env }) => {
  if (env('NODE_ENV') === "development") {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
        },
        useNullAsDefault: true,
      },
    }
  } else if (env('NODE_ENV') === "qa") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", "qa1.c0b69ruyoyby.us-east-1.rds.amazonaws.com"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "qa-strapi"),
          user: env("DATABASE_USERNAME", "qa-strapi"),
          password: env("DATABASE_PASSWORD", "QemI$06$0k2q"),
        },
        useNullAsDefault: true,
      },
    }
  } else if (env('NODE_ENV') === "staging") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", "stg1.c0b69ruyoyby.us-east-1.rds.amazonaws.com"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "stg-strapi"),
          user: env("DATABASE_USERNAME", "stg-strapi"),
          password: env("DATABASE_PASSWORD", "QemI$06$0k2q"),
        },
        useNullAsDefault: true,
      },
    }
  } else if (env('NODE_ENV') === "production") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", "pro-postgresql-01.c0b69ruyoyby.us-east-1.rds.amazonaws.com"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "pro-strapi"),
          user: env("DATABASE_USERNAME", "pro-strapi"),
          password: env("DATABASE_PASSWORD", "QemI$06$0k2q"),
        },
        useNullAsDefault: true,
      },
    }
  } else  {
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
        },
        useNullAsDefault: true,
      },
    }
  }
};
