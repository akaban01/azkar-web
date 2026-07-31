# الأذكار — Azkar Audio PWA

An offline-first Progressive Web App for listening to azkar. Install it once, and the
audio stays on the device permanently — no network needed afterwards.

**Live:** https://akaban01.github.io/azkar-web/

## Contents

| Dhikr | Audio | Reciter |
|---|---|---|
| تكبيرات العيد — Eid Takbeerat | ✅ | Mishary Rashid Alafasy |
| آية الكرسي — Ayatul Kursi (2:255) | ✅ | Mishary Rashid Alafasy |
| الكلمة الرابعة — 4th Kalima (Tauheed) | ⚠️ text only | — |
| أذكار الصباح — Morning Azkar | ✅ | Salman Al-Otaibi |
| أذكار المساء — Evening Azkar | ✅ | Salman Al-Otaibi |

The 4th Kalima ships with Arabic text and a repetition counter but **no bundled
recording** — the available recitations are commercial releases by named artists, so
they are not redistributed here. Use **إضافة صوت** on that screen to add your own file;
it is stored in IndexedDB on your device and works offline like the rest.

## Offline design

Two separate caches, which is the whole trick:

- `azkar-shell-v1` — HTML/CSS/JS. Versioned, and replaced on every deploy.
- `azkar-audio-v1` — the ~20 MB of MP3s. **Never purged on activate**, so app updates
  never force a re-download of the audio.

Other details that make offline actually hold up:

- The service worker serves **HTTP Range requests** from the cached body, so seeking
  and scrubbing work while offline (browsers issue Range requests for `<audio>`).
- `navigator.storage.persist()` is requested on first load so the OS will not evict
  the cache under storage pressure.
- Playback position is saved per track, so a 10-minute recitation resumes where you left off.
- Media Session API integration gives lock-screen / headset controls.

## Features

- Arabic-only, RTL interface
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

## Audio sources

All recordings were obtained from freely accessible public sources and are included
for personal, non-commercial worship use. Attribution is listed in the app's
Settings screen.

- Ayatul Kursi — [everyayah.com](https://everyayah.com), Alafasy 128kbps
- Eid Takbeerat — [archive.org/details/takbirat.al3id](https://archive.org/details/takbirat.al3id)
- Morning & Evening Azkar — Salman Al-Otaibi, via [archive.org](https://archive.org)

These uploads do not carry an explicit open licence. If you are a rights holder and
want a recording removed, open an issue and it will be taken down.

The Arabic texts for the morning and evening azkar follow the ordering in *Hisn
al-Muslim* and are provided as an independent reference — they are **not** claimed to
be time-synced to the recordings.
