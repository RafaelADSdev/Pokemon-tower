export type StatusId = "slow" | "burn" | "poison" | "stun" | "mark";

export interface StatusApplication {
  readonly id: StatusId;
  readonly strength: number;
  readonly duration: number;
}

export const statusRules = {
  poisonStacks: 3,
  slowCap: 0.7,
  hasteCap: 0.85,
} as const;
