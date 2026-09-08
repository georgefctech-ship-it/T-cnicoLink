import { Profile, ServicePhoto } from '../types';
import { getSupabase, saveLocalProfile, getLocalProfiles, saveLocalGalleryPhoto, getLocalGallery } from './supabaseClient';
import { INITIAL_PROFILES } from './mockData';

// Mapping well-known profile IDs to valid PostgreSQL UUIDs
const KNOWN_UUIDS: Record<string, string> = {
  'prof-admin': 'cefe22db-af44-4968-92be-75a61ceae0af',
  'george-admin': 'cefe22db-af44-4968-92be-75a61ceae0af',
  'georgefctech-admin': 'cefe22db-af44-4968-92be-75a61ceae0af',
  'prof-1': 'e1a00000-0000-4000-8000-000000000001',
  'jhonatas-climatizacao': 'e1a00000-0000-4000-8000-000000000001',
  'jhonatas-refrigeracao': 'e1a00000-0000-4000-8000-000000000001',
  'marcos-silva': 'e1a00000-0000-4000-8000-000000000001',
  'prof-2': 'e1a00000-0000-4000-8000-000000000002',
  'felipe-smartphones': 'e1a00000-0000-4000-8000-000000000002',
  'prof-3': 'e1a00000-0000-4000-8000-000000000003',
  'prof-4': 'e1a00000-0000-4000-8000-000000000004',
  'prof-5': 'e1a00000-0000-4000-8000-000000000005',
};

export function isValidUuid(val?: string): boolean {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
}

export function toValidUuid(idOrSlug?: string): string {
  if (!idOrSlug) return crypto.randomUUID();
  if (isValidUuid(idOrSlug)) return idOrSlug;
  const known = KNOWN_UUIDS[idOrSlug.toLowerCase()];
  if (known) return known;
  return crypto.randomUUID();
}

/**
 * Fetch all profiles from Cloud (Server API + Supabase) and merge with local
 */
export async function fetchCloudProfiles(): Promise<Profile[]> {
  const profileMap = new Map<string, Profile>();

  // 1. Start with initial mock profiles as baseline
  for (const p of INITIAL_PROFILES) {
    profileMap.set(p.id, p);
  }

  // 2. Overlay with local storage
  const localList = getLocalProfiles();
  for (const p of localList) {
    profileMap.set(p.id, p);
  }

  // 3. Fetch from Server Persistence (/api/profiles)
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.profiles)) {
        for (const p of data.profiles) {
          if (p && p.id) {
            profileMap.set(p.id, { ...(profileMap.get(p.id) || {}), ...p });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Could not reach /api/profiles:', err);
  }

  // 4. Fetch from Supabase directly
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        for (const row of data) {
          // Normalize specialties if string
          const specialties = Array.isArray(row.specialties)
            ? row.specialties
            : typeof row.specialties === 'string'
            ? [row.specialties]
            : [];

          const mapped: Profile = {
            ...row,
            specialties,
          };
          profileMap.set(mapped.id, { ...(profileMap.get(mapped.id) || {}), ...mapped });
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Supabase profiles fetch error:', err);
    }
  }

  const result = Array.from(profileMap.values());
  // Cache to local storage
  try {
    for (const p of result) {
      saveLocalProfile(p);
    }
  } catch {}

  return result;
}

/**
 * Fetch gallery photos from Cloud (Server API + Supabase)
 */
