import React, { useState } from 'react';
import { 
  Database, 
  X, 
  Check, 
  AlertCircle, 
  Key, 
  Link as LinkIcon, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveStoredSupabaseConfig(url.trim(), anonKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onConfigSaved();
      onClose();
    }, 800);
  }

  function handleReset() {
    setUrl('');
    setAnonKey('');
    saveStoredSupabaseConfig('', '');
    onConfigSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Conexão Supabase</h3>
            <p className="text-xs text-zinc-400">Insira suas chaves para sincronizar dados reais</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 mb-1">
              SUPABASE_URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-zinc-300 mb-1">
              SUPABASE_ANON_KEY
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
            💡 <em>Nota:</em> Se os campos ficarem vazios, a aplicação continuará operando normalmente em modo <strong>Demonstração Rápida & Armazenamento Local</strong> com os perfis de técnicos pré-configurados.
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
              <span>{saved ? 'Salvo!' : 'Conectar Supabase'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              title="Resetar para Demo Local"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Usar Demo</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
