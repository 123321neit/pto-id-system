import { describe, expect, it, vi } from 'vitest';

import { createActor } from '../../shared-kernel/interfaces/actor.js';
import {
  createAdminPathSystemAdminConfig,
  isResolvedActorAdminPathSystemAdmin,
} from '../admin/system-admin.js';
import { resolveCurrentActor } from '../identity/current-actor.js';
import {
  assertOwnedWorkspaceChildScope,
  assertWorkspaceOwner,
  createOwnedWorkspace,
  createOwnedWorkspaceId,
  isWorkspaceOwner,
  OWNED_WORKSPACE_ACCESS_DENIAL,
  type OwnedWorkspace,
  type WorkspaceChildScope,
} from './owned-workspace.js';

describe('owned workspace baseline', () => {
  it('allows an owner to access own workspace', () => {
    const owner = createActor({
      actorId: 'owner_actor',
      source: 'authenticated_context',
      status: 'active',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: owner.actorId,
      workspaceId: 'workspace_owner',
    });
    const resolution = resolveCurrentActor({ actor: owner });

    expect(isWorkspaceOwner(owner, workspace)).toBe(true);
    expect(assertWorkspaceOwner(resolution, workspace)).toEqual({
      actor: owner,
      status: 'allowed',
      workspace,
    });
  });

  it('denies a non-owner with leakage-safe vocabulary', () => {
    const nonOwner = createActor({
      actorId: 'non_owner_actor',
      source: 'authenticated_context',
      status: 'active',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: 'owner_actor',
      workspaceId: 'workspace_owner',
    });

    expect(assertWorkspaceOwner(resolveCurrentActor({ actor: nonOwner }), workspace)).toEqual({
      reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
      status: 'denied',
    });
  });

  it('does not resolve guessed workspace child ids before workspace ownership is verified', () => {
    const nonOwner = createActor({
      actorId: 'non_owner_actor',
      source: 'authenticated_context',
      status: 'active',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: 'owner_actor',
      workspaceId: 'workspace_owner',
    });
    const childLookup = vi.fn();

    for (const childScope of [
      createWorkspaceChildScope('document', workspace.workspaceId, 'guessed_document'),
      createWorkspaceChildScope('folder', workspace.workspaceId, 'guessed_folder'),
      createWorkspaceChildScope('object', workspace.workspaceId, 'guessed_object'),
    ]) {
      const decision = readChildOnlyAfterOwnerCheck(
        resolveCurrentActor({ actor: nonOwner }),
        workspace,
        childScope,
        childLookup,
      );

      expect(decision).toEqual({
        reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
        status: 'denied',
      });
    }

    expect(childLookup).not.toHaveBeenCalled();
  });

  it('does not resolve child ids outside the owned workspace scope', () => {
    const owner = createActor({
      actorId: 'owner_actor',
      source: 'authenticated_context',
      status: 'active',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: owner.actorId,
      workspaceId: 'workspace_owner',
    });
    const childLookup = vi.fn();
    const childScope = createWorkspaceChildScope(
      'document',
      createOwnedWorkspaceId('another_workspace'),
      'guessed_document',
    );

    expect(
      readChildOnlyAfterOwnerCheck(
        resolveCurrentActor({ actor: owner }),
        workspace,
        childScope,
        childLookup,
      ),
    ).toEqual({
      reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
      status: 'denied',
    });
    expect(childLookup).not.toHaveBeenCalled();
  });

  it('fails closed for missing or disabled actors through current actor resolution', () => {
    const disabledActor = createActor({
      actorId: 'owner_actor',
      source: 'authenticated_context',
      status: 'disabled',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: 'owner_actor',
      workspaceId: 'workspace_owner',
    });

    for (const resolution of [
      resolveCurrentActor({}),
      resolveCurrentActor({ actor: null }),
      resolveCurrentActor({ actor: disabledActor }),
    ]) {
      expect(assertWorkspaceOwner(resolution, workspace)).toEqual({
        reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
        status: 'denied',
      });
    }
  });

  it('does not accept the system admin marker as workspace ownership', () => {
    const configuredAdmin = createActor({
      actorId: 'configured_admin',
      source: 'authenticated_context',
      status: 'active',
    });
    const adminResolution = resolveCurrentActor({ actor: configuredAdmin });
    const adminConfig = createAdminPathSystemAdminConfig({
      systemAdminActorId: 'configured_admin',
    });
    const workspace = createOwnedWorkspace({
      ownerActorId: 'workspace_owner',
      workspaceId: 'workspace_owner',
    });

    expect(isResolvedActorAdminPathSystemAdmin(adminResolution, adminConfig)).toBe(true);
    expect(assertWorkspaceOwner(adminResolution, workspace)).toEqual({
      reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
      status: 'denied',
    });
  });

  it('does not use old RBAC role, capability, or membership claims for authorization', () => {
    const actorWithClientClaims = {
      ...createActor({
        actorId: 'non_owner_actor',
        source: 'authenticated_context',
        status: 'active',
      }),
      capabilities: ['view_workspace'],
      membership: 'workspace_owner',
      role: 'Owner',
    };
    const workspace = createOwnedWorkspace({
      ownerActorId: 'owner_actor',
      workspaceId: 'workspace_owner',
    });

    expect(
      assertWorkspaceOwner(resolveCurrentActor({ actor: actorWithClientClaims }), workspace),
    ).toEqual({
      reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
      status: 'denied',
    });

    const workspaceWithClientClaims = createOwnedWorkspace({
      capabilities: ['view_workspace'],
      membership: 'workspace_owner',
      ownerActorId: 'owner_actor',
      role: 'Owner',
      workspaceId: 'workspace_owner',
    } as unknown as Parameters<typeof createOwnedWorkspace>[0]);
    const workspaceRecord = workspaceWithClientClaims as unknown as Record<string, unknown>;

    for (const forbiddenAuthorityKey of [
      'capability',
      'capabilities',
      'membership',
      'role',
      'roles',
    ]) {
      expect(workspaceRecord[forbiddenAuthorityKey]).toBeUndefined();
    }
  });
});

function createWorkspaceChildScope(
  childKind: WorkspaceChildScope['childKind'],
  workspaceId: WorkspaceChildScope['workspaceId'],
  childId: string,
): WorkspaceChildScope {
  return {
    childId,
    childKind,
    workspaceId,
  };
}

function readChildOnlyAfterOwnerCheck(
  resolution: Parameters<typeof assertOwnedWorkspaceChildScope>[0],
  workspace: OwnedWorkspace,
  childScope: WorkspaceChildScope,
  childLookup: (childScope: WorkspaceChildScope) => unknown,
): unknown {
  const decision = assertOwnedWorkspaceChildScope(resolution, workspace, childScope);

  if (decision.status === 'denied') {
    return decision;
  }

  return childLookup(decision.childScope);
}
