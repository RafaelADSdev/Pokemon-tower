"""Compose and synthesize the original Critter Defense score and cues (CC0 1.0)."""

import shutil
import subprocess
from pathlib import Path

import numpy as np


RATE = 32_000
TAU = 2 * np.pi
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "audio"


def new_track(seconds):
    return np.zeros((round(seconds * RATE), 2), dtype=np.float64)


def time_axis(seconds):
    return np.arange(round(seconds * RATE), dtype=np.float64) / RATE


def pitched(note, duration, voice, bend=0):
    t = time_axis(duration)
    hz = 440 * 2 ** ((note - 69) / 12)
    phase = TAU * hz * (t + bend * t * t / (2 * duration))

    if voice == "harp":
        wave = np.sin(phase) + 0.32 * np.sin(phase * 2 + 0.17) + 0.16 * np.sin(phase * 3)
        envelope = np.exp(-3.4 * t)
    elif voice == "bell":
        wave = np.sin(phase) + 0.34 * np.sin(phase * 2.008) * np.exp(-1.6 * t)
        wave += 0.17 * np.sin(phase * 3.91) * np.exp(-3.4 * t)
        envelope = np.exp(-2.7 * t)
    elif voice == "wood":
        wave = np.sin(phase) + 0.12 * np.sin(phase * 3) + 0.03 * np.sin(phase * 5)
        envelope = np.exp(-4.1 * t)
    else:
        wave = np.sin(phase + 0.25 * np.sin(t * 4)) + 0.18 * np.sin(phase * 2.002)
        envelope = 0.72 + 0.28 * np.sin(np.pi * t / duration)

    attack = 0.16 if voice == "pad" else 0.007
    release = 0.42 if voice == "pad" else min(duration * 0.3, 0.18)
    fade = np.clip(t / attack, 0, 1) * np.clip((duration - t) / release, 0, 1)
    return wave * envelope * fade


def drum(duration, frequency, seed):
    t = time_axis(duration)
    rng = np.random.default_rng(seed)
    noise = rng.uniform(-1, 1, len(t))
    noise = np.convolve(noise, np.ones(5) / 5, mode="same")
    wave = np.sin(TAU * (frequency * t + 5.6 * (1 - np.exp(-22 * t))))
    return (wave * np.exp(-10 * t) + noise * np.exp(-29 * t) * 0.42) * np.clip(t / 0.004, 0, 1)


def layer(track, start, signal, volume, pan=0):
    start = round(start * RATE) % len(track)
    stereo = volume * np.array([np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)])
    samples = signal[:, None] * stereo
    first = min(len(samples), len(track) - start)
    track[start:start + first] += samples[:first]
    track[:len(samples) - first] += samples[first:]


def score(tempo, chords, style):
    beat = 60 / tempo
    track = new_track(4 * len(chords) * beat)
    for measure, (root, third, fifth, top) in enumerate(chords):
        start = measure * 4 * beat
        layer(track, start, pitched(root, 4.18 * beat, "pad"), 0.20, -0.13)
        layer(track, start, pitched(fifth - 12, 4.06 * beat, "pad"), 0.082, 0.17)
        layer(track, start + 0.4 * beat, pitched(third, 3.3 * beat, "pad"), 0.052, -0.25)

        if style == "forest":
            phrase = ((0, root + 12), (0.75, fifth), (1.5, third), (2.35, top), (3.1, fifth + 12))
            voice, volume, sustain, echo = "harp", 0.26, 1.25, 0.15
        elif style == "cave":
            phrase = ((0.35, fifth + 12), (1.8, third + 12), (2.8, top))
            voice, volume, sustain, echo = "bell", 0.21, 2.1, 0.31
        else:
            phrase = ((0, root + 12), (0.5, fifth), (1.25, root + 12), (2, top), (2.75, third), (3.4, fifth))
            voice, volume, sustain, echo = "wood", 0.23, 0.9, 0.18
            for offset in (0, 1.6, 2.5):
                layer(track, start + offset * beat, drum(0.38, 49, measure + 24), 0.14, 0.16)

        for index, (offset, note) in enumerate(phrase):
            hit = pitched(note, sustain * beat, voice)
            pan = 0.24 if (index + measure) % 2 else -0.35
            layer(track, start + offset * beat, hit, volume, pan)
            layer(track, start + (offset + 0.42) * beat, hit, volume * echo, -pan)
            if style == "cave":
                layer(track, start + (offset + 0.88) * beat, hit, volume * 0.12, pan)
    return track


