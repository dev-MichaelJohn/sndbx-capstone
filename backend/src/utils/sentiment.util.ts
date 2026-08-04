import Sentiment from "sentiment";

const analyzer = new Sentiment();

export const calculateAfinnScore = (text?: string | null): number => {
  if (!text?.trim()) return 0;
  return analyzer.analyze(text).score;
};
