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
          host: env("DATABASE_HOST", "qa-postgresql-01.c0b69ruyoyby.us-east-1.rds.amazonaws.com"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "qa-postgresql-01"),
          user: env("DATABASE_USERNAME", "fenric"),
          password: env("DATABASE_PASSWORD", "gfduTI2GYQgKlu408oOW"),
        },
        useNullAsDefault: true,
      },
    }
  } else if (env('NODE_ENV') === "staging") {
    return {
      connection: {
        client: "postgres",
        connection: {
          host: env("DATABASE_HOST", "stg-postgresql-01.c0b69ruyoyby.us-east-1.rds.amazonaws.com"),
          port: env.int("DATABASE_PORT", 5432),
          database: env("DATABASE_NAME", "stg-postgresql-01"),
          user: env("DATABASE_USERNAME", "racnoss"),
          password: env("DATABASE_PASSWORD", "05ZHR8VhukwTcijxyudn"),
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
          database: env("DATABASE_NAME", "pro-postgresql-01"),
          user: env("DATABASE_USERNAME", "sycorax"),
          password: env("DATABASE_PASSWORD", "FgDlexvhqsfQ05Yk7LKl"),
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
