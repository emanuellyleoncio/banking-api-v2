const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'BANK_ADMIN_PASSWORD',
    'PORT',
    'NODE_ENV',
    'OTEL_EXPORTER_OTLP_ENDPOINT'
] as const;

type EnvKey = typeof required[number];

function validateEnv(): Record<EnvKey, string> {
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}`);
        process.exit(1);
    }

    return Object.fromEntries(
        required.map((key) => [key, process.env[key]!])
    ) as Record<EnvKey, string>;
}

export const env = validateEnv();
