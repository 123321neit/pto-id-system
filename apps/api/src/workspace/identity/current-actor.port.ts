import type { CurrentActorContext, CurrentActorResolution } from './current-actor.js';

export interface CurrentActorResolverPort {
  resolveCurrentActor(context: CurrentActorContext): CurrentActorResolution;
}
