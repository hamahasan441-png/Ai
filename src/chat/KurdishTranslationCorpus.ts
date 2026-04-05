/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Kurdish Sorani – English Translation Corpus                               ║
 * ║                                                                            ║
 * ║  Curated parallel sentence pairs from the KurdishBLARK InterdialectCorpus  ║
 * ║  (CKB-ENG) dataset. Organized by topic for Kurdish Sorani ↔ English       ║
 * ║  translation reference and language learning.                              ║
 * ║                                                                            ║
 * ║  Source: https://github.com/KurdishBLARK/InterdialectCorpus/tree/master/CKB-ENG ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

/** A single parallel translation pair. */
export interface TranslationPair {
  /** Kurdish Sorani (CKB) sentence */
  ckb: string
  /** English (ENG) translation */
  eng: string
}

/** A categorized group of translation pairs. */
export interface TranslationCategory {
  /** Category name in English */
  name: string
  /** Category name in Kurdish Sorani */
  nameKurdish: string
  /** Short description */
  description: string
  /** Parallel sentence pairs */
  pairs: TranslationPair[]
}

/**
 * Kurdish Sorani ↔ English parallel corpus sourced from the KurdishBLARK
 * InterdialectCorpus CKB-ENG dataset (649 aligned sentence pairs).
 *
 * Categories cover culture, education, society, news, human rights, and more.
 */
export class KurdishTranslationCorpus {
  private readonly categories: TranslationCategory[]

  constructor() {
    this.categories = KurdishTranslationCorpus.buildCorpus()
  }

  /** Get all translation categories. */
  getCategories(): TranslationCategory[] {
    return this.categories
  }

  /** Get a specific category by name (case-insensitive). */
  getCategory(name: string): TranslationCategory | undefined {
    const lower = name.toLowerCase()
    return this.categories.find(c => c.name.toLowerCase() === lower)
  }

  /** Get all translation pairs across every category. */
  getAllPairs(): TranslationPair[] {
    return this.categories.flatMap(c => c.pairs)
  }

  /** Get total number of parallel pairs. */
  get totalPairs(): number {
    return this.categories.reduce((sum, c) => sum + c.pairs.length, 0)
  }

  /** Get total number of categories. */
  get totalCategories(): number {
    return this.categories.length
  }

  /**
   * Search pairs whose English or Kurdish text contains the query.
   * Returns up to `limit` results.
   */
  search(query: string, limit = 10): TranslationPair[] {
    const q = query.toLowerCase()
    const results: TranslationPair[] = []
    for (const cat of this.categories) {
      for (const pair of cat.pairs) {
        if (pair.eng.toLowerCase().includes(q) || pair.ckb.includes(q)) {
          results.push(pair)
          if (results.length >= limit) return results
        }
      }
    }
    return results
  }

