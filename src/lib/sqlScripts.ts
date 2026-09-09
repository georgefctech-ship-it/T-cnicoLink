export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- 🚀 TÉCNICOLINK - SCRIPT SQL COMPLETO & UNIFICADO (SUPABASE / POSTGRESQL)
-- Criação de Tabelas, RLS Universal, Storage, Tráfego e Sincronização em Tempo Real
-- Execute este script completo no SQL Editor do seu Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL DEFAULT 'Profissional Técnico',
    username TEXT UNIQUE NOT NULL,
    profession TEXT NOT NULL DEFAULT 'Técnico Especialista',
    specialties TEXT[] DEFAULT '{}',
    whatsapp_number TEXT NOT NULL DEFAULT '(11) 99999-9999',
    phone_number TEXT,
    bio_short TEXT DEFAULT 'Atendimento ágil, pontualidade e serviço com garantia.',
    avatar_url TEXT,
    cover_url TEXT,
    city_state TEXT NOT NULL DEFAULT 'Boituva - SP',
    years_experience INTEGER DEFAULT 1,
    accepts_pix BOOLEAN DEFAULT true,
    accepts_cards BOOLEAN DEFAULT true,
    offers_warranty BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    -- Colunas de Monetização, Limite e RBAC:
    role TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'technician', 'visitor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    is_verified BOOLEAN DEFAULT false,
    max_photos INTEGER DEFAULT 30,
    monthly_views_limit INTEGER DEFAULT 2500,
    views_count INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Remove restrição de chave estrangeira com auth.users se ela existir (permite sincronizar perfis universais)
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Garantir colunas caso a tabela já existisse anteriormente (migração segura)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'technician',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_photos INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS monthly_views_limit INTEGER DEFAULT 2500,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_city_state ON public.profiles(city_state);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- 3. TABELA DE GALERIA DE SERVIÇOS (service_gallery)
CREATE TABLE IF NOT EXISTS public.service_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tag TEXT DEFAULT 'Instalação',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Remove FK restritiva em service_gallery se existir para garantir inserções fluidas
ALTER TABLE IF EXISTS public.service_gallery DROP CONSTRAINT IF EXISTS service_gallery_profile_id_fkey;

CREATE INDEX IF NOT EXISTS idx_gallery_profile_id ON public.service_gallery(profile_id);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.service_gallery(created_at DESC);

-- 4. TABELA DE DEPOIMENTOS / AVALIAÇÕES (testimonials)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL,
    client_name TEXT NOT NULL,
    client_neighborhood TEXT DEFAULT '',
    comment TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    service_type TEXT DEFAULT 'Atendimento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE IF EXISTS public.testimonials DROP CONSTRAINT IF EXISTS testimonials_profile_id_fkey;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS client_neighborhood TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_testimonials_profile_id ON public.testimonials(profile_id);

-- 5. ATIVAÇÃO DE ROW LEVEL SECURITY UNIVERSAL (Impede erro 42501 e permite sincronia entre navegadores)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Limpa políticas restritivas antigas
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Perfis são visíveis publicamente" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permissao universal perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir sincronização de perfis" ON public.profiles;

-- Política Universal de Perfis
CREATE POLICY "Permissao universal perfis" 
    ON public.profiles FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Limpa políticas de galeria
DROP POLICY IF EXISTS "Public gallery read" ON public.service_gallery;
DROP POLICY IF EXISTS "Fotos dos serviços são visíveis publicamente" ON public.service_gallery;
DROP POLICY IF EXISTS "Users insert photos with limit" ON public.service_gallery;
DROP POLICY IF EXISTS "Usuários podem adicionar fotos à sua própria galeria" ON public.service_gallery;
DROP POLICY IF EXISTS "Users can update own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Permissao universal galeria" ON public.service_gallery;
DROP POLICY IF EXISTS "Permitir sincronização de galeria" ON public.service_gallery;

-- Política Universal de Galeria (Fotos aparecem e sincronizam em todos os navegadores)
CREATE POLICY "Permissao universal galeria" 
    ON public.service_gallery FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Limpa e cria políticas de depoimentos
DROP POLICY IF EXISTS "Public testimonials read" ON public.testimonials;
DROP POLICY IF EXISTS "Public can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users manage own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Permissao universal depoimentos" ON public.testimonials;

