import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { openaiAPIService, OpenAIAPIKey, APIUsageStats } from '@/services/openai-api';

interface APIKeyManagerProps {
  projectId: string;
}

export default function APIKeyManager({ projectId }: APIKeyManagerProps) {
  const [keys, setKeys] = useState<OpenAIAPIKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<OpenAIAPIKey | null>(null);
  const [usage, setUsage] = useState<APIUsageStats | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    organizationId: ''
  });

  useEffect(() => {
    loadAPIKeys();
  }, [projectId]);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const apiKeys = await openaiAPIService.getAPIKeys(projectId);
      setKeys(apiKeys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim()) return;

    try {
      setLoading(true);
      const newKey = await openaiAPIService.createAPIKey({
        name: createForm.name.trim(),
        projectId,
        organizationId: createForm.organizationId.trim() || undefined
      });

      setKeys(prev => [newKey, ...prev]);
      setCreateForm({ name: '', organizationId: '' });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Ошибка создания API ключа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      setLoading(true);
      const updatedKey = await openaiAPIService.updateAPIKey(keyId, { isActive });
      setKeys(prev => prev.map(key => key.id === keyId ? updatedKey : key));
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Ошибка обновления API ключа.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот API ключ? Это действие необратимо.')) {
      return;
    }

    try {
      setLoading(true);
      await openaiAPIService.deleteAPIKey(keyId);
      setKeys(prev => prev.filter(key => key.id !== keyId));
      if (selectedKey?.id === keyId) {
        setSelectedKey(null);
        setUsage(null);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Ошибка удаления API ключа.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUsage = async (key: OpenAIAPIKey) => {
    try {
      setLoading(true);
      setSelectedKey(key);
      const usageData = await openaiAPIService.getUsageStats(key.id);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading usage stats:', error);
      alert('Ошибка загрузки статистики использования.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('API ключ скопирован в буфер обмена');
    }).catch(() => {
      alert('Ошибка копирования в буфер обмена');
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Ключи OpenAI</h2>
          <p className="text-muted-foreground">Управление ключами доступа к OpenAI API</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать ключ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новый API ключ</DialogTitle>
              <DialogDescription>
                Создайте новый ключ для доступа к OpenAI API
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <Label htmlFor="keyName">Название ключа</Label>
                <Input
                  id="keyName"
                  placeholder="Например: Production Key"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="orgId">ID Организации (опционально)</Label>
                <Input
                  id="orgId"
                  placeholder="org-..."
                  value={createForm.organizationId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, organizationId: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    'Создать ключ'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList>
          <TabsTrigger value="keys">API Ключи</TabsTrigger>
          <TabsTrigger value="usage">Статистика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="space-y-4">
          {keys.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="Key" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">У вас пока нет API ключей</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первый ключ для работы с OpenAI API
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать первый ключ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <Card key={key.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="Key" size={20} />
                          {key.name}
                        </CardTitle>
                        <CardDescription>
                          Создан: {formatDate(key.createdAt)}
                          {key.lastUsed && ` • Последнее использование: ${formatDate(key.lastUsed)}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.isActive ? (
                          <Badge variant="default">Активен</Badge>
                        ) : (
                          <Badge variant="secondary">Отключен</Badge>
                        )}
                        <Switch
                          checked={key.isActive}
                          onCheckedChange={(checked) => handleToggleKey(key.id, checked)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* API Key Display */}
                      <div>
                        <Label className="text-sm text-muted-foreground">API Ключ</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                            {openaiAPIService.maskAPIKey(key.apiKey)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(key.apiKey)}
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Usage Stats */}
                      {key.usage && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm text-muted-foreground">Запросы</Label>
                            <p className="font-medium">{key.usage.requests.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Токены</Label>
                            <p className="font-medium">{openaiAPIService.formatTokens(key.usage.tokens)}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Стоимость</Label>
                            <p className="font-medium">{openaiAPIService.formatCost(key.usage.cost)}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUsage(key)}
                          disabled={loading}
                        >
                          <Icon name="BarChart3" size={16} className="mr-1" />
                          Статистика
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={loading}
                        >
                          <Icon name="Trash2" size={16} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="usage">
          {selectedKey && usage ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Статистика использования: {selectedKey.name}</CardTitle>
                  <CardDescription>Данные за последние 30 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{usage.totalRequests.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Всего запросов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{openaiAPIService.formatTokens(usage.totalTokens)}</div>
                      <div className="text-sm text-muted-foreground">Всего токенов</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{openaiAPIService.formatCost(usage.totalCost)}</div>
                      <div className="text-sm text-muted-foreground">Общая стоимость</div>
                    </div>
                  </div>

                  {/* Daily Usage Chart */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Ежедневное использование</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {usage.dailyUsage.slice(-7).map((day) => (
                        <div key={day.date} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString('ru-RU')}</span>
                          <div className="flex gap-4 text-sm">
                            <span>{day.requests} запросов</span>
                            <span>{openaiAPIService.formatTokens(day.tokens)} токенов</span>
                            <span className="font-medium">{openaiAPIService.formatCost(day.cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="BarChart3" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Выберите API ключ</h3>
                <p className="text-muted-foreground">
                  Выберите ключ на вкладке "API Ключи" для просмотра статистики
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}