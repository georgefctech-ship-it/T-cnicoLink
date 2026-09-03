import React, { useState, useRef, useEffect } from 'react';
import { Check, Plus, ChevronDown, Wrench, X, Loader2, Sparkles, Radio } from 'lucide-react';
import { searchProfessionsApi, ProfessionApiItem } from '../services/professionsApi';

interface ProfessionSelectProps {
  value: string;
  onChange: (profession: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const ProfessionSelect: React.FC<ProfessionSelectProps> = ({
  value,
  onChange,
  placeholder = 'Digite para buscar sua profissão em tempo real...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState<ProfessionApiItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external value
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time API search on searchTerm change with debounce
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const data = await searchProfessionsApi(searchTerm, controller.signal);
        setResults(data);
        setHighlightedIndex(-1);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Erro na busca de profissões:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchTerm]);

  const exactMatch = results.some(
    p => p.name.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  function handleSelect(profession: string) {
    onChange(profession);
    setSearchTerm(profession);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex].name);
      } else if (searchTerm.trim()) {
        handleSelect(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Box */}
      <div className="relative">
        <div className="absolute left-3 top-3 pointer-events-none text-gray-400">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          ) : (
            <Wrench className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          required={required}
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            onChange(val);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-16 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium placeholder:text-gray-400"
        />

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              title="Limpar campo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu - Sem categorias, busca direta via API */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-80 flex flex-col text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Header Status Bar (API Search Indicator) */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Busca em Tempo Real</span>
            </div>
            <div className="text-[10px] text-gray-400">
              {isSearching ? 'Buscando...' : `${results.length} sugestões encontradas`}
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 p-1 divide-y divide-gray-50">
            
            {/* If user typed something custom not matching perfectly, offer instant custom option */}
            {searchTerm.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="w-full text-left p-2.5 bg-orange-50/80 hover:bg-orange-100 text-orange-950 rounded-xl flex items-center justify-between transition-colors my-1 border border-orange-200 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Usar: "<span className="text-orange-700">{searchTerm.trim()}</span>"
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Confirmar profissão personalizada digitada
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded">
                  Personalizado
                </span>
              </button>
            )}

            {/* List of matched professions */}
            {results.length > 0 ? (
              results.map((item, idx) => {
                const isSelected = value?.trim().toLowerCase() === item.name.toLowerCase();
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-orange-50 font-bold text-orange-900'
                        : isHighlighted
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-gray-400">▪</span>
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                        {item.area}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </div>
                  </button>
                );
              })
            ) : !isSearching ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                Nenhuma profissão cadastrada encontrada para esse termo.
              </div>
            ) : null}

          </div>

          {/* Bottom helper info */}
          <div className="p-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Digite livremente ou selecione uma opção sugerida.</span>
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="text-orange-600 font-bold hover:underline"
              >
                Confirmar seleção
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
