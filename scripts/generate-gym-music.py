"""Compose and synthesize the original gym battle loops (CC0 1.0)."""

import argparse
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

import numpy as np


RATE = 32_000
PITCH_CLASSES = dict(zip("C C# D D# E F F# G G# A A# B".split(), range(12)))


@dataclass(frozen=True)
class Score:
    tempo: int
    chords: str
    melody: str
    duty: float
    bass: tuple[tuple[int, int, int], ...]
    arpeggio: tuple[tuple[int, int], ...]
    kicks: tuple[int, ...]
    snares: tuple[int, ...]
    peak: float


# One row per bar, four sixteenth notes per group. "=" holds the previous note.
SCORES = {
    "kanto": Score(
        tempo=152,
        chords="D2m D2m A#1 C2  D2m F2 G2m A2  A#1 C2 D2m F2  G2m A#1 A1 A1",
        melody="""
            D5 = F5 A5 | G5 = F5 = | A5 = = G5 | F5 = E5 =
            D5 = A4 D5 | F5 = E5 D5 | A5 = C6 = | A5 = G5 =
            F5 = D5 F5 | A#5 = A5 = | F5 = = D5 | F5 G5 F5 D5
            E5 = G5 = | C6 = = A#5 | G5 = E5 G5 | E5 = C#5 =
            D5 = F5 A5 | D6 = C6 = | A5 = G5 A5 | F5 = E5 =
            F5 = A5 C6 | A5 = G5 = | F5 = C5 D5 | F5 = A5 =
            G5 = A#5 = | D6 = C6 A#5 | G5 = D5 = | G5 = F5 =
            E5 = A5 = | C#6 = E6 = | C#6 = A5 G5 | E5 = C#5 =
            A#5 = = A5 | F5 = D5 = | F5 = A#5 = | C6 = A#5 =
            G5 = E5 G5 | C6 = = B5 | C6 = D6 C6 | G5 = E5 =
            A5 = F5 D5 | A5 = C6 = | D6 = = C6 | A5 = F5 =
            G5 A5 C6 A5 | F5 = G5 A5 | C6 = A5 = | G5 = F5 =
            D6 = A#5 G5 | A#5 = D6 = | F6 = D6 C6 | A#5 = G5 =
            F5 = A#5 = | D6 = = C6 | A#5 = A5 = | F5 = D5 =
            E5 = A5 = | C#6 = E6 = | A6 = E6 C#6 | A5 = G5 =
            E5 = G5 A5 | C#6 = A5 = | G5 = E5 = | C#5 = - E5
        """,
        duty=0.50,
        bass=((0, 3, 0), (4, 2, 1), (7, 1, 0), (8, 3, 2), (12, 2, 0), (15, 1, 1)),
        arpeggio=((2, 1), (3, 2), (6, 0), (8, 3), (10, 2), (11, 1), (14, 2)),
        kicks=(0, 7, 8, 14),
        snares=(4, 12),
        peak=0.43,
    ),
    "johto": Score(
        tempo=138,
        chords="G2m D#2 C2m D2  G2m A#1 D#2 D2  C2m G2m F2 D2  D#2 C2m D2 D2",
        melody="""
            G4 = = - | - D5 = G4 | F5 = D5 = | A#4 = - A4
            G4 = = - | - A#4 = G4 | D#5 = D5 = | A#4 = G4 =
            C5 = C5 D#5 | G5 = = - | F5 = D#5 = | C5 = A#4 =
            A4 = = - | - F#5 = D5 | C5 = A4 = | F#4 = - A4
            G4 = D5 = | F5 = G5 = | A#5 = = G5 | F5 = D5 =
            F5 = D5 F5 | A#5 = A5 = | F5 = D5 = | C5 = A#4 =
            D#5 = F5 G5 | A#5 = G5 = | F5 = D#5 = | G5 = F5 =
            F#5 = = - | A5 = F#5 = | D5 = A4 = | F#4 = - D5
            C5 = G5 = | - G5 = A#5 | C6 = G5 D#5 | G5 = F5 =
            D5 = G5 = | - F5 = G5 | A#5 = = D6 | C6 = A#5 =
            A5 = C6 = | A5 = F5 = | G5 = A5 = | F5 = C5 =
            F#5 = A5 = | C6 = A5 = | F#5 = D5 = | A4 = C5 =
            G5 = A#5 = | D#6 = = A#5 | G5 = F5 G5 | A#5 = G5 =
            D#5 = G5 = | C6 = = A#5 | G5 = D#5 = | C5 = G4 =
            A4 = D5 = | F#5 = A5 = | C6 = A5 F#5 | A5 = D5 =
            F#5 = D5 = | C5 = A4 = | F#4 = A4 = | D5 = - F#4
        """,
        duty=0.25,
        bass=((0, 4, 0), (6, 2, 0), (9, 3, 1), (13, 2, 2)),
        arpeggio=((3, 2), (6, 3), (7, 2), (11, 1), (13, 2), (15, 1)),
        kicks=(0, 6, 9),
        snares=(4, 10, 12),
        peak=0.58,
    ),
    "hoenn": Score(
        tempo=160,
        chords="E2 A2 C#2m B1  E2 D2 A2 B1  C#2m A2 E2 B1  A2 D2 B1 B1",
        melody="""
            B4 = = E5 | G#5 = B5 = | E6 = = B5 | G#5 = F#5 =
            E5 = A5 = | C#6 = = A5 | E5 = F#5 A5 | C#6 = E6 =
            C#6 = B5 G#5 | E5 = G#5 = | C#6 = = B5 | G#5 = E5 =
            F#5 = B5 = | D#6 = C#6 = | B5 = F#5 = | D#5 = - B4
            E5 = = B4 | E5 = G#5 = | B5 = = G#5 | F#5 = E5 =
            A5 = = D5 | F#5 = A5 = | D6 = = C#6 | A5 = F#5 =
            E5 = A5 = | C#6 = B5 = | A5 = E5 F#5 | A5 = C#6 =
            D#6 = = B5 | F#5 = D#5 = | B4 = D#5 F#5 | B5 = D#6 =
            E6 = C#6 G#5 | A5 = G#5 E5 | G#5 = C#6 = | E6 = C#6 =
            A5 = = C#6 | E6 = F#6 = | E6 = C#6 A5 | B5 = C#6 =
            B5 = E6 = | G#6 = = E6 | B5 = G#5 = | E5 = B4 =
            F#5 = D#5 F#5 | B5 = D#6 = | F#6 = = D#6 | C#6 = B5 =
            A5 = E5 A5 | C#6 = E6 = | F#6 = E6 = | C#6 = A5 =
            D6 = A5 D6 | F#6 = A6 = | F#6 = E6 D6 | A5 = F#5 =
            B5 = D#6 = | F#6 = = D#6 | C#6 = B5 = | F#5 = D#5 =
            B4 D#5 F#5 B5 | D#6 = B5 = | F#5 = D#5 = | F#5 = - B4
        """,
        duty=0.375,
        bass=((0, 2, 0), (3, 1, 2), (5, 2, 1), (8, 2, 0), (11, 1, 1), (13, 3, 2)),
        arpeggio=((1, 1), (2, 2), (5, 3), (6, 2), (9, 1), (10, 2), (13, 3), (14, 2)),
        kicks=(0, 3, 8, 11, 14),
        snares=(4, 12),
        peak=0.45,
    ),
}


