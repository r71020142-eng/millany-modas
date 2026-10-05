// Formatting and mask utilities for Brazilian e-commerce

export function maskPhone(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskCEP(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

export function maskCPF(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatBRL(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export async function fetchAddressByCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || ''
    };
  } catch (err) {
    console.error('ViaCEP fetch error:', err);
    return null;
  }
}

export function formatWhatsAppOrderMessage({ orderNumber, customer, items, financial, address }) {
  const dateStr = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsList = items.map((item, idx) => {
    return `${idx + 1}️⃣ *${item.title}*\n   • Qtd: ${item.quantity}x\n   • Cor: ${item.color || 'Padrão'}\n   • Tamanho: ${item.size || 'Tamanho Único'}\n   • Valor Unit: ${formatBRL(item.price_number)}\n   • Subtotal: ${formatBRL(item.price_number * item.quantity)}`;
  }).join('\n\n');

  const discountLine = financial.discount > 0 ? `\n• *Desconto:* -${formatBRL(financial.discount)}` : '';

  const text = `🛍️ *NOVO PEDIDO - MILLANY MODAS*
━━━━━━━━━━━━━━━━━━━━
*Pedido:* #${orderNumber}
*Data:* ${dateStr}

👤 *DADOS DO CLIENTE*
• *Nome:* ${customer.name}
• *WhatsApp:* ${customer.phone}
• *E-mail:* ${customer.email}
${customer.cpf ? `• *CPF:* ${customer.cpf}\n` : ''}
📍 *ENDEREÇO DE ENTREGA*
• *Rua:* ${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}
• *Bairro:* ${address.neighborhood}
• *Cidade/UF:* ${address.city} - ${address.state}
• *CEP:* ${address.cep}
${address.reference ? `• *Referência:* ${address.reference}\n` : ''}
🛒 *ITENS DO PEDIDO*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *RESUMO DO PEDIDO*
• *Subtotal:* ${formatBRL(financial.subtotal)}${discountLine}
• *TOTAL:* ${formatBRL(financial.total)}
• *Pagamento e Envio:* A combinar no WhatsApp

Olá Millany Modas! Registrei meus dados e pedido no site. Aguardo orientações para combinar o pagamento e envio! ✨`;

  return encodeURIComponent(text);
}
