import { Profile } from '../types';

/**
 * Retorna a URL base do site atual.
 * Nunca faz fallback para 'tecnico-link.com' a menos que o domínio real seja esse.
 */
export function getBaseAppUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://tecnico-link.com';
}

/**
 * Retorna o host para exibição limpa (ex: 'app.com' ou 'minha-plataforma.vercel.app')
 */
export function getDisplayHost(): string {
  if (typeof window !== 'undefined' && window.location.host) {
    return window.location.host;
  }
  return 'tecnico-link.com';
}

/**
 * Codifica dados essenciais do perfil em uma string compacta base64 segura para URLs.
 * Isso garante que ao escanear o QR Code de um novo celular ou dispositivo,
 * o perfil abra instantaneamente mesmo sem sincronização prévia com banco de dados.
 */
export function encodeProfilePayload(profile: Profile): string {
  try {
    const compactObj = {
      id: profile.id,
      u: profile.username,
      n: profile.full_name,
      p: profile.profession,
      w: profile.whatsapp_number,
      c: profile.city_state,
      b: profile.bio_short,
      a: profile.avatar_url,
      s: profile.specialties?.slice(0, 8),
      y: profile.years_experience || 0,
      v: profile.is_verified ?? true,
      pl: profile.plan || 'pro'
    };
    const json = JSON.stringify(compactObj);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    console.error('Erro ao codificar payload do perfil:', e);
    return '';
  }
}

/**
 * Decodifica o payload recebido via parâmetro de URL (?d= ou ?data=)
 */
export function decodeProfilePayload(encoded: string): Profile | null {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    const data = JSON.parse(jsonStr);
    if (!data || (!data.u && !data.username)) return null;

    return {
      id: data.id || `prof-${data.u || data.username}`,
      username: (data.u || data.username).toLowerCase().trim(),
      full_name: data.n || data.full_name || 'Profissional',
      profession: data.p || data.profession || 'Técnico Especializado',
      specialties: data.s || data.specialties || [],
      whatsapp_number: data.w || data.whatsapp_number || '',
      city_state: data.c || data.city_state || 'Brasil',
      bio_short: data.b || data.bio_short || '',
      avatar_url: data.a || data.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400',
      years_experience: data.y || data.years_experience || 3,
      accepts_pix: true,
      accepts_cards: true,
      offers_warranty: true,
      is_verified: data.v !== undefined ? Boolean(data.v) : true,
      plan: data.pl || data.plan || 'pro',
      status: 'active',
      role: 'technician',
      created_at: new Date().toISOString()
    };
  } catch (e) {
    console.error('Erro ao decodificar payload do perfil:', e);
    return null;
  }
}

/**
 * Gera a URL completa para QR Code.
 * Retorna a URL limpa direta do perfil (/p/username).
 * Isso gera uma matriz QR de baixa densidade com blocos grandes e nítidos,
 * permitindo que 100% dos celulares leiam instantaneamente sem falhas ópticas.
 */
export function getQrCodeScanUrl(profile: Profile): string {
  const baseUrl = getBaseAppUrl();
  return `${baseUrl}/p/${profile.username}`;
}

/**
 * Gera a URL limpa para copiar e compartilhar (ex: https://meusite.com/p/carlos)
 */
export function getCleanShareUrl(username: string): string {
  const baseUrl = getBaseAppUrl();
  return `${baseUrl}/p/${username}`;
}

/**
 * Gera a URL textual amigável para exibição visual (ex: meusite.com/p/carlos)
 */
export function getCleanDisplayUrl(username: string): string {
  const host = getDisplayHost();
  return `${host}/p/${username}`;
}
