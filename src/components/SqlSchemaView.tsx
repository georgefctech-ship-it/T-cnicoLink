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
  Info
} from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlScripts';

export const SqlSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tables' | 'rls' | 'storage' | 'triggers'>('all');

  function handleCopy() {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
                <span>Etapa 1: Arquitetura & Banco de Dados (Supabase)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Estrutura de Tabelas, RLS e Storage
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Script SQL pronto para ser executado no <strong>SQL Editor</strong> do seu painel Supabase. Criação de perfis, galeria de fotos, políticas de acesso (Row Level Security) e bucket de armazenamento.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'SQL COPIADO COM SUCESSO!' : 'COPIAR SCRIPT SQL COMPLETO'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Abrir Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
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
              Ligada ao <code className="text-orange-700 font-mono font-semibold bg-orange-50 px-1 py-0.5 rounded">auth.users(id)</code> via chave primária UUID. Armazena nome completo, whatsapp com máscara, biografia, cidade/estado, avatar e slug único para a URL pública <code className="text-orange-700 font-mono font-semibold bg-orange-50 px-1 py-0.5 rounded">/p/[username]</code>.
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
            <h3 className="font-bold text-sm text-gray-900">Bucket 'services-photos' & RLS</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Bucket público para visualização instantânea pelos clientes sem tokens expirados. RLS restringe uploads, alterações e exclusões estritamente para a pasta do técnico autenticado <code className="text-sky-700 font-mono font-semibold bg-sky-50 px-1 py-0.5 rounded">auth.uid()</code>.
            </p>
          </div>

        </div>

        {/* Troubleshooting Guide & How to Apply */}
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <span className="font-bold block text-emerald-900">
                Solução para erro "ERROR: 42P01: relation profiles does not exist"
              </span>
              <p className="text-emerald-800 leading-relaxed">
                Este erro acontece quando apenas um fragmento de alteração (<code>ALTER TABLE</code> ou <code>CREATE POLICY</code>) é executado antes da tabela existir. O script completo abaixo é <strong>auto-suficiente (idempotente)</strong>: ele cria as extensões, a tabela <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">profiles</code>, galeria, depoimentos, storage e todas as políticas de segurança de uma única vez.
              </p>
            </div>
          </div>

          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">Como aplicar no Supabase em 1 minuto:</span>
                <span className="text-gray-600">1. Acesse seu projeto Supabase ➔ 2. Clique em <strong>SQL Editor</strong> no menu lateral ➔ 3. Cole o código abaixo ➔ 4. Clique em <strong>Run (Executar)</strong>.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md">
          <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-mono font-bold text-gray-300">supabase_schema_rls.sql</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>

          <pre className="p-4 sm:p-5 text-xs font-mono text-gray-300 bg-gray-950/90 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto selection:bg-orange-500/30">
            <code>{SUPABASE_SQL_SCRIPT}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
