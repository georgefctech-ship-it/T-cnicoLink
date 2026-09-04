import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_PROFILES, INITIAL_GALLERY, INITIAL_TESTIMONIALS, DEFAULT_SYSTEM_SETTINGS, ADMIN_MASTER_PROFILE, isMockDemoPhoto } from './mockData';
import { Profile, ServicePhoto, SystemSettings, Testimonial } from '../types';

const STORAGE_KEY_PROFILES = 'tecnicolink_profiles_v3';
const STORAGE_KEY_GALLERY = 'tecnicolink_gallery_v3';
const STORAGE_KEY_TESTIMONIALS = 'tecnicolink_testimonials_v3';
const STORAGE_KEY_CONFIG = 'tecnicolink_supabase_cfg_v1';
const STORAGE_KEY_SETTINGS = 'tecnicolink_system_settings_v1';
const STORAGE_KEY_AUTH_USER = 'tecnicolink_auth_user_v3';

export function getStoredAuthUser(): any {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading auth user', e);
  }
  return null;
}

export function saveStoredAuthUser(user: any) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
  }
}

export function clearStoredAuthUser() {
  localStorage.removeItem(STORAGE_KEY_AUTH_USER);
}

export function getLocalSystemSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SYSTEM_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SYSTEM_SETTINGS;
}

export function saveLocalSystemSettings(settings: SystemSettings): SystemSettings {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  return settings;
}

const DEFAULT_SUPABASE_URL = 'https://jgdirmbxhdqobbzagphn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-03_htn9IvjTGQC-nzEmFw_hvHGDEFM';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading config', e);
  }
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, anonKey }));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey);
    }
    return supabaseInstance;
  }
  return null;
}

export const STORAGE_KEY_ACTIVE_PROFILE_ID = 'tecnicolink_active_profile_id';

// Local store helpers with persistence fallback
export function getLocalProfiles(): Profile[] {
  let list: Profile[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read profiles from localStorage:', e);
  }

  // If empty, start with initial
  if (list.length === 0) {
    list = [...INITIAL_PROFILES];
  }

  // Guarantee ADMIN_MASTER_PROFILE is always included
  const hasAdmin = list.some(p => p.username === 'george-admin' || p.id === 'prof-admin');
  if (!hasAdmin) {
    list.unshift(ADMIN_MASTER_PROFILE);
  }

  // Scan localStorage for any individually registered profiles (fail-safe)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tecnicolink_prof_')) {
        const itemRaw = localStorage.getItem(key);
        if (itemRaw) {
          const itemProf = JSON.parse(itemRaw);
          if (itemProf && itemProf.username) {
            const alreadyExists = list.some(p => p.username?.toLowerCase() === itemProf.username?.toLowerCase() || p.id === itemProf.id);
            if (!alreadyExists) {
              list.push(itemProf);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Scan localStorage profiles error:', e);
  }

  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not persist updated profiles list:', e);
  }

  return list;
}

export function getStoredActiveProfileId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
  } catch {
    return null;
  }
}

export function saveStoredActiveProfileId(profileId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, profileId);
  } catch (e) {
    console.warn('Failed to save active profile id:', e);
  }
}

export function saveLocalProfile(profile: Profile): Profile {
  const current = getLocalProfiles();
  const index = current.findIndex(p => p.id === profile.id || (p.username && profile.username && p.username.toLowerCase() === profile.username.toLowerCase()));
  let updated: Profile[];
  const enrichedProfile: Profile = {
    ...profile,
    updated_at: new Date().toISOString()
  };

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...enrichedProfile };
  } else {
    updated = [enrichedProfile, ...current];
  }

  // 1. Save to primary list
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update STORAGE_KEY_PROFILES in localStorage:', e);
    // If quota exceeded, try cleaning older keys
    try {
      localStorage.removeItem('tecnicolink_profiles_v1');
      localStorage.removeItem('tecnicolink_profiles_v2');
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
    } catch {}
  }

  // 2. Save individual profile keys as dedicated fail-safe backups
  try {
    if (enrichedProfile.id) {
      localStorage.setItem(`tecnicolink_prof_${enrichedProfile.id}`, JSON.stringify(enrichedProfile));
    }
    if (enrichedProfile.username) {
      localStorage.setItem(`tecnicolink_prof_${enrichedProfile.username.toLowerCase()}`, JSON.stringify(enrichedProfile));
    }
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, enrichedProfile.id);
  } catch (e) {
    console.warn('Failed to save dedicated profile backup:', e);
  }

  return index >= 0 ? updated[index] : enrichedProfile;
}

