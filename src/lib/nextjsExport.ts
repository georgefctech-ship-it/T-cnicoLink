export const NEXTJS_APP_ROUTER_CODE = {
  envExample: `# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`,
  supabaseClient: `// lib/supabase.ts (Client Component)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`,
  middleware: `// middleware.ts (Protege a rota /painel)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (request.nextUrl.pathname.startsWith('/painel') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/painel/:path*'],
};
`,
  publicProfilePage: `// app/p/[username]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MessageSquare, MapPin, CheckCircle, ShieldCheck, Star, Phone } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: { username: string };
}

// Geração de Metadata dinâmico para SEO e compartilhamento no WhatsApp
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, profession, bio_short, avatar_url, city_state')
    .eq('username', params.username)
    .single();

  if (!profile) return { title: 'Profissional Não Encontrado' };

  return {
    title: \`\${profile.full_name} - \${profile.profession} em \${profile.city_state}\`,
    description: profile.bio_short,
    openGraph: {
      title: \`\${profile.full_name} | \${profile.profession}\`,
      description: profile.bio_short,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: photos } = await supabase
    .from('service_gallery')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false });

  const rawPhone = profile.whatsapp_number.replace(/\\D/g, '');
  const cleanPhone = rawPhone.startsWith('55') ? rawPhone : \`55\${rawPhone}\`;
  const defaultMsg = encodeURIComponent(
    \`Olá \${profile.full_name}, vi seu portfólio no TécnicoLink e gostaria de um orçamento para um serviço!\`
  );
  const whatsappUrl = \`https://wa.me/\${cleanPhone}?text=\${defaultMsg}\`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">
      {/* Top Banner */}
      <div className="relative h-44 bg-gradient-to-r from-amber-600 via-amber-700 to-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
      </div>

      {/* Profile Info Container */}
      <div className="max-w-lg mx-auto px-4 -mt-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative">
          <div className="flex items-start gap-4">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789'}
              alt={profile.full_name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-zinc-900 shadow-md ring-2 ring-amber-500/50"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                  Profissional Verificado
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1 truncate">{profile.full_name}</h1>
              <p className="text-sm font-medium text-amber-500">{profile.profession}</p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>{profile.city_state}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-300 mt-4 leading-relaxed bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
            {profile.bio_short}
          </p>

          {/* Quick Highlights */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-center">
            <div className="bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
              <span className="block text-base font-bold text-amber-400">100%</span>
              <span className="text-[11px] text-zinc-400">Garantia</span>
            </div>
            <div className="bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
              <span className="block text-base font-bold text-emerald-400">Rápido</span>
              <span className="text-[11px] text-zinc-400">No WhatsApp</span>
            </div>
            <div className="bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/50">
              <span className="block text-base font-bold text-amber-400">PIX/Cartão</span>
              <span className="text-[11px] text-zinc-400">Facilitado</span>
            </div>
          </div>
        </div>

        {/* Galeria de Fotos */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Trabalhos Realizados</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
                {photos?.length || 0} fotos
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos?.map((photo) => (
              <div key={photo.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title || 'Serviço realizado'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.tag && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-900/90 text-amber-400 text-xs font-semibold rounded backdrop-blur-sm border border-zinc-700">
                      {photo.tag}
                    </span>
                  )}
                </div>
                {(photo.title || photo.description) && (
                  <div className="p-3.5">
                    {photo.title && <h3 className="font-semibold text-sm text-zinc-100 mb-1">{photo.title}</h3>}
                    {photo.description && <p className="text-xs text-zinc-400 leading-relaxed">{photo.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA WhatsApp */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-40">
        <div className="max-w-lg mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-zinc-950 font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all text-base"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>SOLICITAR ORÇAMENTO NO WHATSAPP</span>
          </a>
        </div>
      </div>
    </main>
  );
}
`,
  painelPage: `// app/painel/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Trash2, Link as LinkIcon, Check, Plus, AlertCircle, Save } from 'lucide-react';

export default function PainelPage() {
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    profession: '',
    whatsapp_number: '',
    city_state: '',
    bio_short: '',
    avatar_url: '',
  });
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Upload handler para o Supabase Storage ('services-photos')
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const fileExt = file.name.split('.').pop();
      const filePath = \`\${user.id}/\${Date.now()}.\${fileExt}\`;

      const { error: uploadError } = await supabase.storage
        .from('services-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('services-photos')
        .getPublicUrl(filePath);

      // Salva no banco de dados service_gallery
      const { data: newPhoto, error: dbError } = await supabase
        .from('service_gallery')
        .insert({
          profile_id: user.id,
          image_url: publicUrl,
          title: 'Novo Serviço',
          description: '',
          tag: 'Instalação'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      setPhotos([newPhoto, ...photos]);
    } catch (error: any) {
      alert(error.message || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Painel do Profissional</h1>
        {/* Formulário & Galeria */}
      </div>
    </div>
  );
}
`
};