def effect(notes, duration, thump=None):
    track = new_track(duration)
    for start, note, length, voice, volume, bend in notes:
        layer(track, start, pitched(note, length, voice, bend), volume)
    if thump is not None:
        layer(track, 0, drum(*thump), 0.30)
    return track


def encode(encoder, name, track, *, music=False):
    channels = 2 if music else 1
    signal = np.tanh(track * 1.8)
    if channels == 1:
        signal = signal.mean(axis=1)
    pcm = np.round(signal * 32_767).astype("<i2").tobytes()
    subprocess.run(
        [encoder, "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(RATE),
         "-ac", str(channels), "-i", "-", "-c:a", "libmp3lame", "-b:a", "64k" if music else "40k",
         str(OUTPUT / f"{name}.mp3")],
        input=pcm,
        check=True,
    )


FOREST = (
    (50, 57, 64, 69), (46, 53, 60, 65), (53, 60, 67, 72), (48, 55, 62, 67),
    (50, 57, 65, 74), (43, 53, 62, 69), (46, 57, 64, 69), (45, 55, 61, 64),
)
CAVE = (
    (47, 54, 61, 66), (48, 55, 62, 67), (45, 52, 60, 64), (42, 52, 57, 61),
    (47, 54, 62, 69), (43, 50, 57, 62), (48, 55, 61, 65), (42, 52, 58, 61),
)
VOLCANO = (
    (45, 52, 60, 64), (45, 53, 60, 67), (41, 48, 57, 60), (40, 50, 56, 59),
    (45, 52, 59, 67), (43, 50, 55, 62), (41, 53, 60, 64), (40, 52, 56, 62),
)

EFFECTS = {
    "ui": ([(0, 74, 0.1, "wood", 0.78, 0.15)], 0.12, None),
    "place": ([(0, 57, 0.18, "wood", 0.54, 0.12), (0.055, 69, 0.22, "harp", 0.60, 0)], 0.30, (0.12, 108, 4)),
    "upgrade": ([(0, 62, 0.22, "harp", 0.46, 0), (0.08, 69, 0.21, "bell", 0.53, 0),
                 (0.17, 74, 0.35, "bell", 0.60, 0)], 0.54, None),
    "sell": ([(0, 76, 0.16, "bell", 0.49, 0), (0.062, 69, 0.22, "harp", 0.52, 0)], 0.31, None),
    "wave": ([(0, 43, 0.31, "wood", 0.70, 0), (0.16, 50, 0.42, "pad", 0.50, 0)], 0.61, (0.36, 64, 2)),
    "shot": ([(0, 67, 0.085, "wood", 0.73, 1.5)], 0.11, None),
    "impact": ([(0, 57, 0.14, "wood", 0.42, -0.64)], 0.16, (0.12, 103, 8)),
    "death": ([(0, 67, 0.14, "harp", 0.50, 0.19), (0.04, 74, 0.22, "bell", 0.42, 0.19)], 0.28, None),
    "leak": ([(0, 49, 0.23, "wood", 0.68, -0.36), (0.12, 44, 0.28, "wood", 0.50, -0.32)], 0.43, (0.2, 64, 5)),
    "pause": ([(0, 62, 0.22, "harp", 0.57, -0.15)], 0.25, None),
    "boss": ([(0, 38, 0.48, "pad", 0.66, 0.25), (0.12, 44, 0.35, "pad", 0.40, -0.19)], 0.57, (0.40, 51, 3)),
    "victory": ([(0, 57, 0.45, "harp", 0.43, 0), (0.12, 64, 0.39, "harp", 0.42, 0),
                 (0.24, 69, 0.5, "bell", 0.49, 0), (0.42, 73, 0.62, "bell", 0.48, 0),
                 (0.42, 76, 0.66, "bell", 0.42, 0), (0.42, 57, 0.69, "pad", 0.45, 0)], 1.18, None),
    "defeat": ([(0, 57, 0.34, "harp", 0.57, 0), (0.18, 52, 0.42, "harp", 0.53, 0),
                (0.36, 48, 0.64, "pad", 0.52, 0), (0.36, 45, 0.72, "pad", 0.60, 0)], 1.12, None),
}


def main():
    encoder = shutil.which("ffmpeg")
    if not encoder:
        import imageio_ffmpeg

        encoder = imageio_ffmpeg.get_ffmpeg_exe()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    encode(encoder, "forest", score(100, FOREST, "forest"), music=True)
    encode(encoder, "cave", score(84, CAVE, "cave"), music=True)
    encode(encoder, "volcano", score(112, VOLCANO, "volcano"), music=True)
    for name, (notes, duration, thump) in EFFECTS.items():
        encode(encoder, name, effect(notes, duration, thump))


if __name__ == "__main__":
    main()