export function getLocalGallery(profileId: string): ServicePhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw) {
      const all: Record<string, ServicePhoto[]> = JSON.parse(raw);
      if (all[profileId]) {
        // Filter out all demonstration photos, leaving ONLY real photos added by administrator/user
        const realPhotos = all[profileId].filter(p => !isMockDemoPhoto(p));
        // Clean up stored gallery if mock photos existed
        if (realPhotos.length !== all[profileId].length) {
          all[profileId] = realPhotos;
          localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
        }
        return realPhotos;
      }
    }
  } catch (e) {
    console.error(e);
  }
  // Return empty list if no admin-added photos exist
  return [];
}

export function saveLocalGalleryPhoto(photo: ServicePhoto): ServicePhoto {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    const all: Record<string, ServicePhoto[]> = raw ? JSON.parse(raw) : {};
    if (!all[photo.profile_id]) {
      all[photo.profile_id] = [];
    }
    // Clean up any demo photos
    all[photo.profile_id] = all[photo.profile_id].filter(p => !isMockDemoPhoto(p));
    all[photo.profile_id] = [photo, ...all[photo.profile_id]];
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
  return photo;
}

export function deleteLocalGalleryPhoto(profileId: string, photoId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    const all: Record<string, ServicePhoto[]> = raw ? JSON.parse(raw) : {};
    if (all[profileId]) {
      all[profileId] = all[profileId].filter(p => p.id !== photoId && !isMockDemoPhoto(p));
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
    }
  } catch (e) {
    console.error(e);
  }
}

export function updateLocalGalleryPhoto(photo: ServicePhoto): ServicePhoto {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    const all: Record<string, ServicePhoto[]> = raw ? JSON.parse(raw) : {};
    if (!all[photo.profile_id]) {
      all[photo.profile_id] = [];
    }
    all[photo.profile_id] = all[photo.profile_id].filter(p => !isMockDemoPhoto(p));
    const index = all[photo.profile_id].findIndex(p => p.id === photo.id);
    if (index >= 0) {
      all[photo.profile_id][index] = photo;
    } else {
      all[photo.profile_id].push(photo);
    }
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
  return photo;
}

export function getLocalTestimonials(profileId: string): Testimonial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
    if (raw) {
      const all: Record<string, Testimonial[]> = JSON.parse(raw);
      if (all[profileId]) return all[profileId];
    }
  } catch (e) {
    console.error('Error reading local testimonials:', e);
  }
  const initial = INITIAL_TESTIMONIALS[profileId] || [];
  return initial;
}

export function saveLocalTestimonial(testimonial: Testimonial): Testimonial {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
    const all: Record<string, Testimonial[]> = raw ? JSON.parse(raw) : { ...INITIAL_TESTIMONIALS };
    if (!all[testimonial.profile_id]) {
      all[testimonial.profile_id] = [];
    }
    all[testimonial.profile_id] = [testimonial, ...all[testimonial.profile_id]];
    localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(all));
  } catch (e) {
    console.error('Error saving local testimonial:', e);
  }
  return testimonial;
}

export function deleteLocalTestimonial(profileId: string, testimonialId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
    const all: Record<string, Testimonial[]> = raw ? JSON.parse(raw) : { ...INITIAL_TESTIMONIALS };
    if (all[profileId]) {
      all[profileId] = all[profileId].filter(t => t.id !== testimonialId);
      localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Error deleting local testimonial:', e);
  }
}

export function deleteLocalProfile(profileId: string) {
  try {
    const current = getLocalProfiles();
    const updated = current.filter(p => p.id !== profileId && p.user_id !== profileId);
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));

    // Also remove any gallery photos stored locally for this profile
    const rawGallery = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (rawGallery) {
      const all: Record<string, ServicePhoto[]> = JSON.parse(rawGallery);
      if (all[profileId]) {
        delete all[profileId];
        localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
      }
    }
  } catch (e) {
    console.error('Error deleting local profile:', e);
  }
}

