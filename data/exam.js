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
//  Génération de questions supplémentaires à partir de data/vocab.js
//  (plus de variété : un pool plus large = un test différent à chaque essai)
// ============================================================================

function jpToRomaji(s) {
  return (typeof wanakana !== "undefined") ? wanakana.toRomaji(s) : s;
}

// Construit un tableau de 4 options de QCM en plaçant la bonne réponse à
// l'index voulu et les distracteurs dans l'ordre fourni.
function buildMcqOptions(correct, distractors, correctIndex) {
  const options = [];
  let d = 0;
  for (let pos = 0; pos < 4; pos++) {
    if (pos === correctIndex) options.push(correct);
    else options.push(distractors[d++]);
  }
  return options;
}

// ---- Verbes en -masu : conjugaison (négatif / passé / négatif-passé) -------
const VERB_FR = {
  "いきます": "aller",
  "かえります": "rentrer (à la maison)",
  "きます": "venir",
  "います": "être / se trouver (animé)",
  "あります": "y avoir / se trouver (inanimé)",
  "します": "faire",
  "たべます": "manger",
  "のみます": "boire",
  "みます": "regarder / voir",
  "ききます": "écouter / entendre / demander",
  "よみます": "lire",
  "かきます": "écrire / dessiner",
  "かいます": "acheter",
  "かぶります": "porter (sur la tête)",
  "はきます": "porter (bas du corps / chaussures)",
};
const VERB_FORMS = [
  { name: "négative (présent)", suffix: "ません" },
  { name: "passée", suffix: "ました" },
  { name: "négative passée", suffix: "ませんでした" },
];
function genVerbQuestions() {
  return vocab.filter(v => v.group === "Verbs").map((v, i) => {
    const stem = v.jp.slice(0, -2);
    const form = VERB_FORMS[i % VERB_FORMS.length];
    const base = jpToRomaji(v.jp);
    const accepted = jpToRomaji(stem + form.suffix);
    return {
      sectionId: "verbs", difficulty: "N2", type: "conjugate",
      prompt: `Mettez « ${base} » (${VERB_FR[v.jp] || v.en}) à la forme ${form.name}.`,
      accepted: [[accepted]],
      explanation: `${base} → ${accepted} (forme ${form.name}).`,
    };
  });
}

// ---- Adjectifs i / na : forme négative --------------------------------------
const ADJ_FR = {
  "おおきい": "grand", "ちいさい": "petit", "ながい": "long", "みじかい": "court",
  "たかい": "cher / haut", "やすい": "bon marché", "ひくい": "bas",
  "あたらしい": "nouveau", "ふるい": "vieux (objet)", "ひろい": "spacieux", "せまい": "étroit",
  "むずかしい": "difficile", "やさしい": "facile / gentil", "あつい": "chaud", "さむい": "froid",
  "おいしい": "délicieux", "おもしろい": "intéressant / drôle", "つまらない": "ennuyeux",
  "たのしい": "amusant", "いそがしい": "occupé", "かなしい": "triste", "うれしい": "content",
  "いたい": "douloureux", "うつくしい": "beau", "わるい": "mauvais",
  "ふとい": "épais / gros", "ほそい": "fin / mince", "うすい": "fin (épaisseur)",
  "おもい": "lourd", "かるい": "léger (poids)", "くらい": "sombre", "あかるい": "lumineux",
};
const NA_ADJ_FR = {
  "すき（な）": "aimé / favori", "きらい（な）": "détesté", "じょうず（な）": "doué",
  "へた（な）": "maladroit", "にぎやか（な）": "animé", "しずか（な）": "calme",
  "きれい（な）": "beau / propre", "しんせつ（な）": "gentil", "べんり（な）": "pratique",
  "ひま": "disponible", "ゆうめい": "célèbre", "すてき": "charmant", "おしゃれ": "élégant",
  "ハンサム": "beau (homme)",
};
function genAdjectiveQuestions() {
  const out = [];
  vocab.filter(v => v.group === "Adjectives" && v.jp !== "よい / いい").forEach(v => {
    const stem = v.jp.slice(0, -1);
    const stemR = jpToRomaji(stem);
    out.push({
      sectionId: "adjectives", difficulty: "N2", type: "conjugate",
      prompt: `Donnez la forme négative de « ${jpToRomaji(v.jp)} » (${ADJ_FR[v.jp]}).`,
      accepted: [[stemR + "kunai", stemR + "ku nai", stemR + "kunai desu", stemR + "ku arimasen"]],
      explanation: `Adjectif en -i : ${jpToRomaji(v.jp)} → ${stemR}kunai.`,
      hint: "Adjectif en -i : retirez le い final, puis ajoutez くない (+ desu).",
    });
  });
  vocab.filter(v => v.group === "Na-Adjectives" && v.jp !== "げんき（な）").forEach(v => {
    const stem = v.jp.replace(/（な）$/, "");
    const stemR = jpToRomaji(stem);
    out.push({
      sectionId: "adjectives", difficulty: "N2", type: "conjugate",
      prompt: `Donnez la forme négative de « ${stemR} » (${NA_ADJ_FR[v.jp]}).`,
      accepted: [[stemR + " ja arimasen", stemR + " dewa arimasen", stemR + " ja nai desu", stemR + " janai desu"]],
      explanation: `Na-adjectif : se nie comme un nom → ${stemR} ja arimasen.`,
      hint: "Malgré sa terminaison, c'est un na-adjectif : il se nie comme un nom (X ja arimasen / dewa arimasen).",
    });
  });
  return out;
}

