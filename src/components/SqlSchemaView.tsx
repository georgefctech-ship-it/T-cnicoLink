import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  FolderArchive, 
  Key, 
  Zap, 
  ExternalLink,
  Code,
  Layers,
  ArrowRight,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT, STORAGE_FIX_SQL_SCRIPT } from '../lib/sqlScripts';

export const SqlSchemaView: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState<'full' | 'storage' | null>(null);
  const [activeTab, setActiveTab] = useState<'full' | 'storage'>('full');

  function handleCopyFull() {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedScript('full');
    setTimeout(() => setCopiedScript(null), 2500);
  }

  function handleCopyStorage() {
    navigator.clipboard.writeText(STORAGE_FIX_SQL_SCRIPT);
    setCopiedScript('storage');
    setTimeout(() => setCopiedScript(null), 2500);
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2.5">
                <Database className="w-3.5 h-3.5" />
                <span>Configuração do Supabase (Banco de Dados & Storage)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Estrutura de Tabelas, RLS e Desbloqueio de Storage
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Scripts prontos para executar no <strong>SQL Editor</strong> do seu Supabase. Se suas imagens estiverem travando ao enviar ou não aparecendo para visitantes, use o script de <strong>Desbloqueio de Storage</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopyStorage}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
                title="Copiar apenas o comando para liberar fotos no Supabase Storage"
              >
                {copiedScript === 'storage' ? <Check className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4" />}
                <span>{copiedScript === 'storage' ? 'SQL DE STORAGE COPIADO!' : 'DESBLOQUEAR STORAGE (COPIAR SQL)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFull}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {copiedScript === 'full' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript === 'full' ? 'SQL COMPLETO COPIADO!' : 'COPIAR SCRIPT COMPLETO'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Abrir Supabase</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Dedicated Storage Diagnostic Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <ImageIcon className="w-5 h-5 text-blue-700" />
            <span>Por que o Supabase pode estar bloqueando imagens no Storage?</span>
          </div>
          <p className="text-xs text-blue-900/80 leading-relaxed">
            Geralmente ocorre por dois motivos simples no Supabase:
          </p>
          <ul className="text-xs text-blue-900 space-y-1 list-disc list-inside">
            <li><strong>Bucket Privado:</strong> O bucket <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">services-photos</code> foi criado sem a opção <em>"Public Bucket"</em> ativada.</li>
            <li><strong>Políticas Restritivas de RLS em storage.objects:</strong> O Supabase por padrão bloqueia inserts se a pasta não corresponder exatamente ao <code>auth.uid()</code>.</li>
          </ul>
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('storage');
                handleCopyStorage();
              }}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar e Visualizar Script de Desbloqueio</span>
            </button>
            <span className="text-xs text-blue-700 font-medium">Basta colar no SQL Editor do Supabase e clicar em Run.</span>
          </div>
        </div>

        {/* Overview Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-gray-900">Tabela profiles</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ligada ao <code className="text-orange-700 font-mono font-semibold bg-orange-50 px-1 py-0.5 rounded">auth.users(id)</code> via UUID. Armazena nome completo, whatsapp com máscara, biografia, cidade/estado, avatar e slug único para a URL pública <code className="text-orange-700 font-mono font-semibold bg-orange-50 px-1 py-0.5 rounded">/p/[username]</code>.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-gray-900">Tabela service_gallery</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Armazena as fotos dos serviços com <code className="text-emerald-700 font-mono font-semibold bg-emerald-50 px-1 py-0.5 rounded">profile_id</code> (Foreign Key), URL pública da imagem, título, descrição do serviço e tags como "Antes e Depois" ou "Instalação".
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-1.5 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-gray-900">Buckets Públicos & RLS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Buckets públicos para visualização instantânea pelos clientes sem tokens expirados. Suporta <code className="text-sky-700 font-mono font-semibold bg-sky-50 px-1 py-0.5 rounded">services-photos</code>, <code className="text-sky-700 font-mono font-semibold bg-sky-50 px-1 py-0.5 rounded">service-photos</code> e <code className="text-sky-700 font-mono font-semibold bg-sky-50 px-1 py-0.5 rounded">avatars</code>.
            </p>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'full' 
                ? 'bg-orange-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Script Completo do Sistema (Tabelas + RLS + Storage)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'storage' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Script Rápido: Desbloquear Storage de Fotos</span>
          </button>
        </div>

        {/* Code Viewer */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
          <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-mono font-bold text-gray-300">
                {activeTab === 'full' ? 'supabase_schema_rls_completo.sql' : 'desbloquear_storage_fotos.sql'}
              </span>
            </div>
            <button
              onClick={activeTab === 'full' ? handleCopyFull : handleCopyStorage}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              {(activeTab === 'full' ? copiedScript === 'full' : copiedScript === 'storage') ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar este SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 sm:p-5 text-xs font-mono text-gray-300 bg-gray-950/90 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto selection:bg-orange-500/30">
            <code>{activeTab === 'full' ? SUPABASE_SQL_SCRIPT : STORAGE_FIX_SQL_SCRIPT}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
