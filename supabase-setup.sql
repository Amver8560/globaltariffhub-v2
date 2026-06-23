-- ─────────────────────────────────────────────────────────────
-- GTH — Supabase Schema Setup
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  credits_used INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  plan TEXT DEFAULT 'free',           -- 'free' | 'monthly' | 'annual'
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS — cada usuario solo ve su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Historial de consultas (para el dashboard futuro)
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,               -- 'M01' | 'M03' | 'M04' | 'M05'
  tariff_code TEXT,
  origin_country TEXT,
  destination_country TEXT,
  result_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultations"
  ON public.consultations INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- VERIFICAR que se creó correctamente:
-- SELECT * FROM public.profiles LIMIT 5;
-- SELECT * FROM public.consultations LIMIT 5;
-- ─────────────────────────────────────────────────────────────
