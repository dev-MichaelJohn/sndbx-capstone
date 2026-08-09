import Sentiment from "sentiment";

const analyzer = new Sentiment();

// ============================================================================
// 1. DOMAIN-SPECIFIC DICTIONARIES (English, Tagalog, Taglish, Bisaya/Cebuano)
// ============================================================================

/** Multi-word N-Gram Expressions (Matched BEFORE single words) */
const NGRAM_LEXICON: Record<string, number> = {
  // Positive Multi-Word Expressions
  "well prepared": 3,
  "well-prepared": 3,
  "master of subject": 4,
  "mastery of subject": 4,
  "mastered the subject": 4,
  "explains clearly": 3,
  "explains very clearly": 4,
  "easy to understand": 3,
  "open for questions": 3,
  "open to questions": 3,
  "fair grader": 3,
  "fair grading": 3,
  "constructive feedback": 3,
  "gives feedback": 2,
  "second chance": 2,
  "gives consideration": 3,
  "dedicated teacher": 4,
  "passionate about teaching": 4,

  // Local / Bisaya / Tagalog Positive Multi-Word Expressions
  "magaling mag-explain": 4,
  "magaling magturo": 4,
  "madaling lapitan": 3,
  "mabait magturo": 3,
  "dali ra sabton": 3,
  "sayon ra sabton": 3,
  "maayo mutudlo": 4,
  "maayo motudlo": 4,
  "maayong mutudlo": 4,
  "mabuot kaayo": 3,
  "buotan kaayo": 3,
  "dali ra pangutan-on": 3,
  "dali pangutan-on": 3,
  "dako ug tabang": 3,
  "dako ug natabang": 3,
  "masipag magturo": 3,

  // Negative Multi-Word Expressions
  "reads off slides": -3,
  "reads ppt": -3,
  "slide reader": -3,
  "powerpoint reader": -3,
  "hard to understand": -3,
  "difficult to understand": -3,
  "always late": -3,
  "no feedback": -3,
  "zero consideration": -3,
  "no consideration": -3,
  "too much requirements": -2,
  "heavy workload": -2,
  "high failing rate": -3,
  "waste of time": -4,

  // Local / Bisaya / Tagalog Negative Multi-Word Expressions
  "nagbasa ra sa ppt": -3,
  "nagbasa ra sa powerpoint": -3,
  "palaging late": -3,
  "sige lang late": -3,
  "sige ra late": -3,
  "walay feedback": -3,
  "hindi nagbibigay ng feedback": -3,
  "walay consideration": -3,
  "walay ka-consideration": -3,
  "dili masabtan": -3,
  "di masabtan": -3,
  "walay masabtan": -3,
  "way klaro": -3,
  "walay klaro": -3,
  "walay ka-klaro": -3,
  "dili kabalo magturo": -4,
  "di kabalo mutudlo": -4,
  "walay matutunan": -4,
  "walay natun-an": -4,
  "walay natutunan": -4,
  "bagsakan class": -3,
  "good luck nalang": -2,
  "good luck na lang": -2,
  "sana all nagturo": -2,
  "usik sa oras": -4,
};

