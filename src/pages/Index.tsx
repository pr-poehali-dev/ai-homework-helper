import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import FileUpload from '@/components/FileUpload';
import APISettings from '@/components/APISettings';
import PaymentForm from '@/components/PaymentForm';
import { getOpenAIService, isOpenAIConfigured } from '@/services/openai';
import { paymentService } from '@/services/payment';

const Index = () => {
  const [workType, setWorkType] = useState('');
  const [topic, setTopic] = useState('');
  const [requirements, setRequirements] = useState('');
  const [pages, setPages] = useState('');
  const [plagiarismText, setPlagiarismText] = useState('');
  const [uniquenessScore, setUniquenessScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [homeworkSubject, setHomeworkSubject] = useState('');
  const [homeworkTask, setHomeworkTask] = useState('');
  const [homeworkLevel, setHomeworkLevel] = useState('');
  const [selectedTariff, setSelectedTariff] = useState('');
  const [isProcessingHomework, setIsProcessingHomework] = useState(false);
  const [showAPISettings, setShowAPISettings] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [generatedWork, setGeneratedWork] = useState<string>('');
  const [homeworkSolution, setHomeworkSolution] = useState<string>('');
  const [plagiarismReport, setPlagiarismReport] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{id: string, name: string, price: number} | null>(null);
  const [activeSubscription, setActiveSubscription] = useState(paymentService.getActiveSubscription());

  const workTypes = [
    { value: 'essay', label: 'Реферат', description: 'Краткое изложение темы, 10-15 страниц' },
    { value: 'coursework', label: 'Курсовая работа', description: 'Глубокое исследование, 30-50 страниц' },
    { value: 'diploma', label: 'Дипломная работа', description: 'Выпускная работа, 60-100 страниц' },
    { value: 'thesis', label: 'Диссертация', description: 'Научное исследование, 100+ страниц' }
  ];

  const homeworkSubjects = [
    { value: 'math', label: 'Математика', icon: 'Calculator' },
    { value: 'physics', label: 'Физика', icon: 'Zap' },
    { value: 'chemistry', label: 'Химия', icon: 'Flask' },
    { value: 'biology', label: 'Биология', icon: 'Leaf' },
    { value: 'history', label: 'История', icon: 'Clock' },
    { value: 'literature', label: 'Литература', icon: 'BookOpen' },
    { value: 'russian', label: 'Русский язык', icon: 'Type' },
    { value: 'english', label: 'Английский язык', icon: 'Globe' },
    { value: 'geography', label: 'География', icon: 'MapPin' },
    { value: 'informatics', label: 'Информатика', icon: 'Monitor' }
  ];

  const tariffPlans = [
    {
      id: 'basic',
      name: 'Базовый',
      price: 590,
      period: 'месяц',
      features: [
        '10 академических работ',
        '50 домашних заданий',
        'Проверка уникальности',
        'Email поддержка'
      ],
      popular: false,
      color: 'secondary'
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 990,
      period: 'месяц',
      features: [
        'Безлимитные работы',
        'Безлимитные задания',
        'Приоритетная генерация',
        'Экспертная поддержка 24/7',
        'Персональный куратор',
        'Расширенная библиотека'
      ],
      popular: true,
      color: 'primary'
    },
    {
      id: 'student',
      name: 'Студенческий',
      price: 290,
      period: 'месяц',
      features: [
        '5 академических работ',
        '25 домашних заданий',
        'Базовая проверка уникальности',
        'Форум поддержки'
      ],
      popular: false,
      color: 'outline'
    }
  ];

  const features = [
    {
      icon: 'BookOpen',
      title: 'Генератор академических работ',
      description: 'ИИ создаёт уникальные рефераты, курсовые и дипломные работы по любой теме'
    },
    {
      icon: 'ShieldCheck',
      title: 'Проверка уникальности',
      description: 'Встроенная система проверки на плагиат с детальным анализом'
    },
    {
      icon: 'BookMarked',
      title: 'Библиотека примеров',
      description: 'База готовых работ для изучения структуры и стиля'
    },
    {
      icon: 'Users',
      title: 'Поддержка экспертов',
      description: '24/7 помощь в доработке и улучшении академических работ'
    },
    {
      icon: 'Calculator',
      title: 'Помощь с домашними заданиями',
      description: 'ИИ решает задачи по математике, физике, химии и другим предметам'
    },
    {
      icon: 'CreditCard',
      title: 'Гибкие тарифы',
      description: 'Выберите план, который подходит именно вам — от базового до премиум'
    }
  ];

  const handleGenerate = async () => {
    if (!workType || !topic) return;
    
    setIsGenerating(true);
    setGeneratedWork('');
    
    try {
      if (isOpenAIConfigured()) {
        const openAI = getOpenAIService();
        const result = await openAI.generateAcademicWork({
          workType,
          topic,
          requirements,
          pages
        });
        setGeneratedWork(result);
      } else {
        // Имитация генерации
        await new Promise(resolve => setTimeout(resolve, 3000));
        setGeneratedWork(`Пример генерации ${workType} на тему: "${topic}"

Введение:
Тема ${topic} является одной из актуальных в современном мире...

Основная часть:
1. Анализ проблемы...
2. Методы исследования...

Для полной генерации настройте OpenAI API.`);
      }
    } catch (error) {
      console.error('Error generating work:', error);
      setGeneratedWork('Ошибка генерации. Проверьте настройки API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlagiarismCheck = async () => {
    if (!plagiarismText.trim()) return;
    
    setIsChecking(true);
    setPlagiarismReport('');
    
    try {
      if (isOpenAIConfigured()) {
        const openAI = getOpenAIService();
        const result = await openAI.checkPlagiarism(plagiarismText);
        setUniquenessScore(result.uniqueness);
        setPlagiarismReport(result.report);
      } else {
        // Имитация проверки
        await new Promise(resolve => setTimeout(resolve, 2000));
        const score = Math.floor(Math.random() * 30) + 70;
        setUniquenessScore(score);
        setPlagiarismReport('Пример отчета об уникальности. Для полного анализа настройте OpenAI API.');
      }
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      setUniquenessScore(0);
      setPlagiarismReport('Ошибка проверки. Проверьте настройки API.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePurchase = (plan: {id: string, name: string, price: number}) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('Payment successful:', transactionId);
    setActiveSubscription(paymentService.getActiveSubscription());
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleHomeworkSolve = async () => {
    if (!homeworkSubject || !homeworkTask) return;
    
    setIsProcessingHomework(true);
    setHomeworkSolution('');
    
    try {
      if (isOpenAIConfigured()) {
        const openAI = getOpenAIService();
        const result = await openAI.solveHomework({
          subject: homeworkSubject,
          level: homeworkLevel,
          task: homeworkTask
        });
        setHomeworkSolution(result);
      } else {
        // Имитация решения
        await new Promise(resolve => setTimeout(resolve, 3000));
        setHomeworkSolution(`Пример решения задания по ${homeworkSubject}:

Шаг 1: Анализ условия...
Шаг 2: Применение формул...
Шаг 3: Вычисления...

Для полного решения настройте OpenAI API.`);
      }
    } catch (error) {
      console.error('Error solving homework:', error);
      setHomeworkSolution('Ошибка решения. Проверьте настройки API.');
    } finally {
      setIsProcessingHomework(false);
    }
  };

  const handleTariffPurchase = (tariffId: string) => {
    const plan = tariffPlans.find(t => t.id === tariffId);
    if (plan) {
      handlePurchase({
        id: plan.id,
        name: plan.name,
        price: plan.price
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" className="text-primary-foreground" size={20} />
            </div>
            <h1 className="text-xl font-bold text-foreground">AI Academic Assistant</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Главная</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Тарифы</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Примеры</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Блог</a>
            {activeSubscription && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <Icon name="Crown" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Premium</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAPISettings(!showAPISettings)}
              className={apiConfigured ? "border-green-500 text-green-600" : ""}
            >
              <Icon name="Settings" size={14} className="mr-1" />
              API
            </Button>
            <Button variant="outline" size="sm">Войти</Button>
            <Button size="sm">Начать</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            <Icon name="Sparkles" size={14} className="mr-1" />
            Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Академические работы и домашние задания — <br />
            <span className="text-primary">написаны на 90% быстрее</span> с ИИ
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Генерируйте уникальные рефераты, курсовые и дипломные работы, решение домашних заданий с помощью искусственного интеллекта. 
            Встроенная проверка уникальности и экспертная поддержка.
          </p>
          
          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Icon name="Zap" size={14} className="mr-1" />
              Быстрая генерация
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Icon name="Shield" size={14} className="mr-1" />
              Проверка оригинальности
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Icon name="BookOpen" size={14} className="mr-1" />
              10М+ источников с PDF
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Icon name="List" size={14} className="mr-1" />
              Автоматические ссылки
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Грамматическая проверка
            </Badge>
          </div>

          {/* Hero Image */}
          <div className="max-w-4xl mx-auto mb-16">
            <img 
              src="/img/f25e632a-1b70-46ac-a1fe-85b14c052a0a.jpg" 
              alt="AI Academic Research"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* API Settings Modal */}
      {showAPISettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Настройки OpenAI API</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAPISettings(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <APISettings onConfigured={(configured) => {
                setApiConfigured(configured);
                if (configured) {
                  setShowAPISettings(false);
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Generator */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="generator" className="text-base py-3">
                <Icon name="PenTool" size={20} className="mr-2" />
                Генератор работ
              </TabsTrigger>
              <TabsTrigger value="homework" className="text-base py-3">
                <Icon name="Calculator" size={20} className="mr-2" />
                Домашние задания
              </TabsTrigger>
              <TabsTrigger value="plagiarism" className="text-base py-3">
                <Icon name="Search" size={20} className="mr-2" />
                Проверка уникальности
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator">
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <Icon name="BookMarked" size={24} className="mr-3 text-primary" />
                    Генератор академических работ
                  </CardTitle>
                  <CardDescription className="text-base">
                    Укажите тип работы и тему — ИИ создаст уникальный текст с научными источниками
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="work-type" className="text-base font-medium mb-3 block">
                        Тип работы
                      </Label>
                      <Select value={workType} onValueChange={setWorkType}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Выберите тип работы" />
                        </SelectTrigger>
                        <SelectContent>
                          {workTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-sm text-muted-foreground">{type.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pages" className="text-base font-medium mb-3 block">
                        Количество страниц
                      </Label>
                      <Input 
                        id="pages"
                        placeholder="Например: 20"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="topic" className="text-base font-medium mb-3 block">
                      Тема работы
                    </Label>
                    <Input 
                      id="topic"
                      placeholder="Например: Влияние искусственного интеллекта на современное образование"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-base font-medium mb-3 block">
                      Дополнительные требования
                    </Label>
                    <Textarea 
                      id="requirements"
                      placeholder="Укажите особые требования к работе: стиль цитирования, количество источников, структура..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[120px] text-base"
                    />
                  </div>

                  {workType && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Icon name="Info" size={16} className="mr-2" />
                        {workTypes.find(t => t.value === workType)?.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {workTypes.find(t => t.value === workType)?.description}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerate}
                    disabled={!workType || !topic || isGenerating}
                    size="lg"
                    className="w-full h-12 text-base"
                  >
                    {isGenerating ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Генерирую работу...
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={20} className="mr-2" />
                        Сгенерировать работу
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homework">
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <Icon name="Calculator" size={24} className="mr-3 text-primary" />
                    Помощь с домашними заданиями
                  </CardTitle>
                  <CardDescription className="text-base">
                    ИИ поможет решить задачи по любому предмету с пошаговым объяснением
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="homework-subject" className="text-base font-medium mb-3 block">
                        Предмет
                      </Label>
                      <Select value={homeworkSubject} onValueChange={setHomeworkSubject}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Выберите предмет" />
                        </SelectTrigger>
                        <SelectContent>
                          {homeworkSubjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              <div className="flex items-center">
                                <Icon name={subject.icon as any} size={16} className="mr-2" />
                                <span>{subject.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="homework-level" className="text-base font-medium mb-3 block">
                        Уровень сложности
                      </Label>
                      <Select value={homeworkLevel} onValueChange={setHomeworkLevel}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elementary">Начальная школа (1-4 класс)</SelectItem>
                          <SelectItem value="middle">Основная школа (5-9 класс)</SelectItem>
                          <SelectItem value="high">Средняя школа (10-11 класс)</SelectItem>
                          <SelectItem value="college">Колледж/Университет</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="homework-task" className="text-base font-medium mb-3 block">
                      Задание
                    </Label>
                    <Textarea 
                      id="homework-task"
                      placeholder="Опишите задание или вставьте текст задачи. Можно приложить формулы, схемы и дополнительные условия..."
                      value={homeworkTask}
                      onChange={(e) => setHomeworkTask(e.target.value)}
                      className="min-h-[150px] text-base"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Символов: {homeworkTask.length} / 2,000
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Прикрепить файлы
                    </Label>
                    <FileUpload 
                      onTextExtracted={(text) => {
                        if (text && text.trim()) {
                          setHomeworkTask(prev => {
                            const newText = prev ? `${prev}\n\n--- Распознанный текст ---\n${text}` : text;
                            return newText.slice(0, 2000);
                          });
                        }
                      }}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      maxFiles={3}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Поддерживаются фото задач, PDF документы, Word файлы. Текст будет автоматически распознан и добавлен в поле задания.
                    </p>
                  </div>

                  {homeworkSubject && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Icon name={homeworkSubjects.find(s => s.value === homeworkSubject)?.icon as any || 'Info'} size={16} className="mr-2" />
                        {homeworkSubjects.find(s => s.value === homeworkSubject)?.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        ИИ поможет решить задачи, объяснит теорию и покажет пошаговое решение
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleHomeworkSolve}
                    disabled={!homeworkSubject || !homeworkTask || isProcessingHomework}
                    size="lg"
                    className="w-full h-12 text-base"
                  >
                    {isProcessingHomework ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Решаю задание...
                      </>
                    ) : (
                      <>
                        <Icon name="Calculator" size={20} className="mr-2" />
                        Решить задание
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plagiarism">
              <Card className="shadow-xl border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <Icon name="ShieldCheck" size={24} className="mr-3 text-primary" />
                    Проверка уникальности текста
                  </CardTitle>
                  <CardDescription className="text-base">
                    Проверьте оригинальность текста по базе научных публикаций и интернет-источников
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="plagiarism-text" className="text-base font-medium mb-3 block">
                      Текст для проверки
                    </Label>
                    <Textarea 
                      id="plagiarism-text"
                      placeholder="Вставьте текст для проверки на уникальность..."
                      value={plagiarismText}
                      onChange={(e) => setPlagiarismText(e.target.value)}
                      className="min-h-[200px] text-base"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Символов: {plagiarismText.length} / 10,000
                    </p>
                  </div>

                  <Button 
                    onClick={handlePlagiarismCheck}
                    disabled={!plagiarismText.trim() || isChecking}
                    size="lg"
                    className="w-full h-12 text-base"
                  >
                    {isChecking ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Проверяю уникальность...
                      </>
                    ) : (
                      <>
                        <Icon name="Search" size={20} className="mr-2" />
                        Проверить уникальность
                      </>
                    )}
                  </Button>

                  {uniquenessScore > 0 && (
                    <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {uniquenessScore}%
                        </div>
                        <p className="text-muted-foreground">Уникальность текста</p>
                      </div>
                      <Progress value={uniquenessScore} className="h-2" />
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Icon name={uniquenessScore >= 80 ? "CheckCircle" : "AlertCircle"} size={16} className="mr-2" />
                        {uniquenessScore >= 80 
                          ? "Отличная оригинальность" 
                          : "Требуется доработка"
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Tariff Plans */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Icon name="CreditCard" size={14} className="mr-1" />
              Тарифы
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Выберите подходящий план
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              От базового плана для студентов до премиум с полным сопровождением
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tariffPlans.map((plan) => (
              <Card key={plan.id} className={`relative hover:shadow-xl transition-all duration-300 border-2 ${
                plan.popular ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
              } backdrop-blur-sm`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="default" className="bg-primary text-primary-foreground px-4 py-1">
                      <Icon name="Star" size={14} className="mr-1" />
                      Популярный
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}₽</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Icon name="Check" size={16} className="text-primary mr-3 mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleTariffPurchase(plan.id)}
                    variant={plan.popular ? 'default' : plan.color as any}
                    size="lg"
                    className="w-full h-12"
                  >
                    {selectedTariff === plan.id ? (
                      <>
                        <Icon name="Check" size={20} className="mr-2" />
                        Выбран
                      </>
                    ) : (
                      <>
                        <Icon name="CreditCard" size={20} className="mr-2" />
                        Выбрать план
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Все планы включают 7-дневный бесплатный период
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Icon name="Shield" size={16} className="mr-2 text-primary" />
                Безопасные платежи
              </div>
              <div className="flex items-center">
                <Icon name="RefreshCw" size={16} className="mr-2 text-primary" />
                Отмена в любое время
              </div>
              <div className="flex items-center">
                <Icon name="Headphones" size={16} className="mr-2 text-primary" />
                Поддержка 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Icon name="Star" size={14} className="mr-1" />
              Возможности
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Всё для успешной учёбы в одном сервисе
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Современные ИИ-технологии помогают создавать качественные академические работы
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-8 pb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon name={feature.icon as any} className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Работ создано</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">Средняя уникальность</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Поддержка</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <p className="text-muted-foreground">Источников в базе</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-accent-foreground py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Icon name="GraduationCap" className="text-primary-foreground" size={14} />
                </div>
                <span className="font-bold">AI Academic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Современный сервис для создания академических работ с помощью ИИ
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Сервисы</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Генератор работ</a></li>
                <li><a href="#" className="hover:text-foreground">Проверка плагиата</a></li>
                <li><a href="#" className="hover:text-foreground">Библиотека примеров</a></li>
                <li><a href="#" className="hover:text-foreground">Личный кабинет</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Тарифы</a></li>
                <li><a href="#" className="hover:text-foreground">Помощь</a></li>
                <li><a href="#" className="hover:text-foreground">Блог</a></li>
                <li><a href="#" className="hover:text-foreground">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Связь</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@aiacademic.ru</li>
                <li>+7 (495) 123-45-67</li>
                <li>Пн-Пт 9:00-18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 mt-8 pt-6 text-center text-sm text-muted-foreground">
            © 2024 AI Academic Assistant. Все права защищены.
          </div>
        </div>
      </footer>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <PaymentForm
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default Index;