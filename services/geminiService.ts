import { GoogleGenAI } from "@google/genai";
import { DailyStats } from "../types";

// Using gemini-3-flash-preview for basic text tasks
const MODEL_NAME = 'gemini-3-flash-preview';

export const getHydrationAdvice = async (
  currentIntake: number, 
  target: number, 
  weather: string = "Sunny, 25°C"
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      I am building a water tracking app. The user has consumed ${currentIntake}ml out of their ${target}ml goal today.
      The current weather is ${weather}.
      
      Provide a short, encouraging, and scientifically accurate hydration tip or message (max 2 sentences).
      If they are low on water, encourage them nicely. If they are doing well, congratulate them.
      Do not use markdown. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Stay hydrated and keep up the good work!";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Remember to drink water regularly throughout the day!";
  }
};

export const generateWeeklyReport = async (weeklyStats: DailyStats[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const statsSummary = weeklyStats.map(day => ({
      date: day.date,
      total: day.records.reduce((sum, r) => sum + r.amount, 0),
      goal: day.target
    }));

    const prompt = `
      Analyze the following weekly hydration data for a user:
      ${JSON.stringify(statsSummary)}

      Please provide a concise, friendly, and motivational analysis (max 100 words).
      1. Highlight their best day.
      2. Identify any pattern (e.g., "You tend to drink less on weekends").
      3. Give one specific actionable tip for next week.
      
      Format the response as plain text, but use emojis to make it fun.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Great job tracking your water this week! Keep consistent to build a healthy habit.";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Unable to generate report right now. Keep drinking water!";
  }
};