// ---- Pièges classiques : forme négative des adjectifs (QCM) -----------------
// Pour chaque adjectif, les distracteurs reproduisent les erreurs les plus
// fréquentes des apprenants francophones.
const ADJ_TRAP_I = [
  { jp: "たかい", fr: "cher / haut" },
  { jp: "あつい", fr: "chaud" },
  { jp: "おいしい", fr: "délicieux" },
  { jp: "むずかしい", fr: "difficile" },
  { jp: "さむい", fr: "froid" },
  { jp: "ちいさい", fr: "petit" },
  { jp: "あたらしい", fr: "nouveau" },
  { jp: "いそがしい", fr: "occupé" },
];
const ADJ_TRAP_NA = [
  { jp: "きれい（な）", fr: "beau / propre" },
  { jp: "げんき（な）", fr: "en forme" },
  { jp: "しずか（な）", fr: "calme" },
  { jp: "べんり（な）", fr: "pratique" },
  { jp: "しんせつ（な）", fr: "gentil" },
  { jp: "ゆうめい（な）", fr: "célèbre" },
];
function genAdjectiveTrapQuestions() {
  const out = [];
  ADJ_TRAP_I.forEach((v, i) => {
    const full = jpToRomaji(v.jp);
    const stemR = full.slice(0, -1); // on retire le -i final
    const correct = `${stemR}kunai desu`;
    const trapFull = `${full}kunai desu`;       // garde le -i avant -kunai
    const trapNoun = `${full} ja arimasen`;     // traite l'adj. comme un nom
    const trapYoi = "yokunai desu";             // surgénéralise l'irrégularité de いい
    const correctIndex = i % 4;
    out.push({
      sectionId: "adjectives", difficulty: "N2", type: "mcq",
      prompt: `Quelle est la forme négative correcte de « ${full} » (${v.fr}) ?`,
      options: buildMcqOptions(correct, [trapFull, trapNoun, trapYoi], correctIndex),
      correctIndex,
      explanation: `${full} → ${correct}. Pièges : « ${trapFull} » garde le -i avant -kunai (faux), « ${trapNoun} » traite l'adjectif comme un nom (faux pour un adjectif en -i), et « ${trapYoi} » applique l'irrégularité de いい (yoi/yokunai) à un autre adjectif.`,
    });
  });
  ADJ_TRAP_NA.forEach((v, i) => {
    const stem = v.jp.replace(/（な）$/, "");
    const stemR = jpToRomaji(stem);
    const correct = `${stemR} ja arimasen`;
    const trapIAdj = `${stemR}kunai desu`;   // applique la règle des adj. en -i
    const trapWa = `${stemR} wa arimasen`;   // mauvaise particule
    const trapImasen = `${stemR} ja imasen`; // mauvais verbe (imasen au lieu de arimasen)
    const correctIndex = i % 4;
    out.push({
      sectionId: "adjectives", difficulty: "N2", type: "mcq",
      prompt: `Quelle est la forme négative correcte de « ${stemR} » (${v.fr}) ?`,
      options: buildMcqOptions(correct, [trapIAdj, trapWa, trapImasen], correctIndex),
      correctIndex,
      explanation: `${stemR} est un na-adjectif : il se nie comme un nom → ${correct}. Piège : « ${trapIAdj} » applique la règle des adjectifs en -i (faux, même si ${stemR} se termine par い) ; « ${trapWa} » et « ${trapImasen} » utilisent la mauvaise particule ou le mauvais verbe.`,
    });
  });
  return out;
}

