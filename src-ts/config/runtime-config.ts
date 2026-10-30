export type RuntimeEnvironment = 'development' | 'test' | 'staging' | 'production';

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  signalIngressEnabled: boolean;
  databaseUrl: string | null;
  commitmentSecret: string | null;
  allowedOrigin: string | null;
  authenticationMode: 'disabled' | 'approved_adapter';
  integrityAnchorConfigured: boolean;
}

function configError(message: string): never { const error = new Error(message); error.name = 'InvalidRuntimeConfigurationError'; throw error; }
function optional(input: Record<string, string | undefined>, key: string): string | null { const value = input[key]?.trim(); return value ? value : null; }

export function loadRuntimeConfig(input: Record<string, string | undefined>): RuntimeConfig {
  const environment = (optional(input, 'TRUSTRX_ENVIRONMENT') || 'development') as RuntimeEnvironment;
  if (!['development', 'test', 'staging', 'production'].includes(environment)) configError('TRUSTRX_ENVIRONMENT is invalid');
  const signalIngressEnabled = optional(input, 'TRUSTRX_ENABLE_SIGNAL_INGRESS') === 'true';
  const databaseUrl = optional(input, 'DATABASE_URL');
  const commitmentSecret = optional(input, 'TRUSTRX_COMMITMENT_SECRET');
  const allowedOrigin = optional(input, 'TRUSTRX_ALLOWED_ORIGIN');
  const authenticationMode = (optional(input, 'TRUSTRX_AUTH_MODE') || 'disabled') as RuntimeConfig['authenticationMode'];
  if (!['disabled', 'approved_adapter'].includes(authenticationMode)) configError('TRUSTRX_AUTH_MODE is invalid');
  const anchorValues = ['HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY', 'HEDERA_TOPIC_ID'].map((key) => optional(input, key));
  if (anchorValues.some(Boolean) && !anchorValues.every(Boolean)) configError('Hedera integrity anchor configuration is incomplete');
  if (signalIngressEnabled) {
    if (!databaseUrl || !commitmentSecret) configError('Enabled signal ingress requires DATABASE_URL and TRUSTRX_COMMITMENT_SECRET');
    if (authenticationMode !== 'approved_adapter') configError('Enabled signal ingress requires an approved authentication adapter');
    if (!allowedOrigin || allowedOrigin === '*') configError('Enabled signal ingress requires an explicit non-wildcard origin');
  }
  if (environment === 'production' && signalIngressEnabled && !anchorValues.every(Boolean)) configError('Production ingress requires complete integrity anchor configuration');
  return { environment, signalIngressEnabled, databaseUrl, commitmentSecret, allowedOrigin, authenticationMode, integrityAnchorConfigured: anchorValues.every(Boolean) };
}

export function safeReadiness(config: RuntimeConfig) {
  return { environment: config.environment, signalIngress: config.signalIngressEnabled ? 'configured' : 'disabled', database: config.databaseUrl ? 'configured' : 'not_configured', authentication: config.authenticationMode, integrityAnchor: config.integrityAnchorConfigured ? 'configured' : 'not_configured' } as const;
}
