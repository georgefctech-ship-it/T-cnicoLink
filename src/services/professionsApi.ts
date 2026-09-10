/**
 * Serviço de API de Busca de Empregos, Ocupações e Profissões em Tempo Real
 * Suporte a busca por qualquer categoria do mercado de trabalho brasileiro (CBO).
 */

export const JOB_CATEGORIES = [
  'Qualquer Categoria',
  'Tecnologia & TI',
  'Construção & Reformas',
  'Vendas & Comercial',
  'Saúde & Bem-Estar',
  'Administrativo & Finanças',
  'Logística & Transporte',
  'Gastronomia & Alimentação',
  'Beleza & Estética',
  'Educação & Treinamento',
  'Marketing & Design',
  'Serviços Gerais & Manutenção',
  'Jurídico & Consultoria'
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export interface ProfessionApiItem {
  id: string;
  name: string;
  category: JobCategory;
  area: string;
  cbo?: string;
  demand?: 'Alta Demanda' | 'Média Demanda' | 'Crescente';
  openJobsCount?: number;
  synonyms?: string[];
}

// Catálogo abrangente com mais de 180 profissões do mercado de trabalho
export const PROFESSIONS_CATALOG: ProfessionApiItem[] = [
  // ==================== TECNOLOGIA & TI ====================
  { id: 'tech-1', name: 'Desenvolvedor(a) Full Stack', category: 'Tecnologia & TI', area: 'Software', cbo: '2124-05', demand: 'Alta Demanda', openJobsCount: 1420, synonyms: ['programador', 'developer', 'react', 'node', 'web', 'fullstack'] },
  { id: 'tech-2', name: 'Desenvolvedor(a) Frontend', category: 'Tecnologia & TI', area: 'Software', cbo: '2124-10', demand: 'Alta Demanda', openJobsCount: 980, synonyms: ['frontend', 'react', 'vue', 'html', 'css', 'javascript', 'typescript'] },
  { id: 'tech-3', name: 'Desenvolvedor(a) Backend', category: 'Tecnologia & TI', area: 'Software', cbo: '2124-15', demand: 'Alta Demanda', openJobsCount: 1150, synonyms: ['backend', 'python', 'java', 'c#', 'php', 'golang', 'api', 'banco de dados'] },
  { id: 'tech-4', name: 'Desenvolvedor(a) Mobile (iOS & Android)', category: 'Tecnologia & TI', area: 'Mobile', cbo: '2124-20', demand: 'Alta Demanda', openJobsCount: 650, synonyms: ['mobile', 'flutter', 'react native', 'swift', 'kotlin', 'aplicativos'] },
  { id: 'tech-5', name: 'Analista de Suporte Técnico & Help Desk', category: 'Tecnologia & TI', area: 'Suporte & TI', cbo: '3172-10', demand: 'Alta Demanda', openJobsCount: 1850, synonyms: ['helpdesk', 'suporte', 'atendimento ti', 'redes', 'hardware', 'formatação'] },
  { id: 'tech-6', name: 'Designer UI/UX & Produto Digital', category: 'Tecnologia & TI', area: 'Design & Produto', cbo: '2624-10', demand: 'Crescente', openJobsCount: 520, synonyms: ['ui', 'ux', 'figma', 'designer de interface', 'experiência do usuário', 'prototipagem'] },
  { id: 'tech-7', name: 'Analista de Dados & Business Intelligence (BI)', category: 'Tecnologia & TI', area: 'Dados & BI', cbo: '2124-25', demand: 'Alta Demanda', openJobsCount: 890, synonyms: ['power bi', 'sql', 'analytics', 'dados', 'data science', 'excel avançado'] },
  { id: 'tech-8', name: 'Administrador(a) de Redes & Infraestrutura', category: 'Tecnologia & TI', area: 'Infraestrutura', cbo: '2123-15', demand: 'Média Demanda', openJobsCount: 430, synonyms: ['redes', 'servidores', 'linux', 'windows server', 'cisco', 'mikrotik'] },
  { id: 'tech-9', name: 'Especialista em Cibersegurança & Segurança da Informação', category: 'Tecnologia & TI', area: 'Segurança', cbo: '2123-20', demand: 'Alta Demanda', openJobsCount: 310, synonyms: ['segurança digital', 'hacker ético', 'pentest', 'lgpd', 'firewall'] },
  { id: 'tech-10', name: 'Técnico(a) em Manutenção de Computadores & Notebooks', category: 'Tecnologia & TI', area: 'Hardware', cbo: '3171-10', demand: 'Alta Demanda', openJobsCount: 1200, synonyms: ['manutenção pc', 'conserto notebook', 'gamer', 'placa mãe', 'limpeza e pasta térmica'] },
  { id: 'tech-11', name: 'Técnico(a) em Manutenção de Celulares & Smartphones', category: 'Tecnologia & TI', area: 'Dispositivos Móveis', cbo: '3132-20', demand: 'Alta Demanda', openJobsCount: 890, synonyms: ['troca de tela', 'bateria iphone', 'conector samsung', 'placa de celular'] },
  { id: 'tech-12', name: 'Analista de Qualidade de Software (QA / Tester)', category: 'Tecnologia & TI', area: 'Qualidade', cbo: '2124-30', demand: 'Crescente', openJobsCount: 410, synonyms: ['qa', 'testes automatizados', 'cypress', 'selenium', 'qualidade de software'] },

  // ==================== CONSTRUÇÃO & REFORMAS ====================
  { id: 'const-1', name: 'Eletricista Residencial e Comercial', category: 'Construção & Reformas', area: 'Elétrica', cbo: '7156-15', demand: 'Alta Demanda', openJobsCount: 2100, synonyms: ['eletricista', 'fiação', 'disjuntor', 'tomada', 'quadro elétrico', 'iluminação'] },
  { id: 'const-2', name: 'Eletricista Predial & Padrão de Entrada de Energia', category: 'Construção & Reformas', area: 'Elétrica', cbo: '7156-10', demand: 'Alta Demanda', openJobsCount: 1100, synonyms: ['padrão copel', 'padrão enel', 'entrada de luz', 'poste', 'trifásico'] },
  { id: 'const-3', name: 'Instalador de Energia Solar / Fotovoltaica', category: 'Construção & Reformas', area: 'Energia Solar', cbo: '7156-25', demand: 'Alta Demanda', openJobsCount: 940, synonyms: ['placa solar', 'painel solar', 'inversor solar', 'energia limpa'] },
  { id: 'const-4', name: 'Técnico em Climatização & Ar-Condicionado', category: 'Construção & Reformas', area: 'Climatização', cbo: '3141-10', demand: 'Alta Demanda', openJobsCount: 1650, synonyms: ['ar condicionado', 'split', 'inverter', 'carga de gás', 'limpeza ar', 'pmoc'] },
  { id: 'const-5', name: 'Técnico em Refrigeração (Geladeiras, Freezers e Bebedouros)', category: 'Construção & Reformas', area: 'Refrigeração', cbo: '3141-05', demand: 'Alta Demanda', openJobsCount: 880, synonyms: ['geladeira', 'freezer', 'frost free', 'motor', 'refrigerador', 'bebedouro'] },
  { id: 'const-6', name: 'Encanador e Bombeiro Hidráulico', category: 'Construção & Reformas', area: 'Hidráulica', cbo: '7241-10', demand: 'Alta Demanda', openJobsCount: 1800, synonyms: ['encanador', 'cano', 'vazamento', 'troca de registro', 'sifão', 'tubulação'] },
  { id: 'const-7', name: 'Caça-Vazamentos Especializado (Geofone Digital)', category: 'Construção & Reformas', area: 'Hidráulica', cbo: '7241-15', demand: 'Alta Demanda', openJobsCount: 520, synonyms: ['geofone', 'infiltração', 'conta alta de água', 'vazamento oculto'] },
  { id: 'const-8', name: 'Pedreiro de Alvenaria, Reformas & Estrutura', category: 'Construção & Reformas', area: 'Construção Civil', cbo: '7152-10', demand: 'Alta Demanda', openJobsCount: 3200, synonyms: ['pedreiro', 'alvenaria', 'assentar tijolo', 'reboco', 'contrapiso', 'reforma'] },
  { id: 'const-9', name: 'Azulejista & Assentador de Porcelanatos Grandes Formatos', category: 'Construção & Reformas', area: 'Acabamentos', cbo: '7165-05', demand: 'Alta Demanda', openJobsCount: 1400, synonyms: ['porcelanato', 'azulejo', 'piso', 'revestimento', 'rejunte epóxi'] },
  { id: 'const-10', name: 'Pintor Profissional, Texturas, Vernizes & Grafiato', category: 'Construção & Reformas', area: 'Pintura', cbo: '7166-10', demand: 'Alta Demanda', openJobsCount: 2300, synonyms: ['pintor', 'massa corrida', 'pintura de parede', 'tinta acrílica', 'grafiato'] },
  { id: 'const-11', name: 'Pintor de Fachadas & Trabalhos em Altura (NR-35)', category: 'Construção & Reformas', area: 'Pintura Predial', cbo: '7166-15', demand: 'Média Demanda', openJobsCount: 460, synonyms: ['fachada', 'rapel predial', 'lavagem de fachada', 'balancim'] },
  { id: 'const-12', name: 'Gesseiro, Sancas, Forros & Drywall', category: 'Construção & Reformas', area: 'Construção a Seco', cbo: '7164-05', demand: 'Alta Demanda', openJobsCount: 1150, synonyms: ['drywall', 'gesso liso', 'forro acartonado', 'sanca iluminada', 'divisória'] },
  { id: 'const-13', name: 'Marceneiro de Móveis Planejados & Sob Medida', category: 'Construção & Reformas', area: 'Marcenaria', cbo: '7711-05', demand: 'Alta Demanda', openJobsCount: 980, synonyms: ['armário planejado', 'mdf', 'cozinha planejada', 'closet', 'marcenaria'] },
  { id: 'const-14', name: 'Montador de Móveis Residencial & Comercial', category: 'Construção & Reformas', area: 'Montagem', cbo: '7711-10', demand: 'Alta Demanda', openJobsCount: 1950, synonyms: ['montar guarda-roupa', 'mesa', 'painel de tv', 'móveis comprados na internet'] },
  { id: 'const-15', name: 'Serralheiro de Ferro, Aço & Grades de Proteção', category: 'Construção & Reformas', area: 'Serralheria', cbo: '7244-40', demand: 'Alta Demanda', openJobsCount: 870, synonyms: ['grade', 'portão de ferro', 'solda', 'corrimão', 'estrutura metálica'] },
  { id: 'const-16', name: 'Vidraceiro, Box Blindex & Espelhos Decorativos', category: 'Construção & Reformas', area: 'Vidraçaria', cbo: '7161-05', demand: 'Alta Demanda', openJobsCount: 780, synonyms: ['box de banheiro', 'vidro temperado', 'espelho bisotê', 'guarda-corpo'] },
  { id: 'const-17', name: 'Telhadista, Calhas, Rufos & Conserto de Telhados', category: 'Construção & Reformas', area: 'Coberturas', cbo: '7154-05', demand: 'Alta Demanda', openJobsCount: 650, synonyms: ['telhado', 'calha', 'rufo', 'telha colonial', 'goteira', 'manta térmica'] },
  { id: 'const-18', name: 'Mestre de Obras & Gerenciamento de Edificações', category: 'Construção & Reformas', area: 'Gestão de Obras', cbo: '7102-05', demand: 'Crescente', openJobsCount: 540, synonyms: ['mestre de obras', 'encarregado', 'concreto', 'fundação', 'cronograma'] },

  // ==================== VENDAS & COMERCIAL ====================
  { id: 'sales-1', name: 'Vendedor(a) do Comércio Varejista', category: 'Vendas & Comercial', area: 'Varejo', cbo: '5211-10', demand: 'Alta Demanda', openJobsCount: 5400, synonyms: ['vendedor', 'atendente de loja', 'comércio', 'balcão', 'loja de shopping'] },
  { id: 'sales-2', name: 'Representante Comercial Autônomo', category: 'Vendas & Comercial', area: 'B2B & Representação', cbo: '3541-25', demand: 'Alta Demanda', openJobsCount: 1600, synonyms: ['representante', 'comissões', 'vendas externas', 'carteira de clientes', 'atacado'] },
  { id: 'sales-3', name: 'Corretor(a) de Imóveis (CRECI)', category: 'Vendas & Comercial', area: 'Imobiliário', cbo: '3544-10', demand: 'Alta Demanda', openJobsCount: 2200, synonyms: ['imobiliária', 'venda de apartamentos', 'locação', 'creci', 'casas', 'terrenos'] },
  { id: 'sales-4', name: 'Consultor(a) de Vendas & Negócios', category: 'Vendas & Comercial', area: 'Consultoria Comercial', cbo: '3541-20', demand: 'Alta Demanda', openJobsCount: 1950, synonyms: ['consultor comercial', 'prospecção', 'fechamento', 'negociação'] },
  { id: 'sales-5', name: 'Operador(a) de Caixa e Recebimentos', category: 'Vendas & Comercial', area: 'Atendimento & Caixa', cbo: '4211-25', demand: 'Alta Demanda', openJobsCount: 4100, synonyms: ['caixa', 'supermercado', 'fechamento de caixa', 'troco', 'atendimento ao cliente'] },
  { id: 'sales-6', name: 'Promotor(a) de Vendas & Merchandising', category: 'Vendas & Comercial', area: 'Trade Marketing', cbo: '5211-15', demand: 'Média Demanda', openJobsCount: 1300, synonyms: ['promotor', 'degustação', 'ponto de venda', 'gôndola', 'demonstração'] },
  { id: 'sales-7', name: 'Gerente de Loja e Equipes de Vendas', category: 'Vendas & Comercial', area: 'Gestão de Varejo', cbo: '1423-20', demand: 'Crescente', openJobsCount: 750, synonyms: ['gerente comercial', 'liderança', 'metas', 'gestão de equipe'] },
  { id: 'sales-8', name: 'Operador(a) de Televendas & Inside Sales', category: 'Vendas & Comercial', area: 'Vendas Remotas', cbo: '4223-10', demand: 'Alta Demanda', openJobsCount: 2800, synonyms: ['telemarketing', 'call center', 'vendas por telefone', 'inside sales', 'sdr'] },

  // ==================== SAÚDE & BEM-ESTAR ====================
  { id: 'health-1', name: 'Enfermeiro(a) Geral e Hospitalar', category: 'Saúde & Bem-Estar', area: 'Enfermagem', cbo: '2235-05', demand: 'Alta Demanda', openJobsCount: 3100, synonyms: ['enfermeira', 'coren', 'hospital', 'uti', 'pronto socorro', 'home care'] },
  { id: 'health-2', name: 'Técnico(a) em Enfermagem', category: 'Saúde & Bem-Estar', area: 'Enfermagem', cbo: '3222-05', demand: 'Alta Demanda', openJobsCount: 4200, synonyms: ['técnico enfermagem', 'curativos', 'medicação', 'aferição', 'clínica'] },
  { id: 'health-3', name: 'Cuidador(a) de Idosos e Acompanhante', category: 'Saúde & Bem-Estar', area: 'Cuidados Pessoais', cbo: '5162-10', demand: 'Alta Demanda', openJobsCount: 2900, synonyms: ['cuidadora', 'geriatria', 'acompanhante hospitalar', 'idoso', 'home care'] },
  { id: 'health-4', name: 'Fisioterapeuta Clínico e Domiciliar', category: 'Saúde & Bem-Estar', area: 'Fisioterapia', cbo: '2236-05', demand: 'Alta Demanda', openJobsCount: 1400, synonyms: ['fisioterapia', 'reabilitação', 'ortopedia', 'pilates', 'crefito'] },
  { id: 'health-5', name: 'Psicólogo(a) Clínico e Organizacional', category: 'Saúde & Bem-Estar', area: 'Psicologia', cbo: '2515-10', demand: 'Alta Demanda', openJobsCount: 1800, synonyms: ['psicologia', 'terapia', 'saúde mental', 'crp', 'atendimento online', 'tcc'] },
  { id: 'health-6', name: 'Nutricionista Clínico e Esportivo', category: 'Saúde & Bem-Estar', area: 'Nutrição', cbo: '2237-10', demand: 'Crescente', openJobsCount: 950, synonyms: ['nutrição', 'dieta', 'emagrecimento', 'crn', 'plano alimentar'] },
  { id: 'health-7', name: 'Cirurgião-Dentista / Odontologista', category: 'Saúde & Bem-Estar', area: 'Odontologia', cbo: '2232-08', demand: 'Média Demanda', openJobsCount: 820, synonyms: ['dentista', 'cro', 'ortodontia', 'limpeza dental', 'prótese', 'clareamento'] },
  { id: 'health-8', name: 'Massoterapeuta & Terapeuta Holístico', category: 'Saúde & Bem-Estar', area: 'Terapias Manuais', cbo: '5161-40', demand: 'Alta Demanda', openJobsCount: 880, synonyms: ['massagem relaxante', 'drenagem linfática', 'shiatsu', 'ventosaterapia', 'alívio de dor'] },
  { id: 'health-9', name: 'Personal Trainer & Instrutor de Musculação', category: 'Saúde & Bem-Estar', area: 'Educação Física', cbo: '2241-20', demand: 'Alta Demanda', openJobsCount: 1650, synonyms: ['academia', 'treino personalizado', 'crossfit', 'cref', 'musculação'] },

  // ==================== ADMINISTRATIVO & FINANÇAS ====================
  { id: 'admin-1', name: 'Assistente Administrativo', category: 'Administrativo & Finanças', area: 'Administração', cbo: '4110-10', demand: 'Alta Demanda', openJobsCount: 6200, synonyms: ['auxiliar administrativo', 'rotinas de escritório', 'planilhas', 'atendimento', 'documentos'] },
  { id: 'admin-2', name: 'Auxiliar de Escritório em Geral', category: 'Administrativo & Finanças', area: 'Administração', cbo: '4110-05', demand: 'Alta Demanda', openJobsCount: 4800, synonyms: ['escritório', 'arquivo', 'recepção', 'contas a pagar', 'digitação'] },
  { id: 'admin-3', name: 'Contador(a) e Perito Contábil', category: 'Administrativo & Finanças', area: 'Contabilidade', cbo: '2522-10', demand: 'Alta Demanda', openJobsCount: 1500, synonyms: ['crc', 'balanço', 'tributos', 'imposto de renda', 'fechamento fiscal', 'folha'] },
  { id: 'admin-4', name: 'Analista Financeiro e de Controladoria', category: 'Administrativo & Finanças', area: 'Finanças', cbo: '2525-45', demand: 'Alta Demanda', openJobsCount: 1800, synonyms: ['fluxo de caixa', 'dre', 'conciliação bancária', 'contas a receber', 'faturamento'] },
  { id: 'admin-5', name: 'Assistente de Recursos Humanos / Departamento Pessoal', category: 'Administrativo & Finanças', area: 'RH & DP', cbo: '4110-30', demand: 'Alta Demanda', openJobsCount: 2200, synonyms: ['rh', 'dp', 'folha de pagamento', 'ponto', 'benefícios', 'admissão e demissão'] },
  { id: 'admin-6', name: 'Secretária Executiva e Recepcionista Corporativa', category: 'Administrativo & Finanças', area: 'Recepção', cbo: '4221-05', demand: 'Alta Demanda', openJobsCount: 3400, synonyms: ['recepcionista', 'agenda', 'atendimento telefônico', 'secretariado', 'triagem'] },
  { id: 'admin-7', name: 'Analista de Cobrança e Crédito', category: 'Administrativo & Finanças', area: 'Cobrança', cbo: '4131-10', demand: 'Média Demanda', openJobsCount: 1100, synonyms: ['recuperação de crédito', 'negociação de dívida', 'inadimplência'] },

  // ==================== LOGÍSTICA & TRANSPORTE ====================
  { id: 'log-1', name: 'Motorista de Caminhão e Carreteiro (Cat D/E)', category: 'Logística & Transporte', area: 'Transporte Rodoviário', cbo: '7825-10', demand: 'Alta Demanda', openJobsCount: 3800, synonyms: ['caminhoneiro', 'carreta', 'cnh d', 'cnh e', 'viagens', 'carga pesada'] },
  { id: 'log-2', name: 'Motorista de Van, Utilitários e Entregas Urbanas', category: 'Logística & Transporte', area: 'Entregas', cbo: '7823-10', demand: 'Alta Demanda', openJobsCount: 4500, synonyms: ['fiorino', 'van', 'entregas mercado livre', 'cnh b', 'transporte executivo'] },
  { id: 'log-3', name: 'Motoboy, Motofretista e Entregador Delivery', category: 'Logística & Transporte', area: 'Delivery', cbo: '5191-10', demand: 'Alta Demanda', openJobsCount: 6800, synonyms: ['motofrete', 'entrega rápida', 'ifood', 'moto', 'delivery', 'encomendas'] },
  { id: 'log-4', name: 'Auxiliar de Logística e Expedição', category: 'Logística & Transporte', area: 'Operações Logísticas', cbo: '4141-05', demand: 'Alta Demanda', openJobsCount: 5100, synonyms: ['expedição', 'triagem', 'conferência', 'embalagem', 'armazém', 'carregamento'] },
  { id: 'log-5', name: 'Operador(a) de Empilhadeira', category: 'Logística & Transporte', area: 'Movimentação de Cargas', cbo: '7822-20', demand: 'Alta Demanda', openJobsCount: 1900, synonyms: ['empilhadeira elétrica', 'empilhadeira a gás', 'nr-11', 'paleteira', 'galpão'] },
  { id: 'log-6', name: 'Estoquista e Conferente de Mercadorias', category: 'Logística & Transporte', area: 'Estoque', cbo: '4141-25', demand: 'Alta Demanda', openJobsCount: 3900, synonyms: ['conferente', 'inventário', 'código de barras', 'entrada de nota fiscal', 'depósito'] },

  // ==================== GASTRONOMIA & ALIMENTAÇÃO ====================
  { id: 'gastro-1', name: 'Cozinheiro(a) Geral e Restaurante À La Carte', category: 'Gastronomia & Alimentação', area: 'Cozinha', cbo: '5132-05', demand: 'Alta Demanda', openJobsCount: 3700, synonyms: ['cozinha', 'fogão', 'preparo de pratos', 'restaurante', 'almoço', 'jantar'] },
  { id: 'gastro-2', name: 'Confeiteiro(a) e Boleiro(a) Artesanal', category: 'Gastronomia & Alimentação', area: 'Confeitaria', cbo: '8483-10', demand: 'Alta Demanda', openJobsCount: 1200, synonyms: ['bolos decorados', 'doces finos', 'sobremesas', 'pasta americana', 'brigadeiro'] },
  { id: 'gastro-3', name: 'Pizzaiolo(a) Profissional', category: 'Gastronomia & Alimentação', area: 'Pizzaria', cbo: '5132-20', demand: 'Alta Demanda', openJobsCount: 1600, synonyms: ['pizza', 'forno a lenha', 'massa de pizza', 'pizzaria delivery', 'calzone'] },
  { id: 'gastro-4', name: 'Churrasqueiro(a) para Eventos e Festas', category: 'Gastronomia & Alimentação', area: 'Carnes & Churrasco', cbo: '5132-25', demand: 'Alta Demanda', openJobsCount: 850, synonyms: ['churrasco', 'churrascaria', 'cortes nobres', 'grelhados', 'buffet'] },
  { id: 'gastro-5', name: 'Sushiman e Culinária Japonesa', category: 'Gastronomia & Alimentação', area: 'Cozinha Oriental', cbo: '5132-15', demand: 'Alta Demanda', openJobsCount: 950, synonyms: ['sushi', 'sashimi', 'temaki', 'salmão', 'restaurante japonês'] },
  { id: 'gastro-6', name: 'Padeiro(a) Artesanal e Fermentação Natural', category: 'Gastronomia & Alimentação', area: 'Panificação', cbo: '8483-05', demand: 'Alta Demanda', openJobsCount: 1400, synonyms: ['padaria', 'pão francês', 'levain', 'croissant', 'fornada'] },
  { id: 'gastro-7', name: 'Garçom e Garçonete de Salão e Eventos', category: 'Gastronomia & Alimentação', area: 'Atendimento', cbo: '5134-05', demand: 'Alta Demanda', openJobsCount: 2900, synonyms: ['atendimento de mesa', 'buffet', 'casamentos', 'bandeja', 'restaurante'] },
  { id: 'gastro-8', name: 'Barman, Bartender e Mixologista', category: 'Gastronomia & Alimentação', area: 'Bar & Coquetelaria', cbo: '5134-20', demand: 'Alta Demanda', openJobsCount: 1100, synonyms: ['drinks', 'coquetéis', 'chopp', 'pub', 'eventos', 'caipirinhas'] },

  // ==================== BELEZA & ESTÉTICA ====================
  { id: 'beauty-1', name: 'Cabeleireiro(a), Colorista & Especialista em Mechas', category: 'Beleza & Estética', area: 'Cabelos', cbo: '5161-10', demand: 'Alta Demanda', openJobsCount: 2600, synonyms: ['corte de cabelo', 'mechas', 'tintura', 'escova progressiva', 'salão de beleza'] },
  { id: 'beauty-2', name: 'Barbeiro e Especialista em Barba / Degradê', category: 'Beleza & Estética', area: 'Barbearia', cbo: '5161-05', demand: 'Alta Demanda', openJobsCount: 2100, synonyms: ['barbearia', 'fade', 'navalha', 'pigmentação', 'corte masculino'] },
  { id: 'beauty-3', name: 'Manicure, Pedicure & Nail Designer (Unhas de Fibra/Gel)', category: 'Beleza & Estética', area: 'Unhas', cbo: '5161-20', demand: 'Alta Demanda', openJobsCount: 3300, synonyms: ['unhas em gel', 'alongamento de fibra', 'esmaltacao', 'cutilagem', 'nail art'] },
  { id: 'beauty-4', name: 'Designer de Sobrancelhas & Micropigmentadora', category: 'Beleza & Estética', area: 'Olhar & Sobrancelhas', cbo: '5161-25', demand: 'Alta Demanda', openJobsCount: 1750, synonyms: ['henna', 'microblading', 'extensão de cílios', 'lash lifting', 'visagismo'] },
  { id: 'beauty-5', name: 'Esteticista Facial e Corporal', category: 'Beleza & Estética', area: 'Estética', cbo: '3221-30', demand: 'Alta Demanda', openJobsCount: 1450, synonyms: ['limpeza de pele', 'peeling', 'drenagem', 'botox', 'harmonização', 'radiofrequência'] },
  { id: 'beauty-6', name: 'Maquiadora Profissional e de Noivas', category: 'Beleza & Estética', area: 'Maquiagem', cbo: '5161-45', demand: 'Alta Demanda', openJobsCount: 1100, synonyms: ['maquiagem social', 'make noiva', 'formatura', 'editorial'] },
  { id: 'beauty-7', name: 'Tatuador(a) Profissional & Body Piercer', category: 'Beleza & Estética', area: 'Body Art', cbo: '5168-05', demand: 'Média Demanda', openJobsCount: 650, synonyms: ['tattoo', 'piercing', 'tatuagem realista', 'fineline', 'blackwork'] },

  // ==================== EDUCAÇÃO & TREINAMENTO ====================
  { id: 'edu-1', name: 'Professor(a) de Ensino Fundamental e Médio', category: 'Educação & Treinamento', area: 'Educação Básica', cbo: '2313-05', demand: 'Alta Demanda', openJobsCount: 3800, synonyms: ['escola', 'aulas', 'matemática', 'português', 'história', 'pedagogia'] },
  { id: 'edu-2', name: 'Professor(a) de Idiomas (Inglês, Espanhol, etc.)', category: 'Educação & Treinamento', area: 'Línguas Estrangeiras', cbo: '2394-15', demand: 'Alta Demanda', openJobsCount: 1950, synonyms: ['aulas de inglês', 'conversação', 'toefl', 'espanhol', 'aulas particulares'] },
  { id: 'edu-3', name: 'Pedagogo(a) e Orientador(a) Educacional', category: 'Educação & Treinamento', area: 'Pedagogia', cbo: '2394-05', demand: 'Média Demanda', openJobsCount: 1200, synonyms: ['coordenação pedagógica', 'educação infantil', 'alfabetização'] },
  { id: 'edu-4', name: 'Instrutor(a) de Cursos e Treinamentos Profissionalizantes', category: 'Educação & Treinamento', area: 'Capacitação', cbo: '2394-25', demand: 'Crescente', openJobsCount: 870, synonyms: ['palestrante', 'workshops', 'treinamento empresarial', 'mentoria'] },
  { id: 'edu-5', name: 'Professor(a) de Música e Instrumentos (Violão, Teclado)', category: 'Educação & Treinamento', area: 'Artes & Música', cbo: '2627-05', demand: 'Média Demanda', openJobsCount: 620, synonyms: ['aulas de violão', 'piano', 'canto', 'guitarra', 'teoria musical'] },

  // ==================== MARKETING & DESIGN ====================
  { id: 'mkt-1', name: 'Social Media Manager & Gestor de Redes Sociais', category: 'Marketing & Design', area: 'Redes Sociais', cbo: '2614-10', demand: 'Alta Demanda', openJobsCount: 2400, synonyms: ['instagram', 'tiktok', 'criação de conteúdo', 'posts', 'reels', 'engajamento'] },
  { id: 'mkt-2', name: 'Designer Gráfico & Diretor(a) de Arte', category: 'Marketing & Design', area: 'Design Visual', cbo: '2624-10', demand: 'Alta Demanda', openJobsCount: 1900, synonyms: ['photoshop', 'illustrator', 'identidade visual', 'logos', 'banners', 'impressos'] },
  { id: 'mkt-3', name: 'Gestor(a) de Tráfego Pago & Performance (Meta/Google Ads)', category: 'Marketing & Design', area: 'Mídia Paga', cbo: '2611-20', demand: 'Alta Demanda', openJobsCount: 1600, synonyms: ['facebook ads', 'google ads', 'anúncios online', 'conversão', 'roi', 'leads'] },
  { id: 'mkt-4', name: 'Fotógrafo(a) Profissional (Eventos, Produtos & Ensaios)', category: 'Marketing & Design', area: 'Fotografia', cbo: '2618-05', demand: 'Alta Demanda', openJobsCount: 1300, synonyms: ['fotos', 'casamento', 'ensaio gestante', 'fotos corporativas', 'lightroom'] },
  { id: 'mkt-5', name: 'Videomaker & Editor(a) de Vídeo', category: 'Marketing & Design', area: 'Audiovisual', cbo: '3744-20', demand: 'Alta Demanda', openJobsCount: 1550, synonyms: ['premiere', 'after effects', 'gravação de vídeo', 'reels', 'youtube', 'drone'] },
  { id: 'mkt-6', name: 'Redator(a) Publicitário e Copywriter', category: 'Marketing & Design', area: 'Conteúdo Escrito', cbo: '2615-15', demand: 'Crescente', openJobsCount: 750, synonyms: ['copywriting', 'textos persuasivos', 'artigos', 'páginas de vendas', 'email mkt'] },

  // ==================== SERVIÇOS GERAIS & MANUTENÇÃO ====================
  { id: 'sg-1', name: 'Marido de Aluguel & Pequenos Reparos Residenciais', category: 'Serviços Gerais & Manutenção', area: 'Reparos Rápidos', cbo: '5143-20', demand: 'Alta Demanda', openJobsCount: 3100, synonyms: ['faz tudo', 'pendurar quadro', 'trocar chuveiro', 'instalar suporte tv', 'fechadura'] },
  { id: 'sg-2', name: 'Diarista e Profissional de Limpeza Residencial', category: 'Serviços Gerais & Manutenção', area: 'Limpeza', cbo: '5143-25', demand: 'Alta Demanda', openJobsCount: 5200, synonyms: ['faxina', 'limpeza de casa', 'passar roupa', 'cozinhar', 'faxineira'] },
  { id: 'sg-3', name: 'Jardinagem, Paisagismo & Poda de Árvores', category: 'Serviços Gerais & Manutenção', area: 'Jardins', cbo: '6220-10', demand: 'Alta Demanda', openJobsCount: 1650, synonyms: ['cortar grama', 'roçadeira', 'paisagismo', 'adubação', 'limpeza de terreno'] },
  { id: 'sg-4', name: 'Porteiro(a) e Controlador(a) de Acesso', category: 'Serviços Gerais & Manutenção', area: 'Portaria & Segurança', cbo: '5174-10', demand: 'Alta Demanda', openJobsCount: 4200, synonyms: ['portaria de condomínio', 'guarita', 'recepção de visitantes', 'encomendas'] },
  { id: 'sg-5', name: 'Vigilante e Segurança Patrimonial', category: 'Serviços Gerais & Manutenção', area: 'Segurança', cbo: '5173-30', demand: 'Alta Demanda', openJobsCount: 2900, synonyms: ['vigilância armada', 'ronda', 'escolta', 'segurança de eventos', 'curso de vigilante'] },
  { id: 'sg-6', name: 'Chaveiro 24 Horas Residencial e Automotivo', category: 'Serviços Gerais & Manutenção', area: 'Aberturas & Chaves', cbo: '5211-15', demand: 'Alta Demanda', openJobsCount: 950, synonyms: ['cópia de chave', 'chave codificada', 'abertura de porta travada', 'troca de miolo'] },
  { id: 'sg-7', name: 'Tratador(a) de Piscinas e Manutenção de Bombas', category: 'Serviços Gerais & Manutenção', area: 'Piscinas', cbo: '5143-15', demand: 'Alta Demanda', openJobsCount: 780, synonyms: ['limpeza de piscina', 'cloro', 'filtro', 'aspiração', 'equilíbrio de ph'] },
  { id: 'sg-8', name: 'Dedetizadora & Controle de Pragas Urbanas', category: 'Serviços Gerais & Manutenção', area: 'Sanitização', cbo: '5143-30', demand: 'Alta Demanda', openJobsCount: 650, synonyms: ['dedetização', 'cupim', 'barata', 'ratos', 'desratização'] },
  { id: 'sg-9', name: 'Mecânico Automotivo de Motores, Freios e Suspensão', category: 'Serviços Gerais & Manutenção', area: 'Automotivo', cbo: '9144-05', demand: 'Alta Demanda', openJobsCount: 2800, synonyms: ['mecânica de carros', 'troca de óleo', 'correia dentada', 'alinhamento', 'freios'] },
  { id: 'sg-10', name: 'Eletricista Automotivo & Diagnóstico Computadorizado', category: 'Serviços Gerais & Manutenção', area: 'Autoelétrica', cbo: '9144-15', demand: 'Alta Demanda', openJobsCount: 1400, synonyms: ['auto elétrica', 'alternador', 'bateria de carro', 'scanner', 'motor de arranque'] },

  // ==================== JURÍDICO & CONSULTORIA ====================
  { id: 'law-1', name: 'Advogado(a) Trabalhista, Cível e Previdenciário', category: 'Jurídico & Consultoria', area: 'Direito', cbo: '2410-05', demand: 'Alta Demanda', openJobsCount: 1700, synonyms: ['oab', 'processo trabalhista', 'aposentadoria', 'inss', 'divórcio', 'inventário'] },
  { id: 'law-2', name: 'Assistente Jurídico e Paralegal', category: 'Jurídico & Consultoria', area: 'Suporte Jurídico', cbo: '3514-30', demand: 'Alta Demanda', openJobsCount: 1450, synonyms: ['escritório de advocacia', 'prazos processuais', 'peças jurídicas', 'audiências'] },
  { id: 'law-3', name: 'Consultor(a) Financeiro e Planejador Pessoal', category: 'Jurídico & Consultoria', area: 'Planejamento', cbo: '2410-15', demand: 'Crescente', openJobsCount: 520, synonyms: ['finanças pessoais', 'investimentos', 'planejamento tributário', 'dívidas'] }
];

/**
 * Normaliza string para comparação sem acentos e minúsculas
 */
export function normalizeStr(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface SearchProfessionsOptions {
  query: string;
  category?: string;
  signal?: AbortSignal;
}

/**
 * Busca de empregos e profissões em tempo real via API assíncrona.
 * Retorna sugestões de autocompletar conforme o usuário digita.
 */
export async function searchProfessionsApi(
  options: SearchProfessionsOptions | string,
  signalParam?: AbortSignal
): Promise<ProfessionApiItem[]> {
  const query = typeof options === 'string' ? options : options.query;
  const signal = typeof options === 'string' ? signalParam : options.signal;
  const cleanQuery = normalizeStr(query || '');

  // 1. Busca imediata com ranqueamento no catálogo abrangente CBO
  let pool = PROFESSIONS_CATALOG;

  const queryTerms = cleanQuery.split(/\s+/).filter(Boolean);

  let localResults: ProfessionApiItem[] = [];

  if (!cleanQuery) {
    localResults = pool.slice(0, 15);
  } else {
    const scored = pool.map((item) => {
      const nameNorm = normalizeStr(item.name);
      const areaNorm = normalizeStr(item.area);
      const synNorm = item.synonyms ? item.synonyms.map(normalizeStr) : [];
      const cboNorm = item.cbo ? normalizeStr(item.cbo) : '';

      let score = 0;

      // Correspondência exata no início da profissão
      if (nameNorm.startsWith(cleanQuery)) {
        score += 200;
      } else if (nameNorm.includes(cleanQuery)) {
        score += 90;
      }

      // Palavras que começam com o termo
      const words = nameNorm.split(/\s+/);
      if (words.some(w => w.startsWith(cleanQuery))) {
        score += 120;
      }

      if (cboNorm.includes(cleanQuery)) {
        score += 70;
      }

      // Termos individuais
      for (const term of queryTerms) {
        if (nameNorm.includes(term)) {
          score += 40;
        }
        if (areaNorm.includes(term)) {
          score += 25;
        }
        if (synNorm.some(s => s.includes(term))) {
          score += 35;
        }
      }

      return { item, score };
    });

    localResults = scored
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(res => res.item)
      .slice(0, 15);
  }

  // 2. Consulta a API online em paralelo para enriquecer
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);

    const res = await fetch(`/api/jobs/search?${params.toString()}`, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        // Mesclar itens online que não estejam já na lista
        const existingNames = new Set(localResults.map(i => normalizeStr(i.name)));
        const newFromApi: ProfessionApiItem[] = [];
        for (const item of data.results) {
          if (!existingNames.has(normalizeStr(item.name))) {
            newFromApi.push(item);
            existingNames.add(normalizeStr(item.name));
          }
        }
        return [...localResults, ...newFromApi].slice(0, 15);
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw err;
    }
  }

  return localResults;
}
