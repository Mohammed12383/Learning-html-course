#!/usr/bin/env python3
"""
The soundtrack for a course video, made from scratch with numpy (no samples, no downloads):
calm background music (soft keys, pad, bass and drums) plus small sounds for typing,
pop-ins, swooshes and chimes, placed at the times the video recorded.

    python3 video/audio.py events.json out.wav

events.json = {"duration": seconds, "offset": seconds, "events": [{"t": 1.2, "type": "key"}, ...]}
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(seconds):
    return np.arange(int(seconds * SR)) / SR


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def env_ad(n, attack, decay):
    t = np.arange(n) / SR
    e = np.exp(-t / decay)
    a = int(attack * SR)
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e


# ---------------- instruments ----------------
def keys(f, length=2.2):
    """A soft electric piano (FM): bright at the start, mellow as it rings."""
    t = tt(length)
    index = 1.6 * np.exp(-t / 0.25) + 0.25
    y = np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * t))
    y += 0.12 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.08)   # a little "tine"
    return y * env_ad(len(t), 0.004, 0.9) * 0.22


def pad(f, length):
    t = tt(length)
    y = np.zeros_like(t)
    for d in (-0.12, 0.0, 0.11):                     # three slightly detuned voices
        ff = f * 2 ** (d / 12)
        y += np.sin(2 * np.pi * ff * t) + 0.18 * np.sin(4 * np.pi * ff * t)
    e = np.ones_like(t)
    a, r = int(0.9 * SR), int(1.0 * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return y * e * 0.035


def bass(f, length):
    t = tt(length)
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    e = env_ad(len(t), 0.01, 0.5)
    e[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))
    return y * e * 0.16


def pluck(f, length=0.7):
    """A small marimba-like note for the occasional sparkle melody."""
    t = tt(length)
    y = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3.99 * f * t) * np.exp(-t / 0.05)
    return y * env_ad(len(t), 0.002, 0.22) * 0.07


def kick():
    t = tt(0.4)
    f = 45 + 75 * np.exp(-t / 0.05)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_ad(len(t), 0.002, 0.16) * 0.42


def snare():
    t = tt(0.25)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 1800)                       # keep the bright part
    n = onepole_lp(n, 7000)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    return (0.5 * n * env_ad(len(t), 0.001, 0.06) + 0.3 * tone) * 0.16


def hat(open_=False):
    t = tt(0.18 if open_ else 0.06)
    n = rng.standard_normal(len(t))
    n = onepole_lp(n - onepole_lp(n, 6500), 10000)
    return n * env_ad(len(t), 0.0005, 0.05 if open_ else 0.014) * 0.04


# ---------------- sound effects ----------------
def sfx_key():
    t = tt(0.03)
    n = rng.standard_normal(len(t))
    n = n - onepole_lp(n, 2500)
    f = rng.uniform(1700, 2600)
    y = 0.6 * n + np.sin(2 * np.pi * f * t)
    return y * env_ad(len(t), 0.0003, 0.006) * 0.05


def sfx_click():
    t = tt(0.05)
    y = np.sin(2 * np.pi * 1400 * t) + 0.5 * rng.standard_normal(len(t))
    return y * env_ad(len(t), 0.0003, 0.01) * 0.12


def sfx_pop():
    t = tt(0.16)
    f = 520 + 520 * (1 - np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_ad(len(t), 0.002, 0.045) * 0.13


def sfx_whoosh():
    t = tt(0.9)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    # a band of noise that sweeps up and down
    lo = onepole_lp(n, 600)
    hi = onepole_lp(n, 3000)
    mix = np.sin(np.pi * t / t[-1])
    out = (lo * (1 - mix) + (hi - lo) * mix * 1.4)
    e = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2
    return out * e * 0.10


def sfx_chime():
    y = np.zeros(int(1.6 * SR))
    for k, (m, d) in enumerate([(88, 0.0), (95, 0.09)]):    # E6 then B6
        t = tt(1.5)
        f = midi(m)
        tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.2)
        s = int(d * SR)
        y[s:s + len(t)] += tone * env_ad(len(t), 0.002, 0.45) * 0.06
    return y


# ---------------- the music ----------------
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
PROG_A = [((53, 57, 60, 64), 41), ((52, 55, 59, 62), 40), ((50, 53, 57, 60), 38), ((48, 52, 55, 59), 36)]   # Fmaj7 Em7 Dm7 Cmaj7
PROG_B = [((57, 60, 64, 67), 45), ((57, 60, 62, 65), 38), ((55, 59, 62, 65), 43), ((55, 59, 60, 64), 36)]   # Am7 Dm7 G7 Cmaj7


def add(buf, start, sig, pan=0.0):
    s = int(start * SR)
    if s >= buf.shape[1] or s + len(sig) <= 0:
        return
    if s < 0:
        sig = sig[-s:]
        s = 0
    e = min(buf.shape[1], s + len(sig))
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[0, s:e] += sig[:e - s] * l
    buf[1, s:e] += sig[:e - s] * r


def music(duration):
    buf = np.zeros((2, int(duration * SR) + SR * 4), dtype=np.float32)
    K, S, H, HO = kick(), snare(), hat(), hat(True)
    bars = int(duration / BAR) + 1
    for b in range(bars):
        t0 = b * BAR
        section = (b // 16) % 2
        chord, root = (PROG_A if section == 0 else PROG_B)[b % 4]
        add(buf, t0, sum(pad(midi(m), BAR + 1.0) for m in chord), 0.0)
        if b < 2:
            continue   # a soft start: just the pad
        # keys: on 1, and a syncopated hit on the "and" of 2
        for at, vel in ((0, 1.0), (1.5, 0.7), (3.0, 0.55)):
            for k, m in enumerate(chord):
                add(buf, t0 + at * BEAT + k * 0.012, keys(midi(m + 12)) * vel, -0.25 + 0.17 * k)
        # bass
        add(buf, t0, bass(midi(root), BEAT * 1.8), 0)
        add(buf, t0 + 2.5 * BEAT, bass(midi(root + 7), BEAT * 1.2), 0)
        # drums (light swing), with a breather every 8th bar
        if b % 8 != 7:
            add(buf, t0, K, 0)
            add(buf, t0 + 2.5 * BEAT, K * 0.7, 0)
            add(buf, t0 + BEAT, S, 0.1)
            add(buf, t0 + 3 * BEAT, S, 0.1)
            for e in range(8):
                swing = 0.06 * BEAT if e % 2 else 0
                add(buf, t0 + e * BEAT / 2 + swing, (HO if e == 7 else H) * (1.0 if e % 2 == 0 else 0.65), 0.35)
        # a sparkle melody now and then, from the chord's notes
        if b % 4 in (1, 3):
            notes = [m + 24 for m in chord]
            for i in range(int(rng.integers(2, 5))):
                at = t0 + float(rng.choice([0.5, 1, 1.5, 2, 2.5, 3, 3.5])) * BEAT
                add(buf, at, pluck(midi(int(rng.choice(notes)))), float(rng.uniform(-0.6, 0.6)))
    return buf


def main():
    ev = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    D = float(ev['duration'])
    off = float(ev.get('offset', 0))
    mus = music(D + off)[:, int(off * SR):int(off * SR) + int(D * SR)]
    # fade in and out
    n = mus.shape[1]
    fi, fo = int(1.5 * SR), int(4 * SR)
    mus[:, :fi] *= np.linspace(0, 1, fi)
    mus[:, -fo:] *= np.linspace(1, 0, fo)
    mix = mus * 0.72
    cache = {'pop': sfx_pop(), 'whoosh': sfx_whoosh(), 'chime': sfx_chime(), 'click': sfx_click()}
    keyset = [sfx_key() for _ in range(12)]
    last_key = -1.0
    for e in ev['events']:
        t = float(e['t']) - off
        if t < 0 or t >= D:
            continue
        kind = e['type']
        if kind == 'key':
            if t - last_key < 0.045:
                continue
            last_key = t
            add(mix, t, keyset[int(rng.integers(len(keyset)))], float(rng.uniform(-0.2, 0.2)))
        elif kind in cache:
            add(mix, t, cache[kind], 0.0)
    mix = np.tanh(mix * 1.1) * 0.9          # gentle limiter
    pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2').T.copy()
    with wave.open(out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    peak = float(np.abs(mix).max())
    rms = float(np.sqrt((mix ** 2).mean()))
    print('Soundtrack: %.1fs, peak %.2f, loudness %.1f dBFS' % (D, peak, 20 * np.log10(max(rms, 1e-9))))


if __name__ == '__main__':
    main()