export async function fetchCloudGallery(profileId: string): Promise<ServicePhoto[]> {
  const photoMap = new Map<string, ServicePhoto>();

  // 1. Read local photos
  const localPhotos = getLocalGallery(profileId);
  for (const ph of localPhotos) {
    photoMap.set(ph.id, ph);
  }

  // 2. Read from Server API
  try {
    const res = await fetch(`/api/gallery?profile_id=${encodeURIComponent(profileId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.photos)) {
        for (const ph of data.photos) {
          photoMap.set(ph.id, ph);
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Error fetching /api/gallery:', err);
  }

  // 3. Read from Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const validUuid = toValidUuid(profileId);
      const { data, error } = await supabase
        .from('service_gallery')
        .select('*')
        .or(`profile_id.eq.${validUuid},profile_id.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          photoMap.set(row.id, {
            id: row.id,
            profile_id: row.profile_id,
            image_url: row.image_url,
            title: row.title || '',
            description: row.description || '',
            tag: row.tag || 'Instalação',
            created_at: row.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Supabase gallery fetch error:', err);
    }
  }

  const result = Array.from(photoMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return result;
}

/**
 * Save profile to Cloud in Real Time (Server API + Supabase + Local)
 */
export async function saveCloudProfile(profile: Profile): Promise<Profile> {
  const now = new Date().toISOString();
  const validId = toValidUuid(profile.id);

  const enriched: Profile = {
    ...profile,
    id: profile.id || validId,
    updated_at: now,
  };

  // 1. Save locally immediately for responsive UI
  saveLocalProfile(enriched);

  // 2. Post to Server API (persists across containers & broadcasts via SSE)
  try {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });
  } catch (err) {
    console.warn('[CloudSync] Server API profile save warning:', err);
  }

  // 3. Save to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload: any = {
        id: validId,
        full_name: enriched.full_name,
        username: enriched.username,
        profession: enriched.profession,
        specialties: enriched.specialties || [],
        whatsapp_number: enriched.whatsapp_number,
        phone_number: enriched.phone_number || enriched.whatsapp_number,
        bio_short: enriched.bio_short,
        avatar_url: enriched.avatar_url,
        cover_url: enriched.cover_url || null,
        city_state: enriched.city_state,
        years_experience: enriched.years_experience || 1,
        accepts_pix: enriched.accepts_pix ?? true,
        accepts_cards: enriched.accepts_cards ?? true,
        offers_warranty: enriched.offers_warranty ?? true,
        rating: enriched.rating || 5.0,
        review_count: enriched.review_count || 0,
        role: enriched.role || 'technician',
        status: enriched.status || 'active',
        plan: enriched.plan || 'pro',
        is_verified: enriched.is_verified ?? true,
        max_photos: enriched.max_photos || 30,
        monthly_views_limit: enriched.monthly_views_limit || 2500,
        views_count: enriched.views_count || 0,
        whatsapp_clicks: enriched.whatsapp_clicks || 0,
        updated_at: now,
      };

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) {
        console.warn('[CloudSync] Supabase profile upsert note:', error.message);
      }
    } catch (err) {
      console.warn('[CloudSync] Supabase profile sync exception:', err);
    }
  }

  return enriched;
}

/**
 * Save photo to Cloud in Real Time (Server API + Supabase + Local)
 */
export async function saveCloudPhoto(photo: ServicePhoto): Promise<ServicePhoto> {
  const validPhotoId = toValidUuid(photo.id);
  const validProfileId = toValidUuid(photo.profile_id);

  const cleanPhoto: ServicePhoto = {
    ...photo,
    id: photo.id || validPhotoId,
    created_at: photo.created_at || new Date().toISOString(),
  };

  // 1. Save locally
  saveLocalGalleryPhoto(cleanPhoto);

  // 2. Post to Server API
  try {
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPhoto),
    });
  } catch (err) {
    console.warn('[CloudSync] Server gallery save note:', err);
  }

  // 3. Save to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('service_gallery').upsert({
        id: validPhotoId,
        profile_id: validProfileId,
        title: cleanPhoto.title || '',
        description: cleanPhoto.description || '',
        tag: cleanPhoto.tag || 'Instalação',
        image_url: cleanPhoto.image_url,
        created_at: cleanPhoto.created_at,
      });
      if (error) {
        console.warn('[CloudSync] Supabase gallery upsert note:', error.message);
      }
    } catch (err) {
      console.warn('[CloudSync] Supabase gallery exception:', err);
    }
  }

  return cleanPhoto;
}

/**
 * Delete photo from Cloud (Server API + Supabase + Local)
 */
