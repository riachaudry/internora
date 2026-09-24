import { SCORE_WEIGHTS, WEEK_COMPLETION_THRESHOLD } from './brand';

export type ScoredTask = {
  points: number; is_required: boolean; score: number | null; status: string; is_final_week: boolean;
};

/**
 * Final score = 70% weekly work + 30% final project.
 * Each task score is a 0-100 percentage of its own points.
 */
export function computeScores(tasks: ScoredTask[]) {
  const weekly = tasks.filter((t) => !t.is_final_week);
  const final = tasks.filter((t) => t.is_final_week);
  const weeklyScore = weightedPercent(weekly);
  const finalScore = weightedPercent(final);
  const overall = round2(weeklyScore * SCORE_WEIGHTS.weekly + finalScore * SCORE_WEIGHTS.finalProject);
  return { weeklyScore: round2(weeklyScore), finalProjectScore: round2(finalScore), overallScore: overall };
}

function weightedPercent(tasks: ScoredTask[]) {
  const totalPoints = tasks.reduce((s, t) => s + t.points, 0);
  if (!totalPoints) return 0;
  const earned = tasks.reduce((s, t) => s + (t.points * (t.score ?? 0)) / 100, 0);
  return (earned / totalPoints) * 100;
}

/** A week completes when enough of its required points are approved. */
export function isWeekComplete(tasks: { points: number; is_required: boolean; status: string }[]) {
  const required = tasks.filter((t) => t.is_required);
  if (!required.length) return false;
  const total = required.reduce((s, t) => s + t.points, 0);
  const approved = required.filter((t) => t.status === 'approved').reduce((s, t) => s + t.points, 0);
  return total > 0 && approved / total >= WEEK_COMPLETION_THRESHOLD;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
