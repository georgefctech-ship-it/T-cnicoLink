export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- 🚀 TÉCNICOLINK - SCRIPT SQL COMPLETO & UNIFICADO (SUPABASE / POSTGRESQL)
-- Criação de Tabelas, RLS, Storage, Monetização, Tráfego e Trigger de Usuários
-- Execute este script completo no SQL Editor do seu Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS (profiles)
-- Armazena dados cadastrais, planos (free/pro), limites de tráfego e cargo (role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Profissional Técnico',
    username TEXT UNIQUE NOT NULL,
    profession TEXT NOT NULL DEFAULT 'Técnico Especialista',
    specialties TEXT[] DEFAULT '{}',
    whatsapp_number TEXT NOT NULL DEFAULT '(11) 99999-9999',
    phone_number TEXT,
    bio_short TEXT DEFAULT 'Atendimento ágil, pontualidade e serviço com garantia.',
    avatar_url TEXT,
    cover_url TEXT,
    city_state TEXT NOT NULL DEFAULT 'São Paulo - SP',
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
    max_photos INTEGER DEFAULT 6,
    monthly_views_limit INTEGER DEFAULT 100,
    views_count INTEGER DEFAULT 0,
    whatsapp_clicks INTEGER DEFAULT 0,
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir colunas caso a tabela já existisse anteriormente (migração segura)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'technician',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_photos INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS monthly_views_limit INTEGER DEFAULT 100,
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
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tag TEXT DEFAULT 'Instalação',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_profile_id ON public.service_gallery(profile_id);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.service_gallery(created_at DESC);

-- 4. TABELA DE DEPOIMENTOS / AVALIAÇÕES (testimonials)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    service_type TEXT DEFAULT 'Atendimento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_testimonials_profile_id ON public.testimonials(profile_id);

-- 5. FUNÇÃO AUXILIAR DE ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS RLS PARA PROFILES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
DROP POLICY IF EXISTS "Perfis são visíveis publicamente" ON public.profiles;
CREATE POLICY "Public profiles read"
    ON public.profiles FOR SELECT
    USING (status = 'active' OR public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((auth.uid() = id AND status = 'active') OR public.is_admin())
    WITH CHECK ((auth.uid() = id AND status = 'active') OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem deletar seu próprio perfil" ON public.profiles;
CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

-- 8. POLÍTICAS RLS PARA SERVICE_GALLERY
DROP POLICY IF EXISTS "Public gallery read" ON public.service_gallery;
DROP POLICY IF EXISTS "Fotos dos serviços são visíveis publicamente" ON public.service_gallery;
CREATE POLICY "Public gallery read"
    ON public.service_gallery FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = service_gallery.profile_id 
            AND profiles.status = 'active'
        )
        OR public.is_admin()
        OR profile_id = auth.uid()
    );

DROP POLICY IF EXISTS "Users insert photos with limit" ON public.service_gallery;
DROP POLICY IF EXISTS "Usuários podem adicionar fotos à sua própria galeria" ON public.service_gallery;
CREATE POLICY "Users insert photos with limit"
    ON public.service_gallery FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.uid() = profile_id AND EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active'
        ))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Usuários podem editar fotos da sua própria galeria" ON public.service_gallery;
CREATE POLICY "Users can update own photos"
    ON public.service_gallery FOR UPDATE
    TO authenticated
    USING (auth.uid() = profile_id OR public.is_admin())
    WITH CHECK (auth.uid() = profile_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own photos" ON public.service_gallery;
DROP POLICY IF EXISTS "Usuários podem remover fotos da sua própria galeria" ON public.service_gallery;
CREATE POLICY "Users can delete own photos"
    ON public.service_gallery FOR DELETE
    TO authenticated
    USING (auth.uid() = profile_id OR public.is_admin());

-- 9. POLÍTICAS RLS PARA TESTIMONIALS
DROP POLICY IF EXISTS "Public testimonials read" ON public.testimonials;
CREATE POLICY "Public testimonials read"
    ON public.testimonials FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users manage own testimonials" ON public.testimonials;
CREATE POLICY "Users manage own testimonials"
    ON public.testimonials FOR ALL
    TO authenticated
    USING (auth.uid() = profile_id OR public.is_admin())
    WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- 10. BUCKET DE STORAGE ('services-photos')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'services-photos',
    'services-photos',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage
DROP POLICY IF EXISTS "Acesso público às fotos de serviços" ON storage.objects;
CREATE POLICY "Acesso público às fotos de serviços"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'services-photos');

DROP POLICY IF EXISTS "Usuários autenticados podem enviar fotos" ON storage.objects;
CREATE POLICY "Usuários autenticados podem enviar fotos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'services-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON storage.objects;
CREATE POLICY "Usuários podem atualizar suas próprias fotos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'services-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON storage.objects;
CREATE POLICY "Usuários podem deletar suas próprias fotos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'services-photos' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- 11. TRIGGER PARA AUTO-CRIAÇÃO DE PERFIL NO CADASTRO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    profession,
    whatsapp_number,
    city_state,
    bio_short,
    role,
    plan,
    status
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Profissional Técnico'),
    COALESCE(new.raw_user_meta_data->>'username', 'tecnico-' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'profession', 'Técnico Especialista'),
    COALESCE(new.raw_user_meta_data->>'whatsapp_number', '(11) 99999-9999'),
    COALESCE(new.raw_user_meta_data->>'city_state', 'São Paulo - SP'),
    'Profissional qualificado com atendimento rápido e pontual.',
    'technician',
    'free',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