/** Unigram Multilingual Dictionary */
const UNIGRAM_LEXICON: Record<string, number> = {
  // English Positive
  approachable: 2,
  knowledgeable: 3,
  accommodating: 2,
  engaging: 3,
  inspiring: 3,
  prepared: 2,
  organized: 2,
  passionate: 3,
  understanding: 2,
  fair: 2,
  patient: 2,
  punctual: 2,
  resourceful: 2,
  supportive: 2,
  clear: 2,
  helpful: 2,
  effective: 3,
  interactive: 2,
  considerate: 2,
  encouraging: 3,
  mastery: 3,
  expert: 3,
  dedication: 3,
  kind: 2,
  friendly: 2,

  // English Negative
  unapproachable: -2,
  unprepared: -3,
  monotone: -2,
  disorganized: -2,
  confusing: -2,
  terror: -3,
  bias: -3,
  biased: -3,
  unfair: -3,
  late: -2,
  absent: -2,
  tardy: -2,
  boring: -2,
  dull: -2,
  rude: -3,
  arrogant: -3,
  harsh: -2,
  unclear: -2,
  unreasonable: -3,
  strict: -1,
  favoritism: -3,
  ghosting: -2,

  // Tagalog Positive
  magaling: 3,
  mabait: 2,
  masipag: 2,
  maunawain: 2,
  maaasahan: 2,
  maayos: 2,
  madaling: 1,
  lodi: 2,
  petmalu: 2,
  husay: 3,

  // Tagalog Negative
  tamad: -3,
  magulo: -2,
  suplado: -2,
  suplada: -2,
  masungit: -2,
  bagsak: -2,
  bagsakan: -3,
  madamot: -2,
  pahirap: -3,
  kwenta: -3,

  // Bisaya Positive
  maayo: 3,
  maayong: 3,
  mabuot: 2,
  buotan: 2,
  kugi: 2,
  kugihan: 2,
  hawod: 3,
  masabtan: 3,
  sabtonon: 3,
  chada: 2,
  tsada: 2,
  lingaw: 3,
  malingaw: 3,
  kalingaw: 3,
  alisto: 2,
  abtik: 2,
  tarong: 2,
  sinabtanay: 2,
  sayon: 2,
  sayun: 2,

  // Bisaya Negative
  langay: -2,
  dugay: -2,
  tapulan: -3,
  tapolan: -3,
  maldito: -3,
  maldita: -3,
  isog: -1,
  samok: -2,
  lisod: -2,
  lisud: -2,
  hasol: -2,
  paantos: -3,
  antos: -2,
  gubot: -2,
  salbahis: -3,
  kapoy: -1,
  yawyawan: -2,
  yawyaw: -2,
  gara: -2,
  garaon: -2,
  sabaan: -1,
  hilas: -3,
};

// Modifiers
const PRE_INTENSIFIERS = new Set([
  "very",
  "extremely",
  "super",
  "so",
  "highly",
  "exceptionally",
  "really",
  "sobrang",
  "lubos",
  "napaka",
  "grabe",
  "grabi",
  "talaga",
  "pierte",
  "pierteng",
  "pwerte",
  "pwerteng",
  "hastang",
  "subra",
  "subrang",
]);

const POST_INTENSIFIERS = new Set(["kaayo", "kayo", "kaau", "gyud", "gud", "ka-ayo"]);
const DIMINISHERS = new Set(["slightly", "somewhat", "medyo", "bahagya", "gamay"]);
const CONTRASTIVE_CONJUNCTIONS = new Set([
  "but",
  "however",
  "although",
  "though",
  "yet",
  "pero",
  "kaso",
  "subalit",
  "bagamat",
  "apan",
]);
const NEGATIONS = new Set([
  "not",
  "no",
  "never",
  "none",
  "neither",
  "nor",
  "cannot",
  "can't",
  "don't",
  "doesn't",
  "didn't",
  "won't",
  "wouldn't",
  "hindi",
  "di",
  "wala",
  "huwag",
  "dili",
  "walay",
  "way",
  "wai",
  "ayaw",
]);

// Aspect Keywords for Teaching Feedback Categorization
const ASPECT_KEYWORDS: Record<string, string[]> = {
  PEDAGOGY: [
    "explain",
    "discuss",
    "tudlo",
    "turo",
    "lecture",
    "lesson",
    "ppt",
    "slides",
    "subject",
    "mastery",
    "concept",
    "clear",
    "confusing",
    "sabton",
    "matutunan",
    "teaching",
    "teach",
  ],
  PUNCTUALITY: [
    "late",
    "absent",
    "time",
    "schedule",
    "dugay",
    "langay",
    "tardy",
    "punctual",
    "sayo",
    "oras",
    "attend",
  ],
  GRADING: [
    "grade",
    "exam",
    "test",
    "quiz",
    "score",
    "fair",
    "bias",
    "bagsak",
    "singko",
    "consideration",
    "madamot",
    "retake",
    "failing",
    "checking",
  ],
  ATTITUDE: [
    "approachable",
    "mabuot",
    "mabait",
    "terror",
    "isog",
    "suplado",
    "masungit",
    "patient",
    "rude",
    "polite",
    "arrogant",
    "understanding",
    "kind",
  ],
  WORKLOAD: [
    "requirement",
    "project",
    "assignment",
    "workload",
    "task",
    "pahirap",
    "hasol",
    "overwhelming",
    "demanding",
  ],
};