// ---- Antonymes : appariement -------------------------------------------------
function genAntonymMatchQuestions() {
  const FR = Object.assign({}, ADJ_FR, NA_ADJ_FR);
  const seen = new Set();
  const pairs = [];
  Object.keys(ANTONYMS).forEach(k => {
    const v = ANTONYMS[k];
    if (k.indexOf("/") !== -1 || v.indexOf("/") !== -1) return; // exclut よい / いい
    const key = [k, v].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    const kR = jpToRomaji(k.replace(/（な）$/, ""));
    const vR = jpToRomaji(v.replace(/（な）$/, ""));
    pairs.push({ l: `${FR[k]} (${kR})`, r: vR });
  });
  const out = [];
  for (let i = 0; i < pairs.length; i += 4) {
    out.push({
      sectionId: "adjectives", difficulty: "N1", type: "match",
      prompt: "Reliez chaque adjectif à son contraire (rōmaji).",
      pairs: pairs.slice(i, i + 4),
      explanation: "Les antonymes sont des paires à connaître par cœur pour le N5.",
    });
  }
  return out;
}

// ---- Couleurs : noms (+ no) et adjectifs en -i -------------------------------
const COLOR_NOUN_FR = { "みどり": "vert", "むらさき": "violet", "グレー": "gris", "ちゃいろ": "marron", "ピンク": "rose" };
const COLOR_NOUN_ITEMS = [
  { jp: "かばん", fr: "sac" },
  { jp: "はな", fr: "fleur" },
  { jp: "くるま", fr: "voiture" },
  { jp: "かみ", fr: "cheveux" },
  { jp: "ふく", fr: "vêtement" },
];
const COLOR_I_ADJ_FR = { "しろい": "blanc", "くろい": "noir", "あかい": "rouge", "あおい": "bleu", "きいろい": "jaune" };
function genColorQuestions() {
  const out = [];
  const nouns = vocab.filter(v => v.group === "Colors" && !/い$/.test(v.jp));
  nouns.forEach((v, i) => {
    const item = COLOR_NOUN_ITEMS[(i + 1) % COLOR_NOUN_ITEMS.length];
    out.push({
      sectionId: "colors", difficulty: "N2", type: "fill_blank",
      prompt: `Complétez : « ${jpToRomaji(v.jp)} ___ ${jpToRomaji(item.jp)} » (un ${item.fr} ${COLOR_NOUN_FR[v.jp]})`,
      accepted: [["no"]],
      explanation: `Un nom de couleur se relie au nom avec の : ${jpToRomaji(v.jp)} no ${jpToRomaji(item.jp)}.`,
    });
  });
  const adjs = vocab.filter(v => v.group === "Colors" && /い$/.test(v.jp) && v.jp !== "あかい");
  const adjList = adjs.map(v => v.jp);
  adjs.forEach((v, i) => {
    const distractors = adjList.filter(j => j !== v.jp);
    const correctIndex = i % 4;
    const options = [];
    let d = 0;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctIndex) options.push(COLOR_I_ADJ_FR[v.jp]);
      else { options.push(COLOR_I_ADJ_FR[distractors[d % distractors.length]]); d++; }
    }
    out.push({
      sectionId: "colors", difficulty: "N1", type: "mcq",
      prompt: `Que signifie « ${jpToRomaji(v.jp)} » ?`,
      options, correctIndex,
      explanation: `${jpToRomaji(v.jp)} = ${COLOR_I_ADJ_FR[v.jp]}.`,
    });
  });
  return out;
}

// ---- Lieux classiques ---------------------------------------------------------
const PLACE_FR = {
  "こうえん": "le parc", "びょういん": "l'hôpital", "がっこう": "l'école",
  "ぎんこう": "la banque", "ほんや": "la librairie",
  "はなや": "le fleuriste", "さかなや": "la poissonnerie", "やおや": "le marchand de légumes",
  "にくや": "la boucherie", "スーパー": "le supermarché", "レストラン": "le restaurant",
  "ホテル": "l'hôtel", "きっさてん": "le café / salon de thé", "デパート": "le grand magasin",
  "えいがかん": "le cinéma", "ゆうびんきょく": "le bureau de poste", "ちゅうしゃじょう": "le parking",
  "すしや": "le restaurant de sushis",
};
function genPlaceQuestions() {
  const words = Object.keys(PLACE_FR);
  return words.map((jp, i) => {
    const distractors = words.filter(w => w !== jp);
    const correctIndex = i % 4;
    const options = [];
    let d = i;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctIndex) options.push(PLACE_FR[jp]);
      else { d = (d + 1) % distractors.length; options.push(PLACE_FR[distractors[d]]); }
    }
    return {
      sectionId: "places", difficulty: "N1", type: "mcq",
      prompt: `Que signifie « ${jpToRomaji(jp)} » ?`,
      options, correctIndex,
      explanation: `${jpToRomaji(jp)} = ${PLACE_FR[jp]}.`,
    };
  });
}

