import type { DatabasePool } from '../ports/database.js';
import type { PrivateDatabasePoolFactory, SecretReference, SecretResolver } from '../ports/infrastructure.js';

export interface PrivateInfrastructureRequest {
  environment: 'staging' | 'production';
  databaseConnectionSecret: SecretReference;
  applicationName: string;
}

function infrastructureError(message: string): never {
  const error = new Error(message);
  error.name = 'PrivateInfrastructureResolutionError';
  throw error;
}

function validReference(reference: SecretReference): boolean {
  return /^[A-Za-z][A-Za-z0-9._/-]{2,127}$/.test(reference.name);
}

function validApplicationName(value: string): boolean {
  return /^[a-z][a-z0-9_-]{2,48}$/.test(value);
}

/**
 * Resolves a private connection secret just-in-time and passes it directly to
 * an injected pool factory. It never stores, logs or returns the secret.
 */
export async function createPrivateDatabasePool(
  request: PrivateInfrastructureRequest,
  secrets: SecretResolver,
  pools: PrivateDatabasePoolFactory,
): Promise<DatabasePool> {
  if (!validReference(request.databaseConnectionSecret) || !validApplicationName(request.applicationName)) {
    infrastructureError('Private infrastructure request is invalid');
  }
  let connectionString: string | null;
  try {
    connectionString = await secrets.resolve(request.databaseConnectionSecret);
  } catch {
    infrastructureError('Private database secret could not be resolved');
  }
  if (!connectionString || !/^postgres(?:ql)?:\/\/[^\s]+$/i.test(connectionString)) {
    infrastructureError('Private database secret is unavailable or invalid');
  }
  try {
    return await pools.create({ connectionString, applicationName: request.applicationName, tls: 'verify-full' });
  } catch {
    infrastructureError('Private database pool could not be created');
  }
}
