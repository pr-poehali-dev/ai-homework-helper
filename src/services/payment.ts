export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
  planId: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled';
  expiryDate: Date;
  autoRenew: boolean;
}

class PaymentService {
  private subscriptions: Subscription[] = [];

  // Симуляция обработки платежа (в реальном приложении - интеграция с платежной системой)
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Симуляция проверки карты
        if (paymentData.cardNumber.length !== 16 || !paymentData.cvv || !paymentData.expiryDate) {
          resolve({
            success: false,
            error: 'Неверные данные карты'
          });
          return;
        }

        // Имитация случайного результата (90% успешных платежей)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          const transactionId = 'tx_' + Math.random().toString(36).substr(2, 9);
          
          // Создаем подписку
          const subscription: Subscription = {
            id: 'sub_' + Math.random().toString(36).substr(2, 9),
            planId: paymentData.planId,
            status: 'active',
            expiryDate: this.calculateExpiryDate(paymentData.planId),
            autoRenew: true
          };
          
          this.subscriptions.push(subscription);
          this.saveSubscription(subscription);
          
          resolve({
            success: true,
            transactionId
          });
        } else {
          resolve({
            success: false,
            error: 'Платеж отклонен банком'
          });
        }
      }, 2000); // Имитация времени обработки
    });
  }

  private calculateExpiryDate(planId: string): Date {
    const now = new Date();
    switch (planId) {
      case 'basic':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'pro':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'premium':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }

  private saveSubscription(subscription: Subscription) {
    const stored = localStorage.getItem('userSubscriptions') || '[]';
    const subscriptions = JSON.parse(stored);
    subscriptions.push(subscription);
    localStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));
  }

  getUserSubscriptions(): Subscription[] {
    const stored = localStorage.getItem('userSubscriptions') || '[]';
    return JSON.parse(stored);
  }

  getActiveSubscription(): Subscription | null {
    const subscriptions = this.getUserSubscriptions();
    const now = new Date();
    
    return subscriptions.find(sub => 
      sub.status === 'active' && new Date(sub.expiryDate) > now
    ) || null;
  }

  cancelSubscription(subscriptionId: string): boolean {
    const subscriptions = this.getUserSubscriptions();
    const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
    
    if (index !== -1) {
      subscriptions[index].status = 'cancelled';
      subscriptions[index].autoRenew = false;
      localStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));
      return true;
    }
    
    return false;
  }

  // Форматирование номера карты
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  // Валидация CVV
  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  // Валидация срока действия
  validateExpiryDate(expiryDate: string): boolean {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/').map(Number);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;
    
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }

  // Валидация номера карты (алгоритм Луна)
  validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
}

export const paymentService = new PaymentService();