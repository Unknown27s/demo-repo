import type { Message, AIResponse, ConversationMode } from '../types';
import { AI_TUTOR_BASE_PROMPT, getConversationMode } from '../utils/conversationModes';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private apiKey: string;
  private model: string = 'llama-3.1-8b-instant';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildSystemPrompt(mode: ConversationMode): string {
    const modeConfig = getConversationMode(mode);
    return `${AI_TUTOR_BASE_PROMPT}\n\nCurrent conversation mode: ${modeConfig.name}\n${modeConfig.systemPrompt}`;
  }

  private formatMessages(messages: Message[], mode: ConversationMode): GroqMessage[] {
    const formattedMessages: GroqMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(mode),
      },
    ];

    // Add conversation history (limit to last 10 messages for context)
    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      if (msg.role !== 'system') {
        formattedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return formattedMessages;
  }

  async sendMessage(
    userMessage: string,
    conversationHistory: Message[],
    mode: ConversationMode
  ): Promise<AIResponse> {
    const messages = this.formatMessages(
      [...conversationHistory, { id: '', role: 'user', content: userMessage, timestamp: Date.now() }],
      mode
    );

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      const aiMessage = data.choices[0]?.message?.content || 'I apologize, I couldn\'t generate a response.';

      // Parse for grammar corrections (simple pattern matching)
      const correction = this.extractCorrection(aiMessage);

      return {
        message: aiMessage,
        correction,
      };
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }

  private extractCorrection(message: string): { original: string; corrected: string; explanation: string } | undefined {
    // Look for correction patterns in the AI response
    const correctionPatterns = [
      /I noticed you said ['"]([^'"]+)['"]\. A more natural way would be ['"]([^'"]+)['"]\. (.+?)(?=\n|$)/i,
      /Instead of ['"]([^'"]+)['"], try ['"]([^'"]+)['"]\. (.+?)(?=\n|$)/i,
      /You said ['"]([^'"]+)['"], but it should be ['"]([^'"]+)['"]\. (.+?)(?=\n|$)/i,
    ];

    for (const pattern of correctionPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          original: match[1],
          corrected: match[2],
          explanation: match[3],
        };
      }
    }

    return undefined;
  }
}

// Create a singleton instance
let groqServiceInstance: GroqService | null = null;

export function getGroqService(): GroqService {
  if (!groqServiceInstance) {
    // Get API key from environment or localStorage
    const apiKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key') || '';
    groqServiceInstance = new GroqService(apiKey);
  }
  return groqServiceInstance;
}

export function setGroqApiKey(apiKey: string): void {
  localStorage.setItem('groq_api_key', apiKey);
  groqServiceInstance = new GroqService(apiKey);
}

export function hasGroqApiKey(): boolean {
  return !!(import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key'));
}
