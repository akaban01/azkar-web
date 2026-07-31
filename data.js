/* Azkar content.
   Interface language is English; the dhikr itself stays in Arabic.

   A text entry is:
     body   — the Arabic dhikr, rendered RTL. Optional.
     note   — an English instruction, rendered LTR. Optional.
     repeat — repetition count, shown as a small English caption. Optional.

   `tracks[].src` may be null — the track then relies on user-imported audio. */

export const AZKAR = [
  {
    id: 'takbeerat',
    title: 'Eid Takbeerat',
    subtitle: 'Mishary Rashid Alafasy',
    glyph: '۝',
    accent: 'amber',
    counter: null,
    tracks: [
      // `large` keeps a file out of the automatic first-visit precache — it is
      // downloaded when the listener asks for it instead.
      { id: 'takbeerat-full', title: 'Full takbeerat', sub: '1 hour', src: 'audio/eid-takbeerat-full.mp3', large: true },
      { id: 'takbeerat-1', title: 'Short takbeerat', sub: '1 min', src: 'audio/eid-takbeerat.mp3' }
    ],
    text: [
      { body: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَلِلهِ الْحَمْدُ.' },
      { body: 'اللهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلهِ كَثِيرًا، وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا.' },
      { body: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، صَدَقَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَأَعَزَّ جُنْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.' },
      { body: 'لَا إِلَهَ إِلَّا اللهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ.' }
    ]
  },

  {
    id: 'ayatul-kursi',
    title: 'Ayatul Kursi',
    subtitle: 'Surah Al-Baqarah 255 — Alafasy',
    glyph: '﷽',
    accent: 'emerald',
    counter: null,
    tracks: [
      { id: 'kursi-1', title: 'Ayatul Kursi', src: 'audio/ayatul-kursi.mp3' }
    ],
    text: [
      {
        body:
          'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ ' +
          'لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ ' +
          'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ ' +
          'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۖ وَهُوَ الْعَلِيُّ الْعَظِيمُ'
      }
    ]
  },

  {
    id: 'kalima-tauheed',
    title: '4th Kalima — Kalima Tauheed',
    subtitle: 'Kalima Tauheed',
    glyph: '4',
    accent: 'violet',
    counter: 33,
    tracks: [
      { id: 'kalima-1', title: 'Kalima Tauheed', src: 'audio/kalima-tauheed.mp3' }
    ],
    text: [
      {
        body:
          'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، ' +
          'يُحْيِي وَيُمِيتُ، وَهُوَ حَيٌّ لَا يَمُوتُ أَبَدًا أَبَدًا، ' +
          'ذُو الْجَلَالِ وَالْإِكْرَامِ، بِيَدِهِ الْخَيْرُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.'
      }
    ]
  },

  {
    id: 'azkar-sabah',
    title: 'Morning Azkar',
    subtitle: 'Salman Al-Otaibi',
    glyph: '☀',
    accent: 'sky',
    counter: null,
    tracks: [
      { id: 'sabah-full', title: 'Morning Azkar (full)', src: 'audio/azkar-sabah.mp3' }
    ],
    textNote: 'Text follows the ordering in Hisn al-Muslim and is an independent reference — it is not time-synced to the recording.',
    text: [
      { body: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', note: 'Then recite Ayatul Kursi.' },
      { note: 'Recite Surah Al-Ikhlas, Al-Falaq and An-Nas.', repeat: 3 },
      {
        body:
          'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلهِ، وَالْحَمْدُ لِلهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، ' +
          'لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، ' +
          'وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.'
      },
      {
        note: 'Sayyidul Istighfar — the finest supplication for forgiveness.',
        body:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، ' +
          'أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، ' +
          'فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.'
      },
      {
        body:
          'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، ' +
          'فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.'
      },
      { body: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.', repeat: 3 },
      {
        body:
          'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، ' +
          'لَا إِلَهَ إِلَّا أَنْتَ.',
        repeat: 3
      },
      { body: 'حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.', repeat: 7 },
      {
        body: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        repeat: 3
      },
      { body: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', repeat: 3 },
      {
        body: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
        repeat: 3
      },
      { body: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.', repeat: 10 },
      { body: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ.', repeat: 100 },
      {
        body: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        repeat: 100
      }
    ]
  },

  {
    id: 'azkar-masa',
    title: 'Evening Azkar',
    subtitle: 'Salman Al-Otaibi',
    glyph: '☽',
    accent: 'indigo',
    counter: null,
    tracks: [
      { id: 'masa-full', title: 'Evening Azkar (full)', src: 'audio/azkar-masa.mp3' }
    ],
    textNote: 'Text follows the ordering in Hisn al-Muslim and is an independent reference — it is not time-synced to the recording.',
    text: [
      { body: 'أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', note: 'Then recite Ayatul Kursi.' },
      { note: 'Recite Surah Al-Ikhlas, Al-Falaq and An-Nas.', repeat: 3 },
      {
        body:
          'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلهِ، وَالْحَمْدُ لِلهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، ' +
          'لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، ' +
          'وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.'
      },
      {
        note: 'Sayyidul Istighfar — the finest supplication for forgiveness.',
        body:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، ' +
          'أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، ' +
          'فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.'
      },
      {
        body:
          'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، ' +
          'فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.'
      },
      { body: 'رَضِيتُ بِاللهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.', repeat: 3 },
      {
        body:
          'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، ' +
          'لَا إِلَهَ إِلَّا أَنْتَ.',
        repeat: 3
      },
      { body: 'حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.', repeat: 7 },
      {
        body: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        repeat: 3
      },
      { body: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', repeat: 3 },
      { body: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.', repeat: 10 },
      { body: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ.', repeat: 100 },
      {
        body: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        repeat: 100
      }
    ]
  }
];

const TRACKS = AZKAR.flatMap((s) => s.tracks);

/** Every bundled audio URL — the target for "Download all" and the storage count. */
export const ALL_AUDIO = TRACKS.map((t) => t.src).filter(Boolean);

/** Audio cached automatically on install. Excludes `large` files so a first
 *  visit does not pull tens of megabytes over a metered connection. */
export const PRECACHE_AUDIO = TRACKS.filter((t) => t.src && !t.large).map((t) => t.src);
