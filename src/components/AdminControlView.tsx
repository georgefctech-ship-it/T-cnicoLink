import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Unlock, 
  Settings, 
  Sliders, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  Crown, 
  UserCheck, 
  Search, 
  Filter, 
  Database, 
  Activity, 
  Zap, 
  HelpCircle,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  UserX,
  RefreshCw,
  Award,
  DollarSign,
  TrendingUp,
  Target,
  QrCode,
  Flame,
  CheckSquare,
  Share2,
  PhoneCall,
  Pencil,
  Trash2
} from 'lucide-react';
import { Profile, SystemSettings, UserRole, UserStatus, UserPlan } from '../types';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlScripts';
import { ProfessionSelect } from './ProfessionSelect';
import { getDisplayHost } from '../lib/profileUrlHelper';

interface AdminControlViewProps {
  profiles: Profile[];
  onUpdateProfile: (profile: Profile) => void;
  onDeleteProfile?: (profileId: string) => void;
  systemSettings: SystemSettings;
  onSaveSystemSettings: (settings: SystemSettings) => void;
  onImpersonateUser: (profile: Profile) => void;
  currentAdmin: Profile;
}

export const AdminControlView: React.FC<AdminControlViewProps> = ({
  profiles,
  onUpdateProfile,
  onDeleteProfile,
  systemSettings,
  onSaveSystemSettings,
  onImpersonateUser,
  currentAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'monetization' | 'users' | 'settings' | 'guide' | 'sql_rules'>('monetization');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(systemSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  // Financial & Stats calculations
  const totalUsers = profiles.length;
  const activeUsers = profiles.filter(p => (p.status || 'active') === 'active').length;
  const suspendedUsers = profiles.filter(p => p.status === 'suspended').length;
  const proUsers = profiles.filter(p => p.plan === 'pro' || p.plan === 'enterprise').length;
  const freeUsers = profiles.filter(p => (p.plan || 'free') === 'free').length;
  const totalViews = profiles.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalWhatsappClicks = profiles.reduce((acc, p) => acc + (p.whatsapp_clicks || 0), 0);

  // MRR (Monthly Recurring Revenue) Calculation
  const proPriceMonthly = settingsForm.price_pro_monthly || 29.90;
  const currentMRR = proUsers * proPriceMonthly;
  const target30UsersMRR = 30 * proPriceMonthly;
  const target100UsersMRR = 100 * proPriceMonthly;

  // Filtered profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city_state.toLowerCase().includes(searchQuery.toLowerCase());
    
    const pStatus = p.status || 'active';
    const matchesStatus = statusFilter === 'all' || pStatus === statusFilter;
    
    const pPlan = p.plan || 'free';
    const matchesPlan = planFilter === 'all' || pPlan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleSuspend = (profile: Profile) => {
    const currentStatus = profile.status || 'active';
    const newStatus: UserStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const updated = { ...profile, status: newStatus };
    onUpdateProfile(updated);
  };

  const handleToggleVerified = (profile: Profile) => {
    const updated = { ...profile, is_verified: !profile.is_verified };
    onUpdateProfile(updated);
  };

  const handleChangePlan = (profile: Profile, newPlan: UserPlan) => {
    const maxPhotos = newPlan === 'pro' ? settingsForm.pro_plan_photo_limit : settingsForm.free_plan_photo_limit;
    const viewsLimit = newPlan === 'pro' ? settingsForm.pro_plan_monthly_views : settingsForm.free_plan_monthly_views;
    const updated: Profile = { 
      ...profile, 
      plan: newPlan, 
      max_photos: maxPhotos,
      monthly_views_limit: viewsLimit,
      is_verified: newPlan === 'pro' ? true : profile.is_verified
    };
    onUpdateProfile(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSystemSettings(settingsForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleOpenEdit = (profile: Profile) => {
    setEditingProfile({ ...profile });
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    onUpdateProfile(editingProfile);
    setEditingProfile(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingProfile) return;
    if (onDeleteProfile) {
      onDeleteProfile(deletingProfile.id);
    }
    setDeletingProfile(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const ADMIN_SQL_RBAC = SUPABASE_SQL_SCRIPT;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Master Admin Header Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
                  Controle Master & Monetização
                </span>
                <span className="text-xs text-gray-500 font-medium">Administrador: <strong>{currentAdmin.full_name}</strong></span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Supabase Conectado
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5 font-['Syne',sans-serif]">
                Central de Monetização, Faturamento & Controle
              </h1>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                Controle o faturamento por acessos, gerencie assinaturas PRO via PIX direto na sua conta, configure limites de tráfego e execute o plano para faturar nos primeiros 30 dias.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('monetization')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Plano 30 Dias para Faturar</span>
            </button>
          </div>
        </div>

        {/* Financial & Operational KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
                <span>MRR Atual (Mensal)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700">
                R$ {currentMRR.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">{proUsers} assinantes ativos</div>
            </div>
          </div>

          <div className="bg-white border border-orange-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-600 text-xs font-medium mb-1">
              <span>Meta 30 Dias (30 PRO)</span>
              <Target className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xl font-black text-orange-600">
              R$ {target30UsersMRR.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">R$ 29,90/mês por técnico</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
              <span>Técnicos Free</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-gray-900">{freeUsers}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Potenciais clientes PRO</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
              <span>Visualizações /p/</span>
              <Eye className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-xl font-black text-gray-900">{totalViews}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Acessos monitorados</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
              <span>Cliques WhatsApp</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700">{totalWhatsappClicks}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Chamados gerados</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 text-xs font-medium mb-1">
              <span>Chave PIX Recebimento</span>
              <QrCode className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xs font-black text-gray-900 truncate" title={settingsForm.admin_pix_key}>
              {settingsForm.admin_pix_key}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5 font-medium">100% Direto p/ você</div>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-gray-200 p-1 rounded-xl border border-gray-300 w-full sm:w-max gap-1">
          <button
            onClick={() => setActiveTab('monetization')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'monetization'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Plano de Faturamento (30 Dias)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-orange-600" />
            <span>Técnicos & Acessos ({filteredProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-orange-600" />
            <span>Preços, PIX & Limites de Tráfego</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>Guia do Administrador</span>
          </button>

          <button
            onClick={() => setActiveTab('sql_rules')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sql_rules'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQL Supabase</span>
          </button>
        </div>

        {/* TAB: MONETIZATION & 30-DAY SALES ROADMAP */}
        {activeTab === 'monetization' && (
          <div className="space-y-6">
            
            {/* Strategy Overview Banner */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-800 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Roteiro Validado para Faturar em Menos de 30 Dias</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Syne',sans-serif]">
                Como Transformar o TécnicoLink em R$ 3.000 a R$ 10.000/mês de Faturamento Recorrente
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
                Técnicos autônomos (eletricistas, encanadores, técnicos de ar-condicionado, gesseiros e pintores) perdem clientes todos os dias porque não têm um site profissional e seus orçamentos no WhatsApp parecem amadores. Você resolve a dor deles por apenas <strong>R$ 29,90/mês</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <span className="text-[11px] text-gray-400 font-bold block uppercase">Cenário Inicial (30 Dias)</span>
                  <span className="text-xl font-black text-emerald-400">30 Técnicos</span>
                  <span className="text-xs text-gray-300 block font-semibold">= R$ 897,00 / mês</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <span className="text-[11px] text-gray-400 font-bold block uppercase">Cenário 60 Dias</span>
                  <span className="text-xl font-black text-orange-400">100 Técnicos</span>
                  <span className="text-xs text-gray-300 block font-semibold">= R$ 2.990,00 / mês</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <span className="text-[11px] text-gray-400 font-bold block uppercase">Cenário 90 Dias (Escala Regional)</span>
                  <span className="text-xl font-black text-purple-400">300 Técnicos</span>
                  <span className="text-xs text-gray-300 block font-semibold">= R$ 8.970,00 / mês</span>
                </div>
              </div>
            </div>

            {/* The 4-Week Action Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Semana 1 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                    Semana 1 (Dias 1 a 7)
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">Meta: 10 Perfis Cadastrados</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">1. Cadastro e Ativação dos Primeiros 10 Técnicos</h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                  <li>Abra o Google Maps e busque na sua cidade: <em>"Eletricista", "Instalador de Ar Condicionado", "Encanador"</em>.</li>
                  <li>Pegue 20 números de WhatsApp que NÃO têm site (usam apenas link de rede social ou nada).</li>
                  <li>Crie o perfil deles na plataforma com o nome e profissão em 2 minutos.</li>
                  <li>Mande a mensagem com o link pronto dizendo: <em>"Criei uma página profissional com suas fotos de trabalho de presente para você ver como fica"</em>.</li>
                </ul>
              </div>

              {/* Semana 2 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Semana 2 (Dias 8 a 14)
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">Meta: Primeiras 5 Vendas PRO</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">2. Gatilho do Limite de Acessos & Selo Verificado</h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                  <li>O técnico começa a enviar o link nos orçamentos do WhatsApp.</li>
                  <li>Quando ele atinge o limite do plano gratuito (100 visualizações ou 6 fotos), o sistema avisa que novos clientes estão acessando.</li>
                  <li>Ofereça o upgrade PRO por <strong>R$ 29,90/mês</strong> com o Selo Oficial de Profissional Verificado e até 30 fotos de galeria.</li>
                </ul>
              </div>

              {/* Semana 3 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                    Semana 3 (Dias 15 a 21)
                  </span>
                  <span className="text-xs text-blue-700 font-bold">Meta: Parceria com Lojas de Materiais</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">3. Parceria com Lojas de Materiais Elétricos / Hidráulicos</h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                  <li>Visite as lojas locais de materiais de construção e elétrica onde os técnicos compram peças todo dia.</li>
                  <li>Deixe um display ou QR code no balcão: <em>"Técnico: tenha seu portfólio digital profissional e receba mais orçamentos"</em>.</li>
                  <li>Dê 30 dias de degustação PRO para técnicos indicados pelos vendedores da loja.</li>
                </ul>
              </div>

              {/* Semana 4 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                    Semana 4 (Dias 22 a 30)
                  </span>
                  <span className="text-xs text-purple-700 font-bold">Meta: Bater 30 Assinantes Pagantes</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">4. Oferta de Plano Anual (Caixa Rápido)</h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                  <li>Ofereça a assinatura anual à vista por <strong>R$ 290,00 via PIX</strong> (com 2 meses grátis).</li>
                  <li>Se 10 técnicos fecharem o plano anual no mês, você coloca <strong>R$ 2.900,00 líquidos na sua conta imediatamente</strong>.</li>
                  <li>Ativação 100% pelo seu painel com um clique.</li>
                </ul>
              </div>

            </div>

            {/* Scripts Prontos para Copiar e Enviar no WhatsApp */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Scripts Prontos para Abordagem no WhatsApp (Copie e Cole)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Use essas mensagens testadas para abordar prestadores de serviço com alta taxa de conversão.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Script 1 */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">Abordagem 1: "Criei seu link de presente"</span>
                    <button
                      onClick={() => copyToClipboard(
                        `Olá [Nome do Técnico], tudo bem? Vi seus trabalhos como [Profissão] aqui na região e achei muito bom o capricho!\n\nNotei que quando um cliente pede seu portfólio no WhatsApp você precisa mandar várias fotos soltas. Criei uma página profissional rápida para você ver como seus clientes enxergam seus serviços:\n👉 [Link do Perfil Criado]\n\nFicou bem bacana com botão direto pro seu WhatsApp, fotos de antes/depois e avaliações. É 100% grátis para você testar! O que achou?`,
                        'script1'
                      )}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors"
                    >
                      {copiedScript === 'script1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript === 'script1' ? 'Copiado!' : 'Copiar Script'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-600 font-mono bg-white p-2.5 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line">
                    {`Olá [Nome], tudo bem? Vi seus trabalhos como [Profissão] aqui na região e achei muito bom o capricho!\n\nNotei que quando um cliente pede seu portfólio no WhatsApp você manda fotos soltas. Criei uma página profissional para você:\n👉 [Seu Link]\n\nFicou top com botão direto pro WhatsApp e galeria. Dá uma olhada!`}
                  </p>
                </div>

                {/* Script 2 */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">Abordagem 2: "Oferta Upgrade PRO / Selo Verificado"</span>
                    <button
                      onClick={() => copyToClipboard(
                        `Olá [Nome]! Sua página no TécnicoLink já teve mais de 100 visualizações de clientes este mês!\n\nPara você não perder orçamentos e passar ainda mais autoridade, liberei uma condição especial do Plano PRO:\n✅ Até 30 fotos de alta qualidade\n✅ Selo Oficial de Profissional Verificado\n✅ Até 2.500 visualizações mensais garantidas\n\nPor apenas R$ 29,90/mês ou R$ 290,00 no anual via PIX.\n\nQuer que eu ative seu selo verificado agora?`,
                        'script2'
                      )}
                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors"
                    >
                      {copiedScript === 'script2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedScript === 'script2' ? 'Copiado!' : 'Copiar Script'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-600 font-mono bg-white p-2.5 rounded-lg border border-gray-200 leading-relaxed whitespace-pre-line">
                    {`Olá [Nome]! Sua página já atingiu o limite de acessos gratuitos deste mês.\n\nPara continuar recebendo clientes sem interrupção e liberar o Selo Oficial de Profissional Verificado com 30 fotos:\n👉 Plano PRO por apenas R$ 29,90/mês.\n\nPosso ativar seu selo verificado hoje?`}
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB: USERS MANAGEMENT & TRAFFIC METER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, profissão ou cidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-orange-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="suspended">Apenas Suspensos</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="free">Plano FREE</option>
                  <option value="pro">Plano PRO</option>
                </select>
              </div>
            </div>

            {/* Profiles Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Técnico / Profissão</th>
                      <th className="py-3 px-3">Status da Conta</th>
                      <th className="py-3 px-3">Plano Atual</th>
                      <th className="py-3 px-3">Selo Oficial</th>
                      <th className="py-3 px-3">Consumo de Acessos</th>
                      <th className="py-3 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProfiles.map((p) => {
                      const isSuspended = p.status === 'suspended';
                      const isPro = p.plan === 'pro' || p.plan === 'enterprise';
                      const viewsLimit = isPro ? settingsForm.pro_plan_monthly_views : settingsForm.free_plan_monthly_views;
                      const viewsUsed = p.views_count || 0;
                      const percentUsed = Math.min(100, Math.round((viewsUsed / (viewsLimit || 100)) * 100));

                      return (
                        <tr key={p.id} className={`hover:bg-gray-50/80 transition-colors ${isSuspended ? 'bg-red-50/30' : ''}`}>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.avatar_url}
                                alt={p.full_name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                                  <span>{p.full_name}</span>
                                  {p.role === 'admin' && (
                                    <span className="px-1.5 py-0.2 bg-orange-600 text-white rounded text-[9px] font-black uppercase">
                                      ADMIN
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(p)}
                                    className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                    title="Editar informações deste técnico"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-gray-500 text-[11px] truncate">{p.profession} • {p.city_state}</div>
                                <div className="text-orange-700 font-mono text-[10px]">/p/{p.username}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuspended
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isSuspended ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                              <span>{isSuspended ? 'Suspenso' : 'Ativo'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={p.plan || 'free'}
                                onChange={(e) => handleChangePlan(p, e.target.value as UserPlan)}
                                className={`px-2 py-1 rounded-md text-xs font-bold border focus:outline-none transition-colors ${
                                  isPro
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                <option value="free">Plano FREE (Grátis)</option>
                                <option value="pro">Plano PRO (R$ 29,90/mês)</option>
                                <option value="enterprise">ENTERPRISE</option>
                              </select>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <button
                              onClick={() => handleToggleVerified(p)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                p.is_verified
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                              }`}
                              title="Clique para alternar o selo de verificado"
                            >
                              <Award className={`w-3.5 h-3.5 ${p.is_verified ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span>{p.is_verified ? 'Verificado' : 'Sem Selo'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="w-32 space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-700">{viewsUsed} views</span>
                                <span className="text-gray-400">/ {viewsLimit}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${percentUsed >= 100 ? 'bg-red-500' : percentUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${percentUsed}%` }}
                                ></div>
                              </div>
                              <div className="text-[9px] text-emerald-700 font-semibold">
                                {p.whatsapp_clicks || 0} cliques zap
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                                title="Editar dados completos do técnico"
                              >
                                <Pencil className="w-3 h-3 text-amber-700" />
                                <span>Editar</span>
                              </button>

                              {/* Impersonate Button */}
                              <button
                                type="button"
                                onClick={() => onImpersonateUser(p)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200 transition-colors"
                                title="Ver o Painel como este Técnico"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-600" />
                              </button>

                              {/* Suspend / Unsuspend Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(p)}
                                className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                                  isSuspended
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                }`}
                                title={isSuspended ? 'Desbloquear Acesso' : 'Bloquear / Suspender Acesso'}
                              >
                                {isSuspended ? (
                                  <>
                                    <Unlock className="w-3 h-3" />
                                    <span>Ativar</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3" />
                                    <span>Bloquear</span>
                                  </>
                                )}
                              </button>

                              {/* Delete Button */}
                              {p.role !== 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingProfile(p)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-md border border-red-200 transition-colors"
                                  title="Excluir Técnico e Site"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM SETTINGS, PRICES & PIX */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-600" />
                <span>Preços, Configuração PIX & Limites de Tráfego</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Altere suas chaves de recebimento PIX, defina o preço das assinaturas e ajuste os limites de fotos e acessos por plano.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Configurações salvas e aplicadas em tempo real!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* PIX Key Configuration */}
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>Sua Chave PIX Oficial de Recebimento</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.admin_pix_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, admin_pix_key: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-purple-600"
                  placeholder="Ex: georgefctec@gmail.com ou CPF/CNPJ"
                />
                <p className="text-[11px] text-gray-500">
                  Os técnicos pagarão diretamente nesta chave ao fazerem upgrade para o plano PRO.
                </p>
              </div>

              {/* WhatsApp Billing */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>WhatsApp para Receber Comprovantes</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.admin_whatsapp_billing}
                  onChange={(e) => setSettingsForm({ ...settingsForm, admin_whatsapp_billing: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-600"
                  placeholder="Ex: 5541999998888 (com DDI e DDD)"
                />
                <p className="text-[11px] text-gray-500">
                  Botão de envio de comprovante no modal de pagamento abrirá direto neste número.
                </p>
              </div>

              {/* Price PRO Monthly */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Preço do Plano PRO Mensal (R$)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={settingsForm.price_pro_monthly}
                    onChange={(e) => setSettingsForm({ ...settingsForm, price_pro_monthly: Number(e.target.value) })}
                    className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                  />
                  <span className="text-xs text-gray-500">por mês</span>
                </div>
              </div>

              {/* Price PRO Yearly */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Preço do Plano PRO Anual (R$)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">R$</span>
                  <input
                    type="number"
                    step="1.00"
                    value={settingsForm.price_pro_yearly}
                    onChange={(e) => setSettingsForm({ ...settingsForm, price_pro_yearly: Number(e.target.value) })}
                    className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                  />
                  <span className="text-xs text-emerald-700 font-semibold">(com 2 meses grátis)</span>
                </div>
              </div>

              {/* Monthly Views Free */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Limite de Acessos Mensais - Plano FREE
                </label>
                <input
                  type="number"
                  value={settingsForm.free_plan_monthly_views}
                  onChange={(e) => setSettingsForm({ ...settingsForm, free_plan_monthly_views: Number(e.target.value) })}
                  className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                />
                <p className="text-[11px] text-gray-500">
                  Quando atinge este número de visualizações, o técnico recebe o convite para migrar ao PRO.
                </p>
              </div>

              {/* Monthly Views Pro */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Limite de Acessos Mensais - Plano PRO
                </label>
                <input
                  type="number"
                  value={settingsForm.pro_plan_monthly_views}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pro_plan_monthly_views: Number(e.target.value) })}
                  className="w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                />
                <p className="text-[11px] text-gray-500">
                  Capacidade ampla para atender técnicos de alto fluxo de orçamentos.
                </p>
              </div>

              {/* Free Plan Photo Limit */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Limite de Fotos - Plano Gratuito (FREE)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settingsForm.free_plan_photo_limit}
                  onChange={(e) => setSettingsForm({ ...settingsForm, free_plan_photo_limit: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                />
              </div>

              {/* Pro Plan Photo Limit */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Limite de Fotos - Plano Profissional (PRO)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={settingsForm.pro_plan_photo_limit}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pro_plan_photo_limit: Number(e.target.value) })}
                  className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:border-orange-600"
                />
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-[0.99] flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar e Atualizar Parâmetros</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: GUIDE */}
        {activeTab === 'guide' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Guia Operacional do Administrador
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Entenda como gerenciar seus técnicos, aprovar novas contas e garantir a segurança do seu SaaS.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
              <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl">
                <h4 className="font-bold text-orange-950 text-sm mb-1">Como Ativar um Técnico no Plano PRO</h4>
                <p>
                  Quando o técnico fizer o PIX na sua chave (<strong>{settingsForm.admin_pix_key}</strong>), você pode vir na aba <strong>Técnicos & Acessos</strong> e simplesmente trocar o plano dele de <em>Plano FREE</em> para <em>Plano PRO</em>. Automaticamente o limite dele sobe para até {settingsForm.pro_plan_photo_limit} fotos e {settingsForm.pro_plan_monthly_views} acessos mensais.
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h4 className="font-bold text-gray-900 text-sm mb-1">Como Bloquear Inadimplentes ou Perfis Impróprios</h4>
                <p>
                  Basta clicar no botão vermelho <strong>Suspender</strong> ao lado do técnico. O painel dele ficará bloqueado para salvar alterações e a página pública exibirá aviso de indisponibilidade temporária.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SQL RULES */}
        {activeTab === 'sql_rules' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            
            {/* Troubleshooting Alert Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <span className="font-bold block text-emerald-900">
                  Script Unificado &amp; Correção para "ERROR: 42P01: relation profiles does not exist"
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  Se você recebeu o erro <strong>ERROR: 42P01: relation "public.profiles" does not exist</strong>, isso significa que tentou executar comandos de alteração antes da criação inicial da tabela. O script completo abaixo foi estruturado para criar a tabela <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">profiles</code>, galeria <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">service_gallery</code>, avaliações, bucket de imagens e todas as políticas RLS na ordem exata.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Script SQL Completo (Tabelas + RLS + Storage + Monetização)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Copie e cole no <strong>SQL Editor</strong> do seu Supabase e clique em <strong>Run</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(ADMIN_SQL_RBAC);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL Completo'}</span>
              </button>
            </div>

            <pre className="p-4 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-[420px]">
              {ADMIN_SQL_RBAC}
            </pre>
          </div>
        )}

        {/* MODAL: EDIT USER */}
        {editingProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Editar Técnico / Usuário</h3>
                    <p className="text-xs text-gray-500">ID: {editingProfile.id} • Cadastrado no sistema</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedUser} className="space-y-4">
                {/* Avatar Preview + URL */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <img
                    src={editingProfile.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'}
                    alt="Prévia Avatar"
                    className="w-16 h-16 rounded-xl object-cover border border-gray-300 bg-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789');
                    }}
                  />
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Link / URL da Foto do Avatar
                    </label>
                    <input
                      type="url"
                      value={editingProfile.avatar_url || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, avatar_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Nome Completo / Fantasia <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProfile.full_name}
                      onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Link do Site / Username <span className="text-orange-600">*</span>
                    </label>
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-orange-500 focus-within:bg-white text-xs font-mono">
                      <span className="text-gray-400 select-none">/p/</span>
                      <input
                        type="text"
                        required
                        value={editingProfile.username}
                        onChange={(e) => setEditingProfile({ 
                          ...editingProfile, 
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                        })}
                        className="bg-transparent text-orange-600 focus:outline-none w-full font-bold ml-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Profissão / Especialidade <span className="text-orange-600">*</span>
                    </label>
                    <ProfessionSelect
                      value={editingProfile.profession}
                      onChange={(prof) => setEditingProfile({ ...editingProfile, profession: prof })}
                      placeholder="Selecione ou digite a profissão..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      WhatsApp do Profissional <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProfile.whatsapp_number}
                      onChange={(e) => setEditingProfile({ ...editingProfile, whatsapp_number: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Cidade / Estado (Região de Atendimento)
                    </label>
                    <input
                      type="text"
                      value={editingProfile.city_state || ''}
                      onChange={(e) => setEditingProfile({ ...editingProfile, city_state: e.target.value })}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Plano do Usuário
                    </label>
                    <select
                      value={editingProfile.plan || 'free'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, plan: e.target.value as UserPlan })}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 font-bold"
                    >
                      <option value="free">Plano FREE (Grátis)</option>
                      <option value="pro">Plano PRO (R$ 29,90/mês)</option>
                      <option value="enterprise">Plano ENTERPRISE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Resumo / Descrição dos Serviços (Bio Curta)
                  </label>
                  <textarea
                    rows={2}
                    value={editingProfile.bio_short || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, bio_short: e.target.value })}
                    placeholder="Descrição para apresentar o técnico aos clientes..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Status da Conta
                    </label>
                    <select
                      value={editingProfile.status || 'active'}
                      onChange={(e) => setEditingProfile({ ...editingProfile, status: e.target.value as UserStatus })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-bold"
                    >
                      <option value="active">Ativo (Acesso Liberado)</option>
                      <option value="suspended">Suspenso (Bloqueado)</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Limite de Fotos
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={editingProfile.max_photos || 12}
                      onChange={(e) => setEditingProfile({ ...editingProfile, max_photos: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Limite Mensal de Acessos
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100000}
                      value={editingProfile.monthly_views_limit || 100}
                      onChange={(e) => setEditingProfile({ ...editingProfile, monthly_views_limit: Number(e.target.value) })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit_is_verified"
                    checked={Boolean(editingProfile.is_verified)}
                    onChange={(e) => setEditingProfile({ ...editingProfile, is_verified: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor="edit_is_verified" className="text-xs font-bold text-gray-800 flex items-center gap-1.5 cursor-pointer">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Conceder Selo Oficial de Verificado (Destaque Azul no Site)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: DELETE CONFIRMATION */}
        {deletingProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-700 rounded-xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Excluir Usuário e Site?</h3>
                  <p className="text-xs text-gray-500">Esta ação é permanente e irreversível.</p>
                </div>
              </div>

              <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200 text-xs space-y-2 text-red-900">
                <div className="flex items-center gap-2">
                  <img
                    src={deletingProfile.avatar_url}
                    alt={deletingProfile.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-red-200 shrink-0"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{deletingProfile.full_name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{getDisplayHost()}/p/{deletingProfile.username}</div>
                  </div>
                </div>
                <p className="text-red-700 text-[11px] leading-relaxed pt-1">
                  Ao confirmar, todos os dados cadastrais, fotos da galeria, links, QR Codes gerados e estatísticas de acesso deste técnico serão removidos do armazenamento local e do banco Supabase.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProfile(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir Usuário</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
