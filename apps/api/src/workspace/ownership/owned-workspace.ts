import { createActorId, type Actor } from '../../shared-kernel/interfaces/actor.js';
import type { CurrentActorResolution } from '../identity/current-actor.js';

declare const ownedWorkspaceIdBrand: unique symbol;

export type OwnedWorkspaceId = string & {
  readonly [ownedWorkspaceIdBrand]: 'OwnedWorkspaceId';
};

export interface OwnedWorkspace {
  readonly workspaceId: OwnedWorkspaceId;
  readonly ownerActorId: Actor['actorId'];
}

export interface CreateOwnedWorkspaceInput {
  readonly workspaceId: string;
  readonly ownerActorId: string;
}

export type WorkspaceChildKind = 'document' | 'folder' | 'object';

export interface WorkspaceChildScope {
  readonly childId: string;
  readonly childKind: WorkspaceChildKind;
  readonly workspaceId: OwnedWorkspaceId;
}

export const OWNED_WORKSPACE_ACCESS_DENIAL = {
  notFoundOrNotAuthorized: 'NOT_FOUND_OR_NOT_AUTHORIZED',
} as const;

export type OwnedWorkspaceAccessDenialReason =
  (typeof OWNED_WORKSPACE_ACCESS_DENIAL)[keyof typeof OWNED_WORKSPACE_ACCESS_DENIAL];

export type OwnedWorkspaceAccessDecision =
  | {
      readonly actor: Actor;
      readonly status: 'allowed';
      readonly workspace: OwnedWorkspace;
    }
  | {
      readonly reason: OwnedWorkspaceAccessDenialReason;
      readonly status: 'denied';
    };

export type OwnedWorkspaceChildAccessDecision =
  | {
      readonly actor: Actor;
      readonly childScope: WorkspaceChildScope;
      readonly status: 'allowed';
      readonly workspace: OwnedWorkspace;
    }
  | {
      readonly reason: OwnedWorkspaceAccessDenialReason;
      readonly status: 'denied';
    };

export function createOwnedWorkspace(input: CreateOwnedWorkspaceInput): OwnedWorkspace {
  return {
    ownerActorId: createActorId(input.ownerActorId),
    workspaceId: createOwnedWorkspaceId(input.workspaceId),
  };
}

export function createOwnedWorkspaceId(value: string): OwnedWorkspaceId {
  if (value.trim().length === 0) {
    throw new Error('Owned workspace id must be a non-empty string.');
  }

  return value as OwnedWorkspaceId;
}

export function isWorkspaceOwner(actor: Actor, workspace: OwnedWorkspace): boolean {
  return actor.status === 'active' && actor.actorId === workspace.ownerActorId;
}

export function assertWorkspaceOwner(
  resolution: CurrentActorResolution,
  workspace: OwnedWorkspace,
): OwnedWorkspaceAccessDecision {
  if (resolution.status !== 'resolved') {
    return denyOwnedWorkspaceAccess();
  }

  if (!isWorkspaceOwner(resolution.actor, workspace)) {
    return denyOwnedWorkspaceAccess();
  }

  return {
    actor: resolution.actor,
    status: 'allowed',
    workspace,
  };
}

export function assertOwnedWorkspaceChildScope(
  resolution: CurrentActorResolution,
  workspace: OwnedWorkspace,
  childScope: WorkspaceChildScope,
): OwnedWorkspaceChildAccessDecision {
  const workspaceDecision = assertWorkspaceOwner(resolution, workspace);

  if (workspaceDecision.status === 'denied') {
    return workspaceDecision;
  }

  if (childScope.workspaceId !== workspace.workspaceId) {
    return denyOwnedWorkspaceAccess();
  }

  return {
    actor: workspaceDecision.actor,
    childScope,
    status: 'allowed',
    workspace,
  };
}

function denyOwnedWorkspaceAccess(): Extract<OwnedWorkspaceAccessDecision, { status: 'denied' }> {
  return {
    reason: OWNED_WORKSPACE_ACCESS_DENIAL.notFoundOrNotAuthorized,
    status: 'denied',
  };
}
