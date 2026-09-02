import React, { useState } from 'react';
import { 
  Cloud, 
  Globe, 
  Lock, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Code,
  FileText
} from 'lucide-react';
import { NEXTJS_APP_ROUTER_CODE } from '../lib/nextjsExport';

export const DeployDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'nextjs_code'>('guide');
  const [activeCodeFile, setActiveCodeFile] = useState<'env' | 'public_page' | 'middleware' | 'painel'>('public_page');

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-3">
            <Cloud className="w-3.5 h-3.5" />
            <span>Etapa 3: Guia de Configuração & Deploy em Produção</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Syne',sans-serif]">
            Supabase + Next.js + Vercel + Cloudflare DNS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Passo a passo completo e à prova de falhas para colocar o Micro SaaS no ar com domínio próprio, certificado SSL, cache de imagens e autenticação segura.
          </p>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-sky-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              Guia Passo a Passo (Vercel & Cloudflare)
            </button>
            <button
              onClick={() => setActiveTab('nextjs_code')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'nextjs_code'
                  ? 'bg-sky-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              Código-Fonte Next.js (App Router)
            </button>
          </div>
        </div>

        {activeTab === 'guide' ? (
          <div className="space-y-6">
            
            {/* Step 1: Supabase Environment */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Configurar Variáveis no Arquivo .env.local</h2>
                  <p className="text-xs text-zinc-400">Obtenha as credenciais no menu Project Settings ➔ API do Supabase</p>
                </div>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 relative font-mono text-xs text-zinc-300">
                <button
                  onClick={() => copyText('env', NEXTJS_APP_ROUTER_CODE.envExample)}
                  className="absolute top-3 right-3 text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded border border-zinc-700"
                >
                  {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'env' ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <pre>{NEXTJS_APP_ROUTER_CODE.envExample}</pre>
              </div>

              <div className="text-xs text-zinc-400 space-y-1 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60">
                <p>🔹 <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> Sua URL do projeto (ex: <code className="text-amber-400">https://xyzcompany.supabase.co</code>).</p>
                <p>🔹 <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> A chave pública segura para chamadas do frontend com RLS ativo.</p>
              </div>
            </div>

            {/* Step 2: Vercel Deployment */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Publicação do Projeto na Vercel</h2>
                  <p className="text-xs text-zinc-400">Hospedagem otimizada para Next.js App Router com Server-Side Rendering</p>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-3 text-xs text-zinc-300 leading-relaxed">
                <li>
                  Suba o repositório para o seu <strong>GitHub</strong> ou <strong>GitLab</strong>.
                </li>
                <li>
                  Acesse <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">vercel.com/new</a> e importe seu repositório.
                </li>
                <li>
                  No painel de importação, expanda a seção <strong>Environment Variables</strong> e adicione as variáveis:
                  <ul className="list-disc list-inside mt-2 pl-4 space-y-1 font-mono text-zinc-400">
                    <li><code className="text-amber-300">NEXT_PUBLIC_SUPABASE_URL</code></li>
                    <li><code className="text-amber-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                  </ul>
                </li>
                <li>
                  Clique em <strong>Deploy</strong>. O build será finalizado em ~1 minuto gerando seu domínio <code className="text-sky-400">meu-saas.vercel.app</code>.
                </li>
              </ol>
            </div>

            {/* Step 3: Cloudflare DNS Configuration */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                <span className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Configuração do Domínio no Cloudflare (DNS + SSL + Cache)</h2>
                  <p className="text-xs text-zinc-400">Garante carregamento ultra-rápido no Brasil, proteção DDoS e SSL Gratuito</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-zinc-300">
                
                {/* DNS Records Table */}
                <div>
                  <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>A. Registros DNS a serem adicionados no Cloudflare:</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border border-zinc-800 rounded-xl overflow-hidden">
                      <thead className="bg-zinc-950 text-zinc-400">
                        <tr>
                          <th className="p-2.5 border-b border-zinc-800">Tipo</th>
                          <th className="p-2.5 border-b border-zinc-800">Nome</th>
                          <th className="p-2.5 border-b border-zinc-800">Destino (Target)</th>
                          <th className="p-2.5 border-b border-zinc-800">Proxy Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
                        <tr>
                          <td className="p-2.5 text-amber-400 font-bold">A</td>
                          <td className="p-2.5">@ (raiz)</td>
                          <td className="p-2.5 text-zinc-300">76.76.21.21</td>
                          <td className="p-2.5 text-orange-400 font-semibold">Proxied (Nuvem Laranja)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-amber-400 font-bold">CNAME</td>
                          <td className="p-2.5">www</td>
                          <td className="p-2.5 text-zinc-300">cname.vercel-dns.com</td>
                          <td className="p-2.5 text-orange-400 font-semibold">Proxied (Nuvem Laranja)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SSL Mode */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>B. Modo de Criptografia SSL/TLS (Crítico):</span>
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    No menu <strong>SSL/TLS ➔ Overview</strong> do Cloudflare, selecione o modo <strong>Full (Strict)</strong>. Isso evita o erro clássico de redirecionamento em loop (<em>ERR_TOO_MANY_REDIRECTS</em>) entre Cloudflare e Vercel.
                  </p>
                </div>

                {/* Caching Rules */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>C. Regras de Cache (Page Rules / Cache Rules):</span>
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Para otimizar o carregamento das fotos do Supabase Storage no celular do cliente:
                  </p>
                  <div className="p-3 bg-zinc-900 rounded-lg font-mono text-[11px] text-zinc-300 border border-zinc-800">
                    <div><strong>Regra 1:</strong> Imagens Estáticas & Storage</div>
                    <div className="text-amber-400">URL Pattern: *seudominio.com.br/_next/image*</div>
                    <div className="text-emerald-400">Cache Level: Cache Everything • Edge TTL: 1 mês • Browser TTL: 7 dias</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            
            {/* File Switcher */}
            <div className="flex gap-2 flex-wrap bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
              <button
                onClick={() => setActiveCodeFile('public_page')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCodeFile === 'public_page'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                app/p/[username]/page.tsx
              </button>
              <button
                onClick={() => setActiveCodeFile('painel')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCodeFile === 'painel'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                app/painel/page.tsx
              </button>
              <button
                onClick={() => setActiveCodeFile('middleware')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCodeFile === 'middleware'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                middleware.ts
              </button>
              <button
                onClick={() => setActiveCodeFile('env')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeCodeFile === 'env'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                lib/supabase.ts & .env.local
              </button>
            </div>

            {/* Code Display */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-bold">
                  {activeCodeFile === 'public_page' && 'app/p/[username]/page.tsx (Landing Page Pública Dinâmica)'}
                  {activeCodeFile === 'painel' && 'app/painel/page.tsx (Painel Privado do Técnico)'}
                  {activeCodeFile === 'middleware' && 'middleware.ts (Proteção de Rotas com Supabase SSR)'}
                  {activeCodeFile === 'env' && 'lib/supabase.ts (Cliente Supabase)'}
                </span>
                
                <button
                  onClick={() => {
                    const content = activeCodeFile === 'public_page'
                      ? NEXTJS_APP_ROUTER_CODE.publicProfilePage
                      : activeCodeFile === 'painel'
                      ? NEXTJS_APP_ROUTER_CODE.painelPage
                      : activeCodeFile === 'middleware'
                      ? NEXTJS_APP_ROUTER_CODE.middleware
                      : NEXTJS_APP_ROUTER_CODE.supabaseClient;
                    copyText(activeCodeFile, content);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedSection === activeCodeFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === activeCodeFile ? 'Copiado!' : 'Copiar Código'}</span>
                </button>
              </div>

              <pre className="p-5 text-xs font-mono text-zinc-300 bg-zinc-950/90 overflow-x-auto leading-relaxed max-h-[550px] overflow-y-auto selection:bg-amber-500/30">
                <code>
                  {activeCodeFile === 'public_page' && NEXTJS_APP_ROUTER_CODE.publicProfilePage}
                  {activeCodeFile === 'painel' && NEXTJS_APP_ROUTER_CODE.painelPage}
                  {activeCodeFile === 'middleware' && NEXTJS_APP_ROUTER_CODE.middleware}
                  {activeCodeFile === 'env' && NEXTJS_APP_ROUTER_CODE.supabaseClient}
                </code>
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
