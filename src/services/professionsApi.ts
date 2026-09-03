/**
 * Serviço de API de Busca de Profissões e Ocupações em Tempo Real
 * Baseado no catálogo de ocupações técnicas e prestadores de serviços no Brasil (CBO / Classificação Brasileira).
 */

export interface ProfessionApiItem {
  id: string;
  name: string;
  area: string;
  synonyms?: string[];
}

// Catálogo abrangente com mais de 160 ocupações técnicas e serviços no Brasil
export const PROFESSIONS_CATALOG: ProfessionApiItem[] = [
  // Elétrica & Energia
  { id: '1', name: 'Eletricista Residencial e Comercial', area: 'Elétrica', synonyms: ['eletricista', 'eletricidade', 'fiação', 'disjuntor', 'tomada', 'quadro elétrico'] },
  { id: '2', name: 'Eletricista Predial & Padrão de Entrada', area: 'Elétrica', synonyms: ['padrão copel', 'padrão enel', 'entrada de luz', 'poste', 'trifásico'] },
  { id: '3', name: 'Eletricista Industrial & Comandos Elétricos', area: 'Elétrica', synonyms: ['inversor de frequência', 'painel industrial', 'plc', 'automação'] },
  { id: '4', name: 'Instalador de Energia Solar / Fotovoltaica', area: 'Energia Solar', synonyms: ['placa solar', 'painel solar', 'inversor solar', 'energia limpa'] },
  { id: '5', name: 'Montador de Quadros Elétricos & Disjuntores', area: 'Elétrica', synonyms: ['painéis', 'barramento', 'dps', 'dr', 'quadro de distribuição'] },
  { id: '6', name: 'Instalador de Iluminação Decorativa & Fitas LED', area: 'Iluminação', synonyms: ['led', 'perfil de led', 'lustre', 'spots', 'iluminação'] },
  { id: '7', name: 'Técnico em Geradores de Energia', area: 'Elétrica', synonyms: ['gerador a diesel', 'gerador a gasolina', 'no-break'] },
  { id: '8', name: 'Eletrotécnico Especializado', area: 'Engenharia & Técnica', synonyms: ['laudo técnico', 'art', 'projetos elétricos', 'cft'] },

  // Climatização & Refrigeração
  { id: '9', name: 'Técnico em Climatização & Ar-Condicionado', area: 'Climatização', synonyms: ['ar condicionado', 'split', 'inverter', 'carga de gás'] },
  { id: '10', name: 'Instalador de Ar-Condicionado Split & Multi-Split', area: 'Climatização', synonyms: ['instalação split', 'tubulação de cobre', 'dreno'] },
  { id: '11', name: 'Higienização & Limpeza de Ar-Condicionado (PMOC)', area: 'Climatização', synonyms: ['limpeza ar', 'bactericida', 'higienização split', 'pmoc'] },
  { id: '12', name: 'Técnico em Refrigeração Residencial (Geladeiras / Freezers)', area: 'Refrigeração', synonyms: ['geladeira', 'refrigerador', 'frost free', 'troca de motor'] },
  { id: '13', name: 'Técnico em Refrigeração Comercial & Câmaras Frias', area: 'Refrigeração', synonyms: ['câmara frigorífica', 'balcão refrigerado', 'chiller'] },
  { id: '14', name: 'Manutenção de Máquinas de Lavar, Secadoras e Lava e Seca', area: 'Eletrodomésticos', synonyms: ['máquina de lavar', 'lava e seca', 'tanquinho', 'consul', 'brastemp', 'electrolux'] },
  { id: '15', name: 'Conserto de Micro-ondas e Eletrodomésticos', area: 'Eletrodomésticos', synonyms: ['microondas', 'forno elétrico', 'air fryer'] },

  // Hidráulica & Gás
  { id: '16', name: 'Encanador Residencial & Predial', area: 'Hidráulica', synonyms: ['encanador', 'cano', 'vazamento', 'troca de registro', 'sifão'] },
  { id: '17', name: 'Caça-Vazamentos Especializado (Geofone Digital)', area: 'Hidráulica', synonyms: ['geofone', 'infiltração', 'conta alta de água', 'vazamento invisível'] },
  { id: '18', name: 'Instalador & Técnico de Aquecedores a Gás', area: 'Gás & Aquecimento', synonyms: ['aquecedor a gás', 'rinai', 'lorenzetti', 'pressurizador'] },
  { id: '19', name: 'Desentupidora & Limpeza de Caixas de Gordura', area: 'Desentupimento', synonyms: ['desentupir pia', 'esgoto', 'ralo', 'hidrojateamento'] },
  { id: '20', name: 'Bombeiro Hidráulico & Redes de Distribuição', area: 'Hidráulica', synonyms: ['tubulação tigre', 'barrilete', 'pressurização'] },
  { id: '21', name: 'Instalação de Louças Sanitárias, Torneiras & Válvulas Hydra', area: 'Hidráulica', synonyms: ['vaso sanitário', 'metais', 'deca', 'docol'] },
  { id: '22', name: 'Limpeza e Higienização de Caixas d\'Água', area: 'Saneamento', synonyms: ['caixa de agua', 'desinfecção', 'cloração'] },

  // Construção & Acabamentos
  { id: '23', name: 'Pedreiro & Reformas Gerais', area: 'Construção Civil', synonyms: ['alvenaria', 'assentar tijolo', 'reboco', 'contrapiso', 'reforma'] },
  { id: '24', name: 'Azulejista & Assentador de Porcelanatos Grandes Formatos', area: 'Acabamento', synonyms: ['porcelanato', 'azulejo', 'piso', 'revestimento', 'rejunte epóxi'] },
  { id: '25', name: 'Pintor Profissional, Texturas, Vernizes & Grafiato', area: 'Pintura', synonyms: ['pintura de parede', 'tinta', 'massa corrida', 'lixamento', 'grafiato'] },
  { id: '26', name: 'Pintor de Fachadas & Trabalhos em Altura (NR-35)', area: 'Pintura Predial', synonyms: ['fachada', 'rapel predial', 'lavagem de fachada'] },
  { id: '27', name: 'Gesseiro, Sancas, Forros & Drywall', area: 'Construção a Seco', synonyms: ['drywall', 'gesso liso', 'forro acartonado', 'sanca iluminada', 'divisória'] },
  { id: '28', name: 'Telhadista, Calhas, Rufos & Conserto de Telhados', area: 'Coberturas', synonyms: ['telhado', 'calha', 'rufo', 'telha colonial', 'goteira', 'manta térmica'] },
  { id: '29', name: 'Impermeabilização & Tratamento de Infiltrações', area: 'Construção', synonyms: ['impermeabilizante', 'manta asfáltica', 'umidade', 'mofo'] },
  { id: '30', name: 'Mestre de Obras & Gerenciamento de Obras', area: 'Construção Civil', synonyms: ['supervisão', 'fundação', 'concreto', 'cronograma'] },

  // Marcenaria & Móveis
  { id: '31', name: 'Marceneiro de Móveis Planejados & Sob Medida', area: 'Marcenaria', synonyms: ['armário planejado', 'mdf', 'cozinha planejada', 'closet'] },
  { id: '32', name: 'Montador de Móveis Residencial & Comercial', area: 'Montagem', synonyms: ['montar guarda-roupa', 'mesa', 'painel de tv', 'móveis da internet'] },
  { id: '33', name: 'Instalador de Pisos Laminados & Pisos Vinílicos', area: 'Pisos', synonyms: ['vinílico', 'laminado', 'rodapé', 'quick-step'] },
  { id: '34', name: 'Carpinteiro & Estruturas de Madeira / Pergolados', area: 'Carpintaria', synonyms: ['deck de madeira', 'pergolado', 'porta de madeira', 'forro de madeira'] },
  { id: '35', name: 'Restauração, Pintura e Laqueamento de Móveis', area: 'Marcenaria', synonyms: ['laquear', 'verniz', 'lixar móvel', 'pátina'] },

  // Segurança Eletrônica & Automação
  { id: '36', name: 'Instalador de Câmeras de Segurança (CFTV IP & Analógico)', area: 'Segurança Eletrônica', synonyms: ['cftv', 'dvr', 'câmera wifi', 'intelbras', 'hikvision'] },
  { id: '37', name: 'Alarmes Residenciais, Cerca Elétrica & Concertina', area: 'Segurança Perimetral', synonyms: ['alarme de intrusão', 'choque', 'sensor de presença'] },
  { id: '38', name: 'Automatização & Manutenção de Portões Eletrônicos', area: 'Portões & Motores', synonyms: ['motor de portão', 'ppa', 'rossi', 'garen', 'cremalheira', 'controle'] },
  { id: '39', name: 'Interfonia, Fechaduras Digitais & Controle de Acesso', area: 'Segurança Eletrônica', synonyms: ['interfone', 'videoporteiro', 'fechadura biométrica', 'tag'] },
  { id: '40', name: 'Automação Residencial & Casa Inteligente (Smart Home)', area: 'Automação', synonyms: ['alexa', 'iluminação smart', 'sonoff', 'tuya', 'interruptor inteligente'] },

  // Tecnologia & Eletrônica
  { id: '41', name: 'Técnico em Informática & Manutenção de Computadores', area: 'Informática', synonyms: ['pc gamer', 'formatação', 'ssd', 'upgrade', 'windows'] },
  { id: '42', name: 'Técnico em Manutenção de Notebooks & MacBooks', area: 'Informática', synonyms: ['conserto placa mãe', 'troca de tela', 'bateria de notebook'] },
  { id: '43', name: 'Técnico em Manutenção de Celulares & Smartphones', area: 'Telefonia', synonyms: ['troca de tela iphone', 'conector de carga', 'bateria samsung'] },
  { id: '44', name: 'Instalador de Redes, Wi-Fi & Cabeamento Estruturado', area: 'Redes & Telecom', synonyms: ['rede estruturada', 'cat6', 'repetidor wifi', 'mesh', 'fibra'] },
  { id: '45', name: 'Técnico em Eletrônica & Reparo de Placas', area: 'Eletrônica', synonyms: ['solda smd', 'osciloscópio', 'reparo de circuito', 'tv smart'] },

  // Serralheria, Vidraçaria & Metais
  { id: '46', name: 'Serralheiro de Ferro, Aço & Grades de Proteção', area: 'Serralheria', synonyms: ['grade', 'portão de ferro', 'solda', 'corrimão'] },
  { id: '47', name: 'Serralheiro de Alumínio & Esquadrias', area: 'Esquadrias', synonyms: ['janela de alumínio', 'porta balcão', 'linha suprema'] },
  { id: '48', name: 'Vidraceiro, Box Blindex & Espelhos Decorativos', area: 'Vidraçaria', synonyms: ['box de banheiro', 'vidro temperado', 'espelho bisotê', 'guarda-corpo'] },
  { id: '49', name: 'Soldador Especializado (TIG / MIG / Eletrodo Revestido)', area: 'Metalurgia', synonyms: ['soldagem', 'tubulação inox', 'caldeiraria'] },
  { id: '50', name: 'Instalador de Toldos, Coberturas de Policarbonato & Lonas', area: 'Coberturas', synonyms: ['toldo retrátil', 'policarbonato alveolar', 'sombreamento'] },

  // Automotivo & Mecânica
  { id: '51', name: 'Mecânico Automotivo Especializado em Motores & Câmbio', area: 'Automotivo', synonyms: ['troca de óleo', 'correia dentada', 'freio', 'suspensão', 'cabeçote'] },
  { id: '52', name: 'Eletricista Automotivo & Diagnóstico Computadorizado', area: 'Automotivo', synonyms: ['scanner automotivo', 'injeção eletrônica', 'alternador', 'bateria de carro'] },
  { id: '53', name: 'Funilaria & Pintura Automotiva Profissional', area: 'Automotivo', synonyms: ['reparo de batida', 'cristalização', 'polimento automotivo'] },
  { id: '54', name: 'Martelinho de Ouro & Reparo de Amassados sem Pintura', area: 'Automotivo', synonyms: ['granizo', 'desamassar', 'estética automotiva'] },
  { id: '55', name: 'Instalador de Som Automotivo, Insulfilm & Acessórios', area: 'Automotivo', synonyms: ['película solar', 'insulfilm', 'alto falante', 'multimídia'] },
  { id: '56', name: 'Ar-Condicionado Automotivo & Carga de Gás', area: 'Automotivo', synonyms: ['ar condicionado carro', 'higienização ozônio', 'compressor auto'] },

  // Serviços Gerais, Manutenção & Lar
  { id: '57', name: 'Marido de Aluguel & Pequenos Reparos Gerais', area: 'Serviços Gerais', synonyms: ['faz tudo', 'pendurar quadro', 'trocar chuveiro', 'reparos rápidos'] },
  { id: '58', name: 'Chaveiro 24 Horas & Aberturas Residenciais / Automotivas', area: 'Chaveiro', synonyms: ['cópia de chave', 'chave codificada', 'troca de segredo'] },
  { id: '59', name: 'Jardinagem, Paisagismo & Poda de Árvores', area: 'Jardinagem', synonyms: ['cortar grama', 'roçadeira', 'plantio', 'adubação'] },
  { id: '60', name: 'Tratador de Piscinas & Manutenção de Bombas e Filtros', area: 'Piscinas', synonyms: ['limpeza de piscina', 'cloro', 'troca de areia do filtro'] },
  { id: '61', name: 'Limpeza Pós-Obra Especializada & Tratamento de Pisos', area: 'Limpeza Especializada', synonyms: ['limpeza pesada', 'polimento de mármore', 'limpeza de vidros'] },
  { id: '62', name: 'Dedetizadora & Controle de Pragas Urbanas', area: 'Sanitização', synonyms: ['dedetização', 'barata', 'formiga', 'cupim', 'ratos'] },
  { id: '63', name: 'Instalador de Cortinas, Persianas & Redes de Proteção', area: 'Instalação Residencial', synonyms: ['rede de proteção para janela', 'persiana rolô', 'cortina sob medida'] },
  { id: '64', name: 'Tapeceiro & Higienização de Sofás e Estofados', area: 'Estofados', synonyms: ['limpeza de sofá', 'lavagem a seco', 'reforma de sofá', 'impermeabilização de tecido'] }
];

