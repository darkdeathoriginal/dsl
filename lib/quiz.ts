// lib/quiz.ts (or extend lib/content.ts)
import fs from 'fs';
import path from 'path';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice-single' | 'true-false' | 'multiple-choice-multiple';
  text: string;
  options?: QuizOption[]; // Optional for true-false
  correctOptionId?: string; // For single choice
  correctAnswer?: boolean; // For true-false
  correctOptionIds?: string[]; // For multiple choice multiple
  explanation?: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

const contentDirectory = path.join(process.cwd(), 'content');

export async function getQuizData(unitSlug: string, sectionSlugOrQuizName: string): Promise<QuizData | null> {
  const quizFileName = `${sectionSlugOrQuizName}-quiz.json`; // Convention
  const filePath = path.join(contentDirectory, unitSlug, quizFileName);

  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const quizData: QuizData = JSON.parse(fileContents);
      return quizData;
    }
    return null;
  } catch (error) {
    console.error(`Error loading quiz data for ${unitSlug}/${sectionSlugOrQuizName}:`, error);
    return null;
  }
}