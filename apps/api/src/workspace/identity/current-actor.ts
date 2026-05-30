import type { Actor } from '../../shared-kernel/interfaces/actor.js';

export interface CurrentActorContext {
  readonly actor?: Actor | null;
}

export type CurrentActorResolution =
  | {
      readonly actor: Actor;
      readonly status: 'resolved';
    }
  | {
      readonly status: 'missing_actor' | 'actor_unavailable';
    };

export function resolveCurrentActor(context: CurrentActorContext): CurrentActorResolution {
  if (context.actor === undefined || context.actor === null) {
    return { status: 'missing_actor' };
  }

  if (context.actor.status !== 'active') {
    return { status: 'actor_unavailable' };
  }

  return {
    actor: context.actor,
    status: 'resolved',
  };
}

export function isCurrentActorResolved(
  resolution: CurrentActorResolution,
): resolution is Extract<CurrentActorResolution, { readonly status: 'resolved' }> {
  return resolution.status === 'resolved';
}
