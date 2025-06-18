import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_EMAIL: string;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

function getPortEnvVar(name: string, defaultPort: number): number {
  const value = process.env[name];
  if (!value) return defaultPort;
  
  const port = parseInt(value, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid port number for ${name}: ${value}`);
  }
  return port;
}

function validateJwtSecret(secret: string): void {
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
}

function validateDatabaseUrl(url: string): void {
  if (!url.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql://');
  }
}

function validateVapidEmail(email: string): void {
  if (!email.startsWith('mailto:') || !email.includes('@')) {
    throw new Error('VAPID_EMAIL must be a valid mailto: email address');
  }
}

// Create and validate configuration
function createConfig(): Config {
  const databaseUrl = getRequiredEnvVar('DATABASE_URL');
  const jwtSecret = getRequiredEnvVar('JWT_SECRET');
  const vapidEmail = getRequiredEnvVar('VAPID_EMAIL');

  // Validate critical values
  validateDatabaseUrl(databaseUrl);
  validateJwtSecret(jwtSecret);
  validateVapidEmail(vapidEmail);

  return {
    NODE_ENV: getOptionalEnvVar('NODE_ENV', 'development'),
    PORT: getPortEnvVar('PORT', 3000),
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    VAPID_PUBLIC_KEY: getRequiredEnvVar('VAPID_PUBLIC_KEY'),
    VAPID_PRIVATE_KEY: getRequiredEnvVar('VAPID_PRIVATE_KEY'),
    VAPID_EMAIL: vapidEmail,
  };
}

// Export the validated configuration
export const config = createConfig();

// Helper function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';