  /**
   * Get a random sample of pairs from a category (or all categories).
   */
  sample(count = 5, categoryName?: string): TranslationPair[] {
    const pool = categoryName
      ? (this.getCategory(categoryName)?.pairs ?? [])
      : this.getAllPairs()
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  // ── Corpus Data ────────────────────────────────────────────────────────────

  private static buildCorpus(): TranslationCategory[] {
    return [
      // ── Culture & Festivals ──────────────────────────────────────────────
      {
        name: 'Culture & Festivals',
        nameKurdish: 'کولتوور و فێستیڤاڵ',
        description: 'Kurdish cultural events, celebrations, and traditions',
        pairs: [
          {
            ckb: 'هەفتەی کولتووری کوردی لە شاری بڕۆسکلی پایتەختی بەلجیکا لە ڕۆژی دووەمدا بە هەڵپەڕکێ و گۆرانی بەردەوامە.',
            eng: 'The Kurdish Culture Week started with a march from Brouckere to Espagne squares.',
          },
          {
            ckb: 'بۆ شەشەمین ساڵ هەفتەی کولتووری کوردی لە شاری بڕۆکسل بەڕێوەدەچێت.',
            eng: 'The 6th edition of the Kurdish Culture Week has begun in Brussels.',
          },
          {
            ckb: 'لە مەیدانی ئیسپانیا کە چالاکییەکانی تێدا بەڕێوەدەچێت، چادرەکانی ئەنستیتوی کوردی بڕۆکسل، ڕێکخراوی مافی مرۆڤ و چادری کتێب و خواردنە کوردییەکان دانراوە.',
            eng: 'The event area in Espagne square included replicas of historical buildings in Kurdistan, a stand where Kurdish culture and cousine can be tasted, a stage for concerts, book stands.',
          },
          {
            ckb: 'لە قامشلۆ نەورۆز پیرۆزکرا',
            eng: 'Newroz celebrated in Qamislo',
          },
          {
            ckb: 'هەروەها لە فیلمەکەدا گۆرانی سۆرانی دەچڕدرێت و گۆڤەند و هەڵپەڕکێ دەگیردرێت و ئاماژە بە ژیانی گەریلاکانی کورد دەکرێت.',
            eng: 'Songs in the Sorani dialect and dances reference the daily lives of Kurdish guerillas.',
          },
        ],
      },

      // ── Language Rights & Education ──────────────────────────────────────
      {
        name: 'Language Rights & Education',
        nameKurdish: 'مافی زمان و پەروەردە',
        description: 'Mother language rights, education, and linguistic diversity',
        pairs: [
          {
            ckb: 'لە کۆی 200 وڵاتی جیهان، ئێران لەو دەگمەن وڵاتانەیە کە خوێندن و فێربوونی زمانی دایکیی تێیدا ڕێگەپێنەدراوە.',
            eng: 'Among 200 countries, Iran is one of the few in which reading and learning in mother language is prohibited.',
          },
          {
            ckb: 'کوشتنی زمانی دایکیی هەمان ڕەگەزپەرەستی و پاکتاوی نژادییە.',
            eng: 'Killing a mother tongue is the same as racism and ethnic cleansing.',
          },
          {
            ckb: 'کۆمەڵگایەک کە تاکە یەک زمان بە سەر زمانەکانی دیکەدا دەسەپێنیت، کۆمەڵگەیەکی ڕەگەزپەرەستە.',
            eng: 'A society that imposes only one language over other languages is a racist society.',
          },
          {
            ckb: '21ی فوریەی هەموو ساڵێک، وەبیرهێنەری ڕۆژێکی زۆر گرینگی جیهانییە.',
            eng: 'Each year February 21 is a reminder of the mother language.',
          },
          {
            ckb: 'یۆنسکۆ هەروەها سیستەمی فێرکاری چەند زمانەی بۆ ئەو وڵاتانەی کە دانیشتوانی لە چەند زمان و چەند نەتەوەی جیاواز پێک هاتوە، پێشنیار کرد.',
            eng: 'The UNESCO also proposed a multi-lingual curriculum for countries that include several languages and different nations.',
          },
          {
            ckb: 'زمانەکانی کوردی، تورکی، عەرەبی، بەلوچی و تورکەمەنی وەکوو زمانی دایکیی نەتەوەکانی دیکەی ئێران، پیشاندەری لایەنێک لە فەرهەنگ و کەسایەتی جیاوازی ئەو نەتەوانەیە.',
            eng: 'Kurdish, Turkish, Arabic, Baluchi and Turkmen languages, like the native language of nations in Iran, represent the different culture and personality of these nations.',
          },
          {
            ckb: 'لەشاری کاراسنۆدار-ی فیدراسیۆنی ڕووسیا کۆرسی زمانی کوردی بۆمندالان کرایەوە.',
            eng: 'A Kurdish language course has been started for children in the Russian city of Krasnodar.',
          },
          {
            ckb: 'ئانکۆسێ دەربارەی گرینگی زمانی دایکی وتی، کۆمەڵگە بەزمانی خۆی بوونی خۆی بەردەوام دەکات.',
            eng: 'Speaking on the importance of mother language, Ankosi said: Societies continue their existence with their languages.',
          },
        ],
      },

      // ── History & Heritage ──────────────────────────────────────────────
      {
        name: 'History & Heritage',
        nameKurdish: 'مێژوو و کەلەپوور',
        description: 'Kurdish historical events, places, and heritage',
        pairs: [
          {
            ckb: 'گوندی حاجیکاش شوێنی ژیانی هاوبەشی کورد و ئەرمەن بوو.',
            eng: 'Kurds and Armenians lived together in the village of Hacıkaş.',
          },
          {
            ckb: 'ئەو گوندە 3 جار لەلایەن دەوڵەتی تورکیاوە سوتێنرا.',
            eng: 'The village was burnt down three times by the Turkish state.',
          },
          {
            ckb: 'بەپێی زانیاریی هەندێک لە هاووڵاتییانی ئەو گوندە، مێژووی ئەو گوندە و پەرستگەکە دەگەڕێتەوە بۆ 3 هەزار ساڵ لەوە پێش و بۆ سەردەمی ئورارتوییەکان.',
            eng: 'According to some villagers, this church was built on the site of a 3 thousand years old temple of the Urartu period.',
          },
          {
            ckb: 'یەکێک لەو شوێنەوارانە پەرستگەی مێژوویی حاجی بوو.',
            eng: 'One of these buildings was the Haj Church, the historic Armenian Church.',
          },
          {
            ckb: 'گوندەکە لە دوای ئەو کۆمەڵکوژییە بەتەواوی چۆڵکرا.',
            eng: 'After the massacre, the village was completely vacated.',
          },
        ],
      },

      // ── Film & Arts ─────────────────────────────────────────────────────
      {
        name: 'Film & Arts',
        nameKurdish: 'فیلم و هونەر',
        description: 'Kurdish cinema, music, and artistic works',
        pairs: [
          {
            ckb: 'فیلمی کچانی ڕۆژ باس لە تێکۆشانی ژنانی کورد دەکات دژ بە چەتەکانی داعش.',
            eng: 'The Girls of the Sun film is about the Kurdish women\'s fight against ISIS gangs.',
          },
          {
            ckb: 'فیلمی \'کچانی ڕۆژ لە 71هەمین فێستیڤاڵی نێودەوڵەتیی کان لە فەرەنسا یەکێک بوو لەو 21 فیلم کە بۆ وەرگرتنی خەڵاتی زێڕین، لە پێشبڕکێدایە.',
            eng: '"Girls of the Sun" is among the 21 films running for the Golden Palm in the 71st International Film Festival, and was screened on Saturday for curious audiences.',
          },
          {
            ckb: 'ئاوازی چیا تیپی مۆسیقای گەریلا ئەمجارە کلیپێکی بۆ گۆرانییەکی نوێ بە ناوی "لە چیاوە بەرەو دەریا" ئامادە کرد و بڵاویکردەوە.',
            eng: 'Awazê Çiya music band composed of guerrillas has released a new song called "From mountains to seas".',
          },
          {
            ckb: 'فیلمی \'بۆ ئازادی\' کە لەبارەی بەرخۆدانی سوور بەرهەمهێنراوە، لە ناوەندی کلتور و هونەری محەمەد شێخۆ لە قامشلۆ نمایشکرا.',
            eng: 'The film Ji Bo Azadiyê (The end will be spectacular) about the resistance of Sur was screened at Mihemed Şêxo Culture and Art Center in Qamishlo.',
          },
          {
            ckb: '150 دەزگای چاپ و پەخش بە دەیان هەزار کتێبەوە بەشدارییان لە پێشانگاکەدا کرد، بەڵام لە کاتی ناساندنی بەرپرسە داسەپێنراوەکانی ئاکەپە بەسەر شارەوانیی وان دا ڕایگەیاند، فرۆشتنی کتێب بە زمانی کرد لە پێشانگاکەدا قەدەغەیە.',
            eng: '150 publishers are participating in the fair with tens of thousands of books, but municipal officials have banned the promotion and sale of books in Kurdish.',
          },
        ],
      },

      // ── Society & Civil Life ────────────────────────────────────────────
      {
        name: 'Society & Civil Life',
        nameKurdish: 'کۆمەڵگا و ژیانی مەدەنی',
        description: 'Civil organizations, society, and daily life in Kurdistan',
        pairs: [
          {
            ckb: 'بە هۆی پەتایی کۆڕۆناوە بەشێکی زۆر لە هاووڵاتیانی جیهان لە ماڵەکانی خۆیاندا دەمێننەوە.',
            eng: 'While people in most parts of the world remain in their homes due to the COVID-19 pandemic.',
          },
          {
            ckb: 'بوونی ئێوە خۆی لە خۆیدا سەرکەوتنە.',
            eng: 'Your presence alone is a victory.',
          },
          {
            ckb: 'ڕابوون لەدژی ستەمکاریی سەرکەوتنە.',
            eng: 'The very act of refusing oppression is a victory.',
          },
          {
            ckb: 'تاکە شتێک کە ئەوان دەیکوژن، ترسی ئێمەیە.',
            eng: 'All they have killed is our fear.',
          },
          {
            ckb: 'ئێمە بەم زمانە هەڵبەستمان خویندووەتەوە و وتەی خۆشمان بیستووە.',
            eng: 'We read our first poem and voiced our first beautiful saying in Kurdish.',
          },
        ],
      },

      // ── Human Rights ────────────────────────────────────────────────────
      {
        name: 'Human Rights',
        nameKurdish: 'مافی مرۆڤ',
        description: 'Human rights issues, political prisoners, and justice',
        pairs: [
          {
            ckb: 'یەک لە سێ ژنانی جیهان تووشی توندوتیژی، لێدان، زۆرکردنەوە بۆ پەیوەندیی سێکسی، دەستدرێژی، بووە.',
            eng: 'One in three women worldwide has been subjected to violence, beaten, forced to have sex, raped or mistreated.',
          },
          {
            ckb: 'یەک ملیارد ژنی سەرتاسەری جیهان تووشی دەستدرێژی بووە.',
            eng: 'One billion women worldwide have been raped or harassed.',
          },
          {
            ckb: 'ژنان ئامادە نین ئەم توندوتیژییە بەئاسایی بپەسێنن.',
            eng: 'Women refuse to assume passively this violence.',
          },
          {
            ckb: 'ڕێکخراوی نێونەتەوەیی بۆ مافی مرۆڤ داوای لە سەرۆکی تورکیا کرد، سیاسەتوانی کوردی گوڵسەر یلدرمی ئازاد بکات.',
            eng: 'The International Society for Human Rights (IGFM) has asked Turkish President Erdogan to release Kurdish politician Gülser Yildirim.',
          },
        ],
      },

      // ── Health & Pandemic ───────────────────────────────────────────────
      {
        name: 'Health & Pandemic',
        nameKurdish: 'تەندروستی و پەتا',
        description: 'Health issues, COVID-19, and medical topics',
        pairs: [
          {
            ckb: 'ئەو پەتایە بەسەر هەموو جیهاندا بڵاوبووەتەوە.',
            eng: 'The Covid-19 pandemic has spread around the world.',
          },
          {
            ckb: 'ئێمە نە نەخۆشخانەمان هەیە و نە دکتۆرمان.',
            eng: 'We have neither hospital nor doctors.',
          },
          {
            ckb: 'ئەگەر ڤایرۆسی کۆرۆنا بگاتەمان، ئاکامەکان لێرەسەن دەبن.',
            eng: 'If the coronavirus outbreak reaches us, the consequences will be devastating.',
          },
          {
            ckb: 'هیڤا سۆر ئاکوردی نەخۆشخانەیەکی 120 جێگەی بۆ بەرەنگاربوونەوەی ڤایرۆسی کۆرۆنا لە هەسەکێ دامەزراند.',
            eng: 'Heyva Sor a Kurd has established a 120-bed capacity hospital in Hesekê to fight the coronavirus pandemic.',
          },
          {
            ckb: 'قەدەغەی هاتووچۆ کە لە 23ی ئازاردا بە هۆی پەتای کۆرۆنا ڕاگەیێندرابوو، لە ناوچەکانی باکوور و ڕۆژهەڵاتی سوریا بەردەوامە.',
            eng: 'The curfew, which was announced on 23 March due to the coronavirus epidemic, continues in the northern and eastern Syria regions.',
          },
        ],
      },

      // ── News Headlines ──────────────────────────────────────────────────
      {
        name: 'News Headlines',
        nameKurdish: 'سەرخێنی هەواڵ',
        description: 'Short news headlines demonstrating concise translation patterns',
        pairs: [
          {
            ckb: 'داگیرکەران لە عەفرین بەربوونەتە یەکتری و شەڕ لەگەڵ یەک دەکەن',
            eng: 'Mercenaries clash among themselves in Afrin',
          },
          {
            ckb: 'ئیسرائیل بە موشەک لە سوریای دا',
            eng: 'Israel carries out new air strikes against Syria',
          },
          {
            ckb: 'بوومەلەرزەیەک بە ئاستی 4 لە ئەرزنجانی تورکیا ڕوویدا.',
            eng: 'A 4.0 magnitude earthquake occurred in Kemaliye, Erzincan.',
          },
          {
            ckb: 'هێزەکانی ئەمنیی ناوخۆ ئۆپەراسیۆنێکیان ئەنجامدا.',
            eng: 'Internal Security Forces launched an operation.',
          },
          {
            ckb: 'لە هێرشەکەدا تەلەفاتی گیانی نەبوو.',
            eng: 'There was no loss of life in the attack.',
          },
          {
            ckb: 'دەوڵەتی داگیرکەری تورک لە گرێ سپی هاوڵاتیەکی مەدەنی شەهید کرد',
            eng: 'Civilian from Gire Spi tortured to death by Turkish-backed gangs',
          },
        ],
      },

      // ── Inspirational & Poetic ──────────────────────────────────────────
      {
        name: 'Inspirational & Poetic',
        nameKurdish: 'هاندەر و شیعری',
        description: 'Inspirational quotes and poetic expressions in Kurdish',
        pairs: [
          {
            ckb: 'بوونی ئێوە خۆی لە خۆیدا سەرکەوتنە.',
            eng: 'Your presence alone is a victory.',
          },
          {
            ckb: 'شەڕکردن سەرکەوتنە.',
            eng: 'Fighting is a victory.',
          },
          {
            ckb: 'تاکە شتێک کە ئەوان دەیکوژن، ترسی ئێمەیە.',
            eng: 'All they have killed is our fear.',
          },
          {
            ckb: 'لە جێگەی هەر ژنێک کە ئێوە دەڕفێنن، شەڕڤانێکی نوێ دروست دەبێت.',
            eng: 'With each sister who was captured, a warrior was born.',
          },
        ],
      },

      // ── Legal & Political Vocabulary ─────────────────────────────────────
      {
        name: 'Legal & Political',
        nameKurdish: 'یاسایی و سیاسی',
        description: 'Legal terminology and political vocabulary from the corpus',
        pairs: [
          {
            ckb: 'لقی دووەمی دادگای ئینقلابی کرماشان، حوکمی 9 مانگ زیندانی بەسەر 4 چالاکوانی فەرهەنگی کوردی سەپاند.',
            eng: 'The Second Branch of the Kermanshah Revolutionary Court has sentenced four Kurdish cultural activists to 9 months prison each.',
          },
          {
            ckb: 'ئەو 4 چالاکوانە فەرهەنگییانە پاش لێکۆڵینەوەکان بە کەفاڵەت ئازادکران.',
            eng: 'These four cultural activists were released on bail after interrogations.',
          },
          {
            ckb: 'تەقینەوەی گوللـە خومپارەیەک گیانی هاووڵاتییەکی کوردی تەمەن 37 ساڵەی ئەستاند.',
            eng: 'The bomb explosion killed a 37-year-old citizen in Sarpol Zahab.',
          },
          {
            ckb: 'دوو هاووڵاتی لە پیرانشار بە هۆکاری نادیار دەسبەسەر کران.',
            eng: 'Arrest of two Kurdish citizens in Piranshahr for unknown reasons.',
          },
          {
            ckb: 'ئیدارەی فەرهەنگ و ئیرشادی ورمێ ئیزنی ڕێزگرتنیان بە "عوسمانە سوور" نەدا.',
            eng: 'Osman Mustafa Pour, most prominent Kurdish political prisoner still deprived of leaving.',
          },
        ],
      },

      // ── Key Vocabulary from Corpus ──────────────────────────────────────
      {
        name: 'Key Vocabulary',
        nameKurdish: 'وشەی سەرەکی',
        description: 'Important vocabulary items extracted from the parallel corpus',
        pairs: [
          {
            ckb: 'هاووڵاتی — citizen; دەوڵەت — state/government; زمان — language; زمانی دایکی — mother tongue',
            eng: 'hawlatî — citizen; dawlat — state/government; zman — language; zmanî dayikî — mother tongue',
          },
          {
            ckb: 'فیلم — film; گۆرانی — song; هونەر — art; کتێب — book; فێستیڤاڵ — festival',
            eng: 'fîlm — film; goranî — song; hunar — art; ktêb — book; fêstîval — festival',
          },
          {
            ckb: 'مافی مرۆڤ — human rights; ئازادی — freedom; دادوەری — justice; زیندان — prison',
            eng: 'mafî mirov — human rights; azadî — freedom; dadwerî — justice; zindan — prison',
          },
          {
            ckb: 'نەخۆشخانە — hospital; دکتۆر — doctor; تەندروستی — health; پەتا — pandemic',
            eng: 'nexoshxane — hospital; dktor — doctor; tandirustî — health; pata — pandemic',
          },
          {
            ckb: 'فێرکاری — education; قوتابخانە — school; مامۆستا — teacher; خوێندن — reading/studying',
            eng: 'fêrkarî — education; qutabxane — school; mamosta — teacher; xwêndin — reading/studying',
          },
          {
            ckb: 'کولتوور — culture; فەرهەنگ — culture/dictionary; مێژوو — history; کەلەپوور — heritage',
            eng: 'kultûr — culture; farhang — culture/dictionary; mêzhû — history; kalapûr — heritage',
          },
        ],
      },
    ]
  }
}
