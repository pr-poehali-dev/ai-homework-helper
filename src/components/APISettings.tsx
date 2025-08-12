import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { initializeOpenAI, isOpenAIConfigured, type OpenAIConfig } from '@/services/openai';

interface APISettingsProps {
  onConfigured?: (configured: boolean) => void;
}

export default function APISettings({ onConfigured }: APISettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Проверяем сохраненные настройки
    const savedKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('openai_model');
    const savedTemp = localStorage.getItem('openai_temperature');
    const savedTokens = localStorage.getItem('openai_max_tokens');

    if (savedKey) {
      setApiKey(savedKey);
      setModel(savedModel || 'gpt-4');
      setTemperature(Number(savedTemp) || 0.7);
      setMaxTokens(Number(savedTokens) || 2000);
      
      // Автоматически инициализируем сервис
      handleSaveConfig(savedKey, savedModel || 'gpt-4', Number(savedTemp) || 0.7, Number(savedTokens) || 2000);
    }

    setIsConfigured(isOpenAIConfigured());
  }, []);

  const handleSaveConfig = (key?: string, selectedModel?: string, temp?: number, tokens?: number) => {
    const config: OpenAIConfig = {
      apiKey: key || apiKey,
      model: selectedModel || model,
      temperature: temp !== undefined ? temp : temperature,
      maxTokens: tokens !== undefined ? tokens : maxTokens,
    };

    try {
      initializeOpenAI(config);
      
      // Сохраняем в localStorage
      localStorage.setItem('openai_api_key', config.apiKey);
      localStorage.setItem('openai_model', config.model || 'gpt-4');
      localStorage.setItem('openai_temperature', config.temperature?.toString() || '0.7');
      localStorage.setItem('openai_max_tokens', config.maxTokens?.toString() || '2000');
      
      setIsConfigured(true);
      onConfigured?.(true);
      setTestResult({ success: true, message: 'Настройки сохранены успешно' });
    } catch (error) {
      setTestResult({ success: false, message: 'Ошибка сохранения настроек' });
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Введите API ключ' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Подключение успешно' });
        handleSaveConfig();
      } else {
        setTestResult({ success: false, message: 'Неверный API ключ или проблема с доступом' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Ошибка подключения к OpenAI API' });
    } finally {
      setIsTesting(false);
    }
  };

  const clearConfig = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('openai_model');
    localStorage.removeItem('openai_temperature');
    localStorage.removeItem('openai_max_tokens');
    
    setApiKey('');
    setModel('gpt-4');
    setTemperature(0.7);
    setMaxTokens(2000);
    setIsConfigured(false);
    setTestResult(null);
    
    onConfigured?.(false);
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon name="Settings" size={20} className="mr-2" />
            Настройки OpenAI API
          </div>
          {isConfigured && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Настроен
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Подключите свой API ключ OpenAI для использования ИИ функций
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key */}
        <div>
          <Label htmlFor="api-key" className="text-sm font-medium mb-2 block">
            API Ключ OpenAI
          </Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                <Icon name={showKey ? "EyeOff" : "Eye"} size={16} />
              </Button>
            </div>
            <Button onClick={testConnection} disabled={isTesting || !apiKey.trim()}>
              {isTesting ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="TestTube" size={16} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Получите ключ на{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              platform.openai.com
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <Label htmlFor="model" className="text-sm font-medium mb-2 block">
            Модель
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4 (рекомендуется)</SelectItem>
              <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (быстрее)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="temperature" className="text-sm font-medium mb-2 block">
              Креативность: {temperature}
            </Label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Точно</span>
              <span>Креативно</span>
            </div>
          </div>

          <div>
            <Label htmlFor="max-tokens" className="text-sm font-medium mb-2 block">
              Макс. токенов
            </Label>
            <Input
              id="max-tokens"
              type="number"
              min="100"
              max="4000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <Icon 
              name={testResult.success ? "CheckCircle" : "AlertCircle"} 
              size={16} 
            />
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleSaveConfig()} 
            disabled={!apiKey.trim()}
            className="flex-1"
          >
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить настройки
          </Button>
          
          {isConfigured && (
            <Button variant="outline" onClick={clearConfig}>
              <Icon name="Trash2" size={16} className="mr-2" />
              Очистить
            </Button>
          )}
        </div>

        {/* Current Config Display */}
        {isConfigured && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Icon name="Info" size={16} className="mr-2" />
              Текущие настройки
            </h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>API ключ: {maskApiKey(apiKey)}</p>
              <p>Модель: {model}</p>
              <p>Креативность: {temperature}</p>
              <p>Макс. токенов: {maxTokens}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}