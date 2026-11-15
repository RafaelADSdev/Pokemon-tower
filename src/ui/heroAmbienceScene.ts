type Point = readonly [x: number, y: number];
type Curve = readonly [start: Point, control1: Point, control2: Point, end: Point];

type Waterfall = {
  crest: readonly [Point, Point];
  foot: readonly [Point, Point];
  runoff: Curve;
};

type LeafLane = {
  origin: Point;
  fall: number;
  drift: number;
};

type Scene = {
  feeder: Curve;
  waterfalls: readonly Waterfall[];
  leafLanes: readonly LeafLane[];
};

// Trace each crop in source pixels so the effects follow the stream and trees
// when the browser scales and crops the art.
const scenes = {
  desktop: {
    feeder: [[1284, 328], [1268, 334], [1250, 344], [1236, 355]],
    waterfalls: [
      { crest: [[1213, 355], [1260, 366]], foot: [[1198, 416], [1240, 425]], runoff: [[1218, 427], [1219, 445], [1171, 458], [1161, 476]] },
      { crest: [[1141, 477], [1185, 483]], foot: [[1132, 502], [1170, 511]], runoff: [[1151, 511], [1145, 532], [1082, 530], [1061, 553]] },
      { crest: [[1038, 553], [1081, 560]], foot: [[1031, 577], [1065, 584]], runoff: [[1048, 587], [1043, 611], [981, 613], [952, 596]] },
    ],
    leafLanes: [
      { origin: [720, 225], fall: 300, drift: 22 },
      { origin: [948, 224], fall: 345, drift: -72 },
      { origin: [1128, 204], fall: 360, drift: -48 },
      { origin: [1407, 230], fall: 330, drift: -62 },
    ],
  },
  mobile: {
    feeder: [[493, 229], [480, 233], [464, 243], [450, 255]],
    waterfalls: [
      { crest: [[427, 256], [471, 265]], foot: [[412, 310], [455, 318]], runoff: [[434, 320], [436, 334], [395, 345], [381, 359]] },
      { crest: [[362, 359], [401, 366]], foot: [[353, 386], [389, 393]], runoff: [[372, 394], [367, 406], [315, 409], [293, 430]] },
      { crest: [[274, 430], [313, 436]], foot: [[268, 450], [302, 457]], runoff: [[285, 458], [283, 477], [227, 481], [204, 466]] },
    ],
    leafLanes: [
      { origin: [142, 95], fall: 281, drift: 19 },
      { origin: [292, 117], fall: 312, drift: -39 },
      { origin: [460, 101], fall: 280, drift: -55 },
      { origin: [610, 146], fall: 296, drift: -42 },
    ],
  },
} satisfies Record<'desktop' | 'mobile', Scene>;

const leafColors = [
  ['#ad8733', '#e8be5a'],
  ['#9d561e', '#e29e4c'],
  ['#707a39', '#b8b857'],
  ['#ae6f2d', '#eab76a'],
] as const;

const cycle = (value: number) => value - Math.floor(value);
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

function curvePoint([start, control1, control2, end]: Curve, t: number): Point {
  const inverse = 1 - t;
  const a = inverse ** 3;
  const b = 3 * inverse ** 2 * t;
  const c = 3 * inverse * t ** 2;
  const d = t ** 3;
  return [
    a * start[0] + b * control1[0] + c * control2[0] + d * end[0],
    a * start[1] + b * control1[1] + c * control2[1] + d * end[1],
  ];
}

function drawCascade(ctx: CanvasRenderingContext2D, { crest, foot }: Waterfall, time: number, phase: number) {
  ctx.lineCap = 'round';
  for (let lane = 0; lane < 9; lane++) {
    const cross = (lane + 0.65) / 9.5;
    const [fromX, fromY] = [mix(crest[0][0], crest[1][0], cross), mix(crest[0][1], crest[1][1], cross)];
    const [toX, toY] = [mix(foot[0][0], foot[1][0], cross), mix(foot[0][1], foot[1][1], cross)];
    const run = toY - fromY;
    for (let streak = 0; streak < 2; streak++) {
      const p = cycle(time * (1.04 + 17 / run + (lane % 3) * 0.12) + lane * 0.379 + streak * 0.47 + phase);
      const tail = Math.max(0, p - (0.28 + (lane % 3) * 0.055));
      const middle = (tail + p) / 2;
      ctx.globalAlpha = Math.sin(p * Math.PI) * (streak ? 0.26 : 0.52);
      ctx.strokeStyle = streak ? '#72c2c6' : '#d3f3ef';
      ctx.lineWidth = 0.9 + (lane % 4) * 0.35;
      ctx.beginPath();
      ctx.moveTo(mix(fromX, toX, tail) - 1.5 * Math.sin(tail * Math.PI), fromY + run * tail ** 1.18);
      ctx.quadraticCurveTo(
        mix(fromX, toX, middle) - 2 * Math.sin(middle * Math.PI), fromY + run * middle ** 1.18,
        mix(fromX, toX, p) - 1.5 * Math.sin(p * Math.PI), fromY + run * p ** 1.18,
      );
      ctx.stroke();
    }
  }
}

