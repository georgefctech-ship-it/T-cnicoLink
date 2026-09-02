import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Wrench,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { ADMIN_MASTER_PROFILE } from '../lib/mockData';

interface AuthViewProps {
  initialMode: 'login' | 'register';
  onSuccess: (profile: Profile) => void;
  onCancel: () => void;
  profiles: Profile[];
  onSelectDemoUser: (profile: Profile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode,
  onSuccess,
  onCancel,
  profiles,
  onSelectDemoUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'magic_link'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profession, setProfession] = useState('Eletricista Residencial');
  const [cityState, setCityState] = useState('São Paulo - SP');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Phone mask
  function handleWhatsappChange(value: string) {
    const numbers = value.replace(/\D/g, '');
    let formatted = numbers;
    if (numbers.length <= 11) {
      if (numbers.length > 2 && numbers.length <= 6) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      } else if (numbers.length > 6) {
        formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
      }
    }
    setWhatsapp(formatted);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const supabase = getSupabase();

    if (mode === 'magic_link') {
      if (!email) {
        setErrorMsg('Informe seu e-mail');
        setLoading(false);
        return;
      }
      if (supabase) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setMagicLinkSent(true);
        }
      } else {
        // Mock fallback simulation
        setTimeout(() => {
          setMagicLinkSent(true);
          setLoading(false);
        }, 600);
        return;
      }
      setLoading(false);
      return;
    }

    if (mode === 'register') {
      if (!fullName || !email || !password) {
        setErrorMsg('Preencha os campos obrigatórios');
        setLoading(false);
        return;
      }

      const cleanSlug = fullName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 25);

      const isAdminEmail = email.trim().toLowerCase() === 'georgefctec@gmail.com' || email.trim().toLowerCase().includes('admin@');
      let registeredUserId = 'user-' + Date.now();

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp_number: whatsapp || '(11) 99999-9999',
              profession,
              city_state: cityState,
              username: cleanSlug || 'tecnico-' + Math.floor(Math.random() * 1000)
            }
          }
        });
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }
        if (data.user) {
          registeredUserId = data.user.id;
        }
      }

      // Create new local profile
      const newProfile: Profile = {
        id: registeredUserId,
        full_name: fullName,
        username: cleanSlug || 'tecnico-' + Math.floor(Math.random() * 1000),
        profession: profession || 'Eletricista Especialista',
        specialties: ['Instalações', 'Manutenção Preventiva', 'Atendimento Rápido'],
        whatsapp_number: whatsapp || '(11) 99999-9999',
        bio_short: 'Profissional qualificado com foco em qualidade, pontualidade e transparência nos serviços.',
        avatar_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80',
        city_state: cityState || 'São Paulo - SP',
        years_experience: 5,
        accepts_pix: true,
        accepts_cards: true,
        offers_warranty: true,
        rating: 5.0,
        review_count: 1,
        role: isAdminEmail ? 'admin' : 'technician',
        plan: isAdminEmail ? 'enterprise' : 'free',
        status: 'active',
        is_verified: isAdminEmail,
        max_photos: isAdminEmail ? 30 : 6,
        monthly_views_limit: isAdminEmail ? 999999 : 100,
        views_count: 0,
        whatsapp_clicks: 0,
        created_at: new Date().toISOString()
      };

      if (supabase && registeredUserId) {
        try {
          await supabase.from('profiles').upsert(newProfile);
        } catch (e) {
          console.error('Error syncing profile to Supabase', e);
        }
      }

      setLoading(false);
      onSuccess(newProfile);
    } else {
      // Login
      if (!email) {
        setErrorMsg('Informe seu e-mail');
        setLoading(false);
        return;
      }

      const isAdminEmail = email.trim().toLowerCase() === 'georgefctec@gmail.com' || email.trim().toLowerCase().includes('admin@');

      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Attempt to retrieve profile from supabase
          try {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (dbProfile) {
              const merged: Profile = {
                ...dbProfile,
                role: isAdminEmail ? 'admin' : (dbProfile.role || 'technician'),
                plan: isAdminEmail ? 'enterprise' : (dbProfile.plan || 'free'),
                status: dbProfile.status || 'active',
                is_verified: isAdminEmail || dbProfile.is_verified,
                monthly_views_limit: isAdminEmail ? 999999 : (dbProfile.monthly_views_limit || 100),
                max_photos: isAdminEmail ? 30 : (dbProfile.max_photos || 6)
              };
              setLoading(false);
              onSuccess(merged);
              return;
            }
          } catch (e) {
            console.error('Error fetching profile from Supabase:', e);
          }

          // Fallback profile for newly signed-in user without profiles record
          const cleanSlug = (data.user.user_metadata?.full_name || email.split('@')[0])
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .slice(0, 25);

          const fallbackUser: Profile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || (isAdminEmail ? 'George - Admin Master' : 'Técnico Especialista'),
            username: cleanSlug || 'user-' + data.user.id.slice(0, 6),
            profession: data.user.user_metadata?.profession || 'Técnico Especialista',
            specialties: ['Instalações', 'Manutenção'],
            whatsapp_number: data.user.user_metadata?.whatsapp_number || '(11) 99999-9999',
            bio_short: 'Atendimento com garantia e pontualidade.',
            avatar_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80',
            city_state: data.user.user_metadata?.city_state || 'São Paulo - SP',
            years_experience: 5,
            accepts_pix: true,
            accepts_cards: true,
            offers_warranty: true,
            rating: 5.0,
            review_count: 1,
            role: isAdminEmail ? 'admin' : 'technician',
            plan: isAdminEmail ? 'enterprise' : 'free',
            status: 'active',
            is_verified: isAdminEmail,
            max_photos: isAdminEmail ? 30 : 6,
            monthly_views_limit: isAdminEmail ? 999999 : 100,
            views_count: 0,
            whatsapp_clicks: 0,
            created_at: new Date().toISOString()
          };

          try {
            await supabase.from('profiles').upsert(fallbackUser);
          } catch (err) {
            console.warn('Upsert fallback user error', err);
          }

          setLoading(false);
          onSuccess(fallbackUser);
          return;
        }
      }

      // If offline / local mock login
      if (isAdminEmail) {
        setLoading(false);
        onSuccess(ADMIN_MASTER_PROFILE);
        return;
      }

      const match = profiles.find(p => p.full_name.toLowerCase().includes(email.split('@')[0].toLowerCase())) || profiles[0];
      setLoading(false);
      onSuccess(match);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {mode === 'login' ? 'Acessar seu Painel' : mode === 'register' ? 'Criar seu Site Grátis' : 'Entrar via Link Mágico'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'login' 
              ? 'Digite suas credenciais ou escolha um perfil de demonstração' 
              : 'Preencha seus dados para gerar seu link de WhatsApp'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Criar Cadastro
          </button>
          <button
            type="button"
            onClick={() => { setMode('magic_link'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'magic_link' ? 'bg-white text-gray-900 shadow-xs border border-gray-200' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Link Mágico
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {magicLinkSent ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Link de acesso enviado!</h3>
            <p className="text-xs text-gray-600">
              Verifique sua caixa de entrada em <strong>{email}</strong> para entrar com 1 clique no seu painel.
            </p>
            <button
              onClick={() => onSuccess(profiles[0])}
              className="w-full py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl mt-2 shadow-xs hover:bg-orange-500 transition-colors"
            >
              Acessar Painel Agora (Demo)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nome Completo <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo Eletricista"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Profissão / Área de Atuação <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
                  >
                    <option value="Eletricista Residencial e Comercial">Eletricista Residencial e Comercial</option>
                    <option value="Técnico em Climatização & Ar-Condicionado">Técnico em Climatização & Ar-Condicionado</option>
                    <option value="Marcenaria & Móveis Planejados">Marcenaria & Móveis Planejados</option>
                    <option value="Encanador & Caça-Vazamentos">Encanador & Caça-Vazamentos</option>
                    <option value="Pintor Profissional & Texturas">Pintor Profissional & Texturas</option>
                    <option value="Gesseiro e Drywall">Gesseiro e Drywall</option>
                    <option value="Chaveiro & Fechaduras">Chaveiro & Fechaduras</option>
                    <option value="Pedreiro & Reformas Gerais">Pedreiro & Reformas Gerais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp para Receber Clientes <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={whatsapp}
                      onChange={(e) => handleWhatsappChange(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cidade / Estado <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Curitiba - PR"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-mail <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
                />
              </div>
            </div>

            {mode !== 'magic_link' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Senha {mode === 'register' && <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-orange-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'ENTRAR NO PAINEL'
                      : mode === 'register'
                      ? 'CRIAR MEU SITE E CONTINUAR'
                      : 'ENVIAR LINK POR E-MAIL'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back / Cancel */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            ← Voltar para a página inicial
          </button>
        </div>

      </div>
    </div>
  );
};
