import { createActorId, type Actor } from '../../shared-kernel/interfaces/actor.js';
import type { CurrentActorResolution } from '../identity/current-actor.js';

export interface AdminPathSystemAdminConfig {
  readonly systemAdminActorId?: Actor['actorId'];
}

export interface CreateAdminPathSystemAdminConfigInput {
  readonly systemAdminActorId?: string | null;
}

export function createAdminPathSystemAdminConfig(
  input: CreateAdminPathSystemAdminConfigInput,
): AdminPathSystemAdminConfig {
  const systemAdminActorId = normalizeSystemAdminActorId(input.systemAdminActorId);

  if (systemAdminActorId === undefined) {
    return {};
  }

  return {
    systemAdminActorId: createActorId(systemAdminActorId),
  };
}

export function isAdminPathSystemAdminActor(
  actor: Actor,
  config: AdminPathSystemAdminConfig,
): boolean {
  return actor.status === 'active' && actor.actorId === config.systemAdminActorId;
}

export function isResolvedActorAdminPathSystemAdmin(
  resolution: CurrentActorResolution,
  config: AdminPathSystemAdminConfig,
): boolean {
  return resolution.status === 'resolved' && isAdminPathSystemAdminActor(resolution.actor, config);
}

function normalizeSystemAdminActorId(value: string | null | undefined): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return undefined;
  }

  if (trimmedValue.includes(',')) {
    throw new Error('SYSTEM_ADMIN_ACTOR_ID must configure exactly one actor id.');
  }

  return trimmedValue;
}
