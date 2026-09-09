import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  Link as LinkIcon, 
  ExternalLink,
  RotateCcw,
  Copy,
  Image as ImageIcon,
  Radio,
  Code,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabaseClient';
import { STORAGE_FIX_SQL_SCRIPT, GLOBAL_REALTIME_SQL_SCRIPT, SUPABASE_SQL_SCRIPT } from '../lib/sqlScripts';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
  onNavigateToSql?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onNavigateToSql,
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'storage' | 'realtime' | 'full' | 'keys'>('storage');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = !!(url && anonKey && url.startsWith('http'));

  function handleCopy(type: 'storage' | 'realtime' | 'full', script: string) {
    navigator.clipboard.writeText(script);
    setCopiedTab(type);
    setTimeout(() => setCopiedTab(null), 3000);
  }

  function handleSaveKeys(e: React.FormEvent) {
    e.preventDefault();
    saveStoredSupabaseConfig(url.trim(), anonKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onConfigSaved();
    }, 1000);
  }

  function handleReset() {
    setUrl('');
    setAnonKey('');
    saveStoredSupabaseConfig('', '');
    onConfigSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative text-gray-100 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-lg tracking-tight">Configurar Supabase</h3>
              {isConnected ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-full">
                  Modo Local
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Copie os scripts SQL para liberar fotos em outros computadores/celulares ou insira suas chaves
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-gray-950 rounded-2xl border border-gray-800 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'storage'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-300" />
            <span>Desbloquear Storage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('realtime')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'realtime'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-300" />
            <span>Sincronizar Tempo Real</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'full'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-orange-300" />
            <span>Script Completo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'keys'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-300" />
            <span>Chaves de API</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {/* TAB 1: DESBLOQUEAR STORAGE */}
          {activeTab === 'storage' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs mb-1">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Script de Desbloqueio de Fotos (Storage.Objects)</span>
                </div>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Este script torna o bucket <strong>services-photos</strong> público e desativa a restrição de RLS que bloqueia imagens quando acessadas por outros celulares e computadores.
                </p>
              </div>

              {/* Big 1-Click Copy Button */}
              <button
                type="button"
                onClick={() => handleCopy('storage', STORAGE_FIX_SQL_SCRIPT)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  copiedTab === 'storage'
                    ? 'bg-emerald-600 text-white scale-[1.01]'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                }`}
              >
                {copiedTab === 'storage' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>SCRIPT DE STORAGE COPIADO COM SUCESSO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>COPIAR SCRIPT DE DESBLOQUEIO STORAGE</span>
                  </>
                )}
              </button>

              {/* Steps Guide */}
              <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-2 text-xs">
                <span className="font-bold text-gray-300 block">Como aplicar no Supabase (30 segundos):</span>
                <ol className="space-y-1.5 text-gray-400 list-decimal list-inside leading-relaxed">
                  <li>Clique no botão acima para copiar o script.</li>
                  <li>Acesse seu painel em <strong>supabase.com/dashboard</strong> e abra seu projeto.</li>
                  <li>No menu lateral esquerdo, clique em <strong>SQL Editor</strong>.</li>
                  <li>Cole o código e clique no botão verde <strong>Run</strong> no canto inferior direito.</li>
                </ol>
                <div className="pt-2">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold"
                  >
                    <span>Abrir painel Supabase no navegador</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Code preview snippet */}
              <div className="relative">
                <div className="bg-black/90 p-3 rounded-xl border border-gray-800 text-[11px] font-mono text-gray-300 max-h-36 overflow-y-auto leading-relaxed select-all">
                  {STORAGE_FIX_SQL_SCRIPT.substring(0, 500)}...
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SINCRONIZAR TEMPO REAL */}
          {activeTab === 'realtime' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Script de Sincronização em Tempo Real Global</span>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Habilita o <strong>supabase_realtime</strong> nas tabelas de perfis e galeria, permitindo que alterações salvas em um celular reflitam imediatamente em todos os computadores abertos.
                </p>
              </div>

              {/* Big 1-Click Copy Button */}
              <button
                type="button"
                onClick={() => handleCopy('realtime', GLOBAL_REALTIME_SQL_SCRIPT)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  copiedTab === 'realtime'
                    ? 'bg-emerald-600 text-white scale-[1.01]'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                }`}
              >
                {copiedTab === 'realtime' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>SCRIPT DE TEMPO REAL COPIADO COM SUCESSO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>COPIAR SCRIPT DE TEMPO REAL</span>
                  </>
                )}
              </button>

              <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-2 text-xs">
                <span className="font-bold text-gray-300 block">Instruções:</span>
                <p className="text-gray-400 leading-relaxed">
                  Copie o script e execute no <strong>SQL Editor</strong> do seu Supabase. Ele adiciona as tabelas à publicação <code>supabase_realtime</code> e libera SELECT público para que visitantes vejam as fotos sem precisar de login.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold pt-1"
                >
                  <span>Abrir Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: SCRIPT COMPLETO */}
          {activeTab === 'full' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-3.5 bg-orange-950/40 border border-orange-800/60 rounded-2xl">
                <div className="flex items-center gap-2 text-orange-300 font-bold text-xs mb-1">
                  <Code className="w-4 h-4 text-orange-400" />
                  <span>Script SQL Completo (Todas as Tabelas & Triggers)</span>
                </div>
                <p className="text-xs text-orange-200/80 leading-relaxed">
                  Cria todas as tabelas (<code>profiles</code>, <code>service_gallery</code>, <code>testimonials</code>, <code>system_settings</code>), índices de velocidade, triggers e permissões.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy('full', SUPABASE_SQL_SCRIPT)}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  copiedTab === 'full'
                    ? 'bg-emerald-600 text-white scale-[1.01]'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white'
                }`}
              >
                {copiedTab === 'full' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>SCRIPT COMPLETO COPIADO COM SUCESSO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>COPIAR SCRIPT COMPLETO (BANCO + STORAGE)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: CHAVES DE API */}
          {activeTab === 'keys' && (
            <form onSubmit={handleSaveKeys} className="space-y-3.5 animate-in fade-in">
              <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-2xl">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Credenciais do Projeto Supabase</span>
                </div>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  Encontre estes valores no painel do Supabase em <strong>Project Settings → API</strong>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-300 mb-1">
                  SUPABASE_URL (Project URL)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    placeholder="https://xyzproject.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-300 mb-1">
                  SUPABASE_ANON_KEY (Public Key)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                  <span>{saved ? 'Chaves Salvas com Sucesso!' : 'Salvar Chaves de Conexão'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  title="Resetar para Modo Local"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer with Link to Full SQL View */}
        <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between shrink-0 text-xs">
          {onNavigateToSql && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToSql();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Abrir Página Completa de Schema SQL</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl text-xs transition-colors ml-auto"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

