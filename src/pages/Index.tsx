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

const Index = () => {
  const [workType, setWorkType] = useState('');
  const [topic, setTopic] = useState('');
  const [requirements, setRequirements] = useState('');
  const [pages, setPages] = useState('');
  const [plagiarismText, setPlagiarismText] = useState('');
  const [uniquenessScore, setUniquenessScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const workTypes = [
    { value: 'essay', label: 'Реферат', description: 'Краткое изложение темы, 10-15 страниц' },
    { value: 'coursework', label: 'Курсовая работа', description: 'Глубокое исследование, 30-50 страниц' },
    { value: 'diploma', label: 'Дипломная работа', description: 'Выпускная работа, 60-100 страниц' },
    { value: 'thesis', label: 'Диссертация', description: 'Научное исследование, 100+ страниц' }
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
    }
  ];

  const handleGenerate = async () => {
    if (!workType || !topic) return;
    
    setIsGenerating(true);
    // Имитация генерации
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const handlePlagiarismCheck = async () => {
    if (!plagiarismText.trim()) return;
    
    setIsChecking(true);
    // Имитация проверки
    await new Promise(resolve => setTimeout(resolve, 2000));
    const score = Math.floor(Math.random() * 30) + 70; // 70-100% уникальности
    setUniquenessScore(score);
    setIsChecking(false);
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
            Академические работы — <br />
            <span className="text-primary">написаны на 90% быстрее</span> с ИИ
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Генерируйте уникальные рефераты, курсовые и дипломные работы с помощью искусственного интеллекта. 
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

      {/* Main Generator */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="generator" className="text-base py-3">
                <Icon name="PenTool" size={20} className="mr-2" />
                Генератор работ
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

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default Index;