// ---- Parler de soi : métiers et nationalités -----------------------------------
const OCCUPATION_FR = {
  "いしゃ": "médecin", "かんごし": "infirmier / infirmière", "せんせい": "professeur",
  "きょうし": "enseignant", "がくせい": "étudiant(e)", "エンジニア": "ingénieur",
  "りょうりにん": "cuisinier", "コック": "cuistot", "はいゆう": "acteur / actrice",
  "だいとうりょう": "président", "てんいん": "vendeur / employé de magasin",
  "ぎんこういん": "employé de banque", "かいしゃいん": "employé d'entreprise", "いたまえ": "chef sushi",
};
const NATIONALITY_FR = {
  "にほんじん": "japonais(e)", "アメリカじん": "américain(e)", "イギリスじん": "britannique",
  "ドイツじん": "allemand(e)", "フランスじん": "français(e)", "イタリアじん": "italien(ne)",
  "ちゅうごくじん": "chinois(e)",
};
function genSelfQuestions() {
  const out = [];
  const jobs = Object.keys(OCCUPATION_FR);
  jobs.forEach((jp, i) => {
    const distractors = jobs.filter(j => j !== jp);
    const correctIndex = i % 4;
    const options = [];
    let d = i;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctIndex) options.push(OCCUPATION_FR[jp]);
      else { d = (d + 1) % distractors.length; options.push(OCCUPATION_FR[distractors[d]]); }
    }
    out.push({
      sectionId: "self", difficulty: "N1", type: "mcq",
      prompt: `Que signifie « ${jpToRomaji(jp)} » ?`,
      options, correctIndex,
      explanation: `${jpToRomaji(jp)} = ${OCCUPATION_FR[jp]}.`,
    });
  });
  Object.keys(NATIONALITY_FR).forEach(jp => {
    const r = jpToRomaji(jp);
    out.push({
      sectionId: "self", difficulty: "N2", type: "translate",
      prompt: `Traduisez : « Je suis ${NATIONALITY_FR[jp]}. »`,
      accepted: [[`${r} desu`, `watashi wa ${r} desu`]],
      explanation: `Watashi wa ${r} desu — le sujet « watashi wa » est souvent omis à l'oral.`,
    });
  });
  return out;
}

// ---- Katakana : sens et écriture ------------------------------------------------
const KATAKANA_MCQ_FR = {
  "パソコン": "ordinateur portable", "コンピューター": "ordinateur", "テーブル": "table",
  "ベッド": "lit", "ドア": "porte", "カメラ": "appareil photo", "ボールペン": "stylo à bille",
  "コップ": "verre / tasse", "タクシー": "taxi", "バス": "bus", "コーヒー": "café",
  "ジュース": "jus", "ワイン": "vin", "ウイスキー": "whisky", "パン": "pain", "チーズ": "fromage",
  "チョコレート": "chocolat", "ケーキ": "gâteau", "トマト": "tomate", "バナナ": "banane",
  "メロン": "melon", "レモン": "citron", "キャベツ": "chou", "レタス": "laitue",
  "スーツ": "costume", "セーター": "pull", "コート": "manteau", "ズボン": "pantalon",
  "ネックレス": "collier", "テニス": "tennis", "ゴルフ": "golf", "ジャズ": "jazz",
  "ティーシャツ": "T-shirt",
};
const KATAKANA_WRITE = ["タクシー", "ジュース", "レモン", "セーター", "ティーシャツ", "チョコレート"];
function genKatakanaQuestions() {
  const out = [];
  const words = Object.keys(KATAKANA_MCQ_FR);
  words.forEach((jp, i) => {
    const distractors = words.filter(w => w !== jp);
    const correctIndex = i % 4;
    const options = [];
    let d = i;
    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctIndex) options.push(KATAKANA_MCQ_FR[jp]);
      else { d = (d + 1) % distractors.length; options.push(KATAKANA_MCQ_FR[distractors[d]]); }
    }
    out.push({
      sectionId: "katakana", difficulty: "N1", type: "mcq",
      prompt: `Que signifie « ${jpToRomaji(jp)} » ?`,
      options, correctIndex,
      explanation: `${jpToRomaji(jp)} = ${KATAKANA_MCQ_FR[jp]}.`,
    });
  });
  KATAKANA_WRITE.forEach(jp => {
    const r = jpToRomaji(jp);
    out.push({
      sectionId: "katakana", difficulty: "N3", type: "katakana",
      prompt: `Écrivez en katakana : « ${r} » (${KATAKANA_MCQ_FR[jp] || ""}).`,
      accepted: [[r, jp]], kana: jp,
      explanation: `${jp} = ${r}.`,
    });
  });
  return out;
}

