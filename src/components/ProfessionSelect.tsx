import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Briefcase, 
  X, 
  Loader2, 
  Search,
  ArrowRight
} from 'lucide-react';
import { 
  searchProfessionsApi, 
  ProfessionApiItem, 
  normalizeStr 
} from '../services/professionsApi';

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
  placeholder = 'Digite sua profissão para autocompletar...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<ProfessionApiItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
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

  // Autocomplete search as user types
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const trimmed = inputValue.trim();

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const data = await searchProfessionsApi(
          {
            query: trimmed,
            signal: controller.signal
          },
          controller.signal
        );
        setSuggestions(data);
        setHighlightedIndex(-1);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Erro na API de busca de profissões:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 80);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [inputValue]);

  const exactMatch = suggestions.some(
    p => normalizeStr(p.name) === normalizeStr(inputValue)
  );

  function handleSelect(professionName: string) {
    onChange(professionName);
    setInputValue(professionName);
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
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        handleSelect(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Highlight matching letters in name
  function renderHighlightedText(text: string, query: string) {
    if (!query.trim()) return <span>{text}</span>;
    const normText = normalizeStr(text);
    const normQuery = normalizeStr(query);
    const index = normText.indexOf(normQuery);

    if (index === -1) {
      return <span>{text}</span>;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <span>
        {before}
        <span className="font-bold text-orange-600 bg-orange-50 px-0.5 rounded">{match}</span>
        {after}
      </span>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Campo de Input com Autocompletar */}
      <div className="relative">
        <div className="absolute left-3 top-3 pointer-events-none text-gray-400">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          ) : (
            <Search className="w-4 h-4 text-orange-600" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          required={required}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            onChange(val);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-medium placeholder:text-gray-400 transition-all shadow-2xs"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-3 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Limpar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown de Autocompletar Online */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 flex flex-col text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          
          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => {
                const isSelected = normalizeStr(value) === normalizeStr(item.name);
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-orange-50 text-orange-950 font-semibold'
                        : isHighlighted
                        ? 'bg-gray-50 text-gray-900'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Briefcase className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className="truncate">
                        <div className="text-xs text-gray-900 truncate">
                          {renderHighlightedText(item.name, inputValue)}
                        </div>
                        {item.cbo && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            CBO: {item.cbo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-orange-600" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : !isSearching && inputValue.trim() ? (
              <div className="p-3 text-center text-gray-500">
                <p className="text-xs font-medium text-gray-700">
                  Nenhuma sugestão encontrada para "{inputValue}".
                </p>
                <button
                  type="button"
                  onClick={() => handleSelect(inputValue.trim())}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg"
                >
                  Usar "{inputValue.trim()}" como minha profissão
                </button>
              </div>
            ) : null}

            {/* If user typed a custom profession not in the exact list, offer to use it */}
            {inputValue.trim() && !exactMatch && suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelect(inputValue.trim())}
                className="w-full text-left px-3 py-2 bg-orange-50/70 hover:bg-orange-100 text-orange-900 flex items-center justify-between transition-colors border-t border-orange-100"
              >
                <span className="text-xs">
                  Confirmar digitado: <strong className="text-orange-700 font-bold">"{inputValue.trim()}"</strong>
                </span>
                <span className="text-[10px] font-semibold bg-orange-200/80 text-orange-800 px-1.5 py-0.5 rounded">
                  Personalizado
                </span>
              </button>
            )}
          </div>

          {/* Footer discreto */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Selecione na lista ou continue digitando</span>
            <span>{suggestions.length} sugestões</span>
          </div>
        </div>
      )}
    </div>
  );
};
