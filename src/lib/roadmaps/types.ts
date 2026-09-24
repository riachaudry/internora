import type { Duration } from '../brand';

export type RoadmapTask = {
  title: string;
  description: string;
  objective: string;
  deliverable: string;
  points?: number;
  submissionType?: 'file' | 'url' | 'text' | 'file_or_url';
  allowedFileTypes?: string[];
  deadlineOffsetDays?: number;
};

export type RoadmapWeek = {
  title: string;
  summary: string;
  objectives: string[];
  tasks: RoadmapTask[];
  isFinal?: boolean;
};

export type FieldRoadmap = {
  slug: string;
  name: string;
  icon: string;
  shortDescription: string;
  description: string;
  skills: string[];
  evaluationCriteria: string;
  certificateCriteria: string;
  rewardCriteria: string;
  /** Eight entries. Index 0-6 are the progression weeks, index 7 is the final project week. */
  weeks: RoadmapWeek[];
};

/**
 * Duration mapping rule (documented so students and admins see the same thing):
 * a D-week program runs the first D-1 progression weeks and then the final
 * project week. So a 4-week program is weeks 1-3 plus the final project,
 * and an 8-week program is weeks 1-7 plus the final project.
 */
export function roadmapFor(field: FieldRoadmap, duration: Duration): RoadmapWeek[] {
  const progression = field.weeks.slice(0, duration - 1);
  const final = { ...field.weeks[field.weeks.length - 1], isFinal: true };
  return [...progression, final];
}

export const t = (
  title: string, description: string, objective: string, deliverable: string,
  points = 10, extra: Partial<RoadmapTask> = {},
): RoadmapTask => ({ title, description, objective, deliverable, points, ...extra });
