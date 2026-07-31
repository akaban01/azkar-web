# Azkar — offline audio PWA

An offline-first Progressive Web App for listening to azkar. Install it once and the
audio stays on the device permanently — no network needed afterwards.

The interface is in English; the dhikr itself is shown in Arabic.

**Live:** https://akaban01.github.io/azkar-web/

## Contents

| Dhikr | Audio | Reciter |
|---|---|---|
| Eid Takbeerat | ✅ 1 hour + 1 min | Mishary Rashid Alafasy |
| Ayatul Kursi (2:255) | ✅ 52 s | Mishary Rashid Alafasy |
| 4th Kalima (Tauheed) | ✅ 52 s | islamicsurah.com |
| Morning Azkar | ✅ 10:35 | Salman Al-Otaibi |
| Evening Azkar | ✅ 9:49 | Salman Al-Otaibi |

Any track can also be replaced with your own recording via **Add audio** — the file is
stored in IndexedDB on your device and works offline like the rest.

## Offline design

Two separate caches, which is the whole trick:

- `azkar-shell-v2` — HTML/CSS/JS. Versioned, and replaced on every deploy.
- `azkar-audio-v1` — the MP3s. **Never purged on activate**, so app updates never
  force a re-download of the audio.

Other details that make offline actually hold up:

- The service worker serves **HTTP Range requests** from the cached body, so seeking
  and scrubbing work while offline (browsers issue Range requests for `<audio>`).
- `navigator.storage.persist()` is requested on first load so the OS will not evict
  the cache under storage pressure.
- The hour-long takbeerat (70 MB) is flagged `large` and is **excluded from the
  automatic first-visit precache** — it downloads when you ask for it, via
  *Save offline* or *Download all*. Everything else (~21 MB) is cached on install.
- Playback position is saved per track, so long recitations resume where you left off.
- Media Session API integration gives lock-screen and headset controls.

## Features

- Background playback with lock-screen controls
- Playback speed (0.75× – 1.5×), repeat, resume-where-you-left-off
- Tasbih counter (33× on the 4th Kalima)
- Import your own audio for any track
- Storage panel showing exactly what is cached, with download / clear controls

## Local development

```bash
node .claude/serve.js
```

Then open <http://localhost:5173>. The bundled dev server supports Range requests so
local behaviour matches production. A service worker needs a secure context —
`localhost` qualifies, `file://` does not.

## Audio sources and rights

Recordings were obtained from freely accessible public sources and are included for
personal, non-commercial worship use. Attribution is listed in the app's Settings
screen.

- Ayatul Kursi — [everyayah.com](https://everyayah.com), Alafasy 128kbps
- Eid Takbeerat (1 min) — [archive.org/details/takbirat.al3id](https://archive.org/details/takbirat.al3id)
- Eid Takbeerat (1 hour) — Alafasy, via [archive.org](https://archive.org/details/20240528_20240528_1151)
- Morning & Evening Azkar — Salman Al-Otaibi, via [archive.org](https://archive.org)
- 4th Kalima — islamicsurah.com

**Note on rights.** The archive.org uploads carry no explicit licence. The 4th Kalima
file comes from islamicsurah.com, which asserts site-wide copyright and grants no
explicit reuse permission — it is the least clearly licensed item here and the most
likely candidate for replacement with your own recording. If you are a rights holder
and want something removed, open an issue and it will be taken down.

The Arabic texts for the morning and evening azkar follow the ordering in *Hisn
al-Muslim* and are provided as an independent reference — they are **not** claimed to
be time-synced to the recordings.