// ---- Katakana : paires confondues (longueur, dakuten, petits kana) ----------
const KATAKANA_CONFUSABLE_DATA = [
  { prompt: "« ビル » (biru, sans allongement) signifie :", correct: "immeuble / bâtiment",
    distractors: ["bière (= ビール, biiru)", "lit", "porte"],
    explanation: "ビル (biru, court) = immeuble. ビール (biiru, avec ー) = bière. Le petit allongement ー change complètement le sens !" },
  { prompt: "« ビール » (biiru, avec allongement ー) signifie :", correct: "bière",
    distractors: ["immeuble (= ビル, biru)", "vin", "lit"],
    explanation: "ビール (biiru) = bière, à ne pas confondre avec ビル (biru) = immeuble : l'allongement ー est essentiel." },
  { prompt: "Quelle est l'orthographe correcte de « jūsu » (jus) en katakana ?", correct: "ジュース",
    distractors: ["ジュウス", "シュース", "ジューズ"],
    explanation: "ジュース = ジュ + ー (allongement) + ス. Pièges : ジュウス (ウ au lieu de ー), シュース (シ au lieu de ジ — ゛ manquant), ジューズ (ズ au lieu de ス — ゛ ajouté à tort)." },
  { prompt: "Quelle est l'orthographe correcte de « konpyūtā » (ordinateur) en katakana ?", correct: "コンピューター",
    distractors: ["コンピュウター", "コソピューター", "コンピューダー"],
    explanation: "コンピューター. Pièges : コンピュウター (ウ au lieu de ー), コソピューター (ソ et ン souvent confondus — regardez le sens du petit trait), コンピューダー (タ→ダ, ゛ ajouté à tort)." },
  { prompt: "Quelle est la différence entre « キャ » et « キヤ » ?",
    correct: "キャ (ャ petit) = « kya » en une syllabe ; キヤ (ヤ normal) = « kiya » en deux syllabes",
    distractors: ["ce sont deux écritures de la même syllabe « kya »", "キャ se lit « kiya » et キヤ se lit « kya »", "il n'y a aucune différence de prononciation"],
    explanation: "La taille du petit kana ャ/ュ/ョ change la prononciation : en petit, il fusionne avec la consonne précédente (キャ = kya, une syllabe) ; en taille normale, c'est une syllabe séparée (キヤ = ki-ya, deux syllabes)." },
];
function genKatakanaConfusableQuestions() {
  return KATAKANA_CONFUSABLE_DATA.map((d, i) => {
    const correctIndex = (i + 2) % 4;
    return {
      sectionId: "katakana", difficulty: "N2", type: "mcq",
      prompt: d.prompt,
      options: buildMcqOptions(d.correct, d.distractors, correctIndex),
      correctIndex,
      explanation: d.explanation,
    };
  });
}

// ---- Confusables lexicaux : sens proches, formes proches ---------------------
const LEXICAL_TRAP_DATA = [
  { sectionId: "adjectives", prompt: "Que signifie « kirei » (きれい) ?", correct: "beau / propre",
    distractors: ["détesté (= きらい, kirai)", "calme", "pratique"],
    explanation: "きれい (kirei) = beau / propre. Piège : きらい (kirai) ressemble beaucoup mais signifie « détesté » — sens quasi opposé !" },
  { sectionId: "adjectives", prompt: "Que signifie « kirai » (きらい) ?", correct: "détesté",
    distractors: ["beau / propre (= きれい, kirei)", "doué", "gentil"],
    explanation: "きらい (kirai) = détesté. Piège : きれい (kirei) ressemble beaucoup mais signifie « beau / propre » — ne les confondez pas !" },
  { sectionId: "adjectives", prompt: "« takai » (たかい) peut signifier :", correct: "cher OU haut, selon le contexte",
    distractors: ["uniquement « cher »", "uniquement « haut »", "rapide"],
    explanation: "たかい a deux sens distincts : « cher » (pour un prix) et « haut » (pour une taille / altitude) — le contexte détermine lequel." },
  { sectionId: "adjectives", prompt: "« yasashii » (やさしい) peut signifier :", correct: "facile OU gentil, selon le contexte",
    distractors: ["uniquement « facile »", "uniquement « gentil »", "difficile"],
    explanation: "やさしい a deux sens : « facile » (pour une tâche) et « gentil » (pour une personne) — le contexte permet de choisir." },
  { sectionId: "adjectives", prompt: "Quelle est la différence entre « suki » et « jouzu » ?",
    correct: "suki = aimer ; jouzu = être doué (compétence)",
    distractors: ["suki = être doué ; jouzu = aimer", "ce sont des synonymes", "suki est un verbe, jouzu un nom"],
    explanation: "On peut aimer une activité (suki) sans y être doué (jouzu), et inversement : ce sont deux na-adjectifs indépendants, tous deux construits avec が." },
  { sectionId: "adjectives", prompt: "Quel est le contraire de « takai » (haut, pour la TAILLE / l'altitude) ?",
    correct: "hikui (bas)",
    distractors: ["yasui (bon marché)", "chiisai (petit)", "mijikai (court)"],
    explanation: "Pour la hauteur, le contraire de takai (haut) est hikui (bas). Attention : ce n'est pas yasui, qui s'applique au prix." },
  { sectionId: "adjectives", prompt: "Quel est le contraire de « takai » (cher, pour le PRIX) ?",
    correct: "yasui (bon marché)",
    distractors: ["hikui (bas)", "ookii (grand)", "mottainai (gâché)"],
    explanation: "Pour le prix, le contraire de takai (cher) est yasui (bon marché). hikui s'utilise pour la hauteur, pas pour le prix." },
  { sectionId: "adjectives", prompt: "Quelle est la différence entre « mijikai » et « chiisai » ?",
    correct: "mijikai = court (longueur / durée) ; chiisai = petit (taille générale)",
    distractors: ["ce sont des synonymes parfaits", "mijikai = petit ; chiisai = court", "mijikai s'applique aux personnes uniquement"],
    explanation: "mijikai décrit une longueur ou une durée courte (cheveux courts, trajet court) ; chiisai décrit la taille générale d'un objet (petit sac, petite voiture)." },
  { sectionId: "self", prompt: "« hashi » (はし) peut signifier :", correct: "des baguettes OU un pont, selon le contexte",
    distractors: ["uniquement des baguettes", "uniquement un pont", "des chaussures"],
    explanation: "はし est un homophone : 箸 (baguettes) et 橋 (pont) se prononcent pareil — seul le contexte (et l'accent tonique à l'oral) permet de les distinguer." },
  { sectionId: "self", prompt: "« kami » (かみ) peut signifier :", correct: "des cheveux OU du papier (voire un dieu), selon le contexte",
    distractors: ["uniquement des cheveux", "uniquement du papier", "uniquement un dieu"],
    explanation: "かみ regroupe plusieurs homophones : 髪 (cheveux), 紙 (papier), 神 (dieu) — seul le kanji ou le contexte écrit permet de les distinguer." },
];
function genLexicalTrapQuestions() {
  return LEXICAL_TRAP_DATA.map((d, i) => {
    const correctIndex = i % 4;
    return {
      sectionId: d.sectionId, difficulty: "N2", type: "mcq",
      prompt: d.prompt,
      options: buildMcqOptions(d.correct, d.distractors, correctIndex),
      correctIndex,
      explanation: d.explanation,
    };
  });
}

