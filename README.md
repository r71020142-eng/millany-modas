# 🛍️ Millany Modas - Loja Virtual 100% Fiel + Checkout Transparente WhatsApp

Recriação 100% fiel da loja virtual **Millany Modas** (originalmente desenvolvida na Nuvemshop, tema Rio), com design refinado, catálogo completo com os 39 produtos oficiais, imagens em alta definição, carrinho interativo e checkout transparente personalizado de alta conversão integrado diretamente ao WhatsApp **(31) 98657-0126**.

---

## ✨ Principais Funcionalidades

### 1. 🎨 Identidade Visual 100% Fiel
* **Logotipo Oficial**: Vetorial em WebP de alta resolução com fundo transparente.
* **Tipografia Exata**: Fonte Google Fonts `Prata, serif` (usada nos títulos, preços e marcas) combinada com `Plus Jakarta Sans` para máxima legibilidade.
* **Paleta de Cores Oficial**:
  * Fundo Principal: `#000000` (Preto luxo)
  * Botões e Anúncio: `#d2888a` (Dusty Rose)
  * Destaques: `#f0b4b5` (Blush suave)
  * Navegação e Etiquetas: `#e59a9b`
  * Textos: `#ffffff`
* **Barra de Anúncios Superior (Ticker/Marquee)**: Texto animado infinito *"Enviamos para todo Brasil • Frete Grátis acima de R$ 299 • 1% OFF no Pix"*.
* **Carrossel Hero Panorâmico**: Todos os banners oficiais em resolução `1920x1920` com suporte a autoplay e controles de toque.
* **Régua de Benefícios**: Ícones oficiais de envio rápido, formas de pagamento e compra 100% segura.

---

### 2. 👗 Catálogo de Produtos Integral (39 Produtos)
* Todos os 39 produtos oficiais extraídos com:
  * Fotos em alta resolução (com efeito hover alternando para foto secundária);
  * Título, categoria e descrições detalhadas;
  * Variações de cores reais com paleta de cores (hex codes);
  * Tamanhos (*Tamanho Único*, *P*, *M*, *G*, etc.);
  * Preço normal, preço comparado (promoção), cálculo de **1% de desconto no Pix** e parcelamento em até **12x**;
  * Etiquetas de destaque (*Tamanho Único*, *OFF*, *Poliamida premium*, *Alfaiataria*);
* **Modal de Espiar / Detalhes do Produto**:
  * Galeria com miniaturas;
  * Seleção de cor e tamanho;
  * Ajuste de quantidade;
  * **Calculador de Frete com busca real via API ViaCEP** (Correios PAC e SEDEX);
  * Botão de "Adicionar à Sacola" e "Comprar Agora".

---

### 3. 🛒 Carrinho / Sacola Funcional
* Drawer lateral deslizante (*slide-over*);
* Barra de progresso para meta de **Frete Grátis** (com efeito comemorativo de confete ao atingir R$ 299);
* Controle de quantidade e remoção de produtos;
* Sistema de **Cupons de Desconto** (ex: `BEMVINDA10`, `PRIMEIRACOMPRA`, `MILLANY5`);
* Persistência automática no `localStorage` do navegador (os itens não se perdem ao atualizar a página).

---

### 4. 💎 Checkout Transparente Premium de Alta Conversão
* Formulário limpo e intuitivo em 1 página;
* **Passo 1: Dados Pessoais** (Nome Completo, WhatsApp com máscara `(31) 98888-8888`, E-mail, CPF);
* **Passo 2: Endereço de Entrega** (CEP com **busca automática de logradouro, bairro, cidade e estado via ViaCEP**, Número, Complemento);
* **Passo 3: Método de Pagamento** (Pix com 1% de desconto instantâneo ou Cartão de Crédito);
* **Resumo Visual do Pedido** com fotos dos produtos, cores, tamanhos e quantidades;
* Cronômetro de urgência (15 minutos para reserva de estoque);
* Selos de segurança e garantia de 7 dias.

---

### 5. 🛠️ Painel Administrativo Completo (Banners, Produtos, Configurações)
* **Acesso**: Botão **"Admin"** no cabeçalho superior direito, na barra de navegação e no rodapé. Senha padrão: `admin123` (ou botão de *Entrar com 1 Clique*).
* **Gestão de Banners do Carrossel Hero**:
  * Adicionar novos slides;
  * Alterar imagens Desktop (1920x1920) e Mobile (1024x1024);
  * Alterar títulos, subtítulos, texto do botão (CTA) e categoria alvo;
  * Reordenar slides (subir/descer) e excluir slides;
  * Botão de restaurar os banners originais da loja.
* **Gestão Completa de Produtos**:
  * Adicionar novos produtos;
  * Editar qualquer produto existente (título, categoria, preço, preço promocional, fotos, cores, tamanhos, badges, descrição);
  * Seletor visual de cores com código Hexadecimal `#HEX`;
  * Gerenciador de fotos do produto (adicionar URLs, definir foto de capa principal, excluir);
  * Duplicar produtos com 1 clique;
  * Excluir produtos do catálogo.
* **Configurações da Loja & WhatsApp**:
  * Alterar o número de WhatsApp que recebe os pedidos (padrão: `5531986570126`);
  * Alterar valor mínimo para Frete Grátis e porcentagem de desconto do Pix;
  * Alterar dados de endereço e telefone da loja física;
  * **Exportação e Importação de Backup (JSON)**;
  * Botão de **Restaurar Padrões de Fábrica** (restaura os 39 produtos e banners originais caso deseje).

---

### 6. 📲 Integração Direta com WhatsApp `5531986570126`
Ao clicar no botão de alta conversão **"FAZER PEDIDO NO WHATSAPP"**:
1. Valida todos os campos obrigatórios;
2. Gera o código exclusivo do pedido (ex: `#MIL-784920`);
3. Dispara efeito de confetes;
4. Formata uma mensagem completa e elegante com todos os dados:
   * Número do pedido e data/hora;
   * Dados do cliente (Nome, WhatsApp, E-mail);
   * Endereço completo de entrega;
   * Lista de produtos com quantidade, cor, tamanho e valores;
   * Resumo financeiro (Subtotal, Frete, Desconto e Total);
5. Redireciona automaticamente para o WhatsApp **5531986570126**;
6. Apresenta a tela de confirmação do pedido com botão direto de fallback e chave Pix copia-e-cola.

---

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. Navegue até o diretório do projeto
cd /Users/raypires/.gemini/antigravity/scratch/millany-modas

# 2. Instale as dependências (já instaladas)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Para gerar a build de produção otimizada
npm run build
```

O servidor estará rodando em: `http://localhost:3000`
