import { Module } from '@nestjs/common';

import { AiModule } from './ai/module.js';
import { DocumentsModule } from './documents/module.js';
import { EvidenceModule } from './evidence/module.js';
import { HealthModule } from './health/module.js';
import { PackagesModule } from './packages/module.js';
import { RegistryModule } from './registry/module.js';
import { WorkspaceModule } from './workspace/module.js';

@Module({
  imports: [
    WorkspaceModule,
    DocumentsModule,
    EvidenceModule,
    RegistryModule,
    PackagesModule,
    AiModule,
    HealthModule,
  ],
})
export class AppModule {}