export async function deleteCloudPhoto(profileId: string, photoId: string): Promise<void> {
  // 1. Call Server API
  try {
    await fetch(`/api/gallery/${encodeURIComponent(photoId)}?profile_id=${encodeURIComponent(profileId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[CloudSync] Server gallery delete note:', err);
  }

  // 2. Delete from Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      const validPhotoId = toValidUuid(photoId);
      await supabase.from('service_gallery').delete().or(`id.eq.${validPhotoId},id.eq.${photoId}`);
    } catch (err) {
      console.warn('[CloudSync] Supabase gallery delete exception:', err);
    }
  }
}

/**
 * Global Real-Time Listener: Subscribes to Server-Sent Events AND Supabase Realtime
 * Ensures any edits made on another computer or browser anywhere in the world
 * update this browser's state INSTANTLY!
 */
export function subscribeToGlobalRealtime(callbacks: {
  onProfileUpdated: (profile: Profile) => void;
  onProfileDeleted?: (id: string) => void;
  onPhotoAdded: (photo: ServicePhoto, profileId: string) => void;
  onPhotoDeleted: (photoId: string, profileId?: string) => void;
}): () => void {
  let eventSource: EventSource | null = null;
  let supabaseChannel: any = null;

  // 1. Connect to Server-Sent Events (SSE) stream
  try {
    eventSource = new EventSource('/api/realtime-stream');
    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'profile_updated' && msg.profile) {
          saveLocalProfile(msg.profile);
          callbacks.onProfileUpdated(msg.profile);
        } else if (msg.type === 'profile_deleted' && msg.id) {
          callbacks.onProfileDeleted?.(msg.id);
        } else if (msg.type === 'gallery_photo_added' && msg.photo) {
          saveLocalGalleryPhoto(msg.photo);
          callbacks.onPhotoAdded(msg.photo, msg.profileId || msg.photo.profile_id);
        } else if (msg.type === 'gallery_photo_deleted' && msg.photoId) {
          callbacks.onPhotoDeleted(msg.photoId, msg.profileId);
        }
      } catch (err) {
        // ignore non-json ping/pong
      }
    };
  } catch (err) {
    console.warn('[Realtime] Could not initialize SSE stream:', err);
  }

  // 2. Connect to Supabase Realtime channel
  const supabase = getSupabase();
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('public:global-cloud-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updatedProfile = payload.new as Profile;
              saveLocalProfile(updatedProfile);
              callbacks.onProfileUpdated(updatedProfile);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              callbacks.onProfileDeleted?.(payload.old.id);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'service_gallery' },
          (payload: any) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newPhoto = payload.new as ServicePhoto;
              saveLocalGalleryPhoto(newPhoto);
              callbacks.onPhotoAdded(newPhoto, newPhoto.profile_id);
            } else if (payload.eventType === 'DELETE' && payload.old) {
              callbacks.onPhotoDeleted(payload.old.id, payload.old.profile_id);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Realtime] Supabase Realtime channel error:', err);
    }
  }

  // Return cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
      supabaseChannel = null;
    }
  };
}

/**
 * Smart image upload:
 * 1. Tenta Supabase Storage (services-photos / service-photos)
 * 2. Se falhar por bloqueio de RLS ou erro de rede, faz upload no servidor (/api/upload)
 * Retorna uma URL pública permanente acessível globalmente.
 */
export async function uploadImageSmart(
  blobOrDataUrl: Blob | string,
  folder: string = 'servicos',
  filenameHint?: string
): Promise<string> {
  const supabase = getSupabase();
  const safeFilename = filenameHint || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;

  // 1. Tentar Supabase Storage se disponível
  if (supabase) {
    try {
      const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'servicos';
      const filePath = `${cleanFolder}/${safeFilename}`;
      let blob: Blob;

      if (typeof blobOrDataUrl === 'string') {
        const arr = blobOrDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        blob = blobOrDataUrl;
      }

      let uploadRes = await supabase.storage.from('services-photos').upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

      let targetBucket = 'services-photos';
      if (uploadRes.error && uploadRes.error.message?.toLowerCase().includes('bucket not found')) {
        uploadRes = await supabase.storage.from('service-photos').upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: true,
        });
        targetBucket = 'service-photos';
      }

      if (!uploadRes.error) {
        const { data: { publicUrl } } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
        if (publicUrl) return publicUrl;
      } else {
        console.warn('[CloudSync] Supabase Storage aviso:', uploadRes.error.message);
      }
    } catch (err) {
      console.warn('[CloudSync] Supabase Storage fallback:', err);
    }
  }

  // 2. Fallback de alta disponibilidade: POST /api/upload
  try {
    let base64String = '';
    if (typeof blobOrDataUrl === 'string') {
      base64String = blobOrDataUrl;
    } else {
      base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blobOrDataUrl);
      });
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64String, filename: safeFilename }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('[CloudSync] /api/upload fallback warning:', err);
  }

  // 3. Retorna a própria string se for data URL
  return typeof blobOrDataUrl === 'string' ? blobOrDataUrl : '';
}

/**
 * Sincroniza dados locais para a nuvem automaticamente.
 * Garante que qualquer foto ou alteração feita no navegador do usuário
 * seja propagada para o servidor e acessível em qualquer outro dispositivo.
 */
export async function autoSyncClientToCloud() {
  try {
    const localProfiles = getLocalProfiles();
    for (const p of localProfiles) {
      if (p && p.id) {
        fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).catch(() => {});

        const photos = getLocalGallery(p.id);
        if (photos && photos.length > 0) {
          for (const ph of photos) {
            fetch('/api/gallery', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ph),
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] autoSyncClientToCloud error:', err);
  }
}

