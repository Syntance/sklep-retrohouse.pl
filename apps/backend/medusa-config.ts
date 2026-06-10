import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Provider emailpass jest zawsze aktywny (logowanie email/hasło do admina + dashboardu).
// Provider Google dodaje się tylko gdy ustawione są dane OAuth — dzięki temu deploy
// bez kluczy nie wywala bootu i nie blokuje logowania email.
const authProviders: Array<Record<string, unknown>> = [
  {
    resolve: '@medusajs/medusa/auth-emailpass',
    id: 'emailpass',
  },
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authProviders.push({
    resolve: '@medusajs/medusa/auth-google',
    id: 'google',
    options: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        'https://sklep.retrohouse.pl/magazyn/auth/google/callback',
    },
  })
}

const r2FileUrl = process.env.R2_FILE_URL || process.env.S3_FILE_URL || process.env.S3_PUBLIC_URL
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY
const r2Bucket = process.env.R2_BUCKET || process.env.S3_BUCKET

/** Bucket utworzony w jurysdykcji EU wymaga endpointu *.eu.r2.cloudflarestorage.com */
function normalizeR2Endpoint(endpoint: string | undefined): string | undefined {
  if (!endpoint) return undefined
  if (
    endpoint.includes('.r2.cloudflarestorage.com') &&
    !endpoint.includes('.eu.r2.cloudflarestorage.com')
  ) {
    return endpoint.replace('.r2.cloudflarestorage.com', '.eu.r2.cloudflarestorage.com')
  }
  return endpoint
}

const r2Endpoint = normalizeR2Endpoint(process.env.R2_ENDPOINT || process.env.S3_ENDPOINT)
const r2Configured =
  Boolean(r2FileUrl) &&
  Boolean(r2Bucket) &&
  Boolean(r2Endpoint) &&
  Boolean(r2AccessKeyId) &&
  Boolean(r2SecretAccessKey)

const fileModule = r2Configured
  ? {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@webbers/cloudflare-r2-medusa/modules/cloudflare-r2',
            id: 'r2',
            options: {
              file_url: r2FileUrl,
              access_key_id: r2AccessKeyId,
              secret_access_key: r2SecretAccessKey,
              region: process.env.R2_REGION || process.env.S3_REGION || 'auto',
              bucket: r2Bucket,
              endpoint: r2Endpoint,
              prefix: process.env.R2_PREFIX,
            },
          },
        ],
      },
    }
  : null

// Tpay payment provider — tylko gdy ustawione są credentials.
const tpayConfigured = Boolean(
  process.env.TPAY_CLIENT_ID && process.env.TPAY_CLIENT_SECRET && process.env.TPAY_MERCHANT_ID,
)

const paymentModule = tpayConfigured
  ? {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: './src/modules/tpay',
            id: 'tpay',
            options: {
              clientId: process.env.TPAY_CLIENT_ID,
              clientSecret: process.env.TPAY_CLIENT_SECRET,
              merchantId: process.env.TPAY_MERCHANT_ID,
              sandbox: process.env.TPAY_SANDBOX !== 'false',
              backendUrl: process.env.TPAY_BACKEND_URL || 'http://localhost:9000',
              storefrontUrl: process.env.TPAY_STOREFRONT_URL || 'http://localhost:3000',
              notificationCertPath: process.env.TPAY_NOTIFICATION_CERT_PATH,
            },
          },
        ],
      },
    }
  : null

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: [
    {
      resolve: '@medusajs/medusa/auth',
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: authProviders,
      },
    },
    ...(fileModule ? [fileModule] : []),
    ...(paymentModule ? [paymentModule] : []),
  ],
})
