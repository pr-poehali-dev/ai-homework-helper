interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      ...config
    };
  }

  private async makeRequest(messages: ChatMessage[]): Promise<OpenAIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    }
  }

  async generateAcademicWork(params: {
    workType: string;
    topic: string;
    requirements?: string;
    pages?: string;
  }): Promise<string> {
    const { workType, topic, requirements, pages } = params;

    const systemPrompt = `Ты экспертный помощник для написания академических работ. 
    Создавай качественные, структурированные и уникальные тексты на русском языке.
    Обязательно включай введение, основную часть с разделами, заключение и список литературы.
    Используй академический стиль изложения.`;

    const userPrompt = `Напиши ${workType} на тему: "${topic}"
    ${requirements ? `Требования: ${requirements}` : ''}
    ${pages ? `Объем: ${pages} страниц` : ''}
    
    Структура должна включать:
    1. Введение
    2. Основная часть (разделенная на главы)
    3. Заключение
    4. Список литературы`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0]?.message?.content || 'Ошибка генерации текста';
  }

  async solveHomework(params: {
    subject: string;
    level: string;
    task: string;
  }): Promise<string> {
    const { subject, level, task } = params;

    const systemPrompt = `Ты экспертный преподаватель по предмету "${subject}".
    Решай задания для уровня "${level}" с подробными объяснениями.
    Предоставляй пошаговое решение на русском языке.
    Объясняй каждый шаг доступным языком.`;

    const userPrompt = `Помоги решить задание по предмету "${subject}" (уровень: ${level}):

    ${task}

    Требования к ответу:
    1. Подробное пошаговое решение
    2. Объяснение каждого шага
    3. Проверка результата (если применимо)
    4. Дополнительные пояснения теории`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    return response.choices[0]?.message?.content || 'Ошибка решения задания';
  }

  async checkPlagiarism(text: string): Promise<{
    uniqueness: number;
    report: string;
  }> {
    // Заглушка для проверки уникальности
    // В реальном проекте здесь был бы запрос к сервису проверки плагиата
    const uniqueness = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    const systemPrompt = `Ты эксперт по анализу текстов на уникальность.
    Проанализируй текст и дай рекомендации по повышению уникальности.`;

    const userPrompt = `Проанализируй следующий текст и дай рекомендации:

    ${text.slice(0, 1000)}...

    Предоставь:
    1. Общую оценку качества текста
    2. Рекомендации по улучшению уникальности
    3. Советы по академическому стилю`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.makeRequest(messages);
      const report = response.choices[0]?.message?.content || 'Анализ недоступен';

      return { uniqueness, report };
    } catch (error) {
      return {
        uniqueness,
        report: 'Подробный анализ временно недоступен. Проверьте настройки API.'
      };
    }
  }

  updateConfig(newConfig: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Singleton instance
let openAIService: OpenAIService | null = null;

export const getOpenAIService = (config?: OpenAIConfig): OpenAIService => {
  if (!openAIService && config) {
    openAIService = new OpenAIService(config);
  }
  
  if (!openAIService) {
    throw new Error('OpenAI service not initialized. Please provide API key.');
  }
  
  return openAIService;
};

export const initializeOpenAI = (config: OpenAIConfig): void => {
  openAIService = new OpenAIService(config);
};

export const isOpenAIConfigured = (): boolean => {
  return openAIService !== null;
};

export type { OpenAIConfig, ChatMessage, OpenAIResponse };