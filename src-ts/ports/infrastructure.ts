import type { DatabasePool } from './database.js';

/** An opaque identifier owned by the deployment's secret manager. */
export interface SecretReference { name: string; }

/** Implementations must avoid logging secret values or returning provider metadata. */
export interface SecretResolver {
  resolve(reference: SecretReference): Promise<string | null>;
}

export interface PrivateDatabasePoolFactory {
  create(input: { connectionString: string; applicationName: string; tls: 'verify-full' }): Promise<DatabasePool>;
}
