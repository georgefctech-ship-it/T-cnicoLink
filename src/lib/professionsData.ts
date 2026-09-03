export interface ProfessionCategory {
  category: string;
  icon: string;
  professions: string[];
}

export const PROFESSIONS_CATEGORIES: ProfessionCategory[] = [
  {
    category: 'Elétrica & Energia',
    icon: '⚡',
    professions: [
      'Eletricista Residencial e Comercial',
      'Eletricista Predial & Padrão de Entrada',
      'Eletricista Industrial & Comandos',
      'Instalador de Energia Solar / Fotovoltaica',
      'Montador de Quadros Elétricos & Disjuntores',
      'Iluminação Decorativa & LED',
      'Instalador de Geradores Elétricos'
    ]
  },
  {
    category: 'Climatização & Refrigeração',
    icon: '❄️',
    professions: [
      'Técnico em Climatização & Ar-Condicionado',
      'Instalador de Ar-Condicionado Split & Inverter',
      'Higienização & Limpeza de Ar-Condicionado (PMOC)',
      'Técnico em Refrigeração Residencial (Geladeiras / Freezers)',
      'Refrigeração Comercial & Câmaras Frigoríficas',
      'Manutenção de Lava e Seca & Máquinas de Lavar'
    ]
  },
  {
    category: 'Hidráulica & Gás',
    icon: '💧',
    professions: [
      'Encanador Residencial & Predial',
      'Caça-Vazamentos Especializado (Geofone)',
      'Instalador & Técnico de Aquecedores a Gás',
      'Desentupidora & Limpeza de Caixas de Gordura',
      'Bombeiro Hidráulico & Redes de Água',
      'Instalação de Válvulas Hydra & Louças Sanitárias'
    ]
  },
  {
    category: 'Construção Civil & Reformas',
    icon: '🏗️',
    professions: [
      'Pedreiro & Reformas Gerais',
      'Azulejista & Assentador de Porcelanato',
      'Gesseiro, Sancas & Drywall',
      'Pintor Profissional, Texturas & Grafiato',
      'Pintor de Fachadas & Altura (NR-35)',
      'Telhadista, Calhas & Rufos',
      'Impermeabilização & Tratamento de Infiltrações',
      'Mestre de Obras & Gerenciamento de Reformas'
    ]
  },
  {
    category: 'Marcenaria & Móveis',
    icon: '🪵',
    professions: [
      'Marceneiro de Móveis Planejados',
      'Montador de Móveis Residencial & Comercial',
      'Restauração & Laqueamento de Móveis',
      'Instalador de Pisos Laminados & Vinílicos',
      'Carpinteiro & Estruturas de Madeira'
    ]
  },
  {
    category: 'Segurança Eletrônica & Automação',
    icon: '📹',
    professions: [
      'Instalador de CFTV & Câmeras de Segurança',
      'Alarmes, Cerca Elétrica & Concertina',
      'Automatização de Portões Eletrônicos',
      'Interfonia & Fechaduras Digitais / Biometria',
      'Controle de Acesso Predial & Comercial',
      'Automação Residencial & Casa Inteligente'
    ]
  },
  {
    category: 'Tecnologia & Informática',
    icon: '💻',
    professions: [
      'Técnico em Informática & Manutenção de PCs',
      'Redes, Wi-Fi & Cabeamento Estruturado',
      'Manutenção de Notebooks & MacBooks',
      'Técnico em Manutenção de Celulares & Tablets',
      'Recuperação de Dados & Suporte Técnico'
    ]
  },
  {
    category: 'Serralheria & Vidraçaria',
    icon: '🔩',
    professions: [
      'Serralheiro de Ferro, Aço & Portões',
      'Serralheria de Alumínio & Esquadrias',
      'Vidraceiro, Box Blindex & Espelhos',
      'Soldador Especializado (TIG / MIG / Eletrodo)',
      'Estruturas Metálicas & Coberturas'
    ]
  },
  {
    category: 'Automotivo & Mecânica',
    icon: '🚗',
    professions: [
      'Mecânico Automotivo Especializado',
      'Eletricista Automotivo & Diagnóstico',
      'Funilaria & Pintura Automotiva',
      'Martelinho de Ouro & Estética Automotiva',
      'Instalador de Som & Acessórios Automotivos',
      'Borracharia, Pneus & Alinhamento'
    ]
  },
  {
    category: 'Serviços Gerais & Manutenção',
    icon: '🛠️',
    professions: [
      'Marido de Aluguel & Pequenos Reparos',
      'Chaveiro 24 Horas & Aberturas Rápidas',
      'Jardinagem, Paisagismo & Poda de Árvores',
      'Tratador de Piscinas & Manutenção de Bombas',
      'Limpeza Pós-Obra Especializada',
      'Dedetizadora & Controle de Pragas',
      'Instalador de Cortinas, Persianas & Varões',
      'Tapeçaria & Higienização de Estofados'
    ]
  }
];

// Flat array of all predefined professions
export const ALL_PROFESSIONS_FLAT = PROFESSIONS_CATEGORIES.flatMap(c => 
  c.professions.map(p => ({
    name: p,
    category: c.category,
    icon: c.icon
  }))
);

export function searchProfessions(query: string) {
  if (!query || query.trim() === '') {
    return ALL_PROFESSIONS_FLAT.slice(0, 15);
  }
  const clean = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ALL_PROFESSIONS_FLAT.filter(item => {
    const itemClean = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const catClean = item.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return itemClean.includes(clean) || catClean.includes(clean);
  });
}
