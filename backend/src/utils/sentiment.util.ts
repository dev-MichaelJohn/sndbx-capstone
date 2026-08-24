import Sentiment from "sentiment";

const analyzer = new Sentiment();

// ============================================================================
// 1. DOMAIN-SPECIFIC DICTIONARIES (English, Tagalog, Taglish, Bisaya/Cebuano)
// ============================================================================

/** Multi-word N-Gram Expressions (Matched BEFORE single words) */
const NGRAM_LEXICON: Record<string, number> = {
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

const NGRAM_PATTERNS = Object.keys(NGRAM_LEXICON)
  .sort((a, b) => b.length - a.length)
  .map((phrase) => phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"));

const NGRAM_REGEX = new RegExp(NGRAM_PATTERNS.join("|"), "gi");

/** Unigram Multilingual Dictionary */
const UNIGRAM_LEXICON: Record<string, number> = {
  // English
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

  // Tagalog
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

  // Bisaya
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

// English negations removed; let `sentiment` base module handle English natively to avoid double-counting.
const LOCAL_NEGATIONS = new Set([
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

// Aspect Keywords Pre-compiled to Word Boundary Regexes
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

const ASPECT_REGEXES: Record<string, RegExp> = {};
for (const [aspect, keywords] of Object.entries(ASPECT_KEYWORDS)) {
  ASPECT_REGEXES[aspect] = new RegExp(`\\b(${keywords.join("|")})\\b`, "i");
}

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

// Global caching for base word scores to prevent redundant processing
const wordScoreCache: Record<string, number> = {};

/**
 * Safely retrieves the sentiment score for a single word.
 * Checks local UNIGRAM_LEXICON first, falls back to standard English AFINN dictionary.
 */
const getWordScore = (word: string): number => {
  if (UNIGRAM_LEXICON[word] !== undefined) return UNIGRAM_LEXICON[word];
  if (wordScoreCache[word] !== undefined) return wordScoreCache[word];

  const analysis = analyzer.analyze(word);
  wordScoreCache[word] = analysis.score;
  return analysis.score;
};

/**
 * Look ahead or behind by N tokens to find a scorable word (skipping fillers/stop words).
 */
const getNearbyWordScore = (
  tokens: string[],
  startIndex: number,
  direction: 1 | -1,
  maxDistance = 2,
): number => {
  for (let d = 1; d <= maxDistance; d++) {
    const idx = startIndex + d * direction;

    if (idx < 0 || idx >= tokens.length) break;

    const word = tokens[idx] ?? "";

    if (word !== "") {
      const score = getWordScore(word);
      if (score !== 0) return score;
    }
  }
  return 0;
};

/**
 * Deep Multilingual & Context-Aware Sentiment Analyzer.
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

  // Single-pass Regex match for all N-Gram expressions
  textToAnalyze = textToAnalyze.replace(NGRAM_REGEX, (match) => {
    const phrase = match.toLowerCase();
    const score = NGRAM_LEXICON[phrase];
    if (score !== undefined) {
      detectedIdioms.push(phrase);
      nGramBonusScore += score;
    }
    return " "; // Mask phrase to avoid double-counting unigrams
  });

  // Clause Segmentation by Contrastive Conjunctions
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
    if (!clause || CONTRASTIVE_CONJUNCTIONS.has(clause)) continue;

    const isPostContrastClause =
      cIdx > 0 && CONTRASTIVE_CONJUNCTIONS.has(clauses[cIdx - 1]?.trim() || "");
    const clauseWeight = isPostContrastClause ? 1.6 : 1.0;

    // Base analysis processes standard negations correctly for English
    const baseAnalysis = analyzer.analyze(clause, {
      extras: UNIGRAM_LEXICON,
    });

    let clauseScore = baseAnalysis.score;
    const tokens = clause.replace(/[^\w\s-]/g, "").split(/\s+/);

    const matchedAspects = new Set<string>();
    for (const [aspect, regex] of Object.entries(ASPECT_REGEXES)) {
      if (regex.test(clause)) {
        matchedAspects.add(aspect);
      }
    }

    // Apply custom local modifier windows (intensifiers, diminishers, local negations)
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;

      if (PRE_INTENSIFIERS.has(token)) {
        const targetScore = getNearbyWordScore(tokens, i, 1, 2);
        if (targetScore !== 0) clauseScore += targetScore * 0.5;
      }

      if (POST_INTENSIFIERS.has(token)) {
        const targetScore = getNearbyWordScore(tokens, i, -1, 2);
        if (targetScore !== 0) clauseScore += targetScore * 0.5;
      }

      if (DIMINISHERS.has(token)) {
        const targetScore = getNearbyWordScore(tokens, i, 1, 2);
        if (targetScore !== 0) clauseScore -= targetScore * 0.5;
      }

      if (LOCAL_NEGATIONS.has(token)) {
        const targetScore = getNearbyWordScore(tokens, i, 1, 3);
        // Base analysis added it positively/negatively. We reverse its original effect.
        if (targetScore !== 0) clauseScore += -2 * targetScore;
      }
    }

    const weightedClauseScore = clauseScore * clauseWeight;
    cumulativeScore += weightedClauseScore;

    // Distribute the score fairly among matched aspects to prevent inflation
    if (matchedAspects.size > 0) {
      const splitScore = weightedClauseScore / matchedAspects.size;
      matchedAspects.forEach((aspect) => {
        aspectScores[aspect] = (aspectScores[aspect] || 0) + splitScore;
      });
    }
  }

  const globalAnalysis = analyzer.analyze(cleanText.toLowerCase(), {
    extras: UNIGRAM_LEXICON,
  });

  const finalScore = Number(cumulativeScore.toFixed(2));
  const wordCount = cleanText.split(/\s+/).length || 1;
  const comparative = Number((finalScore / wordCount).toFixed(2));

  const primaryAspects: AspectBreakdown[] = Object.entries(aspectScores)
    .filter(([_, score]) => Math.abs(score) > 0.1)
    .map(([aspect, score]) => ({
      aspect,
      score: Number(score.toFixed(2)),
      classification: score > 0.5 ? "POSITIVE" : score < -0.5 ? "NEGATIVE" : "NEUTRAL",
    }));

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

export const calculateAfinnScore = (text?: string | null): number => {
  return analyzeComplexSentiment(text).score;
};
