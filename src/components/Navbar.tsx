import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  LayoutDashboard, 
  Database, 
  Cloud, 
  Smartphone,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  User,
  Crown,
  Sparkles,
  Zap,
  LogIn,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { AppView, Profile } from '../types';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeProfile: Profile;
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenSupabaseModal,
  isSupabaseConnected,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setProfileDropdownOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isLoggedIn = Boolean(currentUser);
  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.email?.toLowerCase().trim() === 'georgefctec@gmail.com' ||
      currentUser.email?.toLowerCase().includes('admin@')
    )
  );
  const isPro = activeProfile?.plan === 'pro' || activeProfile?.plan === 'enterprise';

  return (
    <>
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md text-white border-b border-gray-800 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 1. Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                id="nav-logo-btn"
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2.5 text-left group focus:outline-none transition-transform active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-orange-500 transition-colors">
                  <Wrench className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg tracking-tight text-white font-['Syne',sans-serif]">
                      Técnico<span className="text-orange-500">Link</span>
                    </span>
                    <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded uppercase tracking-wider border border-orange-500/30">
                      SaaS
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* 2. Desktop Navigation Center Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-950/80 p-1.5 rounded-xl border border-gray-800/80 shadow-inner">
              <button
                id="nav-tab-home"
                onClick={() => navigateTo('home')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'home'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white hover:bg-gray-850'
                }`}
              >
                Início
              </button>

              {/* If logged in as technician or admin */}
              {isLoggedIn && (
                <>
                  <button
                    id="nav-tab-panel"
                    onClick={() => navigateTo('panel')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentView === 'panel'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-gray-850'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{isAdmin ? 'Painel Técnico' : 'Meu Painel'}</span>
                  </button>

                  <button
                    id="nav-tab-profile"
                    onClick={() => navigateTo('public_profile')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      currentView === 'public_profile'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-gray-300 hover:text-white hover:bg-gray-850'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Ver Meu Site</span>
                    {activeProfile && (
                      <span className="text-[10px] font-normal text-gray-400 opacity-80">(/p/{activeProfile.username})</span>
                    )}
                  </button>
                </>
              )}

              {/* Admin Master Tab (STRICTLY ONLY FOR LOGGED-IN ADMIN) */}
              {isAdmin && (
                <button
                  id="nav-tab-admin"
                  onClick={() => navigateTo('admin_control')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentView === 'admin_control'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs ring-1 ring-amber-400'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-gray-850'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Central Admin</span>
                </button>
              )}

              {/* Dropdown "Recursos / SQL" */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="nav-tab-more"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    currentView === 'sql_schema' || currentView === 'deploy_docs'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-850'
                  }`}
                >
                  <span>Recursos</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      id="nav-sub-sql"
                      onClick={() => navigateTo('sql_schema')}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-gray-200 hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold block text-white">Schema SQL Supabase</span>
                        <span className="text-[10px] text-gray-400 block">Tabelas, RLS & Storage</span>
                      </div>
                    </button>
                    
                    <button
                      id="nav-sub-deploy"
                      onClick={() => navigateTo('deploy_docs')}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-medium text-gray-200 hover:bg-gray-850 flex items-center gap-2.5 transition-colors"
                    >
                      <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <span className="font-bold block text-white">Deploy & Domínio</span>
                        <span className="text-[10px] text-gray-400 block">Publicar na Vercel</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Authenticated User Display */}
              {isLoggedIn ? (
                isAdmin ? (
                  /* Admin: Can switch test profiles via dropdown */
                  <div className="relative hidden md:block" ref={profileDropdownRef}>
                    <button
                      id="nav-profile-menu-btn"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-950/80 hover:bg-gray-850 rounded-xl border border-amber-500/40 text-left transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-[10px] font-black text-amber-300 overflow-hidden">
                        {activeProfile?.avatar_url ? (
                          <img src={activeProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          'G'
                        )}
                      </div>
                      <div className="max-w-[130px] truncate">
                        <span className="text-xs font-bold text-amber-200 block truncate leading-none">
                          {currentUser.name || 'George Master'}
                        </span>
                        <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider block mt-0.5">
                          Admin Master
                        </span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-2 py-1.5 border-b border-gray-800 mb-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Modo Administrador Master
                          </span>
                        </div>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {profiles.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                onSelectProfile(p);
                                setProfileDropdownOpen(false);
                              }}
                              className={`w-full p-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                                p.id === activeProfile?.id
                                  ? 'bg-orange-600 text-white font-bold'
                                  : 'text-gray-300 hover:bg-gray-850'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[9px] font-bold shrink-0">
                                  {p.full_name.charAt(0)}
                                </div>
                                <span className="truncate">{p.full_name}</span>
                              </div>
                              <span className="text-[9px] opacity-80 shrink-0 ml-1.5 uppercase font-mono">
                                {p.role === 'admin' ? 'Admin' : p.plan === 'pro' ? 'PRO' : 'Free'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Logged-In Technician: Shows ONLY their own profile */
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-950/80 rounded-xl border border-gray-800 text-left">
                    <div className="w-6 h-6 rounded-full bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-[10px] font-black text-orange-400 overflow-hidden shrink-0">
                      {activeProfile?.avatar_url ? (
                        <img src={activeProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        activeProfile?.full_name?.charAt(0) || 'T'
                      )}
                    </div>
                    <div className="max-w-[130px] truncate">
                      <span className="text-xs font-bold text-gray-200 block truncate leading-none">
                        {activeProfile?.full_name || currentUser.name}
                      </span>
                      <span className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider block mt-0.5">
                        {isPro ? 'Plano Pro' : 'Plano Free'}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                /* Public Visitor: Show Login & Register CTA buttons */
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="btn-login-header"
                    onClick={() => navigateTo('login')}
                    className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>

                  <button
                    id="btn-register-header"
                    onClick={() => navigateTo('register')}
                    className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Criar Meu Site Grátis</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Logout Button (Only if logged in) */}
              {isLoggedIn && (
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-gray-850 transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

              {/* Hamburger Button (Mobile / Tablet) */}
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800 focus:outline-none transition-colors border border-gray-800"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Mobile Slide-Down Navigation Overlay & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden flex flex-col">
          {/* Backdrop Blur Overlay */}
          <div 
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Drawer Content */}
          <div className="relative z-50 bg-gray-900 border-b border-gray-800 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4 animate-in slide-in-from-top duration-200">
            
            {/* User Info / Guest Card */}
            {isLoggedIn && activeProfile ? (
              <div className="p-3.5 bg-gray-950 rounded-2xl border border-gray-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-sm font-bold text-orange-400">
                      {activeProfile.avatar_url ? (
                        <img src={activeProfile.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        activeProfile.full_name.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block leading-tight">
                        {activeProfile.full_name}
                      </span>
                      <span className="text-xs text-gray-400 block mt-0.5">
                        {activeProfile.profession}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30">
                        ADMIN
                      </span>
                    ) : isPro ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-md">
                        FREE
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Switcher (STRICTLY ONLY FOR ADMIN) */}
                {isAdmin && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Alternar Perfil (Modo Admin):
                    </label>
                    <select
                      id="mobile-profile-select"
                      value={activeProfile.id}
                      onChange={(e) => {
                        const found = profiles.find(p => p.id === e.target.value);
                        if (found) {
                          onSelectProfile(found);
                          setMobileMenuOpen(false);
                        }
                      }}
                      className="w-full bg-gray-900 text-xs font-semibold text-orange-400 p-2 rounded-xl border border-gray-800 focus:outline-none"
                    >
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.role === 'admin' ? 'Central Admin' : p.profession.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Mobile Header */
              <div className="p-3.5 bg-gray-950 rounded-2xl border border-gray-800 space-y-2">
                <span className="text-xs font-bold text-orange-400 block">
                  Seja bem-vindo ao TécnicoLink!
                </span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Crie uma página profissional com portfólio de fotos e link direto para o seu WhatsApp.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigateTo('login')}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                  <button
                    onClick={() => navigateTo('register')}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Criar Conta</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Navigation Links */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                Navegação
              </span>

              <button
                id="mobile-nav-home"
                onClick={() => navigateTo('home')}
                className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  currentView === 'home'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-950 text-gray-200 hover:bg-gray-850 border border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-orange-400" />
                  <span>Início</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isLoggedIn && (
                <>
                  <button
                    id="mobile-nav-panel"
                    onClick={() => navigateTo('panel')}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                      currentView === 'panel'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-950 text-gray-200 hover:bg-gray-850 border border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-orange-400" />
                      <span>{isAdmin ? 'Painel Técnico' : 'Meu Painel'}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="mobile-nav-public"
                    onClick={() => navigateTo('public_profile')}
                    className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                      currentView === 'public_profile'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-950 text-gray-200 hover:bg-gray-850 border border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="block">Ver Meu Site</span>
                        {activeProfile && (
                          <span className="text-[10px] text-gray-400 block font-normal">/p/{activeProfile.username}</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </>
              )}

              {/* ADMIN TAB MOBILE */}
              {isAdmin && (
                <button
                  id="mobile-nav-admin"
                  onClick={() => navigateTo('admin_control')}
                  className={`w-full p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                    currentView === 'admin_control'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-950 text-amber-400 hover:bg-gray-850 border border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Central Admin Master</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Acesso Master
                  </span>
                </button>
              )}
            </div>

            {/* Technical Resources Section */}
            <div className="space-y-1.5 pt-2 border-t border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                Recursos & Deploy
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-nav-sql"
                  onClick={() => navigateTo('sql_schema')}
                  className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-left hover:bg-gray-850 transition-colors"
                >
                  <Database className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-white block">Schema SQL</span>
                  <span className="text-[10px] text-gray-400 block">Supabase</span>
                </button>

                <button
                  id="mobile-nav-deploy"
                  onClick={() => navigateTo('deploy_docs')}
                  className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-left hover:bg-gray-850 transition-colors"
                >
                  <Cloud className="w-4 h-4 text-sky-400 mb-1" />
                  <span className="text-xs font-bold text-white block">Deploy Vercel</span>
                  <span className="text-[10px] text-gray-400 block">Domínio</span>
                </button>
              </div>
            </div>

            {/* Logout on Mobile if logged in */}
            {isLoggedIn && (
              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};


