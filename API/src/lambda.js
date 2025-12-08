const serverless = require('serverless-http');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let cachedHandler; // Ensures secrets are loaded only on cold start

async function initialize() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const isOffline = process.env.IS_OFFLINE === 'true' || process.env.IS_OFFLINE === '1';

  if (isOffline) {
    // Local/offline mode: use dotenv, skip Secrets Manager
    try {
      // eslint-disable-next-line global-require
      require('dotenv').config();
      console.log('[lambda] Offline mode detected (IS_OFFLINE). Loaded .env and skipping Secrets Manager.');
    } catch (err) {
      console.warn('[lambda] Failed to load .env in offline mode:', err.message || err);
    }
  } else {
    // Lambda cold start: load secrets from AWS Secrets Manager
    const secretId = process.env.SECRETS_ID;

    if (!secretId) {
      console.warn('[lambda] SECRETS_ID is not set. Skipping Secrets Manager secrets load.');
    } else {
      try {
        const client = new SecretsManagerClient({});
        const command = new GetSecretValueCommand({ SecretId: secretId });
        const response = await client.send(command);

        if (response.SecretString) {
          try {
            const secrets = JSON.parse(response.SecretString);

            if (secrets && typeof secrets === 'object') {
              Object.entries(secrets).forEach(([key, value]) => {
                if (process.env[key] === undefined) {
                  process.env[key] = String(value);
                }
              });
              console.log('[lambda] Secrets loaded from Secrets Manager and merged into process.env');
            }
          } catch (parseErr) {
            console.error('[lambda] Failed to parse SecretString JSON from Secrets Manager:', parseErr.message || parseErr);
          }
        } else {
          console.warn('[lambda] Secrets Manager response did not contain SecretString. Skipping merge.');
        }
      } catch (smErr) {
        console.error('[lambda] Error fetching secrets from Secrets Manager:', smErr.message || smErr);
        // Intentionally swallow to ensure cold start never throws
      }
    }
  }

  // Require app only after env/secrets are prepared so it can read correct env vars
  const app = require('../server');

  cachedHandler = serverless(app);
  return cachedHandler;
}

module.exports.handler = async (event, context) => {
  const handler = await initialize();
  return handler(event, context);
};
