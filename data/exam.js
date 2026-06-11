// ============================================================================
//  Test de niveau japonais (N5) — banque de questions + moteur de correction
// ----------------------------------------------------------------------------
//  Questions en français, réponses attendues en japonais (rōmaji accepté,
//  kana en bonus). Trois niveaux par section :
//    N1 — Reconnaissance (QCM, appariement)
//    N2 — Production guidée (phrase à trous, conjugaison, transformation)
//    N3 — Production libre (traduction FR → JP, mise en situation)
// ============================================================================

// --- Métadonnées des sections ------------------------------------------------
const EXAM_SECTIONS = [
  { id: "desu",           title: "Desu / masu + question (ka)" },
  { id: "demonstratives", title: "Démonstratifs ko-so-a-do" },
  { id: "possession",     title: "La possession (の)" },
  { id: "existence",      title: "imasu / arimasu" },
  { id: "position",       title: "Positions spatiales" },
  { id: "invitations",    title: "Invitations (-mashō / -masen ka)" },
  { id: "movement",       title: "Bouger ensemble (issho ni)" },
  { id: "particles",      title: "Les particules" },
  { id: "places",         title: "Lieux classiques" },
  { id: "time",           title: "Le temps : jours & moments" },
  { id: "timeq",          title: "Questions sur le temps" },
  { id: "verbs",          title: "Verbes en -masu" },
  { id: "adjectives",     title: "Adjectifs i / na" },
  { id: "colors",         title: "Les couleurs" },
  { id: "intensity",      title: "Intensités & fréquences" },
  { id: "self",           title: "Parler de soi" },
  { id: "katakana",       title: "Katakana" },
];

// Sections classiquement difficiles (mode « Mes points faibles »).
const EXAM_WEAK_SECTIONS = ["particles", "adjectives", "invitations", "katakana"];

const EXAM_SECTION_TITLE = {};
EXAM_SECTIONS.forEach(s => { EXAM_SECTION_TITLE[s.id] = s.title; });

