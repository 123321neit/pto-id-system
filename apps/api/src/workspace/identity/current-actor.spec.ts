import { describe, expect, it } from 'vitest';

import { createActor } from '../../shared-kernel/interfaces/actor.js';
import {
  isCurrentActorResolved,
  resolveCurrentActor,
  type CurrentActorContext,
} from './current-actor.js';
import type { CurrentActorResolverPort } from './current-actor.port.js';

describe('current actor identity skeleton', () => {
  it('resolves an active actor from trusted server-side context', () => {
    const actor = createActor({
      actorId: 'user_active',
      source: 'authenticated_context',
      status: 'active',
    });

    const resolution = resolveCurrentActor({ actor });

    expect(resolution).toEqual({
      actor,
      status: 'resolved',
    });
    expect(isCurrentActorResolved(resolution)).toBe(true);
  });

  it('fails closed when actor is missing', () => {
    expect(resolveCurrentActor({})).toEqual({ status: 'missing_actor' });
    expect(resolveCurrentActor({ actor: null })).toEqual({ status: 'missing_actor' });
  });

  it('fails closed when actor is disabled', () => {
    const actor = createActor({
      actorId: 'user_disabled',
      source: 'authenticated_context',
      status: 'disabled',
    });

    expect(resolveCurrentActor({ actor })).toEqual({ status: 'actor_unavailable' });
  });

  it('ignores request-body-style identity and permission claims', () => {
    const actor = createActor({
      actorId: 'server_context_user',
      source: 'authenticated_context',
      status: 'active',
    });
    const contextWithClientClaims: CurrentActorContext & Record<string, unknown> = {
      actor,
      capability: 'client_claimed_write',
      role: 'client_claimed_role',
      user_id: 'client_supplied_user',
    };

    expect(resolveCurrentActor(contextWithClientClaims)).toEqual({
      actor,
      status: 'resolved',
    });

    const contextWithOnlyClientClaims = {
      capability: 'client_claimed_write',
      role: 'client_claimed_role',
      user_id: 'client_supplied_user',
    } as unknown as CurrentActorContext;

    expect(resolveCurrentActor(contextWithOnlyClientClaims)).toEqual({ status: 'missing_actor' });
  });

  it('keeps the actor shape free of roles and capabilities', () => {
    const actor = createActor({
      actorId: 'shape_check_user',
      source: 'test_context',
      status: 'active',
    });
    const actorRecord = actor as unknown as Record<string, unknown>;

    expect(actorRecord['role']).toBeUndefined();
    expect(actorRecord['roles']).toBeUndefined();
    expect(actorRecord['capability']).toBeUndefined();
    expect(actorRecord['capabilities']).toBeUndefined();
  });

  it('does not encode business access for workspace, document, or certificate resources', () => {
    const actor = createActor({
      actorId: 'identity_only_user',
      source: 'test_context',
      status: 'active',
    });
    const actorRecord = actor as unknown as Record<string, unknown>;

    for (const forbiddenAuthorityKey of [
      'workspaceAccess',
      'workspaceId',
      'documentAccess',
      'documentId',
      'certificateAccess',
      'certificateLibraryAccess',
      'certificateLibraryId',
    ]) {
      expect(actorRecord[forbiddenAuthorityKey]).toBeUndefined();
    }
  });

  it('can be used through a resolver port without adding a provider or route', () => {
    const actor = createActor({
      actorId: 'port_user',
      source: 'test_context',
      status: 'active',
    });
    const resolver: CurrentActorResolverPort = {
      resolveCurrentActor,
    };

    expect(resolver.resolveCurrentActor({ actor })).toEqual({
      actor,
      status: 'resolved',
    });
  });
});
