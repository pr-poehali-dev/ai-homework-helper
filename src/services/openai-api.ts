export interface OpenAIAPIKey {
  id: string;
  name: string;
  apiKey: string;
  projectId: string;
  organizationId?: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  usage?: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

export interface APIKeyCreateRequest {
  name: string;
  projectId: string;
  organizationId?: string;
}

export interface APIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

class OpenAIAPIService {
  private baseURL = 'https://api.openai.com/v1';
  private keys: OpenAIAPIKey[] = [];

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    const saved = localStorage.getItem('openai_api_keys');
    if (saved) {
      try {
        this.keys = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading API keys:', error);
        this.keys = [];
      }
    }
  }

  private saveKeys(): void {
    localStorage.setItem('openai_api_keys', JSON.stringify(this.keys));
  }

  private generateAPIKey(): string {
    const prefix = 'sk-';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createAPIKey(request: APIKeyCreateRequest): Promise<OpenAIAPIKey> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 95% success rate
    if (Math.random() < 0.05) {
      throw new Error('Failed to create API key. Please try again.');
    }

    const newKey: OpenAIAPIKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: request.name,
      apiKey: this.generateAPIKey(),
      projectId: request.projectId,
      organizationId: request.organizationId,
      createdAt: new Date().toISOString(),
      isActive: true,
      usage: {
        requests: 0,
        tokens: 0,
        cost: 0
      }
    };

    this.keys.push(newKey);
    this.saveKeys();

    return newKey;
  }

  async getAPIKeys(projectId: string): Promise<OpenAIAPIKey[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.keys.filter(key => key.projectId === projectId);
  }

  async getAPIKey(keyId: string): Promise<OpenAIAPIKey | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.keys.find(key => key.id === keyId) || null;
  }

  async updateAPIKey(keyId: string, updates: Partial<Pick<OpenAIAPIKey, 'name' | 'isActive'>>): Promise<OpenAIAPIKey> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const keyIndex = this.keys.findIndex(key => key.id === keyId);
    if (keyIndex === -1) {
      throw new Error('API key not found');
    }

    this.keys[keyIndex] = { ...this.keys[keyIndex], ...updates };
    this.saveKeys();

    return this.keys[keyIndex];
  }

  async deleteAPIKey(keyId: string): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const keyIndex = this.keys.findIndex(key => key.id === keyId);
    if (keyIndex === -1) {
      throw new Error('API key not found');
    }

    this.keys.splice(keyIndex, 1);
    this.saveKeys();
  }

  async getUsageStats(keyId: string, days: number = 30): Promise<APIUsageStats> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const key = this.keys.find(k => k.id === keyId);
    if (!key) {
      throw new Error('API key not found');
    }

    // Generate mock usage data
    const dailyUsage = [];
    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const requests = Math.floor(Math.random() * 100);
      const tokens = requests * (Math.floor(Math.random() * 1000) + 500);
      const cost = tokens * 0.0015; // $0.0015 per 1K tokens

      dailyUsage.push({
        date: date.toISOString().split('T')[0],
        requests,
        tokens,
        cost: Math.round(cost * 100) / 100
      });

      totalRequests += requests;
      totalTokens += tokens;
      totalCost += cost;
    }

    // Update key usage
    if (key.usage) {
      key.usage.requests = totalRequests;
      key.usage.tokens = totalTokens;
      key.usage.cost = Math.round(totalCost * 100) / 100;
    }

    this.saveKeys();

    return {
      totalRequests,
      totalTokens,
      totalCost: Math.round(totalCost * 100) / 100,
      dailyUsage
    };
  }

  async testAPIKey(apiKey: string): Promise<boolean> {
    // Simulate API call to test key
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate 90% success rate for valid format keys
    if (apiKey.startsWith('sk-') && apiKey.length >= 20) {
      return Math.random() < 0.9;
    }

    return false;
  }

  maskAPIKey(apiKey: string): string {
    if (apiKey.length <= 8) return apiKey;
    
    const start = apiKey.substring(0, 8);
    const end = apiKey.substring(apiKey.length - 4);
    const masked = '*'.repeat(apiKey.length - 12);
    
    return `${start}${masked}${end}`;
  }

  formatCost(cost: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(cost);
  }

  formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }
}

export const openaiAPIService = new OpenAIAPIService();