CREATE POLICY "Permissao universal depoimentos" 
    ON public.testimonials FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 6. CONCEDE PERMISSÕES NO POSTGRESQL PARA ANON E AUTHENTICATED
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.service_gallery TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.testimonials TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 7. BUCKETS DE STORAGE ('services-photos', 'service-photos', 'avatars')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('services-photos', 'services-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('service-photos', 'service-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

-- Políticas de Storage 100% Públicas (Carrega em qualquer celular, computador ou WhatsApp)
DROP POLICY IF EXISTS "Acesso público às fotos de serviços" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem enviar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir gerenciamento de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao de fotos" ON storage.objects;

CREATE POLICY "Permitir leitura pública de fotos"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir upload de fotos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir gerenciamento de fotos"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'))
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir exclusao de fotos"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

-- 8. PUBLICAÇÃO REALTIME GLOBAL (Sincroniza sem atualizar página)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'service_gallery'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_gallery;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'testimonials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
  END IF;
END $$;
`;

export const STORAGE_FIX_SQL_SCRIPT = `-- ================================================================
-- SCRIPT DE DESBLOQUEIO DE IMAGENS E STORAGE (SUPABASE)
-- Execute no SQL Editor do Supabase se o envio de fotos estiver travando
-- ou se as fotos não aparecerem para visitantes em outros navegadores.
-- ================================================================

-- 1. Garante buckets públicos para fotos e avatares (até 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('services-photos', 'services-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('service-photos', 'service-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

-- 2. Limpa políticas restritivas que travam o upload
DROP POLICY IF EXISTS "Acesso público às fotos de serviços" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem enviar fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir gerenciamento de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao de fotos" ON storage.objects;

-- 3. Libera visualização pública (para qualquer cliente ver a foto no site)
CREATE POLICY "Permitir leitura pública de fotos"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

-- 4. Libera upload de imagens no painel
CREATE POLICY "Permitir upload de fotos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

-- 5. Libera atualização e exclusão
CREATE POLICY "Permitir gerenciamento de fotos"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'))
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir exclusao de fotos"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));
`;

export const GLOBAL_REALTIME_SQL_SCRIPT = `-- ==============================================================================
-- 🚀 SCRIPT DE SINCRONIZAÇÃO TOTAL ENTRE NAVEGADORES E CONTAS (SUPABASE)
-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)
-- 
-- Resolve 100% o problema de alterações e fotos que só aparecem em um navegador
-- Desativa os bloqueios de segurança (RLS 42501) que impedem gravação pública
-- e ativa a transmissão em tempo real para todos os dispositivos e contas.
-- ==============================================================================

-- 1. Remove restrição que impede perfis sem conta no auth.users
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.service_gallery DROP CONSTRAINT IF EXISTS service_gallery_profile_id_fkey;
ALTER TABLE IF EXISTS public.testimonials DROP CONSTRAINT IF EXISTS testimonials_profile_id_fkey;

-- 2. Habilita RLS flexível nas tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 3. Limpa todas as políticas antigas que causavam bloqueio 42501
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Perfis são visíveis publicamente" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permissao universal perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura de perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permitir sincronização de perfis" ON public.profiles;

DROP POLICY IF EXISTS "Public gallery read" ON public.service_gallery;
DROP POLICY IF EXISTS "Fotos dos serviços são visíveis publicamente" ON public.service_gallery;
DROP POLICY IF EXISTS "Users insert photos with limit" ON public.service_gallery;
DROP POLICY IF EXISTS "Usuários podem adicionar fotos à sua própria galeria" ON public.service_gallery;
DROP POLICY IF EXISTS "Users can update own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Users can delete own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Permissao universal galeria" ON public.service_gallery;
DROP POLICY IF EXISTS "Permitir leitura de galeria" ON public.service_gallery;
DROP POLICY IF EXISTS "Permitir sincronização de galeria" ON public.service_gallery;

DROP POLICY IF EXISTS "Public testimonials read" ON public.testimonials;
DROP POLICY IF EXISTS "Public can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Users manage own testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Permissao universal depoimentos" ON public.testimonials;

-- 4. Cria Políticas Universais de Leitura e Gravação (Sincronização 100% Livre)
CREATE POLICY "Permissao universal perfis" 
    ON public.profiles FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permissao universal galeria" 
    ON public.service_gallery FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Permissao universal depoimentos" 
    ON public.testimonials FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. Concede permissões para anon e authenticated
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.service_gallery TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.testimonials TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6. Garante Buckets de Storage Públicos para fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('services-photos', 'services-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('service-photos', 'service-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']),
    ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir gerenciamento de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao de fotos" ON storage.objects;

CREATE POLICY "Permitir leitura pública de fotos"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir upload de fotos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir gerenciamento de fotos"
    ON storage.objects FOR UPDATE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'))
    WITH CHECK (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

CREATE POLICY "Permitir exclusao de fotos"
    ON storage.objects FOR DELETE
    USING (bucket_id IN ('services-photos', 'service-photos', 'avatars'));

-- 7. Habilita publicação Realtime do Supabase (WebSockets ativos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'service_gallery'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_gallery;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'testimonials'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
  END IF;
END $$;
`;



