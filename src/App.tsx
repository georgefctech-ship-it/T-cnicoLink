import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, UserX, Loader2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { PainelView } from './components/PainelView';
import { PublicProfileView } from './components/PublicProfileView';
import { AuthView } from './components/AuthView';
import { SqlSchemaView } from './components/SqlSchemaView';
import { DeployDocsView } from './components/DeployDocsView';
import { AdminControlView } from './components/AdminControlView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Footer } from './components/Footer';
import { AppView, Profile, ServicePhoto, SystemSettings } from './types';
import { 
  getLocalProfiles, 
  saveLocalProfile, 
  getLocalGallery, 
  saveLocalGalleryPhoto, 
  deleteLocalGalleryPhoto, 
  deleteLocalProfile,
  getStoredSupabaseConfig,
  getLocalSystemSettings,
  saveLocalSystemSettings,
  getSupabase,
  getStoredAuthUser,
  saveStoredAuthUser,
  clearStoredAuthUser
} from './lib/supabaseClient';
import { INITIAL_TESTIMONIALS, DEFAULT_SYSTEM_SETTINGS, ADMIN_MASTER_PROFILE } from './lib/mockData';
import { decodeProfilePayload } from './lib/profileUrlHelper';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [gallery, setGallery] = useState<ServicePhoto[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileNotFoundUsername, setProfileNotFoundUsername] = useState<string | null>(null);
  const [isPublicVisitor, setIsPublicVisitor] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  function updateBrowserUrl(view: AppView, username?: string) {
    if (typeof window === 'undefined') return;
    let targetPath = '/';
    if (view === 'public_profile') {
      targetPath = username ? `/p/${username}` : '/p';
    } else if (view === 'panel') {
      targetPath = '/painel';
    } else if (view === 'login') {
      targetPath = '/login';
    } else if (view === 'register') {
      targetPath = '/cadastro';
    } else if (view === 'admin_control') {
      targetPath = '/admin';
    } else if (view === 'sql_schema') {
      targetPath = '/sql-schema';
    } else if (view === 'deploy_docs') {
      targetPath = '/deploy';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }

  function navigateTo(view: AppView, targetProfile?: Profile) {
    if (targetProfile) {
      handleSelectProfile(targetProfile);
    }
    setCurrentView(view);
    setProfileNotFoundUsername(null);
    if (view !== 'public_profile') {
      setIsPublicVisitor(false);
    }
    updateBrowserUrl(view, targetProfile?.username || activeProfile?.username);
  }

  async function parseAndApplyRoute(pathname: string, availableProfiles: Profile[]) {
    const cleanPath = pathname.trim();

    // 0. Check if URL has a base64 encoded profile payload (?d=... or ?data=...) from QR Code scan
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('d') || urlParams.get('data');
        if (encodedData) {
          const restoredProfile = decodeProfilePayload(encodedData);
          if (restoredProfile && restoredProfile.username) {
            saveLocalProfile(restoredProfile);
            setProfiles(prev => {
              const exists = prev.some(p => p.username === restoredProfile.username || p.id === restoredProfile.id);
              return exists ? prev.map(p => p.username === restoredProfile.username ? restoredProfile : p) : [restoredProfile, ...prev];
            });
            setActiveProfile(restoredProfile);
            setGallery(getLocalGallery(restoredProfile.id));
            setCurrentView('public_profile');
            setIsPublicVisitor(true);
            setProfileNotFoundUsername(null);
            setIsLoadingRoute(false);
            window.history.replaceState({}, '', `/p/${restoredProfile.username}`);
            return;
          }
        }
      } catch (e) {
        console.warn('Erro decodificando dados da rota:', e);
      }
    }

    // Determine target username from pathname (/p/...) OR query param (?p=...) OR hash (#/p/...)
    let rawUsername = '';
    if (cleanPath.startsWith('/p/')) {
      rawUsername = cleanPath.replace(/^\/p\//, '').split('/')[0].split('?')[0].trim().toLowerCase();
    } else if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryUser = urlParams.get('p') || urlParams.get('u') || urlParams.get('perfil');
      if (queryUser) {
        rawUsername = queryUser.trim().toLowerCase();
      } else if (window.location.hash.startsWith('#/p/')) {
        rawUsername = window.location.hash.replace(/^#\/p\//, '').split('/')[0].split('?')[0].trim().toLowerCase();
      }
    }

    if (rawUsername) {
      setIsLoadingRoute(true);

      // 1. Try finding in current or fresh local profiles
      const freshProfiles = getLocalProfiles();
      const allCandidates = [...availableProfiles, ...freshProfiles];
      const foundLocal = allCandidates.find(p => p.username.toLowerCase() === rawUsername);
      
      if (foundLocal) {
        setActiveProfile(foundLocal);
        const photos = getLocalGallery(foundLocal.id);
        setGallery(photos);
        setCurrentView('public_profile');
        setIsPublicVisitor(true);
        setProfileNotFoundUsername(null);
        setIsLoadingRoute(false);
        return;
      }

      // 2. Try fetching from Supabase
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data: dbProf } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', rawUsername)
            .maybeSingle();

          if (dbProf) {
            saveLocalProfile(dbProf);
            setProfiles(prev => {
              const exists = prev.some(p => p.id === dbProf.id);
              return exists ? prev.map(p => p.id === dbProf.id ? dbProf : p) : [dbProf, ...prev];
            });
            setActiveProfile(dbProf);

            const { data: dbPhotos } = await supabase
              .from('gallery')
              .select('*')
              .eq('profile_id', dbProf.id);

            if (dbPhotos && dbPhotos.length > 0) {
              setGallery(dbPhotos);
            } else {
              setGallery(getLocalGallery(dbProf.id));
            }

            setCurrentView('public_profile');
            setIsPublicVisitor(true);
            setProfileNotFoundUsername(null);
            setIsLoadingRoute(false);
            return;
          }
        } catch (e) {
          console.warn('Erro buscando perfil público no Supabase:', e);
        }
      }

      // If neither local nor Supabase found it:
      setProfileNotFoundUsername(rawUsername);
      setCurrentView('public_profile');
      setIsPublicVisitor(true);
      setIsLoadingRoute(false);
      return;
    }

    if (cleanPath === '/painel' || cleanPath === '/panel') {
      setCurrentView('panel');
    } else if (cleanPath === '/login') {
      setCurrentView('login');
    } else if (cleanPath === '/cadastro' || cleanPath === '/register') {
      setCurrentView('register');
    } else if (cleanPath === '/admin') {
      setCurrentView('admin_control');
    } else if (cleanPath === '/sql-schema') {
      setCurrentView('sql_schema');
    } else if (cleanPath === '/deploy') {
      setCurrentView('deploy_docs');
    } else {
      setCurrentView('home');
    }
  }

  // Initialize data on mount
  useEffect(() => {
    const loadedProfiles = getLocalProfiles();
    setProfiles(loadedProfiles);
    const initialActive = loadedProfiles[0];
    setActiveProfile(initialActive);

    const initialGallery = getLocalGallery(initialActive.id);
    setGallery(initialGallery);

    const loadedSettings = getLocalSystemSettings();
    setSystemSettings(loadedSettings);

    checkSupabaseStatus();

    // Check URL route on start
    parseAndApplyRoute(window.location.pathname, loadedProfiles);

    // Listen to browser Back and Forward button events
    const handlePopState = () => {
      parseAndApplyRoute(window.location.pathname, loadedProfiles);
    };
    window.addEventListener('popstate', handlePopState);

    // 1. Check local stored auth session
    const storedAuth = getStoredAuthUser();
    if (storedAuth) {
      setCurrentUser(storedAuth);
      const isOwnerAdmin = storedAuth.role === 'admin' || storedAuth.email?.trim().toLowerCase() === 'georgefctec@gmail.com';
      if (isOwnerAdmin) {
        setActiveProfile(ADMIN_MASTER_PROFILE);
      } else {
        const matchingProfile = loadedProfiles.find(p => p.id === storedAuth.id || p.user_id === storedAuth.id);
        if (matchingProfile) {
          setActiveProfile(matchingProfile);
        }
      }
    }

    // 2. Check active Supabase session if connected
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const isOwnerAdmin = session.user.email?.trim().toLowerCase() === 'georgefctec@gmail.com' || session.user.email?.toLowerCase().includes('admin@');
          const authUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            role: isOwnerAdmin ? 'admin' : 'technician'
          };
          setCurrentUser(authUser);
          saveStoredAuthUser(authUser);

          try {
            const { data: dbProf } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (dbProf) {
              const fullProf: Profile = {
                ...dbProf,
                role: isOwnerAdmin ? 'admin' : (dbProf.role || 'technician'),
                plan: isOwnerAdmin ? 'enterprise' : (dbProf.plan || 'free'),
                status: dbProf.status || 'active',
                is_verified: isOwnerAdmin || dbProf.is_verified,
                monthly_views_limit: isOwnerAdmin ? 999999 : (dbProf.monthly_views_limit || 100),
                max_photos: isOwnerAdmin ? 30 : (dbProf.max_photos || 6)
              };
              saveLocalProfile(fullProf);
              setActiveProfile(fullProf);
              setProfiles(prev => {
                const exists = prev.some(p => p.id === fullProf.id);
                return exists ? prev.map(p => p.id === fullProf.id ? fullProf : p) : [fullProf, ...prev];
              });
            } else if (isOwnerAdmin) {
              setActiveProfile(ADMIN_MASTER_PROFILE);
            }
          } catch (e) {
            console.warn('Session profile fetch warning:', e);
          }
        }
      });
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update gallery when active profile changes
  useEffect(() => {
    if (activeProfile) {
      const photos = getLocalGallery(activeProfile.id);
      setGallery(photos);
    }
  }, [activeProfile?.id]);

  function checkSupabaseStatus() {
    const config = getStoredSupabaseConfig();
    const isConn = !!(config.url && config.anonKey && config.url.startsWith('http'));
    setIsSupabaseConnected(isConn);
  }

  function handleSelectProfile(profile: Profile) {
    setActiveProfile(profile);
    const photos = getLocalGallery(profile.id);
    setGallery(photos);
  }

  async function handleSaveProfile(updated: Profile) {
    saveLocalProfile(updated);
    setActiveProfile(updated);
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));

    const supabase = getSupabase();
    if (supabase && updated.id) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: updated.id,
            full_name: updated.full_name,
            username: updated.username,
            profession: updated.profession,
            specialties: updated.specialties,
            whatsapp_number: updated.whatsapp_number,
            phone_number: updated.phone_number,
            bio_short: updated.bio_short,
            avatar_url: updated.avatar_url,
            cover_url: updated.cover_url,
            city_state: updated.city_state,
            years_experience: updated.years_experience,
            accepts_pix: updated.accepts_pix,
            accepts_cards: updated.accepts_cards,
            offers_warranty: updated.offers_warranty,
            role: updated.role,
            status: updated.status,
            plan: updated.plan,
            is_verified: updated.is_verified,
            max_photos: updated.max_photos,
            monthly_views_limit: updated.monthly_views_limit,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Supabase profile save error:', err);
      }
    }
  }

  function handleAddPhoto(photo: ServicePhoto) {
    saveLocalGalleryPhoto(photo);
    setGallery(prev => [photo, ...prev]);
  }

  function handleDeletePhoto(photoId: string) {
    if (activeProfile) {
      deleteLocalGalleryPhoto(activeProfile.id, photoId);
      setGallery(prev => prev.filter(p => p.id !== photoId));
    }
  }

  async function handleDeleteProfile(profileId: string) {
    // 1. Delete from local storage (both profile & its gallery photos)
    deleteLocalProfile(profileId);

    // 2. Remove from React state
    setProfiles(prev => prev.filter(p => p.id !== profileId && p.user_id !== profileId));

    // 3. If currently viewing/editing this profile, fallback safely
    if (activeProfile && (activeProfile.id === profileId || activeProfile.user_id === profileId)) {
      const remaining = profiles.filter(p => p.id !== profileId && p.user_id !== profileId);
      setActiveProfile(remaining.length > 0 ? remaining[0] : ADMIN_MASTER_PROFILE);
    }

    // 4. Delete from Supabase if connected
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('service_gallery').delete().eq('profile_id', profileId);
        await supabase.from('profiles').delete().eq('id', profileId);
      } catch (err) {
        console.error('Supabase profile deletion error:', err);
      }
    }
  }

  function handleAuthSuccess(profile: Profile) {
    const isOwnerAdmin = profile.role === 'admin' || profile.username === 'george-admin';
    const authUser = {
      id: profile.id,
      name: profile.full_name,
      email: isOwnerAdmin ? 'georgefctec@gmail.com' : `${profile.username}@tecnicolink.com.br`,
      role: isOwnerAdmin ? 'admin' : 'technician'
    };

    saveStoredAuthUser(authUser);
    setCurrentUser(authUser);

    if (isOwnerAdmin) {
      setActiveProfile(ADMIN_MASTER_PROFILE);
      setCurrentView('admin_control');
    } else {
      saveLocalProfile(profile);
      setProfiles(prev => {
        const exists = prev.some(p => p.id === profile.id);
        return exists ? prev.map(p => p.id === profile.id ? profile : p) : [profile, ...prev];
      });
      setActiveProfile(profile);
      setCurrentView('panel');
    }
  }

  function handleLogout() {
    clearStoredAuthUser();
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setCurrentUser(null);
    const loadedProfiles = getLocalProfiles();
    setActiveProfile(loadedProfiles[0]);
    setCurrentView('home');
  }

  function handleSaveSystemSettings(newSettings: SystemSettings) {
    saveLocalSystemSettings(newSettings);
    setSystemSettings(newSettings);
  }

  function handleImpersonateUser(profile: Profile) {
    handleSelectProfile(profile);
    setCurrentView('panel');
  }

  function handleTrackView(profileId: string) {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const updated = { ...p, views_count: (p.views_count || 0) + 1 };
        saveLocalProfile(updated);
        return updated;
      }
      return p;
    }));
    setActiveProfile(prev => {
      if (prev.id === profileId) {
        return { ...prev, views_count: (prev.views_count || 0) + 1 };
      }
      return prev;
    });
  }

  function handleTrackWhatsAppClick(profileId: string) {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const updated = { ...p, whatsapp_clicks: (p.whatsapp_clicks || 0) + 1 };
        saveLocalProfile(updated);
        return updated;
      }
      return p;
    }));
    setActiveProfile(prev => {
      if (prev.id === profileId) {
        return { ...prev, whatsapp_clicks: (prev.whatsapp_clicks || 0) + 1 };
      }
      return prev;
    });
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const testimonials = INITIAL_TESTIMONIALS[activeProfile.id] || [];

  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.email?.toLowerCase().trim() === 'georgefctec@gmail.com' ||
      currentUser.email?.toLowerCase().includes('admin@')
    )
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {isLoadingRoute ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
            <p className="text-sm font-semibold text-gray-700">Carregando portfólio do técnico...</p>
          </div>
        ) : null}

        {!isLoadingRoute && currentView === 'home' && (
          <HomeView
            onStart={() => {
              if (currentUser) {
                navigateTo('panel');
              } else {
                navigateTo('register');
              }
            }}
            onSelectProfile={(p) => {
              navigateTo('public_profile', p);
            }}
            profiles={profiles}
            setCurrentView={navigateTo}
          />
        )}

        {!isLoadingRoute && (currentView === 'login' || currentView === 'register') && (
          <AuthView
            initialMode={currentView === 'register' ? 'register' : 'login'}
            onSuccess={handleAuthSuccess}
            onCancel={() => navigateTo('home')}
            profiles={profiles}
            onSelectDemoUser={(p) => {
              handleSelectProfile(p);
              handleAuthSuccess(p);
            }}
          />
        )}

        {!isLoadingRoute && currentView === 'panel' && (
          <PainelView
            profile={activeProfile}
            gallery={gallery}
            onSaveProfile={handleSaveProfile}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            setCurrentView={navigateTo}
            isSupabaseConnected={isSupabaseConnected}
            systemSettings={systemSettings}
          />
        )}

        {!isLoadingRoute && currentView === 'public_profile' && (
          profileNotFoundUsername ? (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserX className="w-8 h-8 text-orange-600" />
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Link Não Encontrado
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-3 font-['Syne',sans-serif]">
                  Página do Técnico não Encontrada
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  O link <code className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-mono font-bold">/p/{profileNotFoundUsername}</code> ainda não foi registrado ou foi digitado com algum erro.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('home')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
                  >
                    Voltar ao Início
                  </button>
                  <button
                    onClick={() => navigateTo('register')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Criar Meu Site Grátis
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <PublicProfileView
              profile={activeProfile}
              gallery={gallery}
              testimonials={testimonials}
              onBackToPanel={() => navigateTo(currentUser ? 'panel' : 'home')}
              systemSettings={systemSettings}
              onTrackView={() => handleTrackView(activeProfile.id)}
              onTrackWhatsAppClick={() => handleTrackWhatsAppClick(activeProfile.id)}
              isPublicVisitor={isPublicVisitor}
            />
          )
        )}

        {currentView === 'admin_control' && (
          isAdmin ? (
            <AdminControlView
              profiles={profiles}
              onUpdateProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              systemSettings={systemSettings}
              onSaveSystemSettings={handleSaveSystemSettings}
              onImpersonateUser={handleImpersonateUser}
              currentAdmin={ADMIN_MASTER_PROFILE}
            />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
                  <ShieldAlert className="w-8 h-8 text-amber-600" />
                </div>
                
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full uppercase tracking-wider border border-amber-200">
                  Acesso Restrito ao Administrador Master
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4 tracking-tight font-['Syne',sans-serif]">
                  Área de Segurança & Gestão SaaS
                </h2>

                <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Esta central contém controle de faturamento PIX, limites de planos e moderação de técnicos. Acesso restrito ao proprietário do sistema: <strong className="text-gray-900 font-semibold">George Ferreira Costa</strong> (<code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono text-xs">georgefctec@gmail.com</code>).
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentView('login')}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Fazer Login como Administrador Master</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView('home')}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
                  >
                    Voltar para o Início
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentView === 'sql_schema' && (
          isAdmin ? (
            <SqlSchemaView />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-5">
                  <ShieldAlert className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Recurso Exclusivo do Administrador</h2>
                <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  A estrutura e configurações do banco de dados são estritamente restritas ao proprietário do sistema.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Voltar para o Início
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentView === 'deploy_docs' && (
          isAdmin ? (
            <DeployDocsView />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
              <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-5">
                  <ShieldAlert className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Recurso Exclusivo do Administrador</h2>
                <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  As instruções de deploy em nuvem e servidores são estritamente restritas ao administrador master.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setCurrentView('home')}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Voltar para o Início
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Application Footer with Copyright and Socials */}
      {currentView !== 'public_profile' && (
        <Footer setCurrentView={navigateTo} />
      )}

      {/* Supabase Custom Keys Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => checkSupabaseStatus()}
      />

    </div>
  );
}

