import { createWave, group } from "./builders";
import type { WaveGroup } from "./types";

const forestGroups: readonly (readonly WaveGroup[])[] = [
  [group("mossmite", 6, 1.12)],
  [group("mossmite", 7, 0.95), group("reedrunner", 4, 0.8, 6)],
  [group("mossmite", 8, 0.89), group("flinthide", 3, 1.7, 4)],
  [group("reedrunner", 8, 0.72), group("galefoal", 5, 1.15, 4)],
  [group("mossmite", 8, 0.75), group("springtail", 7, 1.1, 4)],
  [group("cindershield", 6, 1.25), group("reedrunner", 9, 0.68, 5)],
  [group("hollowpod", 6, 1.07), group("flinthide", 4, 1.55, 4)],
  [group("mossmite", 11, 0.64), group("mistveil", 5, 1.06, 5)],
  [group("cindershield", 7, 1.04), group("galefoal", 7, 0.85, 3), group("springtail", 4, 1.2, 8)],
  [group("marrowcrown", 1, 1), group("springtail", 9, 0.86, 3), group("reedrunner", 7, 0.74, 8)],

  [group("flinthide", 9, 1.11), group("mossmite", 8, 0.66, 5)],
  [group("galefoal", 12, 0.71), group("cindershield", 8, 1.12, 4)],
  [group("hollowpod", 9, 0.85), group("mistveil", 8, 0.84, 5)],
  [group("reedrunner", 17, 0.49), group("flinthide", 8, 1.08, 5)],
  [group("springtail", 13, 0.79), group("galefoal", 8, 0.82, 6), group("mistveil", 4, 0.8, 10)],
  [group("cindershield", 13, 0.83), group("hollowpod", 9, 0.94, 6)],
  [group("galefoal", 16, 0.62), group("mossmite", 13, 0.56, 7)],
  [group("flinthide", 13, 0.91), group("springtail", 12, 0.79, 6)],
  [group("mistveil", 13, 0.74), group("hollowpod", 10, 0.75, 5), group("galefoal", 7, 0.78, 10)],
  [group("ashdrummer", 1, 1), group("cindershield", 12, 0.74, 3), group("reedrunner", 17, 0.54, 6)],

  [group("reedrunner", 16, 0.41), group("flinthide", 13, 0.86, 4), group("mistveil", 8, 0.72, 9)],
  [group("hollowpod", 14, 0.72), group("springtail", 14, 0.7, 6)],
  [group("galefoal", 23, 0.49), group("cindershield", 12, 0.78, 7)],
  [group("mistveil", 17, 0.64), group("galefoal", 9, 0.66, 5), group("reedrunner", 13, 0.48, 11)],
  [group("flinthide", 16, 0.84), group("hollowpod", 13, 0.64, 5), group("springtail", 8, 0.72, 11)],
  [group("cindershield", 20, 0.69), group("mossmite", 22, 0.39, 5)],
  [group("galefoal", 23, 0.43), group("mistveil", 16, 0.66, 6)],
  [group("hollowpod", 19, 0.57), group("reedrunner", 21, 0.37, 5)],
  [group("flinthide", 15, 0.76), group("cindershield", 19, 0.59, 4), group("galefoal", 12, 0.53, 11)],
  [
    group("marrowcrown", 1, 1),
    group("ashdrummer", 1, 1, 4),
    group("springtail", 14, 0.62, 2),
    group("mistveil", 10, 0.64, 8),
    group("galefoal", 13, 0.56, 13),
  ],
];

export const forestWaves = forestGroups.map((groups, index) => createWave(index + 1, groups));
