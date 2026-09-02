import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
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
  getStoredSupabaseConfig,
  getLocalSystemSettings,
  saveLocalSystemSettings,
  getSupabase,
  getStoredAuthUser,
  saveStoredAuthUser,
  clearStoredAuthUser
} from './lib/supabaseClient';
import { INITIAL_TESTIMONIALS, DEFAULT_SYSTEM_SETTINGS, ADMIN_MASTER_PROFILE } from './lib/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [gallery, setGallery] = useState<ServicePhoto[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
        setCurrentView={setCurrentView}
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
        {currentView === 'home' && (
          <HomeView
            onStart={() => {
              if (currentUser) {
                setCurrentView('panel');
              } else {
                setCurrentView('register');
              }
            }}
            onSelectProfile={(p) => {
              handleSelectProfile(p);
              setCurrentView('public_profile');
            }}
            profiles={profiles}
            setCurrentView={setCurrentView}
          />
        )}

        {(currentView === 'login' || currentView === 'register') && (
          <AuthView
            initialMode={currentView === 'register' ? 'register' : 'login'}
            onSuccess={handleAuthSuccess}
            onCancel={() => setCurrentView('home')}
            profiles={profiles}
            onSelectDemoUser={(p) => {
              handleSelectProfile(p);
              handleAuthSuccess(p);
            }}
          />
        )}

        {currentView === 'panel' && (
          <PainelView
            profile={activeProfile}
            gallery={gallery}
            onSaveProfile={handleSaveProfile}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            setCurrentView={setCurrentView}
            isSupabaseConnected={isSupabaseConnected}
            systemSettings={systemSettings}
          />
        )}

        {currentView === 'public_profile' && (
          <PublicProfileView
            profile={activeProfile}
            gallery={gallery}
            testimonials={testimonials}
            onBackToPanel={() => setCurrentView(currentUser ? 'panel' : 'home')}
            systemSettings={systemSettings}
            onTrackView={() => handleTrackView(activeProfile.id)}
            onTrackWhatsAppClick={() => handleTrackWhatsAppClick(activeProfile.id)}
          />
        )}

        {currentView === 'admin_control' && (
          isAdmin ? (
            <AdminControlView
              profiles={profiles}
              onUpdateProfile={handleSaveProfile}
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
        <Footer setCurrentView={setCurrentView} />
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

