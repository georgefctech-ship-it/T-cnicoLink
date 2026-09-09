import { Profile, ServicePhoto, Testimonial, SystemSettings } from '../types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  allow_self_registration: true,
  require_profile_approval: false,
  free_plan_photo_limit: 6,
  pro_plan_photo_limit: 30,
  free_plan_monthly_views: 100, // limite de 100 acessos no plano Free
  pro_plan_monthly_views: 2500, // limite de 2500 acessos no plano PRO
  price_pro_monthly: 29.90,
  price_pro_yearly: 290.00,
  admin_pix_key: 'georgefctec@gmail.com',
  admin_pix_name: 'George - TécnicoLink SaaS',
  admin_whatsapp_billing: '5541999998888',
  enable_access_paywall: true,
  enable_verified_badges: true,
  maintenance_mode: false,
  enable_watermark: true,
};

export const ADMIN_MASTER_PROFILE: Profile = {
  id: 'prof-admin',
  user_id: 'user-admin',
  full_name: 'George Ferreira Costa (Admin Master)',
  username: 'george-admin',
  profession: 'Gestor & Administrador da Plataforma',
  specialties: ['Gestão de Plataforma', 'Moderação', 'Aprovação de Técnicos', 'Configuração Supabase'],
  whatsapp_number: '(15) 99999-8888',
  phone_number: '(15) 99999-8888',
  bio_short: 'Conta de Administrador Master do TécnicoLink. Controle total sobre perfis, limites de planos, moderação de fotos e políticas de segurança.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  cover_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
  city_state: 'Boituva - SP',
  years_experience: 10,
  accepts_pix: true,
  accepts_cards: true,
  offers_warranty: true,
  rating: 5.0,
  review_count: 99,
  role: 'admin',
  status: 'active',
  plan: 'enterprise',
  is_verified: true,
  max_photos: 100,
  views_count: 1420,
  whatsapp_clicks: 340,
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
};

export const INITIAL_PROFILES: Profile[] = [
  ADMIN_MASTER_PROFILE,
  {
    id: 'prof-1',
    user_id: 'user-1',
    full_name: 'Jhonatas Climatização',
    username: 'jhonatas-climatizacao',
    profession: 'Técnico em Refrigeração & Ar-Condicionado',
    specialties: ['Instalação Split Inverter', 'Higienização Química', 'Carga de Gás R410/R32', 'Contratos PMOC'],
    whatsapp_number: '(15) 98819-3561',
    phone_number: '(15) 98819-3561',
    bio_short: 'Especialista em climatização residencial e comercial. Instalações com bomba de vácuo, teste de estanqueidade com nitrogênio e 1 ano de garantia.',
    avatar_url: '',
    cover_url: '',
    city_state: 'Boituva - SP',
    years_experience: 9,
    accepts_pix: true,
    accepts_cards: true,
    offers_warranty: true,
    rating: 5.0,
    review_count: 54,
    role: 'technician',
    status: 'active',
    plan: 'pro',
    is_verified: true,
    max_photos: 30,
    views_count: 780,
    whatsapp_clicks: 194,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'prof-2',
    user_id: 'user-2',
    full_name: 'Felipe Santos Cell',
    username: 'felipe-smartphones',
    profession: 'Manutenção de Celulares & Smartphones',
    specialties: ['Troca de Telas & Baterias', 'Reparo de Placas iPhone/Android', 'Troca de Vidro Apple Watch', 'Desoxidação'],
    whatsapp_number: '(21) 99881-3322',
    phone_number: '(21) 99881-3322',
    bio_short: 'Laboratório técnico com bancada antiestática e microscópio trinocular. Troca de telas na hora com peças originais e garantia expressa.',
    avatar_url: '',
    cover_url: '',
    city_state: 'Rio de Janeiro - RJ',
    years_experience: 7,
    accepts_pix: true,
    accepts_cards: true,
    offers_warranty: true,
    rating: 4.9,
    review_count: 68,
    role: 'technician',
    status: 'active',
    plan: 'pro',
    is_verified: true,
    max_photos: 30,
    views_count: 615,
    whatsapp_clicks: 162,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'prof-3',
    user_id: 'user-3',
    full_name: 'Eng. Renato Prado Eletrônica',
    username: 'renato-eletronica',
    profession: 'Técnico em Eletrônica & Placas',
    specialties: ['Conserto Smart TVs 4K/OLED', 'Fontes Chaveadas', 'Inversores de Frequência', 'Microsoldagem SMD/BGA'],
    whatsapp_number: '(31) 98712-4400',
    phone_number: '(31) 98712-4400',
    bio_short: 'Diagnóstico preciso em osciloscópio digital e estação de retrabalho BGA. Reparo de módulos industriais, nobreaks de alta potência e placas de TVs modernas.',
    avatar_url: '',
    cover_url: '',
    city_state: 'Belo Horizonte - MG',
    years_experience: 14,
    accepts_pix: true,
    accepts_cards: true,
    offers_warranty: true,
    rating: 5.0,
    review_count: 42,
    role: 'technician',
    status: 'active',
    plan: 'pro',
    is_verified: true,
    max_photos: 30,
    views_count: 530,
    whatsapp_clicks: 128,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'prof-4',
    user_id: 'user-4',
    full_name: 'Lucas Designer 3D',
    username: 'lucas-modelagem3d',
    profession: 'Modelagem 3D & Prototipagem',
    specialties: ['Impressão 3D Resina e FDM', 'Modelagem Paramétrica CAD', 'Colecionáveis & Miniaturas', 'Peças Sob Medida'],
    whatsapp_number: '(41) 99182-7766',
    phone_number: '(41) 99182-7766',
    bio_short: 'Criação de modelos 3D industriais, moldes e estátuas de alta definição. Impressões em altíssima resolução com pós-processamento profissional e pintura.',
    avatar_url: '',
    cover_url: '',
    city_state: 'Curitiba - PR',
    years_experience: 6,
    accepts_pix: true,
    accepts_cards: true,
    offers_warranty: true,
    rating: 4.9,
    review_count: 31,
    role: 'technician',
    status: 'active',
    plan: 'pro',
    is_verified: true,
    max_photos: 30,
    views_count: 440,
    whatsapp_clicks: 98,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'prof-5',
    user_id: 'user-5',
    full_name: 'Juliana Bolos & Doces Finos',
    username: 'juliana-confeitaria',
    profession: 'Confeitaria Artística de Festas',
    specialties: ['Bolos Decorados em Chantininho', 'Doces Finos para Casamentos', 'Kit Festa Personalizado', 'Macarons Franceses'],
    whatsapp_number: '(51) 99344-5511',
    phone_number: '(51) 99344-5511',
    bio_short: 'Transformando momentos especiais em sabores inesquecíveis. Bolos artísticos sob encomenda com ingredientes premium, chocolates nobres e finalização impecável.',
    avatar_url: '',
    cover_url: '',
    city_state: 'Porto Alegre - RS',
    years_experience: 8,
    accepts_pix: true,
    accepts_cards: true,
    offers_warranty: true,
    rating: 5.0,
    review_count: 89,
    role: 'technician',
    status: 'active',
    plan: 'pro',
    is_verified: true,
    max_photos: 30,
    views_count: 920,
    whatsapp_clicks: 275,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  }
];