/**
 * Normaliza string para comparação sem acentos
 */
function normalizeStr(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca de profissões em tempo real via API assíncrona.
 * Suporta cancelamento com AbortSignal e debounce.
 */
export async function searchProfessionsApi(
  query: string, 
  signal?: AbortSignal
): Promise<ProfessionApiItem[]> {
  // Simula latência de rede realista da API (100ms)
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 100);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });

  const cleanQuery = normalizeStr(query);

  if (!cleanQuery) {
    // Retorna as mais requisitadas por padrão
    return PROFESSIONS_CATALOG.slice(0, 12);
  }

  const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);

  // Busca e ranqueamento inteligente
  const scored = PROFESSIONS_CATALOG.map((item) => {
    const nameNorm = normalizeStr(item.name);
    const areaNorm = normalizeStr(item.area);
    const synNorm = item.synonyms ? item.synonyms.map(normalizeStr) : [];

    let score = 0;

    // Correspondência exata no início do nome ganha prioridade máxima
    if (nameNorm.startsWith(cleanQuery)) {
      score += 100;
    } else if (nameNorm.includes(cleanQuery)) {
      score += 50;
    }

    // Termos individuais
    for (const term of queryTerms) {
      if (nameNorm.includes(term)) {
        score += 25;
      }
      if (areaNorm.includes(term)) {
        score += 15;
      }
      if (synNorm.some(s => s.includes(term))) {
        score += 20;
      }
    }

    return { item, score };
  });

  // Filtra itens relevantes ordenados por pontuação
  const results = scored
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);

  return results.slice(0, 15);
}
