import React, { useState, useMemo } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Package,
  Calendar,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { formatBRL } from '../../utils/masks';
import { STORE_INFO } from '../../data/banners';
import AdminOrderDetailsModal from './AdminOrderDetailsModal';

const STATUS_BADGES = {
  'Novo Pedido': {
    bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400'
  },
  'Aguardando Pagamento': {
    bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400'
  },
  'Confirmado / Pago': {
    bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400'
  },
  'Em Separação': {
    bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400'
  },
  'Enviado': {
    bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400'
  },
  'Entregue': {
    bg: 'bg-green-500/20 text-green-300 border-green-500/30',
    dot: 'bg-green-400'
  },
  'Cancelado': {
    bg: 'bg-red-500/20 text-red-300 border-red-500/30',
    dot: 'bg-red-400'
  }
};

export default function AdminCRM({
  orders = [],
  onUpdateOrderStatus,
  onUpdateOrderNotes,
  onDeleteOrder,
  onClearAllOrders,
  onSeedDemoOrders
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'
  const [crmView, setCrmView] = useState('orders'); // 'orders' | 'customers'
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        searchTerm === '' ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some((i) => i.title?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
      const matchPayment = selectedPayment === 'ALL' || order.financial?.paymentMethod === selectedPayment;

      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const totalA = a.financial?.total || 0;
      const totalB = b.financial?.total || 0;

      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest') return totalB - totalA;
      if (sortBy === 'lowest') return totalA - totalB;
      return 0;
    });
  }, [orders, searchTerm, selectedStatus, selectedPayment, sortBy]);

  // Aggregate Customers from Orders
  const customerList = useMemo(() => {
    const customerMap = new Map();

    orders.forEach((order) => {
      const key = (order.customer?.phone || order.customer?.email || order.customer?.name || '').trim().toLowerCase();
      if (!key) return;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: order.customer?.name || 'Cliente',
          phone: order.customer?.phone || '',
          email: order.customer?.email || '',
          city: order.address?.city || '',
          state: order.address?.state || '',
          address: order.address || {},
          ordersCount: 0,
          totalSpent: 0,
          orders: [],
          lastOrderDate: order.createdAt
        });
      }

      const client = customerMap.get(key);
      client.ordersCount += 1;
      client.totalSpent += (order.financial?.total || 0);
      client.orders.push(order);
      if (new Date(order.createdAt) > new Date(client.lastOrderDate)) {
        client.lastOrderDate = order.createdAt;
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalOrdersCount = orders.length;
    const uniqueCustomersCount = customerList.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.financial?.total || 0), 0);
    const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const pendingOrdersCount = orders.filter(
      (o) => o.status === 'Novo Pedido' || o.status === 'Aguardando Pagamento'
    ).length;
    const confirmedOrdersCount = orders.filter(
      (o) => o.status === 'Confirmado / Pago' || o.status === 'Entregue'
    ).length;

    return {
      totalOrdersCount,
      uniqueCustomersCount,
      totalRevenue,
      avgTicket,
      pendingOrdersCount,
      confirmedOrdersCount
    };
  }, [orders, customerList]);

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Não há pedidos ou clientes para exportar.');
      return;
    }

    const headers = [
      'Numero_Pedido',
      'Data_Criacao',
      'Status',
      'Cliente_Nome',
      'Cliente_Telefone',
      'Cliente_Email',
      'Cidade',
      'Estado',
      'Forma_Pagamento',
      'Qtd_Itens',
      'Valor_Subtotal',
      'Desconto',
      'Frete',
      'Valor_Total'
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber || ''}"`,
      `"${new Date(o.createdAt).toLocaleString('pt-BR')}"`,
      `"${o.status || ''}"`,
      `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
      `"${o.customer?.phone || ''}"`,
      `"${o.customer?.email || ''}"`,
      `"${o.address?.city || ''}"`,
      `"${o.address?.state || ''}"`,
      `"${o.financial?.paymentMethod === 'pix' ? 'Pix' : 'Cartao'}"`,
      o.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0,
      (o.financial?.subtotal || 0).toFixed(2),
      (o.financial?.discount || 0).toFixed(2),
      (o.financial?.shipping || 0).toFixed(2),
      (o.financial?.total || 0).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `millany_modas_crm_pedidos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export Customers to CSV
  const handleExportCustomersCSV = () => {
    if (customerList.length === 0) {
      alert('Não há clientes cadastrados para exportar.');
      return;
    }

    const headers = [
      'Nome_Cliente',
      'Telefone_WhatsApp',
      'Email',
      'Cidade',
      'Estado',
      'Qtd_Pedidos',
      'Total_Gasto_R$',
      'Ultimo_Pedido_Data'
    ];

    const rows = customerList.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      c.ordersCount,
      c.totalSpent.toFixed(2),
      `"${new Date(c.lastOrderDate).toLocaleString('pt-BR')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `millany_modas_crm_clientes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpenWhatsAppContact = (phone, name, orderNumber) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${name || 'Cliente'}, tudo bem? Aqui é da Millany Modas referente ao seu pedido #${orderNumber || ''}. Gostaria de confirmar as informações com você!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${targetPhone}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-rose/20 text-brand-rose-light rounded-xl border border-brand-rose/30">
              <Users className="w-5 h-5 text-brand-rose" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              CRM de Clientes & Pedidos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Gestão de leads capturados no checkout, pedidos recebidos via WhatsApp, histórico de clientes e status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {orders.length === 0 && onSeedDemoOrders && (
            <button
              onClick={onSeedDemoOrders}
              className="px-3.5 py-2 bg-brand-card hover:bg-brand-rose/20 text-brand-rose-light border border-brand-rose/40 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Preenche o CRM com pedidos simulados para testar"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
              <span>Gerar Pedidos Teste</span>
            </button>
          )}

          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-brand-border">
            <button
              onClick={() => setCrmView('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                crmView === 'orders'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Pedidos ({orders.length})</span>
            </button>

            <button
              onClick={() => setCrmView('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                crmView === 'customers'
                  ? 'bg-brand-rose text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes ({customerList.length})</span>
            </button>
          </div>

          <button
            onClick={crmView === 'orders' ? handleExportCSV : handleExportCustomersCSV}
            className="px-3.5 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title="Exportar para Excel / Planilha CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {orders.length > 0 && onClearAllOrders && (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todos os pedidos do CRM? Essa ação não pode ser desfeita.')) {
                  onClearAllOrders();
                }
              }}
              className="p-2 text-gray-500 hover:text-red-400 rounded-xl bg-brand-card hover:bg-red-500/10 border border-brand-border transition-colors"
              title="Limpar histórico do CRM"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-brand-card/90 border border-brand-border p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-rose/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Faturamento Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            {formatBRL(metrics.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <span>Ticket Médio:</span>
            <strong className="text-brand-rose-light">{formatBRL(metrics.avgTicket)}</strong>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-brand-card/90 border border-brand-border p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-rose/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total de Pedidos
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            {metrics.totalOrdersCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <span>{metrics.confirmedOrdersCount} confirmados / entregues</span>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="bg-brand-card/90 border border-brand-border p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-rose/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Base de Clientes
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
            {metrics.uniqueCustomersCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <span>Clientes únicos capturados</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-brand-card/90 border border-brand-border p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-rose/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Aguardando Contato
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-serif text-white tracking-tight text-amber-300">
            {metrics.pendingOrdersCount}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
            <span>Leads recentes para fechamento</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="bg-brand-card/70 border border-brand-border p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, WhatsApp, email, cidade ou nº pedido..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-brand-border rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-rose transition-colors"
            />
          </div>

          {/* Status Filter */}
          {crmView === 'orders' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filtrar por Status"
                className="bg-black/60 border border-brand-border rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand-rose transition-colors cursor-pointer"
              >
                <option value="ALL">Todos os Status</option>
                <option value="Novo Pedido">Novo Pedido</option>
                <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                <option value="Confirmado / Pago">Confirmado / Pago</option>
                <option value="Em Separação">Em Separação</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>

              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                aria-label="Filtrar por Pagamento"
                className="bg-black/60 border border-brand-border rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand-rose transition-colors cursor-pointer"
              >
                <option value="ALL">Qualquer Pagamento</option>
                <option value="pix">Pix (com 1% desc.)</option>
                <option value="credit">Cartão de Crédito</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar por"
                className="bg-black/60 border border-brand-border rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand-rose transition-colors cursor-pointer"
              >
                <option value="newest">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
                <option value="highest">Maior Valor</option>
                <option value="lowest">Menor Valor</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. CONTENT LIST: ORDERS VIEW */}
      {crmView === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-brand-card/50 border border-brand-border rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-rose/10 text-brand-rose flex items-center justify-center mx-auto border border-brand-rose/20">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif text-white font-bold">
                {orders.length === 0 ? 'Nenhum pedido registrado no CRM ainda' : 'Nenhum pedido encontrado para esses filtros'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Assim que um cliente preencher o formulário do Checkout Transparente e clicar em "Fazer Pedido", todos os dados (nome, endereço, telefone, itens) serão salvos automaticamente aqui!
              </p>
              {orders.length === 0 && onSeedDemoOrders && (
                <button
                  onClick={onSeedDemoOrders}
                  className="px-5 py-2.5 bg-brand-rose hover:bg-brand-rose-dark text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Carregar Pedidos de Demonstração</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const badge = STATUS_BADGES[order.status] || STATUS_BADGES['Novo Pedido'];
                const itemsCount = order.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 0;

                return (
                  <div
                    key={order.id}
                    className="bg-brand-card/90 border border-brand-border hover:border-brand-rose/40 rounded-2xl p-5 transition-all shadow-lg space-y-4"
                  >
                    {/* Top Row: Order ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white bg-black/60 px-3 py-1 rounded-lg border border-brand-border">
                          #{order.orderNumber}
                        </span>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                          <span>{order.status || 'Novo Pedido'}</span>
                        </span>

                        {order.stockDeducted && (
                          <span className="flex items-center gap-1 text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-semibold" title="Estoque deste pedido já foi debitado automaticamente">
                            <Package className="w-3 h-3 text-purple-400" /> Estoque Baixado
                          </span>
                        )}

                        {order.financial?.paymentMethod === 'pix' ? (
                          <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                            <QrCode className="w-3 h-3" /> Pix
                          </span>
                        ) : order.financial?.paymentMethod === 'credit' || order.financial?.paymentMethod === 'credit_card' ? (
                          <span className="flex items-center gap-1 text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-semibold">
                            <CreditCard className="w-3 h-3" /> Cartão
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
                            <MessageCircle className="w-3 h-3 text-brand-whatsapp" /> Via WhatsApp
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Middle Row: Customer Info & Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Customer Details */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                          Cliente
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-rose/20 text-brand-rose-light flex items-center justify-center font-bold text-xs">
                            {order.customer?.name ? order.customer.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {order.customer?.name || 'Cliente Sem Nome'}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-brand-whatsapp" />
                              <span>{order.customer?.phone || 'Sem telefone'}</span>
                            </div>
                          </div>
                        </div>

                        {order.customer?.email && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1 pl-10">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="truncate max-w-[200px]">{order.customer.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                          Entrega
                        </div>
                        <div className="text-xs text-gray-300 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-rose mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-white">
                              {order.address?.street}, {order.address?.number}
                              {order.address?.complement ? ` (${order.address.complement})` : ''}
                            </p>
                            <p className="text-gray-400 text-[11px]">
                              {order.address?.neighborhood} - {order.address?.city}/{order.address?.state}
                            </p>
                            <p className="text-gray-500 text-[10px] font-mono">
                              CEP: {order.address?.cep}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Items & Total */}
                      <div className="space-y-1.5 md:text-right">
                        <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                          Itens & Total
                        </div>
                        <div className="text-lg font-bold font-serif text-brand-gold">
                          {formatBRL(order.financial?.total)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'itens'} no pedido
                        </div>

                        {/* Items thumbnail preview */}
                        <div className="flex items-center gap-1.5 md:justify-end overflow-hidden pt-1">
                          {order.items?.slice(0, 4).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image || item.images?.[0]}
                              alt={item.title}
                              title={`${item.title} (${item.quantity}x)`}
                              className="w-8 h-8 rounded-lg object-cover border border-brand-border bg-black"
                            />
                          ))}
                          {order.items?.length > 4 && (
                            <span className="w-8 h-8 rounded-lg bg-black border border-brand-border text-[10px] text-gray-400 flex items-center justify-center font-bold">
                              +{order.items.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Internal Notes Preview (if any) */}
                    {order.notes && (
                      <div className="bg-black/40 border border-brand-border/60 rounded-xl px-3 py-2 text-xs text-amber-200/90 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate"><strong>Nota Interna:</strong> {order.notes}</span>
                      </div>
                    )}

                    {/* Bottom Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-brand-border/40">
                      
                      {/* Status Selector Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400 font-semibold hidden sm:inline">Mudar Status:</span>
                        <select
                          value={order.status || 'Novo Pedido'}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          aria-label="Atualizar status do pedido"
                          className="bg-black/60 border border-brand-border text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-brand-rose cursor-pointer"
                        >
                          <option value="Novo Pedido">Novo Pedido</option>
                          <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                          <option value="Confirmado / Pago">Confirmado / Pago</option>
                          <option value="Em Separação">Em Separação</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Customer Action */}
                        <button
                          onClick={() => handleOpenWhatsAppContact(order.customer?.phone, order.customer?.name, order.orderNumber)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                          title="Falar com o cliente no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp Cliente</span>
                        </button>

                        {/* View Complete Dossier */}
                        <button
                          onClick={() => setSelectedOrderForDetails(order)}
                          className="px-3 py-1.5 bg-brand-rose/20 hover:bg-brand-rose/30 text-brand-rose-light border border-brand-rose/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Dossiê Completo</span>
                        </button>

                        {/* Delete Order */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o pedido #${order.orderNumber} permanentemente?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Excluir pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. CONTENT LIST: CUSTOMERS AGGREGATED VIEW */}
      {crmView === 'customers' && (
        <div className="space-y-4">
          {customerList.length === 0 ? (
            <div className="bg-brand-card/50 border border-brand-border rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif text-white font-bold">
                Nenhum cliente cadastrado ainda
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Conforme novos clientes finalizarem compras no checkout, sua base de contatos qualificados e histórico de LTV (Lifetime Value) crescerá aqui.
              </p>
            </div>
          ) : (
            <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-black/80 text-[11px] uppercase tracking-wider text-gray-400 border-b border-brand-border">
                    <tr>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">WhatsApp / Telefone</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Localidade</th>
                      <th className="py-3 px-4 text-center">Pedidos</th>
                      <th className="py-3 px-4 text-right">Total Gasto (LTV)</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40">
                    {customerList.map((client, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-rose/20 text-brand-rose-light flex items-center justify-center font-bold text-xs shrink-0">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{client.name}</div>
                              <div className="text-[10px] text-gray-500">
                                Último: {new Date(client.lastOrderDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          {client.phone ? (
                            <button
                              onClick={() => handleOpenWhatsAppContact(client.phone, client.name, '')}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{client.phone}</span>
                            </button>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-400">
                          {client.email || '-'}
                        </td>

                        <td className="py-3.5 px-4">
                          {client.city ? (
                            <span className="text-gray-300">
                              {client.city}/{client.state}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-brand-rose/20 text-brand-rose-light px-2.5 py-1 rounded-full font-bold text-xs border border-brand-rose/30">
                            {client.ordersCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-brand-gold">
                          {formatBRL(client.totalSpent)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (client.orders[0]) {
                                setSelectedOrderForDetails(client.orders[0]);
                              }
                            }}
                            className="px-2.5 py-1 bg-brand-card hover:bg-brand-rose/20 text-gray-300 hover:text-white rounded-lg border border-brand-border text-xs transition-colors"
                          >
                            Ver Pedido
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Order Details Dossier Modal */}
      {selectedOrderForDetails && (
        <AdminOrderDetailsModal
          isOpen={!!selectedOrderForDetails}
          onClose={() => setSelectedOrderForDetails(null)}
          order={selectedOrderForDetails}
          onUpdateOrderStatus={(orderId, status) => {
            onUpdateOrderStatus(orderId, status);
            setSelectedOrderForDetails((prev) => prev ? { ...prev, status } : null);
          }}
          onUpdateOrderNotes={(orderId, notes) => {
            onUpdateOrderNotes(orderId, notes);
            setSelectedOrderForDetails((prev) => prev ? { ...prev, notes } : null);
          }}
        />
      )}
    </div>
  );
}