// ---- Particules : minimal-pairs et pièges classiques -------------------------
const PARTICLE_TRAP_QUESTIONS = [
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Toshokan ___ hon ga arimasu. » (Il y a des livres à la bibliothèque)",
    accepted: [["ni"]],
    traps: [{ test: (n, t) => t === "de", message: "で / に — で marque le lieu d'une ACTION (lire, manger…). Pour dire qu'une chose EXISTE quelque part (arimasu / imasu), on utilise に." }],
    explanation: "に + arimasu / imasu = lieu d'existence. で est réservé au lieu d'une action.",
    hint: "Le verbe est arimasu (existence) : quelle particule de lieu va avec « il y a » ?" },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Toshokan ___ hon o yomimasu. » (Je lis des livres à la bibliothèque)",
    accepted: [["de"]],
    traps: [{ test: (n, t) => t === "ni", message: "に / で — に marque le lieu où une chose EXISTE (arimasu / imasu). Pour le lieu d'une ACTION (yomimasu = lire), on utilise で." }],
    explanation: "で + verbe d'action = lieu où se déroule l'action. Comparez avec « toshokan ni hon ga arimasu » (に = existence).",
    hint: "Le verbe est yomimasu (action) : quelle particule de lieu va avec une action ?" },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Zou ___ hana ga nagai desu. » (L'éléphant a une longue trompe — littéralement : pour ce qui est de l'éléphant, la trompe est longue)",
    accepted: [["wa"]],
    traps: [{ test: (n, t) => t === "ga", message: "は / が — dans la structure « A wa B ga [adjectif] », le THÈME général (zou) prend は, et la caractéristique précise (hana) prend が. Mettre が aux deux retire le thème de la phrase." }],
    explanation: "Structure classique A wa B ga [adjectif] : zou wa hana ga nagai desu = « l'éléphant, c'est le nez qui est long ».",
    hint: "Le sujet général de la phrase (« l'éléphant ») prend は ; la partie dont on parle précisément (« la trompe ») prend が." },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Watashi wa sushi ___ suki desu. » (J'aime les sushis)",
    accepted: [["ga"]],
    traps: [{ test: (n, t) => t === "o", message: "を / が — すき (aimer) est un na-adjectif, pas un verbe transitif. L'objet aimé se marque avec が, jamais avec を." }],
    explanation: "suki desu est un adjectif (« être agréable / apprécié »), pas un verbe d'action : on dit toujours « X ga suki desu », jamais « X o suki desu ».",
    hint: "« suki » se comporte comme un adjectif, pas comme un verbe : quelle particule accompagne un adjectif de préférence ?" },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Watashi wa nihongo ___ jouzu desu. » (Je suis doué en japonais)",
    accepted: [["ga"]],
    traps: [{ test: (n, t) => t === "o", message: "を / が — じょうず (doué) est un na-adjectif, pas un verbe. Le domaine de compétence se marque avec が, jamais avec を." }],
    explanation: "Même piège que suki : jouzu desu est un adjectif → nihongo ga jouzu desu (jamais « o jouzu »).",
    hint: "Comme « suki », « jouzu » est un adjectif : quelle particule l'accompagne ?" },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Eki ___ arukimasu. » (Je marche jusqu'à la gare)",
    accepted: [["made"]],
    traps: [{ test: (n, t) => t === "ni" || t === "e" || t === "he", message: "まで / に — に et へ marquent la destination avec aller / venir / rentrer (ikimasu, kimasu, kaerimasu). Pour exprimer une LIMITE, un point « jusqu'à », on utilise まで." }],
    explanation: "まで = jusqu'à (limite d'un trajet) : eki made arukimasu = « je marche jusqu'à la gare ».",
    hint: "On insiste sur le point d'arrivée comme une LIMITE (« jusqu'à ») plutôt que comme une simple destination." },
  { sectionId: "particles", difficulty: "N2", type: "fill_blank",
    prompt: "Complétez : « Gakkou ___ jitensha de ikimasu. » (Je vais à l'école à vélo)",
    accepted: [["ni", "e", "he"]],
    traps: [{ test: (n, t) => t === "made", message: "まで / に — まで indique une limite (« jusqu'à »), mais avec ikimasu (aller), la destination se marque par に ou へ." }],
    explanation: "に / へ + ikimasu / kimasu / kaerimasu = destination d'un déplacement : gakkou ni / e ikimasu.",
    hint: "Le verbe est ikimasu (aller) : quelle particule marque la destination avec ce verbe ?" },
];

