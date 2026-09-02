import React, { useState, useEffect } from 'react';
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
  getSupabase
} from './lib/supabaseClient';
import { INITIAL_TESTIMONIALS, DEFAULT_SYSTEM_SETTINGS } from './lib/mockData';

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

    // Check existing active Supabase session
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const isOwnerAdmin = session.user.email?.trim().toLowerCase() === 'georgefctec@gmail.com' || session.user.email?.toLowerCase().includes('admin@');
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email
          });

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
    setCurrentUser({ id: profile.id, name: profile.full_name });
    saveLocalProfile(profile);
    setProfiles(prev => {
      const exists = prev.some(p => p.id === profile.id);
      return exists ? prev.map(p => p.id === profile.id ? profile : p) : [profile, ...prev];
    });
    setActiveProfile(profile);
    setCurrentView('panel');
  }

  function handleLogout() {
    setCurrentUser(null);
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

  // Find admin profile or fallback to active profile
  const adminProfile = profiles.find(p => p.role === 'admin') || activeProfile;

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
            onStart={() => setCurrentView('panel')}
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
            onBackToPanel={() => setCurrentView('panel')}
            systemSettings={systemSettings}
            onTrackView={() => handleTrackView(activeProfile.id)}
            onTrackWhatsAppClick={() => handleTrackWhatsAppClick(activeProfile.id)}
          />
        )}

        {currentView === 'admin_control' && (
          <AdminControlView
            profiles={profiles}
            onUpdateProfile={handleSaveProfile}
            systemSettings={systemSettings}
            onSaveSystemSettings={handleSaveSystemSettings}
            onImpersonateUser={handleImpersonateUser}
            currentAdmin={adminProfile}
          />
        )}

        {currentView === 'sql_schema' && (
          <SqlSchemaView />
        )}

        {currentView === 'deploy_docs' && (
          <DeployDocsView />
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