def midi(name):
    pitch, octave = name[:-1], int(name[-1])
    return 12 * (octave + 1) + PITCH_CLASSES[pitch]


def place(track, start, signal, volume, pan=0):
    index = round(start * RATE) % len(track)
    gains = volume * np.sqrt([(1 - pan) / 2, (1 + pan) / 2])
    first = min(len(signal), len(track) - index)
    track[index:index + first] += signal[:first, None] * gains
    track[:len(signal) - first] += signal[first:, None] * gains


def oscillator(note, seconds, duty):
    t = np.arange(round(seconds * RATE)) / RATE
    frequency = 440 * 2 ** ((note - 69) / 12)
    phase = 2 * np.pi * frequency * t
    wave = np.zeros_like(t)
    if duty is None:
        # The Game Boy wave channel can play back a short triangle waveform.
        wave = 2 * np.arcsin(np.sin(phase)) / np.pi
    else:
        # Band-limited pulse with gentler upper harmonics for headphone playback.
        for harmonic in range(1, min(10, int(12_000 / frequency)) + 1):
            weight = np.sin(np.pi * harmonic * duty) / harmonic ** 1.22
            wave += weight * np.cos(harmonic * phase)
        wave /= np.max(np.abs(wave))
    envelope = np.minimum(t / 0.005, 1) * np.clip((seconds - t) / 0.024, 0, 1)
    return wave * envelope * (0.84 + 0.16 * np.exp(-7 * t))


