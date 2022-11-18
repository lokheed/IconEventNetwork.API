module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
    },
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET_NAME'),
        },
      },
      // These parameters could solve issues with ACL public-read access — see [this issue](https://github.com/strapi/strapi/issues/5868) for details
      actionOptions: {
        upload: {
          ACL: null
        },
        uploadStream: {
          ACL: null
        },
      }
    },
  },
  'import-export-entries': {
    enabled: true,
  },
  'fuzzy-search': {
    enabled: true,
    config: {
      contentTypes: [
        {
          uid: 'api::country.country',
          modelName: 'country',
            fuzzysortOptions: {
              characterLimit: 300,
              threshold: -600,
              limit: 10,
              keys: [
              {
                name: "Name",
                weight: 100,
              },
              {
                name: "SearchableName",
                weight: 100,
              },
            ],
          },
        },
      ],
    },
  },
});
