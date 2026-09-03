import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Plus, ChevronDown, Wrench, Sparkles, X } from 'lucide-react';
import { PROFESSIONS_CATEGORIES, searchProfessions, ALL_PROFESSIONS_FLAT } from '../lib/professionsData';

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
  placeholder = 'Digite ou selecione sua profissão...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = searchProfessions(searchTerm);

  // If a category filter is active in the popup
  const displayedItems = selectedCategory
    ? ALL_PROFESSIONS_FLAT.filter(p => p.category === selectedCategory)
    : filteredItems;

  const exactMatch = ALL_PROFESSIONS_FLAT.some(
    p => p.name.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  function handleSelect(profession: string) {
    onChange(profession);
    setSearchTerm(profession);
    setIsOpen(false);
    setIsCustomMode(false);
  }

  function handleCustomConfirm() {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
      setIsCustomMode(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Box */}
      <div className="relative">
        <Wrench className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          required={required}
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            onChange(val);
            setIsOpen(true);
            setSelectedCategory(null);
          }}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-16 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-80 flex flex-col text-xs">
          
          {/* Categories Pill Bar */}
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Todas as Áreas
            </button>
            {PROFESSIONS_CATEGORIES.map(cat => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category === selectedCategory ? null : cat.category)}
                className={`px-2 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
                  selectedCategory === cat.category
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.category.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1 divide-y divide-gray-50">
            {/* If user typed something not matching, show option to use custom */}
            {searchTerm.trim() && !exactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="w-full text-left p-2.5 bg-orange-50/70 hover:bg-orange-100 text-orange-900 rounded-xl flex items-center justify-between transition-colors my-1 border border-orange-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      Usar: "<span className="text-orange-700">{searchTerm.trim()}</span>"
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Profissão personalizada que você digitou
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded">
                  Nova
                </span>
              </button>
            )}

            {displayedItems.length > 0 ? (
              displayedItems.map((item) => {
                const isSelected = value?.trim().toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-orange-50/60 transition-colors ${
                      isSelected ? 'bg-orange-50 font-bold text-orange-900' : 'text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {item.category.split('&')[0].trim()}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-xs">
                Nenhuma profissão pré-cadastrada encontrada com esse termo.
              </div>
            )}

            {/* Always offer 'Outras' option at the bottom */}
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                if (!searchTerm || exactMatch) {
                  setSearchTerm('');
                  onChange('');
                }
                inputRef.current?.focus();
              }}
              className="w-full text-left p-2 text-gray-600 hover:text-orange-700 hover:bg-gray-50 rounded-lg flex items-center justify-between font-semibold mt-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">✨</span>
                <span>Outras (digite sua profissão ou especialidade livremente)</span>
              </div>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                Personalizar
              </span>
            </button>
          </div>

          {/* Bottom helper tip */}
          <div className="p-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Você pode selecionar da lista ou digitar livremente.</span>
            {searchTerm && (
              <button
                type="button"
                onClick={handleCustomConfirm}
                className="text-orange-600 font-bold hover:underline"
              >
                Confirmar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
