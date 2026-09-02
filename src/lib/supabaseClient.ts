import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_PROFILES, INITIAL_GALLERY, DEFAULT_SYSTEM_SETTINGS } from './mockData';
import { Profile, ServicePhoto, SystemSettings } from '../types';

const STORAGE_KEY_PROFILES = 'tecnicolink_profiles_v3';
const STORAGE_KEY_GALLERY = 'tecnicolink_gallery_v3';
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

// Local store helpers with persistence fallback
export function getLocalProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
  return INITIAL_PROFILES;
}

export function saveLocalProfile(profile: Profile): Profile {
  const current = getLocalProfiles();
  const index = current.findIndex(p => p.id === profile.id || p.username === profile.username);
  let updated: Profile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...profile, updated_at: new Date().toISOString() };
  } else {
    updated = [profile, ...current];
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
  return profile;
}

export function getLocalGallery(profileId: string): ServicePhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw) {
      const all: Record<string, ServicePhoto[]> = JSON.parse(raw);
      if (all[profileId]) return all[profileId];
    }
  } catch (e) {
    console.error(e);
  }
  // Initialize with initial gallery
  const initial = INITIAL_GALLERY[profileId] || [];
  return initial;
}

export function saveLocalGalleryPhoto(photo: ServicePhoto): ServicePhoto {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    const all: Record<string, ServicePhoto[]> = raw ? JSON.parse(raw) : { ...INITIAL_GALLERY };
    if (!all[photo.profile_id]) {
      all[photo.profile_id] = [];
    }
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
    const all: Record<string, ServicePhoto[]> = raw ? JSON.parse(raw) : { ...INITIAL_GALLERY };
    if (all[profileId]) {
      all[profileId] = all[profileId].filter(p => p.id !== photoId);
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(all));
    }
  } catch (e) {
    console.error(e);
  }
}