def percussion(seed):
    rng = np.random.default_rng(seed)
    t = np.arange(round(0.16 * RATE)) / RATE
    noise = rng.uniform(-1, 1, len(t))
    attack = np.minimum(t / 0.003, 1) * np.clip((0.16 - t) / 0.012, 0, 1)
    kick_phase = 2 * np.pi * (50 * t + 2.65 * (1 - np.exp(-32 * t)))
    kick = np.sin(kick_phase) * np.exp(-22 * t)
    softened = np.convolve(noise, [0.18, 0.44, 0.24, 0.14], mode="same")
    snare = (softened + 0.25 * np.sin(2 * np.pi * 145 * t) * np.exp(-22 * t)) * np.exp(-24 * t)
    hat = (noise - np.roll(noise, 1)) * 0.48 * np.exp(-51 * t)
    return kick * attack, snare * attack, hat * attack


def write_melody(track, phrase, start, step, duty, volume):
    notes = phrase.replace("|", " ").split()
    if len(notes) != 16:
        raise ValueError(f"Expected 16 sixteenth notes: {phrase}")
    for index, note in enumerate(notes):
        if note in ("-", "="):
            continue
        end = index + 1
        while end < len(notes) and notes[end] == "=":
            end += 1
        duration = (end - index - 0.10) * step
        emphasis = 1.0 if index % 4 == 0 else 0.91
        signal = oscillator(midi(note), duration, duty)
        place(track, start + index * step, signal, volume * emphasis, -0.23)


def render(score, seed):
    step = 15 / score.tempo
    bars = score.melody.strip().splitlines()
    chords = score.chords.split()
    if len(bars) != len(chords):
        raise ValueError("Each melody bar requires a chord")
    track = np.zeros((round(len(bars) * 16 * step * RATE), 2))
    kick, snare, hat = percussion(seed)
    for bar, (phrase, chord) in enumerate(zip(bars, chords)):
        start = bar * 16 * step
        root = midi(chord.removesuffix("m"))
        third = 3 if chord.endswith("m") else 4
        bass_notes = (root, root + 7, root + 12)
        arp_notes = (root + 24, root + 24 + third, root + 31, root + 36)
        write_melody(track, phrase, start, step, score.duty, 0.28 if bar < 8 else 0.3)

        for offset, length, tone in score.bass:
            signal = oscillator(bass_notes[tone], (length - 0.08) * step, None)
            place(track, start + offset * step, signal, 0.24)
        for offset, tone in score.arpeggio:
            signal = oscillator(arp_notes[tone], 0.88 * step, 0.125)
            place(track, start + offset * step, signal, 0.115 if bar % 4 else 0.13, 0.38)

        for offset in score.kicks:
            place(track, start + offset * step, kick, 0.21)
        phrase_turn = bar % 4 == 3 and bar < len(bars) - 1
        snare_hits = (*score.snares, 15) if phrase_turn else score.snares
        for offset in snare_hits:
            place(track, start + offset * step, snare, 0.19 if offset % 4 == 0 else 0.11, -0.08)
        for offset in range(2, 16, 2):
            place(track, start + offset * step, hat, 0.11 if offset % 4 == 2 else 0.055, 0.16)

    saturated = np.tanh(track * 1.65)
    # Ramp the very ends so wrapped percussion never clicks at the loop point.
    seam = np.linspace(0, 1, round(0.0025 * RATE))[:, None]
    saturated[:len(seam)] *= seam
    saturated[-len(seam):] *= seam[::-1]
    return score.peak * saturated / np.max(np.abs(saturated))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output directory for the synthesized tracks")
    output = parser.parse_args().output

    encoder = shutil.which("ffmpeg")
    if not encoder:
        import imageio_ffmpeg

        encoder = imageio_ffmpeg.get_ffmpeg_exe()
    output.mkdir(parents=True, exist_ok=True)
    for seed, (region, score) in enumerate(SCORES.items(), start=41):
        samples = render(score, seed)
        pcm = np.round(samples * 32_767).astype("<i2")
        subprocess.run(
            [encoder, "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le",
             "-ar", str(RATE), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "64k",
             str(output / f"gym-{region}.mp3")],
            input=pcm.tobytes(),
            check=True,
        )


if __name__ == "__main__":
    main()
