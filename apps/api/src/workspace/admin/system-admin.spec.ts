import { describe, expect, it } from 'vitest';

import { createActor } from '../../shared-kernel/interfaces/actor.js';
import { resolveCurrentActor } from '../identity/current-actor.js';
import {
  createAdminPathSystemAdminConfig,
  isAdminPathSystemAdminActor,
  isResolvedActorAdminPathSystemAdmin,
} from './system-admin.js';

describe('admin-path system admin marker', () => {
  it('treats missing admin config as no system admin', () => {
    const actor = createActor({
      actorId: 'regular_user',
      source: 'authenticated_context',
      status: 'active',
    });

    expect(isAdminPathSystemAdminActor(actor, createAdminPathSystemAdminConfig({}))).toBe(false);
    expect(
      isAdminPathSystemAdminActor(
        actor,
        createAdminPathSystemAdminConfig({ systemAdminActorId: '' }),
      ),
    ).toBe(false);
  });

  it('does not mark a regular actor as system admin', () => {
    const regularActor = createActor({
      actorId: 'regular_user',
      source: 'authenticated_context',
      status: 'active',
    });
    const config = createAdminPathSystemAdminConfig({
      systemAdminActorId: 'configured_admin',
    });

    expect(isAdminPathSystemAdminActor(regularActor, config)).toBe(false);
  });

  it('marks the configured active actor as system admin for admin-path checks only', () => {
    const configuredActor = createActor({
      actorId: 'configured_admin',
      source: 'authenticated_context',
      status: 'active',
    });
    const resolution = resolveCurrentActor({ actor: configuredActor });
    const config = createAdminPathSystemAdminConfig({
      systemAdminActorId: 'configured_admin',
    });

    expect(isResolvedActorAdminPathSystemAdmin(resolution, config)).toBe(true);
  });

  it('does not mark the configured disabled actor as system admin', () => {
    const disabledActor = createActor({
      actorId: 'configured_admin',
      source: 'authenticated_context',
      status: 'disabled',
    });
    const resolution = resolveCurrentActor({ actor: disabledActor });
    const config = createAdminPathSystemAdminConfig({
      systemAdminActorId: 'configured_admin',
    });

    expect(resolution).toEqual({ status: 'actor_unavailable' });
    expect(isResolvedActorAdminPathSystemAdmin(resolution, config)).toBe(false);
    expect(isAdminPathSystemAdminActor(disabledActor, config)).toBe(false);
  });

  it('rejects multiple configured admin actor ids', () => {
    expect(() =>
      createAdminPathSystemAdminConfig({
        systemAdminActorId: 'admin_one,admin_two',
      }),
    ).toThrow(/exactly one actor id/);
  });

  it('ignores client-supplied admin, role, and capability claims', () => {
    const clientClaimingActor = {
      ...createActor({
        actorId: 'regular_user',
        source: 'authenticated_context',
        status: 'active',
      }),
      admin: true,
      capability: 'admin_everything',
      role: 'system_admin',
    };
    const config = createAdminPathSystemAdminConfig({
      systemAdminActorId: 'configured_admin',
    });

    expect(isAdminPathSystemAdminActor(clientClaimingActor, config)).toBe(false);

    const actorRecord = createActor({
      actorId: 'shape_check_user',
      source: 'test_context',
      status: 'active',
    }) as unknown as Record<string, unknown>;

    for (const forbiddenAuthorityKey of [
      'admin',
      'isAdmin',
      'role',
      'roles',
      'capability',
      'capabilities',
      'permissions',
    ]) {
      expect(actorRecord[forbiddenAuthorityKey]).toBeUndefined();
    }
  });

  it('does not encode workspace ownership or business access', () => {
    const actorRecord = createActor({
      actorId: 'configured_admin',
      source: 'test_context',
      status: 'active',
    }) as unknown as Record<string, unknown>;

    for (const forbiddenBusinessAccessKey of [
      'workspaceOwner',
      'workspaceOwnership',
      'workspaceAccess',
      'workspaceId',
      'grant',
      'grants',
      'shareGrant',
      'certificateLibraryAccess',
      'certificateLibraryId',
    ]) {
      expect(actorRecord[forbiddenBusinessAccessKey]).toBeUndefined();
    }
  });
});
