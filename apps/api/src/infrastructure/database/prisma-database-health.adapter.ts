import { PrismaClient } from '@prisma/client';

import { checkDatabaseHealth } from './database-health.js';
import type {
  DatabaseConnectivityAdapter,
  DatabaseHealthPort,
  DatabaseHealthResult,
} from './database-health.port.js';

export class PrismaDatabaseHealthAdapter implements DatabaseHealthPort {
  constructor(private readonly databaseUrl: string | undefined) {}

  check(): Promise<DatabaseHealthResult> {
    return checkDatabaseHealth({
      createAdapter: () => new PrismaDatabaseConnectivityAdapter(this.databaseUrl ?? ''),
      databaseUrl: this.databaseUrl,
    });
  }
}

class PrismaDatabaseConnectivityAdapter implements DatabaseConnectivityAdapter {
  private readonly client: PrismaClient;

  constructor(databaseUrl: string) {
    this.client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  async executeConnectivityCheck(): Promise<void> {
    await this.client.$queryRaw`SELECT 1`;
  }
}
