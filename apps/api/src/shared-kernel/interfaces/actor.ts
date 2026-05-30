declare const actorIdBrand: unique symbol;

export type ActorId = string & {
  readonly [actorIdBrand]: 'ActorId';
};

export type ActorStatus = 'active' | 'disabled';

export type ActorSource = 'authenticated_context' | 'test_context';

export interface Actor {
  readonly actorId: ActorId;
  readonly source: ActorSource;
  readonly status: ActorStatus;
}

export interface CreateActorInput {
  readonly actorId: string;
  readonly source: ActorSource;
  readonly status: ActorStatus;
}

export function createActor(input: CreateActorInput): Actor {
  return {
    actorId: createActorId(input.actorId),
    source: input.source,
    status: input.status,
  };
}

export function createActorId(value: string): ActorId {
  if (value.trim().length === 0) {
    throw new Error('Actor id must be a non-empty string.');
  }

  return value as ActorId;
}
