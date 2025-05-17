// components/Quiz.tsx
'use client';

import React, { useState } from 'react';
import { QuizData, QuizQuestion } from '@/lib/quiz'; // Adjust path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {  Info } from "lucide-react";

interface QuizProps {
  quizData: QuizData;
  onQuizComplete?: (score: number, totalQuestions: number) => void;
}

type UserAnswers = {
  [questionId: string]: string | string[]; // string for single choice/TF, string[] for multiple choice
};

export const Quiz: React.FC<QuizProps> = ({ quizData, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleOptionChange = (questionId: string, optionId: string | boolean, questionType: QuizQuestion['type']) => {
    setUserAnswers(prev => {
      if (questionType === 'multiple-choice-multiple') {
        const currentSelection = (prev[questionId] as string[] || []);
        if (currentSelection.includes(optionId as string)) {
          return { ...prev, [questionId]: currentSelection.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentSelection, optionId as string] };
        }
      }
      else if (questionType === 'true-false') {
        return { ...prev, [questionId]: optionId ? 'true' : 'false' }; // Store as string for consistency
      }
      else { // single-choice or true-false
        return { ...prev, [questionId]: optionId as string }; // boolean for TF will be 'true'/'false' strings
      }
    });
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    quizData.questions.forEach(q => {
      const userAnswer = userAnswers[q.id];
      if (q.type === 'multiple-choice-single') {
        if (userAnswer === q.correctOptionId) calculatedScore++;
      } else if (q.type === 'true-false') {
        // Ensure comparison is between boolean or string representations
        if (String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase()) calculatedScore++;
      } else if (q.type === 'multiple-choice-multiple') {
        const correctIds = q.correctOptionIds || [];
        const selectedIds = (userAnswer as string[] || []);
        // Strict check: all correct selected, and no incorrect selected
        if (selectedIds.length === correctIds.length && correctIds.every(id => selectedIds.includes(id))) {
          calculatedScore++;
        }
      }
    });
    setScore(calculatedScore);
    setShowResults(true);
    if (onQuizComplete) {
      onQuizComplete(calculatedScore, quizData.questions.length);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit(); // Auto-submit on last question if preferred, or show submit button
    }
  };
   const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };


  if (showResults) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Quiz Results: {quizData.title}</CardTitle>
          <CardDescription>You scored {score} out of {quizData.questions.length}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizData.questions.map((q, index) => {
            const userAnswer = userAnswers[q.id];
            let isCorrect = false;
            if (q.type === 'multiple-choice-single') isCorrect = userAnswer === q.correctOptionId;
            else if (q.type === 'true-false') isCorrect = String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();
            else if (q.type === 'multiple-choice-multiple') {
                const correctIds = q.correctOptionIds || [];
                const selectedIds = (userAnswer as string[] || []);
                isCorrect = selectedIds.length === correctIds.length && correctIds.every(id => selectedIds.includes(id));
            }

            return (
              <div key={q.id} className={`p-4 rounded-md border ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30'}`}>
                <p className="font-semibold">Question {index + 1}: {q.text}</p>
                <p className="text-sm">Your answer: {
                  Array.isArray(userAnswer) ? (userAnswer as string[]).join(', ') || "None selected" : String(userAnswer) === 'undefined' ? "Not answered" : String(userAnswer)
                }</p>
                {!isCorrect && (
                  <p className="text-sm">Correct answer(s): {
                    q.type === 'multiple-choice-single' ? q.options?.find(opt => opt.id === q.correctOptionId)?.text :
                    q.type === 'true-false' ? String(q.correctAnswer) :
                    q.type === 'multiple-choice-multiple' ? q.options?.filter(opt => q.correctOptionIds?.includes(opt.id)).map(opt => opt.text).join(', ') : ''
                  }</p>
                )}
                {q.explanation && <p className="mt-2 text-xs text-muted-foreground italic"><Info size={14} className="inline mr-1"/> {q.explanation}</p>}
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetry}>Retry Quiz</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>{quizData.title}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {quizData.questions.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 font-medium">{currentQuestion.text}</p>
        {currentQuestion.type === 'multiple-choice-single' && currentQuestion.options && (
          <RadioGroup
            value={userAnswers[currentQuestion.id] as string || ""}
            onValueChange={(value) => handleOptionChange(currentQuestion.id, value, currentQuestion.type)}
          >
            {currentQuestion.options.map(opt => (
              <div key={opt.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={opt.id} id={`${currentQuestion.id}-${opt.id}`} />
                <Label htmlFor={`${currentQuestion.id}-${opt.id}`}>{opt.text}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {currentQuestion.type === 'true-false' && (
          <RadioGroup
            value={userAnswers[currentQuestion.id] as string || ""}
            onValueChange={(value) => handleOptionChange(currentQuestion.id, value === 'true', currentQuestion.type)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="true" id={`${currentQuestion.id}-true`} />
              <Label htmlFor={`${currentQuestion.id}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="false" id={`${currentQuestion.id}-false`} />
              <Label htmlFor={`${currentQuestion.id}-false`}>False</Label>
            </div>
          </RadioGroup>
        )}
        {currentQuestion.type === 'multiple-choice-multiple' && currentQuestion.options && (
            <div className="space-y-2">
                 {currentQuestion.options.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${currentQuestion.id}-${opt.id}`}
                            checked={(userAnswers[currentQuestion.id] as string[] || []).includes(opt.id)}
                            onCheckedChange={() => {
                                handleOptionChange(currentQuestion.id, opt.id, currentQuestion.type);
                            }}
                        />
                        <Label htmlFor={`${currentQuestion.id}-${opt.id}`}>{opt.text}</Label>
                    </div>
                 ))}
            </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline">Previous</Button>
        {currentQuestionIndex < quizData.questions.length - 1 ? (
          <Button onClick={handleNextQuestion}>Next</Button>
        ) : (
          <Button onClick={handleSubmit}>Submit Quiz</Button>
        )}
      </CardFooter>
    </Card>
  );
};