// --- Banque de questions -----------------------------------------------------
// Champs communs : sectionId, difficulty (N1|N2|N3), type, prompt, explanation.
//   mcq        → options[], correctIndex
//   match      → pairs[{l, r}]  (l = français, r = rōmaji attendu)
//   fill_blank / conjugate / transform / translate / katakana
//              → blanks (défaut 1), accepted [[variantes blanc 1], …], kana?
//   situation  → requiredParts[], model
const EXAM_QUESTIONS = [
  // ---- 1. Desu / masu + ka --------------------------------------------------
  { sectionId: "desu", difficulty: "N1", type: "mcq",
    prompt: "Comment dit-on poliment « Je suis étudiant » ?",
    options: ["Watashi wa gakusei desu", "Watashi wa gakusei da", "Watashi gakusei ka desu", "Gakusei wa watashi desu"],
    correctIndex: 0,
    explanation: "Phrase nominale polie = Nom + です. だ est la forme familière." },
  { sectionId: "desu", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Anata wa sensei ___ ka. » (Êtes-vous professeur ?)",
    accepted: [["desu"]],
    explanation: "Question polie = … です + か placé tout à la fin." },
  { sectionId: "desu", difficulty: "N2", type: "transform",
    prompt: "Mettez « gakusei desu » à la forme négative polie.",
    accepted: [["gakusei ja arimasen", "gakusei dewa arimasen", "gakusei ja nai desu", "gakusei janai desu"]],
    explanation: "Négation de です → じゃ ありません / では ありません (plus formel)." },
  { sectionId: "desu", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Ce n'est pas un professeur. »",
    accepted: [["sensei ja arimasen", "sensei dewa arimasen", "sensei ja nai desu", "sensei janai desu"]],
    explanation: "Piège : じゃ ありません (familier-poli) ou では ありません (formel), pas だ." },

  // ---- 2. Démonstratifs ko-so-a-do -----------------------------------------
  { sectionId: "demonstratives", difficulty: "N1", type: "mcq",
    prompt: "« kore » et « kono » : lequel se place DEVANT un nom ?",
    options: ["kono (kono hon = ce livre)", "kore (kore hon)", "les deux", "aucun des deux"],
    correctIndex: 0,
    explanation: "kore = pronom (employé seul). kono = + nom. kore ≠ kono !" },
  { sectionId: "demonstratives", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « ___ hon wa watashi no desu. » (CE livre-ci est à moi)",
    accepted: [["kono"]],
    explanation: "Devant un nom → kono / sono / ano / dono." },
  { sectionId: "demonstratives", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « ___ wa nan desu ka. » (Qu'est-ce que c'est, ça là-bas ? — pronom, objet éloigné)",
    accepted: [["are"]],
    explanation: "kore (près de moi) / sore (près de toi) / are (loin des deux)." },
  { sectionId: "demonstratives", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Ce parapluie-ci est à moi. »",
    accepted: [["kono kasa wa watashi no desu"]],
    explanation: "kono + nom, puis possession avec の." },

  // ---- 3. Possession (no) ---------------------------------------------------
  { sectionId: "possession", difficulty: "N1", type: "mcq",
    prompt: "Comment dit-on « le livre du professeur » ?",
    options: ["sensei no hon", "hon no sensei", "sensei wa hon", "sensei hon no"],
    correctIndex: 0,
    explanation: "A no B = « le B de A ». L'ordre est l'inverse du français." },
  { sectionId: "possession", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Kore wa watashi ___ kasa desu. » (C'est mon parapluie)",
    accepted: [["no"]],
    explanation: "の relie le possesseur au possédé : watashi no kasa." },
  { sectionId: "possession", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « C'est la voiture de mon ami. »",
    accepted: [["tomodachi no kuruma desu", "watashi no tomodachi no kuruma desu"]],
    explanation: "tomodachi no kuruma = la voiture de (mon) ami." },

  // ---- 4. imasu / arimasu ---------------------------------------------------
  { sectionId: "existence", difficulty: "N1", type: "mcq",
    prompt: "Quel verbe pour « Il y a un chat » ?",
    options: ["imasu (neko ga imasu)", "arimasu", "desu", "narimasu"],
    correctIndex: 0,
    explanation: "imasu = êtres vivants (animés). arimasu = objets / plantes." },
  { sectionId: "existence", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Tsukue no ue ni hon ga ___. » (Il y a un livre sur le bureau)",
    accepted: [["arimasu"]],
    explanation: "Objet inanimé → arimasu. Le sujet est marqué par が." },
  { sectionId: "existence", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Niwa ni inu ga ___. » (Il y a un chien dans le jardin)",
    accepted: [["imasu"]],
    explanation: "Un chien est vivant → imasu." },
  { sectionId: "existence", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Il y a un professeur dans la classe. »",
    accepted: [["kyoushitsu ni sensei ga imasu", "kurasu ni sensei ga imasu"]],
    explanation: "Lieu + に, sujet + が, et imasu car le professeur est vivant." },

  // ---- 5. Positions spatiales ----------------------------------------------
  { sectionId: "position", difficulty: "N1", type: "match",
    prompt: "Reliez chaque position à son rōmaji.",
    pairs: [
      { l: "dessus", r: "ue" },
      { l: "dessous", r: "shita" },
      { l: "dedans", r: "naka" },
      { l: "devant", r: "mae" },
      { l: "derrière", r: "ushiro" },
    ],
    explanation: "Structure : A wa B no [position] ni arimasu/imasu." },
  { sectionId: "position", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Hon wa tsukue no ___ ni arimasu. » (Le livre est SUR le bureau)",
    accepted: [["ue"]],
    explanation: "tsukue no ue ni = sur le bureau. La position se place avec の … に." },
  { sectionId: "position", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Le chat est sous la chaise. »",
    accepted: [["neko wa isu no shita ni imasu"]],
    explanation: "Position avec の…に, et imasu car le chat est vivant." },

  // ---- 6. Invitations -------------------------------------------------------
  { sectionId: "invitations", difficulty: "N1", type: "mcq",
    prompt: "« Tabemashō » signifie :",
    options: ["Mangeons !", "Voulez-vous manger ?", "Je ne mange pas", "J'ai mangé"],
    correctIndex: 0,
    explanation: "-mashō = « faisons … ». -masen ka = « voulez-vous … ? »" },
  { sectionId: "invitations", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Issho ni eiga o mi___ ka. » (Voulez-vous regarder un film ensemble ?)",
    accepted: [["masen"]],
    explanation: "Invitation polie = verbe en -masen + ka (mimasen ka)." },
  { sectionId: "invitations", difficulty: "N2", type: "transform",
    prompt: "Transformez « ikimasu » en invitation « allons-y ».",
    accepted: [["ikimashou", "ikimasho"]],
    explanation: "-masu → -mashō pour proposer de faire ensemble." },
  { sectionId: "invitations", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Prenons un café. »",
    accepted: [["koohii o nomimashou", "koohii o nomimasho"]],
    explanation: "nomimasu → nomimashō (« buvons »). Objet marqué par を." },

  // ---- 7. Bouger ensemble (issho ni) ---------------------------------------
  { sectionId: "movement", difficulty: "N1", type: "mcq",
    prompt: "« Issho ni » veut dire :",
    options: ["ensemble", "seul", "bientôt", "souvent"],
    correctIndex: 0,
    explanation: "issho ni + verbe de déplacement = faire le trajet ensemble." },
  { sectionId: "movement", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Issho ni gakkou ___ ikimasen ka. » (particule de destination)",
    accepted: [["e", "he", "ni"]],
    explanation: "Destination → へ (écrit « e » en rōmaji) ou に." },
  { sectionId: "movement", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Voulez-vous aller au restaurant ensemble ? »",
    accepted: [["issho ni resutoran ni ikimasen ka", "issho ni resutoran e ikimasen ka"]],
    explanation: "issho ni + lieu + に/へ + ikimasen ka." },

  // ---- 8. Particules --------------------------------------------------------
  { sectionId: "particles", difficulty: "N1", type: "mcq",
    prompt: "« Je bois du café » : Koohii ___ nomimasu.",
    options: ["o", "ga", "ni", "de"],
    correctIndex: 0,
    explanation: "Le complément d'objet direct est marqué par を (« o »)." },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez (2 blancs) : « Toshokan ___ hon ___ yomimasu. » (Je lis des livres à la bibliothèque)",
    blanks: 2,
    accepted: [["de"], ["o"]],
    explanation: "で = lieu d'une action ; を = objet direct." },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Uchi ___ benkyou shimasu. » (J'étudie à la maison — lieu d'une action)",
    accepted: [["de"]],
    explanation: "Piège ni / de : で marque le lieu où se déroule l'action." },
  { sectionId: "particles", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Je mange du pain à la maison. »",
    accepted: [["uchi de pan o tabemasu", "ie de pan o tabemasu"]],
    explanation: "Lieu d'action → で, objet → を." },

  // ---- 9. Lieux classiques --------------------------------------------------
  { sectionId: "places", difficulty: "N1", type: "mcq",
    prompt: "Que signifie « toshokan » ?",
    options: ["bibliothèque", "école", "gare", "banque"],
    correctIndex: 0,
    explanation: "toshokan = bibliothèque ; gakkō = école ; eki = gare ; ginkō = banque." },
  { sectionId: "places", difficulty: "N1", type: "mcq",
    prompt: "Que signifie « eki » ?",
    options: ["gare", "bureau de poste", "hôpital", "supermarché"],
    correctIndex: 0,
    explanation: "eki = gare. On y prend le train : eki de densha ni norimasu." },
  { sectionId: "places", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Eki ___ densha o machimasu. » (J'attends le train à la gare)",
    accepted: [["de"]],
    explanation: "で car l'attente est une action qui se déroule à la gare." },
  { sectionId: "places", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Je vais à la banque. »",
    accepted: [["ginkou ni ikimasu", "ginkou e ikimasu"]],
    explanation: "Destination → に / へ avec ikimasu." },

  // ---- 10. Jours & moments --------------------------------------------------
  { sectionId: "time", difficulty: "N1", type: "match",
    prompt: "Reliez chaque jour à son rōmaji.",
    pairs: [
      { l: "lundi", r: "getsuyoubi" },
      { l: "mardi", r: "kayoubi" },
      { l: "mercredi", r: "suiyoubi" },
      { l: "jeudi", r: "mokuyoubi" },
      { l: "vendredi", r: "kinyoubi" },
    ],
    explanation: "…曜日 (yōbi) = jour de la semaine." },
  { sectionId: "time", difficulty: "N1", type: "mcq",
    prompt: "Que signifie « ashita » ?",
    options: ["demain", "hier", "aujourd'hui", "ce soir"],
    correctIndex: 0,
    explanation: "kinō = hier, kyō = aujourd'hui, ashita = demain." },
  { sectionId: "time", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « ___ no asa, jogingu o shimasu. » (Hier matin, j'ai fait du jogging)",
    accepted: [["kinou"]],
    explanation: "Combinaison : kinō no asa = hier matin." },
  { sectionId: "time", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « demain après-midi »",
    accepted: [["ashita no gogo"]],
    explanation: "On relie les deux repères temporels avec の : ashita no gogo." },

  // ---- 11. Questions sur le temps ------------------------------------------
  { sectionId: "timeq", difficulty: "N1", type: "mcq",
    prompt: "Pour demander l'heure, on dit :",
    options: ["Ima nanji desu ka", "Ima itsu desu ka", "Ima dare desu ka", "Ima doko desu ka"],
    correctIndex: 0,
    explanation: "nan-ji = quelle heure ; itsu = quand ; dare = qui ; doko = où." },
  { sectionId: "timeq", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Kyou wa nan___ desu ka. » (Quel jour sommes-nous ?)",
    accepted: [["youbi"]],
    explanation: "nan-yōbi = quel jour de la semaine." },
  { sectionId: "timeq", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Quelle heure est-il maintenant ? »",
    accepted: [["ima nanji desu ka"]],
    explanation: "Ima nan-ji desu ka — l'interrogatif vient avant です ka." },

  // ---- 12. Verbes en -masu --------------------------------------------------
  { sectionId: "verbs", difficulty: "N1", type: "mcq",
    prompt: "Forme passée polie de « tabemasu » :",
    options: ["tabemashita", "tabemasen", "tabemasu", "tabemasen deshita"],
    correctIndex: 0,
    explanation: "masu → mashita (passé), masen (nég.), masen deshita (nég. passé)." },
  { sectionId: "verbs", difficulty: "N2", type: "conjugate",
    prompt: "Mettez « nomimasu » à la forme négative passée.",
    accepted: [["nomimasen deshita"]],
    explanation: "Négatif passé = -masen deshita." },
  { sectionId: "verbs", difficulty: "N2", type: "conjugate",
    prompt: "Mettez « ikimasu » à la forme négative (présent).",
    accepted: [["ikimasen"]],
    explanation: "Négatif présent = -masen." },
  { sectionId: "verbs", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Je n'ai pas regardé la télévision. »",
    accepted: [["terebi o mimasen deshita"]],
    explanation: "mimasu → mimasen deshita. Objet (terebi) marqué par を." },

  // ---- 13. Adjectifs i / na -------------------------------------------------
  { sectionId: "adjectives", difficulty: "N1", type: "mcq",
    prompt: "Négation de « ii » (bon) :",
    options: ["yokunai", "iikunai", "iinai", "yokatta"],
    correctIndex: 0,
    explanation: "ii est irrégulier : il se conjugue sur よ- → yokunai." },
  { sectionId: "adjectives", difficulty: "N2", type: "conjugate",
    prompt: "Donnez la forme négative de « takai » (cher).",
    accepted: [["takakunai", "takaku nai", "takakunai desu", "takaku arimasen"]],
    explanation: "Adjectif en -i : -i → -kunai (takai → takakunai)." },
  { sectionId: "adjectives", difficulty: "N2", type: "transform",
    prompt: "Combinez « ookii » + « takai » avec « et » (forme -kute).",
    accepted: [["ookikute takai"]],
    explanation: "Adjectif en -i : -i → -kute pour enchaîner (ookii → ookikute)." },
  { sectionId: "adjectives", difficulty: "N2", type: "conjugate",
    prompt: "Donnez la forme négative de « genki » (na-adjectif).",
    accepted: [["genki ja arimasen", "genki dewa arimasen", "genki ja nai desu", "genki janai desu"]],
    explanation: "Un na-adjectif se nie comme un nom : genki ja arimasen." },
  { sectionId: "adjectives", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Ce pull n'est pas cher. »",
    accepted: [["kono seetaa wa takakunai desu", "kono seetaa wa takaku arimasen"]],
    explanation: "takai → takakunai desu / takaku arimasen (jamais « takai janai »)." },

  // ---- 14. Couleurs ---------------------------------------------------------
  { sectionId: "colors", difficulty: "N1", type: "mcq",
    prompt: "Que signifie « akai » ?",
    options: ["rouge", "bleu", "blanc", "noir"],
    correctIndex: 0,
    explanation: "akai = rouge, aoi = bleu, shiroi = blanc, kuroi = noir." },
  { sectionId: "colors", difficulty: "N1", type: "mcq",
    prompt: "Lequel est un NOM de couleur (et non un adjectif en -i) ?",
    options: ["midori (vert)", "akai", "aoi", "shiroi"],
    correctIndex: 0,
    explanation: "midori / murasaki sont des noms → midori no (+ の devant un nom)." },
  { sectionId: "colors", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « midori ___ kaban » (un sac vert)",
    accepted: [["no"]],
    explanation: "Un nom de couleur se relie au nom avec の : midori no kaban." },
  { sectionId: "colors", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « une voiture blanche »",
    accepted: [["shiroi kuruma"]],
    explanation: "shiroi est un adjectif en -i : il se place directement devant le nom." },

  // ---- 15. Intensités & fréquences -----------------------------------------
  { sectionId: "intensity", difficulty: "N1", type: "mcq",
    prompt: "« amari » s'utilise avec :",
    options: ["une négation (amari … masen)", "une affirmation", "une question", "le passé uniquement"],
    correctIndex: 0,
    explanation: "amari et zenzen imposent une forme négative." },
  { sectionId: "intensity", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Watashi wa amari terebi o mi___. » (Je ne regarde pas beaucoup la télé)",
    accepted: [["masen"]],
    explanation: "amari … -masen : « pas beaucoup »." },
  { sectionId: "intensity", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Sushi ga ___ suki desu. » (J'aime BEAUCOUP les sushis)",
    accepted: [["totemo"]],
    explanation: "totemo = très / beaucoup (avec une forme affirmative)." },
  { sectionId: "intensity", difficulty: "N3", type: "translate",
    prompt: "Traduisez : « Je ne bois jamais d'alcool. » (zenzen)",
    accepted: [["osake o zenzen nomimasen", "zenzen osake o nomimasen"]],
    explanation: "zenzen + négation = « jamais / pas du tout »." },

  // ---- 16. Parler de soi ----------------------------------------------------
  { sectionId: "self", difficulty: "N1", type: "mcq",
    prompt: "Pour se présenter, on commence par :",
    options: ["Hajimemashite", "Sayōnara", "Itadakimasu", "Otsukaresama"],
    correctIndex: 0,
    explanation: "Hajimemashite = « Enchanté » (1re rencontre)." },
  { sectionId: "self", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Pari ___ kimashita. » (Je viens de Paris)",
    accepted: [["kara"]],
    explanation: "~kara kimashita = « je viens de … »." },
  { sectionId: "self", difficulty: "N3", type: "situation",
    prompt: "Présentez-vous : « Enchanté. Je suis Tanaka. Je viens de Paris. Je suis ingénieur. (formule finale de politesse) »",
    requiredParts: ["hajimemashite", "desu", "pari kara", "enjinia", "yoroshiku"],
    model: "Hajimemashite. Tanaka desu. Pari kara kimashita. Enjinia desu. Dōzo yoroshiku.",
    explanation: "Schéma : Hajimemashite → nom desu → ~kara kimashita → métier desu → dōzo yoroshiku." },

  // ---- 17. Katakana ---------------------------------------------------------
  { sectionId: "katakana", difficulty: "N1", type: "mcq",
    prompt: "Que signifie スカート ?",
    options: ["jupe", "chemise", "manteau", "ceinture"],
    correctIndex: 0,
    explanation: "スカート sukāto = jupe ; ズボン zubon = pantalon ; コート kōto = manteau." },
  { sectionId: "katakana", difficulty: "N1", type: "mcq",
    prompt: "Que signifie ビール ?",
    options: ["bière", "vin", "café", "eau"],
    correctIndex: 0,
    explanation: "ビール bīru = bière ; ワイン wain = vin ; コーヒー kōhī = café." },
  { sectionId: "katakana", difficulty: "N1", type: "mcq",
    prompt: "Quel katakana se lit « shi » ?",
    options: ["シ", "ツ", "ソ", "ン"],
    correctIndex: 0,
    explanation: "Confusables : シ (shi) a des traits horizontaux ; ツ (tsu) verticaux." },
  { sectionId: "katakana", difficulty: "N1", type: "mcq",
    prompt: "コーヒー se lit :",
    options: ["koohii", "konpyuutaa", "keeki", "koora"],
    correctIndex: 0,
    explanation: "ー allonge la voyelle : コー = kō, ヒー = hī → koohii." },
  { sectionId: "katakana", difficulty: "N1", type: "mcq",
    prompt: "Quel katakana se lit « n » ?",
    options: ["ン", "ソ", "シ", "ツ"],
    correctIndex: 0,
    explanation: "Confusables : ン (n) vs ソ (so) — sens du petit trait." },
  { sectionId: "katakana", difficulty: "N2", type: "katakana",
    prompt: "Écrivez en katakana : « wain » (vin).",
    accepted: [["wain", "ワイン"]], kana: "ワイン",
    explanation: "ワ + イ + ン = ワイン." },
  { sectionId: "katakana", difficulty: "N2", type: "katakana",
    prompt: "Écrivez en katakana : « biiru » (bière).",
    accepted: [["biiru", "ビール"]], kana: "ビール",
    explanation: "ビ + ー (allongement) + ル = ビール." },
  { sectionId: "katakana", difficulty: "N2", type: "katakana",
    prompt: "Écrivez en katakana : « tenisu » (tennis).",
    accepted: [["tenisu", "テニス"]], kana: "テニス",
    explanation: "テ + ニ + ス = テニス." },
  { sectionId: "katakana", difficulty: "N2", type: "katakana",
    prompt: "Écrivez en katakana : « pari » (Paris).",
    accepted: [["pari", "パリ"]], kana: "パリ",
    explanation: "パ (handakuten) + リ = パリ." },
  { sectionId: "katakana", difficulty: "N3", type: "katakana",
    prompt: "Écrivez en katakana : « konpyuutaa » (ordinateur).",
    accepted: [["konpyuutaa", "konpyuuta", "コンピューター", "コンピュータ"]], kana: "コンピューター",
    explanation: "コ ン ピュー (petit ュ) ター — attention aux allongements ー." },
];

// ============================================================================
//  Moteur de correction tolérant
// ============================================================================

// Normalise une saisie pour comparaison : minuscules, kana → rōmaji, macrons
// neutralisés, ponctuation et apostrophes retirées, voyelles longues réduites.
function examNormalize(s) {
  let t = (s == null ? "" : String(s)).trim().toLowerCase();
  if (/[ぁ-ゖァ-ヺー一-鿿]/.test(t) && typeof wanakana !== "undefined") {
    t = wanakana.toRomaji(t).toLowerCase();
  }
  t = t.normalize("NFC")
    .replace(/[āâà]/g, "a").replace(/[īîì]/g, "i").replace(/[ūûù]/g, "u")
    .replace(/[ēêè]/g, "e").replace(/[ōôò]/g, "o")
    .replace(/[、。．・,!?！？．。]/g, " ")
    .replace(/[’'`ー\-_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // Réduction des voyelles longues (ô≈ou≈oo, etc.) pour une comparaison souple.
  t = t.replace(/(ou|oo)/g, "o").replace(/uu/g, "u").replace(/aa/g, "a").replace(/ee/g, "e");
  return t;
}

function examTight(s) { return examNormalize(s).replace(/ /g, ""); }

// Vrai si la saisie correspond à l'une des variantes acceptées.
function examMatchesAny(user, variants) {
  const u = examNormalize(user), uT = examTight(user);
  if (!u) return false;
  return variants.some(v => {
    const n = examNormalize(v);
    return u === n || uT === examTight(v) || n === "" ;
  });
}

// Corrige une question. `answer` :
//   mcq        → index choisi (number)
//   match      → { [indexGauche]: rōmaji choisi }
//   situation  → string
//   autres     → tableau de chaînes (une par blanc)
// Retourne { correct, near } (near = « presque » pour les traductions).
function gradeExam(q, answer) {
  if (q.type === "mcq") {
    return { correct: answer === q.correctIndex, near: false };
  }
  if (q.type === "match") {
    const correct = q.pairs.every((p, i) =>
      answer && examNormalize(answer[i]) === examNormalize(p.r));
    return { correct, near: false };
  }
  if (q.type === "situation") {
    const u = examNormalize(answer).replace(/ /g, "");
    const correct = q.requiredParts.every(part =>
      u.includes(examNormalize(part).replace(/ /g, "")));
    return { correct, near: false };
  }
  // Types à saisie libre (un ou plusieurs blancs).
  const blanks = q.blanks || 1;
  const arr = Array.isArray(answer) ? answer : [answer];
  let allCorrect = true;
  for (let i = 0; i < blanks; i++) {
    if (!examMatchesAny(arr[i] || "", q.accepted[i] || [])) { allCorrect = false; break; }
  }
  if (allCorrect) return { correct: true, near: false };

  // « Presque » : pour une traduction, s'il ne manque/diffère qu'un seul mot.
  let near = false;
  if (q.type === "translate" && blanks === 1 && (arr[0] || "").trim()) {
    const best = (q.accepted[0] || []).map(examNormalize)
      .sort((a, b) => b.split(" ").length - a.split(" ").length)[0] || "";
    const want = best.split(" ").filter(Boolean);
    const got = examNormalize(arr[0]).split(" ").filter(Boolean);
    const missing = want.filter(w => !got.includes(w));
    near = want.length >= 2 && missing.length === 1;
  }
  return { correct: false, near };
}

// Construit un jeu de questions selon le mode choisi.
function buildExamDeck(mode, value) {
  let pool;
  if (mode === "section") pool = EXAM_QUESTIONS.filter(q => q.sectionId === value);
  else if (mode === "level") pool = EXAM_QUESTIONS.filter(q => q.difficulty === value);
  else if (mode === "weak") pool = EXAM_QUESTIONS.filter(q => EXAM_WEAK_SECTIONS.includes(q.sectionId));
  else pool = EXAM_QUESTIONS.slice(); // complete
  return shuffle(pool);
}
