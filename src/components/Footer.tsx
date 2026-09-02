import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Twitter, 
  MessageCircle, 
  Mail, 
  ShieldCheck, 
  Heart,
  ExternalLink,
  Wrench
} from 'lucide-react';
import { AppView } from '../types';

interface FooterProps {
  setCurrentView?: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: 'https://wa.me/5511999999999?text=Ol%C3%A1%20George%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20T%C3%A9cnicoLink!',
      color: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
      label: 'WhatsApp Oficial'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com',
      color: 'hover:bg-pink-600 hover:text-white hover:border-pink-600 text-pink-400 bg-pink-950/40 border-pink-800/60',
      label: '@tecnicolink'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com',
      color: 'hover:bg-red-600 hover:text-white hover:border-red-600 text-red-400 bg-red-950/40 border-red-800/60',
      label: 'Canal YouTube'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com',
      color: 'hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-400 bg-blue-950/40 border-blue-800/60',
      label: 'LinkedIn'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com',
      color: 'hover:bg-blue-700 hover:text-white hover:border-blue-700 text-blue-300 bg-blue-950/40 border-blue-800/60',
      label: 'Página Facebook'
    },
    {
      name: 'Twitter / X',
      icon: Twitter,
      url: 'https://twitter.com',
      color: 'hover:bg-sky-500 hover:text-white hover:border-sky-500 text-sky-400 bg-sky-950/40 border-sky-800/60',
      label: 'Twitter / X'
    }
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  Técnico<span className="text-orange-500">Link</span>
                </span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold ml-2">
                  Oficial
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              A plataforma definitiva para técnicos e profissionais liberais criarem seus portfólios digitais de alta conversão, exibirem fotos reais de serviços e fecharem mais orçamentos diretamente pelo WhatsApp.
            </p>

            {/* Social Icons Bar */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2.5">
                Nossas Redes Sociais & Contato:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${social.color} shadow-xs group`}
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => setCurrentView?.('home')}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView?.('panel')}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  Criar Meu Portfólio
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView?.('login')}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  Acessar Conta / Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView?.('sql_schema')}
                  className="hover:text-orange-400 transition-colors text-left"
                >
                  Estrutura Supabase SQL
                </button>
              </li>
            </ul>
          </div>

          {/* Security and Credentials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Segurança & Tecnologia
            </h4>
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Banco de Dados Supabase</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                Infraestrutura com proteção RLS (Row Level Security), criptografia e carregamento ultra-rápido.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs font-medium text-gray-300">
              © {currentYear} <strong className="text-white">TécnicoLink</strong>. Todos os direitos reservados.
            </p>
            <p className="text-[11px] text-orange-400/90 mt-0.5 font-semibold flex items-center justify-center sm:justify-start gap-1">
              <span>Direitos Autorais & Criação:</span>
              <strong className="text-white font-bold tracking-wide">George Ferreira Costa</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="hover:text-gray-200 cursor-pointer transition-colors">Termos de Uso</span>
            <span>•</span>
            <span className="hover:text-gray-200 cursor-pointer transition-colors">Privacidade</span>
            <span>•</span>
            <span className="hover:text-gray-200 cursor-pointer transition-colors">Contato</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
