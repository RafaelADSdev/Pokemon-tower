"""Synthesize the original elemental attack effects and Howler sprite offsets."""

import argparse
import shutil
import subprocess
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
RATE = 32_000
TAU = 2 * np.pi
GAP_MS = 52


def time_axis(milliseconds):
    return np.arange(milliseconds * RATE // 1000) / RATE


def envelope(t, onset, decay):
    attack = np.sin(np.pi / 2 * np.minimum(t / onset, 1)) ** 2
    release = np.minimum((t[-1] - t) / 0.014, 1) ** 2
    return attack * np.exp(-decay * t) * release


def sweep(milliseconds, start, end, partials, *, onset=0.005, decay=15):
    t = time_axis(milliseconds)
    speed = np.geomspace(start, end, len(t))
    phase = TAU / RATE * np.cumsum(speed)
    signal = sum(level * np.sin(phase * harmonic) for harmonic, level in partials)
    return signal * envelope(t, onset, decay)


def texture(milliseconds, band, seed, *, onset=0.005, decay=14):
    t = time_axis(milliseconds)
    white = np.random.default_rng(seed).normal(size=len(t))
    frequencies = np.fft.rfftfreq(len(t), 1 / RATE)
    low, high = band
    filter_gain = (1 - np.exp(-((frequencies / low) ** 4))) * np.exp(-((frequencies / high) ** 4))
    signal = np.fft.irfft(np.fft.rfft(white) * filter_gain, n=len(t))
    return signal / np.std(signal) * envelope(t, onset, decay)


def attack(milliseconds, *layers):
    track = np.zeros(len(time_axis(milliseconds)))
    for offset, gain, signal in layers:
        start = offset * RATE // 1000
        track[start:start + len(signal)] += gain * signal
    # Shape the transients gently while leaving room for other battle sounds.
    soft = np.tanh(track)
    return soft * min(0.68 / np.max(np.abs(soft)), 0.17 / np.std(soft))


PURE = ((1, 1),)
HOLLOW = ((1, 1), (2.02, 0.26), (3.03, 0.13))
CRUNCH = ((1, 1), (2.6, 0.29), (4.2, 0.18))
BUZZ = ((1, 1), (3, 0.29), (5, 0.17), (7, 0.1))
GLASS = ((1, 1), (2.14, 0.32), (3.9, 0.2))


def make_effects():
    return {
        "brasa-shot": attack(
            204,
            (0, 0.73, texture(204, (650, 4500), 41, onset=0.019, decay=13)),
            (4, 0.79, sweep(150, 380, 140, HOLLOW, onset=0.012)),
            (54, 0.25, texture(102, (2450, 4400), 42, decay=31)),
        ),
        "brasa-impact": attack(
            214,
            (0, 0.88, sweep(160, 228, 56, CRUNCH)),
            (0, 0.57, texture(170, (540, 4300), 43, decay=19)),
            (38, 0.27, texture(58, (2400, 5700), 44, decay=32)),
            (86, 0.18, texture(82, (1350, 6200), 45, decay=32)),
        ),
        "mare-shot": attack(
            191,
            (0, 0.28, texture(140, (1670, 6550), 51, onset=0.017, decay=12)),
            (4, 0.85, sweep(111, 420, 980, HOLLOW, decay=23)),
            (29, 0.64, sweep(105, 790, 282, PURE, decay=22)),
            (76, 0.27, sweep(105, 1270, 480, PURE, decay=25)),
        ),
        "mare-impact": attack(
            201,
            (0, 0.56, texture(171, (950, 7180), 52, decay=19)),
            (5, 0.71, sweep(134, 352, 112, HOLLOW, decay=22)),
            (24, 0.39, sweep(109, 1560, 548, PURE, decay=26)),
            (62, 0.32, sweep(118, 902, 225, PURE, decay=27)),
        ),
        "folha-shot": attack(
            169,
            (0, 0.58, texture(125, (1200, 5350), 61, onset=0.019, decay=14)),
            (15, 0.45, sweep(118, 740, 1520, PURE, onset=0.017, decay=17)),
            (54, 0.35, texture(105, (2300, 8460), 62, onset=0.009, decay=24)),
        ),
        "folha-impact": attack(
            153,
            (0, 0.67, texture(115, (1750, 5570), 63, decay=28)),
            (0, 0.52, sweep(107, 525, 184, HOLLOW, decay=21)),
            (37, 0.31, texture(106, (1180, 3700), 64, decay=20)),
        ),
        "faisca-shot": attack(
            172,
            (0, 0.55, texture(109, (1970, 8700), 71, decay=31)),
            (0, 0.78, sweep(73, 430, 2420, BUZZ, decay=19)),
            (60, 0.61, sweep(95, 2020, 470, BUZZ, decay=25)),
            (91, 0.25, texture(76, (3100, 8500), 72, decay=29)),
        ),
        "faisca-impact": attack(
            177,
            (0, 0.76, texture(103, (1960, 9650), 73, decay=28)),
            (0, 0.74, sweep(128, 1180, 161, BUZZ, decay=25)),
            (32, 0.31, sweep(110, 2110, 860, GLASS, decay=29)),
        ),
        "pedra-shot": attack(
            204,
            (0, 0.71, sweep(155, 245, 93, CRUNCH, decay=17)),
            (4, 0.58, texture(163, (240, 2420), 81, onset=0.009, decay=16)),
            (62, 0.36, sweep(126, 290, 148, CRUNCH, decay=24)),
        ),
        "pedra-impact": attack(
            221,
            (0, 0.93, sweep(177, 149, 48, HOLLOW, decay=13)),
            (0, 0.68, texture(157, (330, 2500), 82, decay=19)),
            (44, 0.31, sweep(120, 453, 288, CRUNCH, decay=27)),
            (88, 0.26, texture(129, (426, 2330), 83, decay=20)),
        ),
        "sombra-shot": attack(
            226,
            (0, 0.66, sweep(221, 742, 201, GLASS, onset=0.032, decay=10)),
            (13, 0.5, sweep(191, 510, 118, HOLLOW, onset=0.026, decay=10)),
            (25, 0.28, texture(184, (460, 2410), 91, onset=0.025, decay=13)),
        ),
        "sombra-impact": attack(
            236,
            (0, 0.77, sweep(195, 430, 68, HOLLOW, decay=14)),
            (9, 0.62, sweep(215, 913, 307, GLASS, decay=14)),
            (27, 0.30, texture(186, (650, 3690), 92, onset=0.021, decay=17)),
        ),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default=shutil.which("ffmpeg"))
    encoder = parser.parse_args().ffmpeg
    if not encoder:
        import imageio_ffmpeg

        encoder = imageio_ffmpeg.get_ffmpeg_exe()

    offset = GAP_MS
    gap = np.zeros(len(time_axis(GAP_MS)))
    bank = [gap]
    sprites = ["// Generated by scripts/generate-attack-audio.py.", "export const attackSprites = {"]
    for name, cue in make_effects().items():
        duration = len(cue) * 1000 // RATE
        sprites.append(f'  "{name}": [{offset}, {duration}],')
        bank.extend([cue, gap])
        offset += duration + GAP_MS
    sprites.append("} satisfies Record<string, [number, number]>;\n")

    output = ROOT / "public" / "audio" / "attack-sfx.mp3"
    pcm = np.round(np.concatenate(bank) * 32767).astype("<i2").tobytes()
    subprocess.run(
        [encoder, "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(RATE),
         "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "56k", str(output)],
        input=pcm,
        check=True,
    )
    (ROOT / "src" / "audio" / "attackSprites.ts").write_text("\n".join(sprites), encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