// ============================================================================
// 2. CORE SENTIMENT ENGINE
// ============================================================================

export interface AspectBreakdown {
  aspect: string;
  score: number;
  classification: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
}

export interface ComprehensiveSentimentResult {
  score: number;
  comparative: number;
  classification: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED";
  primaryAspects: AspectBreakdown[];
  detectedIdioms: string[];
  positiveWords: string[];
  negativeWords: string[];
  summary: string;
}

/**
 * Deep Multilingual & Context-Aware Sentiment Analyzer.
 * Supports N-Gram Idiom Matching, Contrastive Clauses, Modifier Multipliers,
 * Negation Scope, Aspect Category Breakdown, and MIXED classification.
 */
export const analyzeComplexSentiment = (text?: string | null): ComprehensiveSentimentResult => {
  if (!text || !text.trim()) {
    return {
      score: 0,
      comparative: 0,
      classification: "NEUTRAL",
      primaryAspects: [],
      detectedIdioms: [],
      positiveWords: [],
      negativeWords: [],
      summary: "No qualitative comment provided.",
    };
  }

  const cleanText = text.trim();
  let textToAnalyze = cleanText.toLowerCase();

  const detectedIdioms: string[] = [];
  let nGramBonusScore = 0;

  // Step 1: Detect and Extract Multi-Word Expressions (Idioms / Phrases)
  for (const [phrase, score] of Object.entries(NGRAM_LEXICON)) {
    if (textToAnalyze.includes(phrase)) {
      detectedIdioms.push(phrase);
      nGramBonusScore += score;
      // Mask phrase out to prevent double-counting unigrams
      textToAnalyze = textToAnalyze.replaceAll(phrase, " ");
    }
  }

  // Step 2: Clause Segmentation by Contrastive Conjunctions ("but", "pero", "apan")
  const contrastPattern = /\b(but|however|although|though|yet|pero|kaso|subalit|bagamat|apan)\b/gi;
  const clauses = textToAnalyze.split(contrastPattern);

  let cumulativeScore = nGramBonusScore;
  const aspectScores: Record<string, number> = {
    PEDAGOGY: 0,
    PUNCTUALITY: 0,
    GRADING: 0,
    ATTITUDE: 0,
    WORKLOAD: 0,
  };

  for (let cIdx = 0; cIdx < clauses.length; cIdx++) {
    const clause = clauses[cIdx]!.trim();
    if (!clause) continue;

    if (CONTRASTIVE_CONJUNCTIONS.has(clause)) continue;

    // Post-contrastive clauses carry 1.6x weight (shifts evaluation intent)
    const isPostContrastClause =
      cIdx > 0 && CONTRASTIVE_CONJUNCTIONS.has(clauses[cIdx - 1]?.trim() || "");
    const clauseWeight = isPostContrastClause ? 1.6 : 1.0;

    const baseAnalysis = analyzer.analyze(clause, {
      extras: UNIGRAM_LEXICON,
    });

    let clauseScore = baseAnalysis.score;
    const tokens = clause.replace(/[^\w\s-]/g, "").split(/\s+/);

    // Aspect Tagging for this clause
    const matchedAspects = new Set<string>();
    for (const [aspect, keywords] of Object.entries(ASPECT_KEYWORDS)) {
      if (keywords.some((kw) => clause.includes(kw))) {
        matchedAspects.add(aspect);
      }
    }

    // Contextual Token Processing (Modifiers & Negations)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;

      // Pre-Intensifiers (e.g., "very helpful", "pwerteng maayo")
      if (PRE_INTENSIFIERS.has(token) && i + 1 < tokens.length) {
        const nextWord = tokens[i + 1]!;
        const wordScore = UNIGRAM_LEXICON[nextWord] || 0;
        if (wordScore !== 0) clauseScore += wordScore * 0.5;
      }

      // Post-Intensifiers for Bisaya syntax (e.g., "maayo kaayo")
      if (POST_INTENSIFIERS.has(token) && i - 1 >= 0) {
        const prevWord = tokens[i - 1]!;
        const wordScore = UNIGRAM_LEXICON[prevWord] || 0;
        if (wordScore !== 0) clauseScore += wordScore * 0.5;
      }

      // Diminishers (e.g., "medyo lisud")
      if (DIMINISHERS.has(token) && i + 1 < tokens.length) {
        const nextWord = tokens[i + 1]!;
        const wordScore = UNIGRAM_LEXICON[nextWord] || 0;
        if (wordScore !== 0) clauseScore -= wordScore * 0.5;
      }

      // Negation Scope Flipping (e.g., "dili tapulan", "not bad")
      if (NEGATIONS.has(token) && i + 1 < tokens.length) {
        const nextWord = tokens[i + 1]!;
        const wordScore = UNIGRAM_LEXICON[nextWord] || 0;
        if (wordScore !== 0) clauseScore += -2 * wordScore;
      }
    }

    const weightedClauseScore = clauseScore * clauseWeight;
    cumulativeScore += weightedClauseScore;

    // Distribute clause score to matched aspects
    matchedAspects.forEach((aspect) => {
      aspectScores[aspect] = (aspectScores[aspect] || 0) + weightedClauseScore;
    });
  }

  // Step 3: Global AFINN Word Extraction
  const globalAnalysis = analyzer.analyze(cleanText.toLowerCase(), {
    extras: UNIGRAM_LEXICON,
  });

  const finalScore = Number(cumulativeScore.toFixed(2));
  const wordCount = cleanText.split(/\s+/).length || 1;
  const comparative = Number((finalScore / wordCount).toFixed(2));

  // Step 4: Aspect Breakdown Formulation
  const primaryAspects: AspectBreakdown[] = Object.entries(aspectScores)
    .filter(([_, score]) => Math.abs(score) > 0.1)
    .map(([aspect, score]) => ({
      aspect,
      score: Number(score.toFixed(2)),
      classification: score > 0.5 ? "POSITIVE" : score < -0.5 ? "NEGATIVE" : "NEUTRAL",
    }));

  // Step 5: Overall Classification (Handles MIXED feedback)
  const hasStrongPositiveAspect = primaryAspects.some((a) => a.score > 1.5);
  const hasStrongNegativeAspect = primaryAspects.some((a) => a.score < -1.5);

  let classification: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" = "NEUTRAL";

  if (hasStrongPositiveAspect && hasStrongNegativeAspect) {
    classification = "MIXED";
  } else if (finalScore > 0.5) {
    classification = "POSITIVE";
  } else if (finalScore < -0.5) {
    classification = "NEGATIVE";
  }

  // Step 6: Readable Summary Generation
  let summary = `Overall ${classification.toLowerCase()} sentiment (${finalScore}).`;
  if (primaryAspects.length > 0) {
    const aspectSummary = primaryAspects
      .map((a) => `${a.aspect}: ${a.classification.toLowerCase()}`)
      .join(", ");
    summary += ` Aspects discussed: [${aspectSummary}].`;
  }

  return {
    score: finalScore,
    comparative,
    classification,
    primaryAspects,
    detectedIdioms,
    positiveWords: Array.from(new Set(globalAnalysis.positive)),
    negativeWords: Array.from(new Set(globalAnalysis.negative)),
    summary,
  };
};

/**
 * Returns the computed compound sentiment score for a comment string.
 * Maintained for 100% backward compatibility across execution and report services.
 */
export const calculateAfinnScore = (text?: string | null): number => {
  return analyzeComplexSentiment(text).score;
};
