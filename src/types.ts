/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GuideStep {
  step_number: number;
  title: string;
  timestamp: string;
  instructions: string;
  why_it_matters: string;
  common_mistake: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  category: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface PracticeTask {
  task: string;
  description: string;
}

export interface Mistake {
  mistake: string;
  how_to_avoid: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface LearningGuide {
  title: string;
  summary: string;
  skill_level: string;
  materials: string[];
  prerequisites: string[];
  steps: GuideStep[];
  key_concepts: KeyConcept[];
  mistakes_to_avoid: Mistake[];
  practice_tasks: PracticeTask[];
  checklist: ChecklistItem[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface SavedGuide {
  id: string;
  userId: string;
  title: string;
  youtubeUrl: string;
  goal: string;
  guide: LearningGuide;
  completedSteps: Record<number, boolean>;
  completedChecklist: Record<string, boolean>;
  quizAnswers: Record<string, string>;
  savedAt: string;
}
