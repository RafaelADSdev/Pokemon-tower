import { createWave, group } from "./builders";
import type { WaveGroup } from "./types";

function upper(enemyId: string, count: number, interval: number, delay = 0) {
  return group(enemyId, count, interval, delay, 0);
}

function lower(enemyId: string, count: number, interval: number, delay = 0) {
  return group(enemyId, count, interval, delay, 1);
}

const caveGroups: readonly (readonly WaveGroup[])[] = [
  [upper("mossmite", 4, 1.1), lower("mossmite", 4, 1.1, 2.2)],
  [lower("reedrunner", 6, 0.78), upper("mossmite", 6, 0.96, 1.5)],
  [upper("flinthide", 4, 1.45), lower("mossmite", 10, 0.64, 3)],
  [upper("cindershield", 4, 1.3), lower("cindershield", 4, 1.3, 2), lower("reedrunner", 5, 0.75, 6)],
  [lower("springtail", 9, 0.84), upper("hollowpod", 5, 1.23, 4)],
  [group("galefoal", 10, 0.71), lower("flinthide", 5, 1.4, 4)],
  [upper("hollowpod", 7, 0.9), lower("hollowpod", 7, 1.04, 3)],
  [lower("mistveil", 7, 1.03), upper("reedrunner", 10, 0.58, 3)],
  [upper("mistveil", 7, 0.9), lower("flinthide", 8, 0.99, 3), group("galefoal", 7, 0.82, 7)],
  [upper("ashdrummer", 1, 1), upper("reedrunner", 10, 0.56, 4), lower("cindershield", 9, 0.89, 3.5)],

  [upper("flinthide", 10, 0.95), lower("flinthide", 10, 1.03, 2)],
  [upper("reedrunner", 12, 0.47), lower("springtail", 10, 0.87, 3), group("galefoal", 8, 0.73, 6)],
  [group("mistveil", 16, 0.66), upper("hollowpod", 10, 0.83, 4)],
  [lower("cindershield", 13, 0.75), upper("galefoal", 13, 0.59, 4)],
  [upper("hollowpod", 11, 0.79), lower("reedrunner", 15, 0.46, 2), lower("springtail", 7, 0.82, 8)],
  [upper("mistveil", 12, 0.71), lower("flinthide", 13, 0.91, 3.2)],
  [group("galefoal", 22, 0.45), lower("mossmite", 16, 0.47, 7)],
  [upper("springtail", 13, 0.73), lower("springtail", 13, 0.81, 3), lower("cindershield", 8, 0.7, 9)],
  [upper("flinthide", 12, 0.91), lower("hollowpod", 17, 0.66, 3.2), upper("mistveil", 10, 0.5, 8.5)],
  [lower("marrowcrown", 1, 1), lower("springtail", 13, 0.68, 3.1), upper("galefoal", 15, 0.61, 7)],

  [upper("reedrunner", 22, 0.38), lower("reedrunner", 23, 0.41, 1.7)],
  [lower("hollowpod", 14, 0.7), upper("cindershield", 14, 0.69, 3), group("galefoal", 11, 0.61, 7)],
  [group("mistveil", 26, 0.57), lower("flinthide", 14, 0.89, 5)],
  [upper("mossmite", 19, 0.49), lower("springtail", 17, 0.69, 3), group("galefoal", 14, 0.58, 8)],
  [upper("flinthide", 17, 0.79), lower("cindershield", 18, 0.68, 3.1)],
  [lower("mistveil", 19, 0.59), upper("hollowpod", 15, 0.71, 5.4)],
  [group("galefoal", 29, 0.43), upper("springtail", 15, 0.68, 5), lower("springtail", 13, 0.77, 6.5)],
  [upper("cindershield", 17, 0.69), lower("flinthide", 14, 0.86, 2.9), lower("reedrunner", 16, 0.45, 8.1)],
  [lower("hollowpod", 21, 0.49), upper("mistveil", 16, 0.61, 3), group("galefoal", 19, 0.5, 6.3)],
  [
    upper("marrowcrown", 1, 1), lower("ashdrummer", 1, 1, 2.2),
    upper("flinthide", 14, 0.68, 3.4), lower("cindershield", 13, 0.64, 6.8),
    group("galefoal", 15, 0.51, 11),
  ],
];

export const caveWaves = caveGroups.map((groups, index) => createWave(index + 1, groups));