// ---- « Trouvez l'erreur » : repérer et corriger un piège classique -----------
const FIND_ERROR_QUESTIONS = [
  { sectionId: "adjectives", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Kono kaban wa takai ja arimasen.",
    accepted: [["kono kaban wa takakunai desu", "kono kaban wa takaku arimasen"]],
    errorTrap: "« takai ja arimasen » traite l'adjectif en -i たかい comme un na-adjectif. Un adjectif en -i se nie en -kunai (desu), jamais avec ja arimasen.",
    hint: "たかい est un adjectif en -I : retirez le い final, que met-on à la place ?",
    explanation: "takai (adjectif en -i) → takakunai desu. ja arimasen ne s'utilise qu'après un nom ou un na-adjectif." },
  { sectionId: "adjectives", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Kono heya wa kirei kunai desu.",
    accepted: [["kono heya wa kirei ja arimasen", "kono heya wa kirei dewa arimasen", "kono heya wa kirei ja nai desu", "kono heya wa kirei janai desu"]],
    errorTrap: "きれい est un na-adjectif malgré sa terminaison en い : on ne peut pas lui appliquer -kunai. Il se nie comme un nom, avec ja arimasen.",
    hint: "きれい se termine par い mais c'est un NA-adjectif : comment se nient les noms et na-adjectifs ?",
    explanation: "kirei (na-adjectif) → kirei ja arimasen / dewa arimasen. -kunai est réservé aux adjectifs en -i comme takai, ookii…" },
  { sectionId: "particles", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Toshokan ni hon o yomimasu.",
    accepted: [["toshokan de hon o yomimasu"]],
    errorTrap: "に marque le lieu d'EXISTENCE (avec arimasu / imasu), pas le lieu d'une ACTION. Pour lire (action), il faut で.",
    hint: "yomimasu est un verbe d'action : quelle particule de lieu accompagne une action ?",
    explanation: "で + verbe d'action = lieu où se déroule l'action : toshokan de hon o yomimasu." },
  { sectionId: "particles", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Watashi wa nihongo o suki desu.",
    accepted: [["watashi wa nihongo ga suki desu"]],
    errorTrap: "すき (aimer) est un na-adjectif, pas un verbe transitif : l'objet aimé se marque toujours par が, jamais par を.",
    hint: "« suki » se comporte comme un adjectif : quelle particule accompagne un adjectif de préférence ?",
    explanation: "X ga suki desu — jamais « X o suki desu »." },
  { sectionId: "verbs", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Kinou eiga o mimasu.",
    accepted: [["kinou eiga o mimashita"]],
    errorTrap: "« kinou » (hier) impose un verbe au PASSÉ. mimasu est au présent / futur : il faut mimashita.",
    hint: "« kinou » signifie « hier » : à quel temps doit être le verbe ?",
    explanation: "kinou (hier) → verbe au passé : mimasu → mimashita." },
  { sectionId: "demonstratives", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Kore hon wa watashi no desu.",
    accepted: [["kono hon wa watashi no desu"]],
    errorTrap: "« kore » est un PRONOM (employé seul, sans nom après). Devant un nom (hon), il faut « kono ».",
    hint: "Y a-t-il un nom juste après « kore / kono » ? Quelle forme s'utilise devant un nom ?",
    explanation: "kore = pronom seul (« ceci »). kono + nom = « ce / cette … »." },
  { sectionId: "existence", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Kyoushitsu ni gakusei ga arimasu.",
    accepted: [["kyoushitsu ni gakusei ga imasu"]],
    errorTrap: "arimasu s'utilise pour les objets inanimés. gakusei (étudiant) est un être animé : il faut imasu.",
    hint: "Un étudiant est-il animé ou inanimé ? Quel verbe d'existence correspond ?",
    explanation: "Êtres animés (personnes, animaux) → imasu. Objets / plantes inanimés → arimasu." },
  { sectionId: "self", difficulty: "N3", type: "find_error",
    prompt: "Cette phrase contient une erreur classique. Corrigez-la (réécrivez la phrase entière, en rōmaji).",
    sentence: "Watashi wa Furansu ni kimashita.",
    accepted: [["watashi wa furansu kara kimashita", "furansu kara kimashita"]],
    errorTrap: "に marque une destination (« venir À »), mais ici on veut exprimer l'ORIGINE (« venir DE »). Il faut から.",
    hint: "On veut dire « venir DE » (origine), pas « venir À » (destination) : quelle particule exprime l'origine ?",
    explanation: "~kara kimashita = « je viens de … » (origine). に / へ marquent une destination, pas une origine." },
];