// Galeria inicial 100% vazia - exibe estritamente as fotos e links adicionados pelo próprio usuário
export const INITIAL_GALLERY: Record<string, ServicePhoto[]> = {};

// Função estrita que identifica e remove fotos de demonstração/mock antigas
export function isMockDemoPhoto(photo: { id?: string; image_url?: string; title?: string } | null | undefined): boolean {
  if (!photo || !photo.image_url) return true;
  const url = photo.image_url.toLowerCase();
  
  // Detecta URLs de fotos de demonstração do Unsplash que foram usadas como mock
  if (
    url.includes('photo-1621905252507') ||
    url.includes('photo-1585338107529') ||
    url.includes('photo-1590496793929') ||
    url.includes('photo-1621905251189') ||
    url.includes('photo-1581092') ||
    url.includes('photo-1556911220') ||
    url.includes('photo-1589939705384') ||
    url.includes('photo-1607472586893') ||
    url.includes('photo-1540569014015') ||
    url.includes('photo-1539571696357') ||
    url.includes('photo-1507003211169') ||
    url.includes('photo-1500648767791') ||
    url.includes('photo-1573496359142')
  ) {
    return true;
  }
  
  // Fotos com IDs de mock antigos
  if (photo.id && (
    photo.id.startsWith('e1a00000-0000-4000-8000-00000000001') ||
    photo.id === 'test-photo-1' ||
    photo.id === 'test-photo-2'
  )) {
    return true;
  }
  
  return false;
}

export const INITIAL_TESTIMONIALS: Record<string, Testimonial[]> = {
  'prof-1': [
    {
      id: 'test-1',
      profile_id: 'prof-1',
      client_name: 'Juliana Mendes',
      client_neighborhood: 'Moema, São Paulo',
      comment: 'O Jhonatas instalou 3 aparelhos de ar split no meu apartamento. Fez todo o teste de vácuo, não deixou nem poeira na parede e o atendimento foi rápido!',
      rating: 5,
      service_type: 'Instalação Split Inverter',
      date: 'Há 1 semana'
    },
    {
      id: 'test-2',
      profile_id: 'prof-1',
      client_name: 'Roberto Alencar',
      client_neighborhood: 'Pinheiros, São Paulo',
      comment: 'Excelente técnico. Higienizou o ar-condicionado do meu escritório e acabou de vez com o cheiro de umidade.',
      rating: 5,
      service_type: 'Higienização Química',
      date: 'Há 3 semanas'
    }
  ],
  'prof-2': [
    {
      id: 'test-201',
      profile_id: 'prof-2',
      client_name: 'Camila Vasconcelos',
      client_neighborhood: 'Barra da Tijuca, RJ',
      comment: 'Trocou a tela do meu iPhone em menos de 40 minutos com peça original. O touch ficou perfeito e ele me deu garantia de 6 meses.',
      rating: 5,
      service_type: 'Troca de Tela iPhone',
      date: 'Há 3 dias'
    }
  ],
  'prof-5': [
    {
      id: 'test-501',
      profile_id: 'prof-5',
      client_name: 'Fernanda Diniz',
      client_neighborhood: 'Moinhos de Vento, Porto Alegre',
      comment: 'O bolo de aniversário da minha filha foi a atração da festa! Além de lindo de tirar o fôlego, o sabor estava divino e super molhadinho.',
      rating: 5,
      service_type: 'Bolo Artístico Infantil',
      date: 'Há 5 dias'
    }
  ]
};
