import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { paymentService, Subscription } from '@/services/payment';

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    const userSubscriptions = paymentService.getUserSubscriptions();
    const active = paymentService.getActiveSubscription();
    setSubscriptions(userSubscriptions);
    setActiveSubscription(active);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    if (confirm('Вы уверены, что хотите отменить подписку?')) {
      const success = paymentService.cancelSubscription(subscriptionId);
      if (success) {
        loadSubscriptions();
      }
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);

    if (subscription.status === 'cancelled') {
      return <Badge variant="destructive">Отменена</Badge>;
    } else if (subscription.status === 'expired' || expiryDate < now) {
      return <Badge variant="secondary">Истекла</Badge>;
    } else {
      return <Badge variant="default">Активна</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPlanName = (planId: string) => {
    const planNames: Record<string, string> = {
      'basic': 'Базовый',
      'premium': 'Премиум',
      'student': 'Студенческий'
    };
    return planNames[planId] || planId;
  };

  if (subscriptions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-4" />
          <CardTitle>У вас пока нет подписок</CardTitle>
          <CardDescription>
            Выберите подходящий тарифный план для доступа к премиум функциям
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Active Subscription */}
      {activeSubscription && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icon name="Crown" size={20} className="text-primary" />
                  Активная подписка
                </CardTitle>
                <CardDescription className="text-base">
                  План: {getPlanName(activeSubscription.planId)}
                </CardDescription>
              </div>
              {getStatusBadge(activeSubscription)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Действует до:</p>
                <p className="font-medium">{formatDate(activeSubscription.expiryDate.toString())}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Автопродление:</p>
                <p className="font-medium flex items-center gap-2">
                  {activeSubscription.autoRenew ? (
                    <>
                      <Icon name="Check" size={16} className="text-green-600" />
                      Включено
                    </>
                  ) : (
                    <>
                      <Icon name="X" size={16} className="text-red-600" />
                      Отключено
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleCancelSubscription(activeSubscription.id)}
                className="flex-1"
              >
                <Icon name="XCircle" size={16} className="mr-2" />
                Отменить подписку
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Subscriptions History */}
      <Card>
        <CardHeader>
          <CardTitle>История подписок</CardTitle>
          <CardDescription>
            Все ваши подписки и их статус
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div 
                key={subscription.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{getPlanName(subscription.planId)}</h3>
                    {getStatusBadge(subscription)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Истекает: {formatDate(subscription.expiryDate.toString())}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {subscription.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelSubscription(subscription.id)}
                    >
                      <Icon name="XCircle" size={16} className="mr-1" />
                      Отменить
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Star" size={20} className="text-primary" />
            Преимущества подписки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Icon name="Check" size={16} className="text-green-600 mt-1" />
              <div>
                <p className="font-medium">Безлимитная генерация</p>
                <p className="text-sm text-muted-foreground">
                  Создавайте неограниченное количество работ
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Check" size={16} className="text-green-600 mt-1" />
              <div>
                <p className="font-medium">Приоритетная обработка</p>
                <p className="text-sm text-muted-foreground">
                  Ваши задачи выполняются в первую очередь
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Check" size={16} className="text-green-600 mt-1" />
              <div>
                <p className="font-medium">Экспертная поддержка</p>
                <p className="text-sm text-muted-foreground">
                  Круглосуточная помощь наших специалистов
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Check" size={16} className="text-green-600 mt-1" />
              <div>
                <p className="font-medium">Расширенные функции</p>
                <p className="text-sm text-muted-foreground">
                  Доступ к дополнительным инструментам
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}