EXAM_QUESTIONS.push(
  ...genVerbQuestions(),
  ...genAdjectiveQuestions(),
  ...genAdjectiveTrapQuestions(),
  ...genAntonymMatchQuestions(),
  ...genColorQuestions(),
  ...genPlaceQuestions(),
  ...genSelfQuestions(),
  ...genKatakanaQuestions(),
  ...genKatakanaConfusableQuestions(),
  ...genLexicalTrapQuestions(),
  ...PARTICLE_TRAP_QUESTIONS,
  ...FIND_ERROR_QUESTIONS,
);

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

  // Piège « phrase recopiée » : pour find_error, si l'utilisateur n'a rien
  // changé à la phrase fautive, on signale directement l'erreur à corriger.
  if (q.type === "find_error" && q.sentence && examTight(arr[0] || "") === examTight(q.sentence)) {
    return { correct: false, near: false, trapMessage: q.errorTrap };
  }

  // « Presque » : pour une traduction (ou la correction d'une erreur), s'il
  // ne manque/diffère qu'un seul mot.
  let near = false;
  if ((q.type === "translate" || q.type === "find_error") && blanks === 1 && (arr[0] || "").trim()) {
    const best = (q.accepted[0] || []).map(examNormalize)
      .sort((a, b) => b.split(" ").length - a.split(" ").length)[0] || "";
    const want = best.split(" ").filter(Boolean);
    const got = examNormalize(arr[0]).split(" ").filter(Boolean);
    const missing = want.filter(w => !got.includes(w));
    near = want.length >= 2 && missing.length === 1;
  }

  // Pièges spécifiques (particules, etc.) : message ciblé sur l'erreur précise.
  return { correct: false, near, trapMessage: detectTrap(q, arr) };
}

// Détecte si la réponse correspond à un piège connu (q.traps), pour donner
// une explication ciblée sur l'erreur précise commise par l'apprenant.
function detectTrap(q, arr) {
  if (!q.traps) return undefined;
  const norm = examNormalize(arr[0] || "");
  const tight = examTight(arr[0] || "");
  for (const trap of q.traps) {
    if (trap.test(norm, tight)) return trap.message;
  }
  return undefined;
}

// Nombre de questions piochées par mode (le pool étant plus grand que ces
// limites, chaque tentative tire un sous-ensemble différent).
const EXAM_DECK_CAPS = { complete: 40, section: 15, level: 30, weak: 24 };

// Construit un jeu de questions selon le mode choisi.
function buildExamDeck(mode, value) {
  let pool;
  if (mode === "section") pool = EXAM_QUESTIONS.filter(q => q.sectionId === value);
  else if (mode === "level") pool = EXAM_QUESTIONS.filter(q => q.difficulty === value);
  else if (mode === "weak") pool = EXAM_QUESTIONS.filter(q => EXAM_WEAK_SECTIONS.includes(q.sectionId));
  else pool = EXAM_QUESTIONS.slice(); // complete
  const shuffled = shuffle(pool);
  const cap = EXAM_DECK_CAPS[mode];
  return cap ? shuffled.slice(0, cap) : shuffled;
}
