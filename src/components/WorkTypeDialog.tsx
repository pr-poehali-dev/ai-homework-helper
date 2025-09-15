import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getOpenAIService, isOpenAIConfigured } from '@/services/openai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkTypeSelected: (workData: {
    workType: string;
    topic: string;
    requirements: string;
    pages: string;
  }) => void;
}

const WorkTypeDialog = ({ isOpen, onClose, onWorkTypeSelected }: WorkTypeDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const initialMessage: Message = {
    id: '1',
    role: 'assistant',
    content: 'Привет! Я помогу вам подобрать подходящий тип академической работы и сформулировать требования. Расскажите мне:\n\n• Какую работу вам нужно написать?\n• По какому предмету или теме?\n• Есть ли особые требования от преподавателя?\n• Сколько должно быть страниц?\n\nОпишите своими словами, а я помогу все правильно оформить!',
    timestamp: new Date()
  };

  useEffect(() => {
    if (isOpen) {
      setMessages([initialMessage]);
      setExtractedData(null);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (isOpenAIConfigured()) {
        const openAI = getOpenAIService();
        const chatHistory = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const systemPrompt = `Ты помощник по академическим работам. Твоя задача:
1. Выяснить тип работы (реферат, курсовая, дипломная, диссертация, домашнее задание)
2. Уточнить тему
3. Собрать требования 
4. Определить объем

Когда у тебя достаточно информации, добавь в конец ответа JSON в формате:
[EXTRACTED_DATA]
{
  "workType": "essay|coursework|diploma|thesis|homework",
  "topic": "тема работы",
  "requirements": "дополнительные требования", 
  "pages": "количество страниц"
}
[/EXTRACTED_DATA]

Будь дружелюбным и помогай сформулировать требования правильно.`;

        const response = await openAI.chat([
          { role: 'system', content: systemPrompt },
          ...chatHistory
        ]);

        // Проверяем, есть ли извлеченные данные
        const extractMatch = response.content.match(/\[EXTRACTED_DATA\](.*?)\[\/EXTRACTED_DATA\]/s);
        let assistantContent = response.content;
        
        if (extractMatch) {
          try {
            const extractedJson = JSON.parse(extractMatch[1].trim());
            setExtractedData(extractedJson);
            assistantContent = response.content.replace(/\[EXTRACTED_DATA\].*?\[\/EXTRACTED_DATA\]/s, '').trim();
          } catch (e) {
            console.error('Error parsing extracted data:', e);
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Простая логика без API
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Понятно! Для полноценного диалога настройте OpenAI API. Пока что могу предложить стандартные варианты:\n\n• Реферат (10-15 страниц)\n• Курсовая работа (30-50 страниц)\n• Дипломная работа (60-100 страниц)\n\nВыберите подходящий тип работы кнопками ниже.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Проверьте настройки API или попробуйте позже.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickSelect = (workType: string, label: string, pages: string) => {
    const workData = {
      workType,
      topic: '',
      requirements: '',
      pages
    };
    onWorkTypeSelected(workData);
    onClose();
  };

  const handleUseExtracted = () => {
    if (extractedData) {
      onWorkTypeSelected(extractedData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Icon name="MessageCircle" size={20} />
                Помощник по выбору типа работы
              </CardTitle>
              <CardDescription>
                Опишите свою задачу — я помогу определить тип работы и требования
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 block mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span className="text-sm">Печатаю...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Extracted Data Preview */}
          {extractedData && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-800 flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  Готово к генерации!
                </h4>
                <Button onClick={handleUseExtracted} size="sm">
                  Использовать
                </Button>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Тип:</strong> {extractedData.workType}</p>
                <p><strong>Тема:</strong> {extractedData.topic}</p>
                <p><strong>Страниц:</strong> {extractedData.pages}</p>
                {extractedData.requirements && (
                  <p><strong>Требования:</strong> {extractedData.requirements}</p>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">Или выберите готовый вариант:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('essay', 'Реферат', '15')}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">Реферат</div>
                    <div className="text-xs text-muted-foreground">10-15 стр</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('coursework', 'Курсовая', '40')}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">Курсовая</div>
                    <div className="text-xs text-muted-foreground">30-50 стр</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('diploma', 'Диплом', '80')}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">Диплом</div>
                    <div className="text-xs text-muted-foreground">60-100 стр</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect('homework', 'Д/З', '3')}
                  className="h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">Д/З</div>
                    <div className="text-xs text-muted-foreground">1-5 стр</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Напишите свой вопрос..."
              className="resize-none min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkTypeDialog;