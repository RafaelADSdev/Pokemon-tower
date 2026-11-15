import { createWave, group } from "./builders";
import type { WaveGroup } from "./types";

const volcanoGroups: readonly (readonly WaveGroup[])[] = [
  [group("mossmite", 9, 0.96), group("reedrunner", 3, 0.83, 7.2)],
  [group("cindershield", 3, 1.45), group("reedrunner", 8, 0.7, 4)],
  [group("hollowpod", 5, 1.07), group("flinthide", 3, 1.43, 5)],
  [group("galefoal", 6, 1.01), group("cindershield", 5, 1.15, 5)],
  [group("cindershield", 8, 1.05), group("mossmite", 13, 0.64, 4)],
  [group("flinthide", 7, 1.03), group("reedrunner", 15, 0.54, 4.5)],
  [group("springtail", 11, 0.91), group("galefoal", 9, 0.82, 4.2)],
  [group("mistveil", 8, 0.86), group("hollowpod", 8, 0.87, 4.5)],
  [group("cindershield", 11, 0.91), group("galefoal", 12, 0.69, 3.8)],
  [group("ashdrummer", 1, 1), group("cindershield", 11, 0.72, 2), group("reedrunner", 14, 0.55, 6)],

  [group("hollowpod", 10, 0.81), group("flinthide", 9, 0.92, 6)],
  [group("galefoal", 18, 0.53), group("mistveil", 8, 0.87, 6)],
  [group("reedrunner", 20, 0.4), group("cindershield", 11, 0.91, 5.5)],
  [group("flinthide", 13, 0.93), group("springtail", 13, 0.69, 4.7)],
  [group("mistveil", 15, 0.71), group("mossmite", 15, 0.55, 4), group("galefoal", 9, 0.76, 9)],
  [group("cindershield", 14, 0.67), group("hollowpod", 13, 0.76, 3.3)],
  [group("galefoal", 19, 0.56), group("reedrunner", 18, 0.46, 4.3)],
  [group("springtail", 17, 0.71), group("flinthide", 12, 0.87, 3.8)],
  [group("cindershield", 17, 0.71), group("mistveil", 16, 0.63, 4.9)],
  [group("marrowcrown", 1, 1), group("cindershield", 13, 0.74, 2.7), group("springtail", 12, 0.74, 5.8)],

  [group("galefoal", 24, 0.45), group("hollowpod", 14, 0.68, 4.7)],
  [group("flinthide", 17, 0.82), group("reedrunner", 23, 0.42, 4.1)],
  [group("cindershield", 20, 0.61), group("springtail", 17, 0.63, 4.9)],
  [group("mistveil", 22, 0.58), group("galefoal", 22, 0.47, 3.8)],
  [group("hollowpod", 20, 0.56), group("flinthide", 16, 0.82, 5.7)],
  [group("cindershield", 24, 0.57), group("reedrunner", 26, 0.39, 4.4)],
  [group("galefoal", 27, 0.41), group("flinthide", 14, 0.78, 4.5), group("mistveil", 13, 0.68, 9.1)],
  [group("springtail", 21, 0.66), group("hollowpod", 20, 0.62, 4), group("mistveil", 12, 0.59, 8)],
  [group("cindershield", 23, 0.58), group("flinthide", 19, 0.71, 4.4), group("galefoal", 20, 0.48, 8.8)],
  [
    group("ashdrummer", 1, 1), group("marrowcrown", 1, 1, 3),
    group("cindershield", 20, 0.55, 1.6), group("mistveil", 17, 0.59, 7),
    group("galefoal", 21, 0.46, 9.8),
  ],
];

export const volcanoWaves = volcanoGroups.map((groups, index) => createWave(index + 1, groups));
