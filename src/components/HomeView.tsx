import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  MessageSquare, 
  Camera, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  ChevronRight,
  Star,
  Flame,
  Check
} from 'lucide-react';
import { Profile, AppView } from '../types';

interface HomeViewProps {
  onStart: () => void;
  onSelectProfile: (profile: Profile) => void;
  profiles: Profile[];
  setCurrentView: (view: AppView) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStart,
  onSelectProfile,
  profiles,
  setCurrentView
}) => {
  const [ticketMedio, setTicketMedio] = useState<number>(350);
  const [orcamentosMes, setOrcamentosMes] = useState<number>(20);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  const activeProfile = profiles[selectedDemoIndex] || profiles[0];

  // ROI estimate: A professional link with real photos increases closing rate by ~35%
  const orcamentosAtuaisFechados = Math.round(orcamentosMes * 0.3); // 30% closing rate without portfolio
  const orcamentosComTecnicoLink = Math.round(orcamentosMes * 0.55); // 55% closing rate with portfolio
  const ganhoExtraMensal = (orcamentosComTecnicoLink - orcamentosAtuaisFechados) * ticketMedio;

  const demoPhotosMap: Record<string, { img: string; tag: string }[]> = {
    'prof-1': [
      { img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80', tag: 'Ar Split 18k' },
      { img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80', tag: 'Higienização' }
    ],
    'prof-2': [
      { img: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?auto=format&fit=crop&w=400&q=80', tag: 'Troca de Tela OLED' },
      { img: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80', tag: 'Reparo Placa Mãe' }
    ],
    'prof-3': [
      { img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', tag: 'Inversor Solar' },
      { img: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80', tag: 'Osciloscópio Lab' }
    ],
    'prof-4': [
      { img: 'https://images.unsplash.com/photo-1633493763531-155e9754f9d2?auto=format&fit=crop&w=400&q=80', tag: 'Impressão Resina 8K' },
      { img: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=400&q=80', tag: 'Prototipagem 3D' }
    ],
    'prof-5': [
      { img: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80', tag: 'Bolo Chantininho' },
      { img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', tag: 'Doces Finos Casamento' }
    ]
  };

  const currentDemoPhotos = demoPhotosMap[activeProfile?.id] || [
    { img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80', tag: 'Serviço 1' },
    { img: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80', tag: 'Serviço 2' }
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937]">
      
      {/* Hero Section */}
      <section className="relative pt-10 pb-16 overflow-hidden border-b border-gray-200 bg-white">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-500/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold shadow-xs">
              <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
              <span>Micro SaaS para Técnicos & Prestadores de Serviço</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight font-['Syne',sans-serif]">
              Seu portfólio profissional no WhatsApp em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600">
                menos de 5 minutos
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Você já faz o serviço perfeito e tem as fotos no rolo da câmera. Pare de perder orçamentos para concorrentes que parecem mais profissionais.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="btn-hero-cta"
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm rounded-xl shadow-md shadow-orange-600/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>CRIAR MEU SITE GRÁTIS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-hero-demo"
                onClick={() => setCurrentView('public_profile')}
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>Ver Exemplo de Site Gerado</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero conhecimento técnico</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fotos direto do celular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Botão direto pro seu WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Live Interactive Preview Bento Grid */}
          <div className="mt-12 max-w-5xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                  Demonstração em Tempo Real
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                  Veja como fica o site de diferentes profissionais:
                </h3>
              </div>
              
              {/* Category selector */}
              <div className="flex flex-wrap gap-2">
                {profiles.map((p, idx) => {
                  const isSelected = (activeProfile?.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedDemoIndex(idx);
                        onSelectProfile(p);
                      }}
                      className={`px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs ${
                        isSelected 
                          ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-400' 
                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      <span>{p.profession.split(' ')[0]}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                        isSelected 
                          ? 'bg-orange-700 text-white border-orange-500' 
                          : 'text-orange-700 bg-orange-50 border-orange-200'
                      }`}>
                        {p.city_state.split('-')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock phone preview inside home */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Configuração em 3 passos simples</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Como você cria em 5 minutos:</h4>
                  <ul className="mt-2.5 space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <span>Digite seu nome, WhatsApp, cidade e sua especialidade.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <span>Selecione 4 a 8 fotos de serviços feitos que estão no seu celular.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <span>Pronto! O sistema gera seu link <code className="text-orange-700 font-mono font-semibold bg-orange-50 px-1 rounded">tecnicolink.com.br/p/seu-nome</code> e QR Code.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50/70 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Resultado Comprovado</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    "O cliente que pede orçamento recebe um link profissional em vez de fotos soltas. A confiança aumenta na hora e ninguém mais pede desconto absurdo."
                  </p>
                  <div className="mt-2 text-[11px] text-gray-500 font-semibold">
                    — {activeProfile.full_name}, {activeProfile.profession} em {activeProfile.city_state}
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-2 text-gray-700 font-semibold truncate max-w-[200px] sm:max-w-none">
                      tecnicolink.com.br/p/{activeProfile.username}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      onSelectProfile(activeProfile);
                      setCurrentView('public_profile');
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>Abrir Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Simulated profile inside */}
                <div className="mt-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-3.5 items-start sm:items-center">
                  <img
                    src={activeProfile.avatar_url}
                    alt={activeProfile.full_name}
                    className="w-14 h-14 rounded-lg object-cover ring-2 ring-orange-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{activeProfile.full_name}</h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                        ★ {activeProfile.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 font-semibold truncate">{activeProfile.profession}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{activeProfile.bio_short}</p>
                  </div>
                </div>

                {/* 2 sample photos */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {currentDemoPhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={photo.img}
                        alt={photo.tag}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 left-1 bg-gray-900/80 text-[10px] text-white px-1.5 py-0.5 rounded font-medium truncate max-w-[90%]">
                        {photo.tag}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Simulated CTA button */}
                <div className="mt-3">
                  <a
                    href={`https://wa.me/55${activeProfile.whatsapp_number.replace(/\D/g, '')}?text=Ol%C3%A1%2C%20vi%20seu%20portf%C3%B3lio%20no%20T%C3%A9cnicoLink%20e%20gostaria%20de%20um%20or%C3%A7amento!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>FALAR NO WHATSAPP COM O TÉCNICO</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Comparison Section: "Antes vs Depois" */}
      <section className="py-16 bg-[#F3F4F6] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Transformação Imediata
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 font-['Syne',sans-serif]">
              Como você envia orçamentos hoje vs com o TécnicoLink
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              A diferença entre um cliente pechinchar ou aprovar o valor com segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* O Jeito Antigo */}
            <div className="bg-white border border-red-200 rounded-2xl p-5 sm:p-6 shadow-xs relative">
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>O Jeito Antigo (Amador)</span>
              </div>

              <div className="space-y-3">
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-xs text-gray-700 space-y-2">
                  <p className="font-semibold text-gray-900">Cliente no WhatsApp:</p>
                  <p className="italic text-gray-600">"Você tem fotos de outros serviços parecidos pra eu ver?"</p>
                  <div className="pt-2 border-t border-red-100 text-red-700 space-y-1">
                    <p>❌ Você gasta 20 minutos procurando fotos no rolo de câmera.</p>
                    <p>❌ Manda 8 fotos soltas sem explicação nenhuma.</p>
                    <p>❌ O cliente desconfia se as fotos são suas mesmo.</p>
                    <p>❌ O cliente compara só pelo preço e pede 40% de desconto.</p>
                  </div>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  <span className="font-bold">Resultado:</span> Taxa de fechamento baixa e desvalorização do seu valor/hora.
                </div>
              </div>
            </div>

            {/* O Jeito TécnicoLink */}
            <div className="bg-white border border-orange-300 rounded-2xl p-5 sm:p-6 shadow-sm relative ring-1 ring-orange-200">
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Com o TécnicoLink (Profissional)</span>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100 text-xs text-gray-700 space-y-2">
                  <p className="font-semibold text-gray-900">Cliente no WhatsApp:</p>
                  <p className="italic text-gray-600">"Você tem fotos de outros serviços parecidos pra eu ver?"</p>
                  <div className="pt-2 border-t border-orange-100 text-emerald-700 space-y-1">
                    <p>✅ Você envia seu link: <span className="text-orange-700 font-mono font-semibold">tecnicolink.com.br/p/carlos-eletricista</span></p>
                    <p>✅ O cliente abre em 1 segundo: vê fotos com legenda, garantia e avaliações.</p>
                    <p>✅ O cliente vê que você é um técnico sério e credenciado.</p>
                    <p>✅ O cliente clica no botão verde e já aprova o orçamento.</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <span className="font-bold">Resultado:</span> Mais orçamentos fechados e autoridade para cobrar seu preço justo.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
              Calculadora de Retorno
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Quanto dinheiro a mais você pode colocar no bolso todo mês?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ajuste seus números e veja o impacto de uma apresentação profissional:
            </p>
          </div>

          <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-center">
              
              {/* Sliders */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-700">Valor médio de cada serviço (Ticket Médio):</span>
                    <span className="text-orange-600 font-mono text-sm">R$ {ticketMedio}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={ticketMedio}
                    onChange={(e) => setTicketMedio(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>R$ 100</span>
                    <span>R$ 1.500</span>
                    <span>R$ 3.000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-700">Orçamentos solicitados por mês:</span>
                    <span className="text-orange-600 font-mono text-sm">{orcamentosMes} clientes</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={orcamentosMes}
                    onChange={(e) => setOrcamentosMes(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>5</span>
                    <span>40</span>
                    <span>80+</span>
                  </div>
                </div>
              </div>

              {/* Result card */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl text-center space-y-2.5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Potencial de Faturamento Extra Estimado
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">
                  + R$ {ganhoExtraMensal.toLocaleString('pt-BR')}<span className="text-xs font-normal text-gray-500">/mês</span>
                </div>
                <p className="text-xs text-gray-600">
                  Fechando em média <strong className="text-gray-900">+{orcamentosComTecnicoLink - orcamentosAtuaisFechados} orçamentos adicionais</strong> por mês com apresentação de alto nível.
                </p>

                <button
                  onClick={onStart}
                  className="w-full mt-3 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all"
                >
                  COMEÇAR AGORA POR R$ 0
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="py-14 bg-[#F3F4F6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-9">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Feito sob medida para profissionais que trabalham com as próprias mãos:
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Eletricistas', icon: '⚡', desc: 'Quadros, LED, Copel' },
              { name: 'Ar-Condicionado', icon: '❄️', desc: 'Instalação e Vácuo' },
              { name: 'Marceneiros', icon: '🪚', desc: 'Móveis Planejados' },
              { name: 'Encanadores', icon: '🔧', desc: 'Vazamentos e Cobre' },
              { name: 'Pintores', icon: '🎨', desc: 'Texturas e Airless' },
              { name: 'Gesseiros', icon: '🏛️', desc: 'Drywall e Sancas' },
            ].map((cat, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 hover:border-orange-500 p-3.5 rounded-xl text-center transition-all group shadow-2xs"
              >
                <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h4 className="font-bold text-xs text-gray-900">{cat.name}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-14 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Pronto para ter seu site de serviços no ar hoje mesmo?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Sem mensalidades surpresa. Sem precisar de computador ou saber programar.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all"
            >
              CRIAR MEU PORTFÓLIO EM 5 MINUTOS
            </button>
            <button
              onClick={() => setCurrentView('sql_schema')}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-all"
            >
              Ver Arquitetura Supabase / SQL
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
