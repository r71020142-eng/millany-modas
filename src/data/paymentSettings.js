import { formatBRL } from '../utils/masks.js';

export const DEFAULT_PAYMENT_SETTINGS = {
  pix: {
    enabled: true,
    discountPercent: 0, // Pix sem desconto adicional por padrão
    keyType: 'Telefone', // 'Telefone' | 'CPF' | 'CNPJ' | 'E-mail' | 'Aleatória'
    key: '3180393768',
    recipient: 'Millany Modas / Rayane Pires',
    bank: 'Nubank / Mercado Pago',
    city: 'Ipatinga - MG',
    instructions: 'Chave Pix disponível no checkout e enviada junto com o resumo no WhatsApp após a confirmação.'
  },
  creditCard: {
    enabled: true,
    maxInstallments: 12,
    interestFreeInstallments: 0, // 0 ou 1 = 1x com juros (todas as parcelas com juros)
    monthlyInterestRate: 1.95, // % a.m. para parcelas com acréscimo
    minInstallmentValue: 15.00,
    acceptedBrands: ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'Amex'],
    instructions: 'Link de pagamento seguro ou máquina de cartão combinado diretamente no WhatsApp.'
  },
  boleto: {
    enabled: false,
    discountPercent: 0,
    daysToDueDate: 3,
    instructions: 'Boleto bancário emitido via WhatsApp com compensação em até 2 dias úteis.'
  },
  coupons: [
    {
      id: 'cp_1',
      code: 'BEMVINDA10',
      type: 'percent',
      value: 10,
      minOrder: 0,
      description: '10% de Boas-Vindas para sua primeira compra',
      active: true
    },
    {
      id: 'cp_2',
      code: 'PRIMEIRACOMPRA',
      type: 'percent',
      value: 5,
      minOrder: 100,
      description: '5% de desconto em compras acima de R$ 100',
      active: true
    },
    {
      id: 'cp_3',
      code: 'MILLANY5',
      type: 'fixed',
      value: 5,
      minOrder: 50,
      description: 'R$ 5,00 OFF em compras acima de R$ 50',
      active: true
    }
  ]
};

export const calculatePixPrice = (priceNumber, paymentSettings) => {
  const num = typeof priceNumber === 'number' ? priceNumber : parseFloat(priceNumber) || 0;
  if (!paymentSettings?.pix?.enabled) return num;
  const discount = (num * (paymentSettings?.pix?.discountPercent || 0)) / 100;
  return Math.max(0, num - discount);
};

export const calculateInstallments = (priceNumber, paymentSettings) => {
  const num = typeof priceNumber === 'number' ? priceNumber : parseFloat(priceNumber) || 0;
  const maxInst = paymentSettings?.creditCard?.maxInstallments || 12;
  const interestFree = Number(paymentSettings?.creditCard?.interestFreeInstallments ?? 0);
  const rate = paymentSettings?.creditCard?.monthlyInterestRate || 1.95;

  if (interestFree >= maxInst && interestFree > 0) {
    const val = num / maxInst;
    return `${maxInst}x de ${formatBRL(val)} sem juros`;
  }

  // Se for 0 ou 1x com juros
  if (interestFree <= 1) {
    const extraFactor = 1 + (rate * maxInst) / 100;
    const val = (num * extraFactor) / maxInst;
    return `${maxInst}x de ${formatBRL(val)} (1x com juros)`;
  }

  // Juros aplicado sobre parcelas excedentes além de interestFree
  const extraFactor = 1 + (rate * (maxInst - interestFree)) / 100;
  const val = (num * extraFactor) / maxInst;

  return `${maxInst}x de ${formatBRL(val)} (${interestFree}x sem juros)`;
};
