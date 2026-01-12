import { GoogleGenAI } from "@google/genai";
import { Transaction, Member, TransactionType } from '../types';
import { formatCurrency } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFinancialAdvice = async (
  transactions: Transaction[],
  members: Member[],
  query: string
): Promise<string> => {
  try {
    const model = 'gemini-3-pro-preview';
    
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const recentTransactions = transactions.slice(0, 10).map(t => 
      `${t.date}: ${t.type} - ${t.category} (${formatCurrency(t.amount)}) - ${t.description}`
    ).join('\n');

    const prompt = `
      You are an expert financial assistant for a church in India. 
      Here is the current financial context:
      - Total Income: ${formatCurrency(income)}
      - Total Expenses: ${formatCurrency(expense)}
      - Net Balance: ${formatCurrency(income - expense)}
      
      Recent Transactions:
      ${recentTransactions}
      
      User Query: "${query}"
      
      Please provide a helpful, concise, and professional response.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "I apologize, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const scanReceipt = async (base64Image: string): Promise<{ amount: number; date: string; description: string } | null> => {
  try {
    // Using gemini-3-pro-preview for multimodal understanding (Image -> Text) with JSON output
    const model = 'gemini-3-pro-preview';
    
    const prompt = `
      Analyze this receipt or financial document image. 
      Extract the total amount (as a number), the date (in YYYY-MM-DD format), and a brief description (e.g. store name or purpose).
      Return ONLY a JSON object with keys: "amount", "date", "description". 
      If a value cannot be found, use null.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw error;
  }
};