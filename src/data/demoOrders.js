export const INITIAL_DEMO_ORDERS = [
  {
    id: 'ord_demo_101',
    orderNumber: 'ML-9842',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min atrás
    status: 'Novo Pedido',
    customer: {
      name: 'Mariana Silveira Ramos',
      phone: '(31) 99874-5521',
      email: 'mariana.silveira@gmail.com',
      cpf: '124.587.963-00'
    },
    address: {
      cep: '35160-294',
      street: 'Rua Diamantina',
      number: '482',
      complement: 'Apto 301',
      neighborhood: 'Centro',
      city: 'Ipatinga',
      state: 'MG',
      reference: 'Próximo à pracinha'
    },
    items: [
      {
        id: 'vestido-longo-crepe-duna-floral-amarelo',
        title: 'Vestido Longo Crepe Duna Floral Amarelo',
        price: 189.90,
        originalPrice: 229.90,
        quantity: 1,
        selectedColor: 'Amarelo Floral',
        selectedSize: 'Tamanho Único',
        image: 'https://acdn-us.mitiendanube.com/stores/003/740/490/products/whatsapp-image-2025-09-08-at-13-16-09-2-cf7fc1656f5e3bc82c17573482590623-1024-1024.webp'
      },
      {
        id: 'cropped-trancado-costas-nula-manga',
        title: 'Cropped Trançado Costas Nula Manga',
        price: 79.90,
        originalPrice: 99.90,
        quantity: 1,
        selectedColor: 'Terracota',
        selectedSize: 'Tamanho Único',
        image: 'https://acdn-us.mitiendanube.com/stores/003/740/490/products/whatsapp-image-2025-08-01-at-14-16-56-1-fe6d6bbff069bf02f817540686950298-1024-1024.webp'
      }
    ],
    financial: {
      subtotal: 269.80,
      discount: 2.70, // 1% pix
      shipping: 0.00, // Frete grátis (> 250)
      total: 267.10,
      paymentMethod: 'pix'
    },
    notes: 'Cliente chamou perguntando se chega antes de sexta-feira. Endereço verificado.'
  },
  {
    id: 'ord_demo_102',
    orderNumber: 'ML-9841',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 horas atrás
    status: 'Confirmado / Pago',
    customer: {
      name: 'Camila Albuquerque',
      phone: '(31) 98712-4099',
      email: 'camila.albuquerque@hotmail.com',
      cpf: '098.765.432-11'
    },
    address: {
      cep: '35010-180',
      street: 'Avenida Brasil',
      number: '1240',
      complement: 'Bloco B Sala 4',
      neighborhood: 'São Geraldo',
      city: 'Governador Valadares',
      state: 'MG',
      reference: 'Em frente ao banco'
    },
    items: [
      {
        id: 'conjunto-alfaiataria-colete-e-calca',
        title: 'Conjunto Alfaiataria Colete e Calça',
        price: 249.90,
        originalPrice: 289.90,
        quantity: 1,
        selectedColor: 'Bege Areia',
        selectedSize: 'M',
        image: 'https://acdn-us.mitiendanube.com/stores/003/740/490/products/whatsapp-image-2025-08-01-at-15-58-20-1-6eb1b1e969966b9ee617540747449553-1024-1024.webp'
      }
    ],
    financial: {
      subtotal: 249.90,
      discount: 0.00,
      shipping: 18.50,
      total: 268.40,
      paymentMethod: 'credit'
    },
    notes: 'Comprovante recebido no WhatsApp. Embalado para envio via Sedex.'
  },
  {
    id: 'ord_demo_103',
    orderNumber: 'ML-9840',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
    status: 'Entregue',
    customer: {
      name: 'Juliana Mendes Rocha',
      phone: '(11) 97103-8822',
      email: 'ju.mendes@outlook.com',
      cpf: '332.114.556-88'
    },
    address: {
      cep: '04538-132',
      street: 'Rua Joaquim Floriano',
      number: '820',
      complement: '14º Andar',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      reference: 'Edifício Infinity'
    },
    items: [
      {
        id: 'vestido-canelado-midi-fenda-lateral',
        title: 'Vestido Canelado Midi Fenda Lateral',
        price: 139.90,
        originalPrice: 169.90,
        quantity: 2,
        selectedColor: 'Preto Clássico',
        selectedSize: 'Tamanho Único',
        image: 'https://acdn-us.mitiendanube.com/stores/003/740/490/products/whatsapp-image-2025-09-08-at-13-16-09-1-5833c9aa6e3557e04f17573482586616-1024-1024.webp'
      }
    ],
    financial: {
      subtotal: 279.80,
      discount: 2.80,
      shipping: 0.00,
      total: 277.00,
      paymentMethod: 'pix'
    },
    notes: 'Entregue com sucesso. Cliente elogiou o caimento e o tecido no WhatsApp.'
  }
];
