import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { paymentService, PaymentData } from '@/services/payment';

interface PaymentFormProps {
  planId: string;
  planName: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function PaymentForm({ planId, planName, amount, onSuccess, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentService.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Неверный номер карты';
    }

    if (!paymentService.validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Неверный срок действия (MM/YY)';
    }

    if (!paymentService.validateCVV(formData.cvv)) {
      newErrors.cvv = 'CVV должен содержать 3-4 цифры';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Укажите имя держателя карты';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Укажите корректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    if (field === 'cardNumber') {
      processedValue = paymentService.formatCardNumber(value);
      if (processedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiryDate') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length >= 2) {
        processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2, 4);
      }
      if (processedValue.length > 5) return;
    } else if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const paymentData: PaymentData = {
        ...formData,
        planId,
        amount
      };

      const result = await paymentService.processPayment(paymentData);

      if (result.success && result.transactionId) {
        onSuccess(result.transactionId);
      } else {
        setErrors({ submit: result.error || 'Ошибка обработки платежа' });
      }
    } catch (error) {
      setErrors({ submit: 'Произошла ошибка. Попробуйте позже.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Оформление подписки</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            План: <span className="font-medium">{planName}</span>
            <br />
            Стоимость: <span className="font-medium text-lg">{amount}₽</span>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Номер карты</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                disabled={isProcessing}
                className={errors.cardNumber ? 'border-red-500' : ''}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Срок действия</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  disabled={isProcessing}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                />
                {errors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  disabled={isProcessing}
                  className={errors.cvv ? 'border-red-500' : ''}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">Имя держателя карты</Label>
              <Input
                id="cardholderName"
                placeholder="IVAN IVANOV"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value.toUpperCase())}
                disabled={isProcessing}
                className={errors.cardholderName ? 'border-red-500' : ''}
              />
              {errors.cardholderName && (
                <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email для чека</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isProcessing}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={isProcessing}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" size={16} className="mr-2" />
                    Оплатить {amount}₽
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-start gap-2">
              <Icon name="Shield" size={16} className="text-green-600 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Безопасная оплата</p>
                <p>Данные карты защищены SSL-шифрованием</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}