function drawCurrent(ctx: CanvasRenderingContext2D, curve: Curve, time: number, phase: number, count: number) {
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const p = cycle(time * (0.32 + (i % 3) * 0.039) + i * 0.197 + phase);
    const [x, y] = curvePoint(curve, p);
    const spread = i % 3 - 1;
    const side = spread * (2 + 3.5 * Math.sin(Math.PI * p));
    const radius = (2.6 + (i % 4) * 1.4) * (0.65 + 0.5 * p);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (i % 2 ? 0.35 : 0.5);
    ctx.strokeStyle = i % 2 ? '#8cced0' : '#e5f3de';
    ctx.lineWidth = i % 2 ? 1.15 : 1.55;
    ctx.beginPath();
    ctx.ellipse(x + side, y - side * 0.55, radius, 1.15 + radius * 0.19, -0.19, 0.28 + 0.2 * (i % 3), 2.27);
    ctx.stroke();
  }
}

function drawSpray(ctx: CanvasRenderingContext2D, [left, right]: Waterfall['foot'], time: number, phase: number) {
  ctx.fillStyle = '#eef7e9';
  const strength = right[0] - left[0];
  for (let i = 0; i < 13; i++) {
    const p = cycle(time * (0.92 + (i % 4) * 0.27) + i * 0.137 + phase);
    const cross = 0.16 + cycle(i * 0.618) * 0.68;
    const x = mix(left[0], right[0], cross) + (cross - 0.5) * strength * p * 0.45;
    const y = mix(left[1], right[1], cross) + p * 3 - Math.sin(p * Math.PI) * (3.6 + (i % 5) * 1.7);
    ctx.globalAlpha = Math.sin(p * Math.PI) * (i % 3 ? 0.44 : 0.65);
    ctx.beginPath();
    ctx.ellipse(x, y, 0.7 + (i % 4) * 0.36, 0.43 + (i % 3) * 0.26, -0.2, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, turn: number, tone: number) {
  const [base, lit] = leafColors[tone];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(size * turn, size);
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(0.02, -0.83);
  ctx.bezierCurveTo(0.74, -0.49, 0.68, 0.27, -0.13, 0.59);
  ctx.bezierCurveTo(-0.57, 0.13, -0.58, -0.34, 0.02, -0.83);
  ctx.fill();
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(0.02, -0.83);
  ctx.bezierCurveTo(0.74, -0.49, 0.68, 0.27, -0.13, 0.59);
  ctx.quadraticCurveTo(0.2, -0.02, 0.02, -0.83);
  ctx.fill();
  ctx.strokeStyle = '#7b542a';
  ctx.lineWidth = 0.064;
  ctx.beginPath();
  ctx.moveTo(-0.21, 0.79);
  ctx.quadraticCurveTo(0.01, 0.39, 0.065, -0.45);
  ctx.stroke();
  ctx.restore();
}

function drawLeaves(ctx: CanvasRenderingContext2D, lanes: readonly LeafLane[], time: number) {
  for (let lane = 0; lane < lanes.length; lane++) {
    const { origin: [originX, originY], drift, fall } = lanes[lane];
    for (let leaf = 0; leaf < 3; leaf++) {
      const index = lane * 3 + leaf;
      const life = 7.8 + (index % 5) * 0.86;
      const p = cycle(time / life + leaf / 3 + lane * 0.17);
      const sway = p * Math.PI * (3.6 + (index % 3) * 0.65) + index;
      const side = (leaf - 1) * 18;
      const x = originX + side + drift * p + Math.sin(sway) * (15 + (index % 4) * 4);
      const y = originY + (leaf % 3) * 17 + fall * p + 5 * Math.sin(sway * 0.8);
      const angle = Math.sin(sway - 0.5) * 0.98 - 0.32 + (index % 3) * 0.43;
      const turn = 0.29 + 0.71 * Math.abs(Math.cos(sway * 0.83 + index));
      ctx.globalAlpha = Math.min(1, p * 5, (1 - p) * 6) * (0.55 + (index % 4) * 0.095);
      drawLeaf(ctx, x, y, 7.9 + (index % 5) * 1.49, angle, turn, index % leafColors.length);
    }
  }
}

export function drawHeroAmbience(ctx: CanvasRenderingContext2D, time: number, variant: keyof typeof scenes) {
  const { feeder, waterfalls, leafLanes } = scenes[variant];
  ctx.save();
  drawCurrent(ctx, feeder, time, 0.15, 6);
  waterfalls.forEach((waterfall, i) => {
    const phase = i * 0.27;
    drawCascade(ctx, waterfall, time, phase);
    drawCurrent(ctx, waterfall.runoff, time, phase, 8);
    drawSpray(ctx, waterfall.foot, time, phase);
  });
  drawLeaves(ctx, leafLanes, time);
  ctx.restore();
}
