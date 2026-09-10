import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// High body limits for compressed base64 images upload fallback
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Image uploads directory (fail-safe for Supabase Storage RLS lock)
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Server-side persistence file path
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "cloud_store.json");

interface CloudStore {
  profiles: any[];
  gallery: Record<string, any[]>;
  testimonials: Record<string, any[]>;
  updatedAt: string;
}

function loadStore(): CloudStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("[Store] Error loading store file:", err);
  }
  return {
    profiles: [],
    gallery: {},
    testimonials: {},
    updatedAt: new Date().toISOString(),
  };
}

function saveStore(store: CloudStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    store.updatedAt = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("[Store] Error writing store file:", err);
  }
}

// In-memory active store
let cloudStore = loadStore();

// Server-Sent Events (SSE) subscribers for global real-time synchronization
const sseClients = new Set<express.Response>();

function broadcastSSE(event: { type: string; [key: string]: any }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// API Routes FIRST

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    clientsConnected: sseClients.size,
    profilesCount: cloudStore.profiles.length,
    updatedAt: cloudStore.updatedAt,
    timestamp: new Date().toISOString(),
  });
});

// 2. Real-time stream (Server-Sent Events)
app.get("/api/realtime-stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(`data: ${JSON.stringify({ type: "connected", time: new Date().toISOString() })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// 3. Profiles API
app.get("/api/profiles", (req, res) => {
  res.json({
    profiles: cloudStore.profiles,
    updatedAt: cloudStore.updatedAt,
  });
});

// Jobs & Occupations Search API (multi-category CBO & employment search)
app.get("/api/jobs/categories", (req, res) => {
  res.json({
    categories: [
      "Qualquer Categoria",
      "Tecnologia & TI",
      "Construção & Reformas",
      "Vendas & Comercial",
      "Saúde & Bem-Estar",
      "Administrativo & Finanças",
      "Logística & Transporte",
      "Gastronomia & Alimentação",
      "Beleza & Estética",
      "Educação & Treinamento",
      "Marketing & Design",
      "Serviços Gerais & Manutenção",
      "Jurídico & Consultoria"
    ]
  });
});

app.get("/api/jobs/search", (req, res) => {
  const q = ((req.query.q as string) || "").trim().toLowerCase();
  const category = ((req.query.category as string) || "").trim();

  // Empregos e ocupações do mercado CBO brasileiro categorizados
  const jobsList = [
    { id: "tech-1", name: "Desenvolvedor(a) Full Stack", category: "Tecnologia & TI", area: "Software", cbo: "2124-05", demand: "Alta Demanda", openJobsCount: 1420, synonyms: ["programador", "developer", "react", "node", "web"] },
    { id: "tech-2", name: "Desenvolvedor(a) Frontend", category: "Tecnologia & TI", area: "Software", cbo: "2124-10", demand: "Alta Demanda", openJobsCount: 980, synonyms: ["frontend", "react", "vue", "javascript", "typescript"] },
    { id: "tech-3", name: "Desenvolvedor(a) Backend", category: "Tecnologia & TI", area: "Software", cbo: "2124-15", demand: "Alta Demanda", openJobsCount: 1150, synonyms: ["backend", "python", "java", "api", "sql"] },
    { id: "tech-4", name: "Analista de Suporte Técnico & Help Desk", category: "Tecnologia & TI", area: "Suporte & TI", cbo: "3172-10", demand: "Alta Demanda", openJobsCount: 1850, synonyms: ["helpdesk", "suporte", "hardware", "redes"] },
    { id: "tech-5", name: "Designer UI/UX & Produto Digital", category: "Tecnologia & TI", area: "Design & Produto", cbo: "2624-10", demand: "Crescente", openJobsCount: 520, synonyms: ["ui", "ux", "figma", "interface"] },
    { id: "tech-6", name: "Técnico(a) em Manutenção de Computadores & Notebooks", category: "Tecnologia & TI", area: "Hardware", cbo: "3171-10", demand: "Alta Demanda", openJobsCount: 1200, synonyms: ["manutenção pc", "conserto notebook", "gamer"] },
    { id: "const-1", name: "Eletricista Residencial e Comercial", category: "Construção & Reformas", area: "Elétrica", cbo: "7156-15", demand: "Alta Demanda", openJobsCount: 2100, synonyms: ["eletricista", "fiação", "disjuntor", "tomada", "quadro elétrico"] },
    { id: "const-2", name: "Instalador de Energia Solar / Fotovoltaica", category: "Construção & Reformas", area: "Energia Solar", cbo: "7156-25", demand: "Alta Demanda", openJobsCount: 940, synonyms: ["placa solar", "painel solar", "inversor solar"] },
    { id: "const-3", name: "Técnico em Climatização & Ar-Condicionado", category: "Construção & Reformas", area: "Climatização", cbo: "3141-10", demand: "Alta Demanda", openJobsCount: 1650, synonyms: ["ar condicionado", "split", "inverter", "carga de gás", "pmoc"] },
    { id: "const-4", name: "Encanador e Bombeiro Hidráulico", category: "Construção & Reformas", area: "Hidráulica", cbo: "7241-10", demand: "Alta Demanda", openJobsCount: 1800, synonyms: ["encanador", "cano", "vazamento", "sifão", "tubulação"] },
    { id: "const-5", name: "Pedreiro de Alvenaria, Reformas & Estrutura", category: "Construção & Reformas", area: "Construção Civil", cbo: "7152-10", demand: "Alta Demanda", openJobsCount: 3200, synonyms: ["pedreiro", "alvenaria", "assentar tijolo", "reboco", "reforma"] },
    { id: "const-6", name: "Pintor Profissional, Texturas & Grafiato", category: "Construção & Reformas", area: "Pintura", cbo: "7166-10", demand: "Alta Demanda", openJobsCount: 2300, synonyms: ["pintor", "massa corrida", "pintura", "grafiato"] },
    { id: "const-7", name: "Marceneiro de Móveis Planejados & Sob Medida", category: "Construção & Reformas", area: "Marcenaria", cbo: "7711-05", demand: "Alta Demanda", openJobsCount: 980, synonyms: ["armário planejado", "mdf", "cozinha planejada"] },
    { id: "const-8", name: "Montador de Móveis Residencial & Comercial", category: "Construção & Reformas", area: "Montagem", cbo: "7711-10", demand: "Alta Demanda", openJobsCount: 1950, synonyms: ["montar guarda-roupa", "mesa", "painel de tv"] },
    { id: "sales-1", name: "Vendedor(a) do Comércio Varejista", category: "Vendas & Comercial", area: "Varejo", cbo: "5211-10", demand: "Alta Demanda", openJobsCount: 5400, synonyms: ["vendedor", "balcão", "loja", "atendente"] },
    { id: "sales-2", name: "Representante Comercial Autônomo", category: "Vendas & Comercial", area: "B2B & Representação", cbo: "3541-25", demand: "Alta Demanda", openJobsCount: 1600, synonyms: ["representante", "vendas externas", "atacado"] },
    { id: "sales-3", name: "Corretor(a) de Imóveis (CRECI)", category: "Vendas & Comercial", area: "Imobiliário", cbo: "3544-10", demand: "Alta Demanda", openJobsCount: 2200, synonyms: ["imobiliária", "apartamentos", "creci", "casas"] },
    { id: "health-1", name: "Enfermeiro(a) Geral e Hospitalar", category: "Saúde & Bem-Estar", area: "Enfermagem", cbo: "2235-05", demand: "Alta Demanda", openJobsCount: 3100, synonyms: ["enfermeira", "coren", "hospital", "clínica"] },
    { id: "health-2", name: "Técnico(a) em Enfermagem", category: "Saúde & Bem-Estar", area: "Enfermagem", cbo: "3222-05", demand: "Alta Demanda", openJobsCount: 4200, synonyms: ["técnico enfermagem", "curativos", "medicação"] },
    { id: "health-3", name: "Cuidador(a) de Idosos e Acompanhante", category: "Saúde & Bem-Estar", area: "Cuidados Pessoais", cbo: "5162-10", demand: "Alta Demanda", openJobsCount: 2900, synonyms: ["cuidadora", "geriatria", "idoso", "home care"] },
    { id: "health-4", name: "Personal Trainer & Instrutor de Musculação", category: "Saúde & Bem-Estar", area: "Educação Física", cbo: "2241-20", demand: "Alta Demanda", openJobsCount: 1650, synonyms: ["academia", "treino", "crossfit", "cref"] },
    { id: "admin-1", name: "Assistente Administrativo", category: "Administrativo & Finanças", area: "Administração", cbo: "4110-10", demand: "Alta Demanda", openJobsCount: 6200, synonyms: ["auxiliar administrativo", "escritório", "planilhas", "atendimento"] },
    { id: "admin-2", name: "Contador(a) e Perito Contábil", category: "Administrativo & Finanças", area: "Contabilidade", cbo: "2522-10", demand: "Alta Demanda", openJobsCount: 1500, synonyms: ["crc", "tributos", "balanço", "fiscal"] },
    { id: "log-1", name: "Motorista de Van, Utilitários e Entregas", category: "Logística & Transporte", area: "Entregas", cbo: "7823-10", demand: "Alta Demanda", openJobsCount: 4500, synonyms: ["van", "fiorino", "entregas", "cnh b"] },
    { id: "log-2", name: "Motoboy e Entregador Delivery", category: "Logística & Transporte", area: "Delivery", cbo: "5191-10", demand: "Alta Demanda", openJobsCount: 6800, synonyms: ["motofrete", "ifood", "moto", "delivery"] },
    { id: "log-3", name: "Auxiliar de Logística e Expedição", category: "Logística & Transporte", area: "Operações", cbo: "4141-05", demand: "Alta Demanda", openJobsCount: 5100, synonyms: ["expedição", "estoque", "conferência", "armazém"] },
    { id: "gastro-1", name: "Cozinheiro(a) Geral e Restaurante", category: "Gastronomia & Alimentação", area: "Cozinha", cbo: "5132-05", demand: "Alta Demanda", openJobsCount: 3700, synonyms: ["cozinha", "restaurante", "pratos", "chef"] },
    { id: "gastro-2", name: "Pizzaiolo(a) Profissional", category: "Gastronomia & Alimentação", area: "Pizzaria", cbo: "5132-20", demand: "Alta Demanda", openJobsCount: 1600, synonyms: ["pizza", "forno", "massa"] },
    { id: "beauty-1", name: "Cabeleireiro(a) e Colorista", category: "Beleza & Estética", area: "Cabelos", cbo: "5161-10", demand: "Alta Demanda", openJobsCount: 2600, synonyms: ["corte", "mechas", "salão de beleza", "tintura"] },
    { id: "beauty-2", name: "Barbeiro e Especialista em Barba / Fade", category: "Beleza & Estética", area: "Barbearia", cbo: "5161-05", demand: "Alta Demanda", openJobsCount: 2100, synonyms: ["barbearia", "fade", "navalha", "corte masculino"] },
    { id: "beauty-3", name: "Manicure, Pedicure & Nail Designer", category: "Beleza & Estética", area: "Unhas", cbo: "5161-20", demand: "Alta Demanda", openJobsCount: 3300, synonyms: ["unhas", "gel", "fibra", "esmalte"] },
    { id: "edu-1", name: "Professor(a) de Idiomas (Inglês, Espanhol)", category: "Educação & Treinamento", area: "Línguas", cbo: "2394-15", demand: "Alta Demanda", openJobsCount: 1950, synonyms: ["inglês", "aulas", "conversação", "espanhol"] },
    { id: "mkt-1", name: "Social Media Manager & Gestor de Redes", category: "Marketing & Design", area: "Redes Sociais", cbo: "2614-10", demand: "Alta Demanda", openJobsCount: 2400, synonyms: ["instagram", "tiktok", "reels", "posts"] },
    { id: "mkt-2", name: "Gestor(a) de Tráfego Pago (Meta/Google Ads)", category: "Marketing & Design", area: "Mídia Paga", cbo: "2611-20", demand: "Alta Demanda", openJobsCount: 1600, synonyms: ["facebook ads", "google ads", "tráfego", "anúncios"] },
    { id: "sg-1", name: "Marido de Aluguel & Pequenos Reparos", category: "Serviços Gerais & Manutenção", area: "Reparos", cbo: "5143-20", demand: "Alta Demanda", openJobsCount: 3100, synonyms: ["faz tudo", "chuveiro", "quadro", "reparos"] },
    { id: "sg-2", name: "Diarista e Profissional de Limpeza", category: "Serviços Gerais & Manutenção", area: "Limpeza", cbo: "5143-25", demand: "Alta Demanda", openJobsCount: 5200, synonyms: ["faxina", "limpeza", "casa"] },
    { id: "law-1", name: "Advogado(a) Trabalhista, Cível e Família", category: "Jurídico & Consultoria", area: "Direito", cbo: "2410-05", demand: "Alta Demanda", openJobsCount: 1700, synonyms: ["oab", "processos", "jurídico", "trabalhista"] }
  ];

  let filtered = jobsList;

  if (category && category !== "Qualquer Categoria") {
    filtered = filtered.filter((j) => j.category === category);
  }

  if (q) {
    filtered = filtered.filter((j) => {
      const matchName = j.name.toLowerCase().includes(q);
      const matchArea = j.area.toLowerCase().includes(q);
      const matchCbo = j.cbo?.toLowerCase().includes(q);
      const matchSyn = j.synonyms.some((s) => s.toLowerCase().includes(q));
      return matchName || matchArea || matchCbo || matchSyn;
    });
  }

  res.json({
    total: filtered.length,
    category: category || "Qualquer Categoria",
    query: q,
    results: filtered.slice(0, 25),
  });
});

app.get("/api/profiles/:idOrSlug", (req, res) => {
  const param = req.params.idOrSlug.toLowerCase();
  const profile = cloudStore.profiles.find(
    (p) => p.id?.toLowerCase() === param || p.username?.toLowerCase() === param
  );
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  const gallery = cloudStore.gallery[profile.id] || [];
  const testimonials = cloudStore.testimonials[profile.id] || [];
  res.json({ profile, gallery, testimonials });
});

app.post("/api/profiles", (req, res) => {
  const incoming = req.body;
  if (!incoming || !incoming.id) {
    return res.status(400).json({ error: "Invalid profile data (missing id)" });
  }

  const now = new Date().toISOString();
  incoming.updated_at = now;

  const idx = cloudStore.profiles.findIndex(
    (p) => p.id === incoming.id || (p.username && p.username === incoming.username)
  );

  if (idx >= 0) {
    cloudStore.profiles[idx] = { ...cloudStore.profiles[idx], ...incoming };
  } else {
    cloudStore.profiles.push(incoming);
  }

  saveStore(cloudStore);
  broadcastSSE({
    type: "profile_updated",
    profile: incoming,
    timestamp: now,
  });

  res.json({ success: true, profile: incoming });
});

app.delete("/api/profiles/:id", (req, res) => {
  const { id } = req.params;
  cloudStore.profiles = cloudStore.profiles.filter((p) => p.id !== id);
  delete cloudStore.gallery[id];
  delete cloudStore.testimonials[id];

  saveStore(cloudStore);
  broadcastSSE({ type: "profile_deleted", id });
  res.json({ success: true });
});

// 4. Gallery API
app.get("/api/gallery", (req, res) => {
  const profileId = req.query.profile_id as string;
  if (profileId) {
    const photos = cloudStore.gallery[profileId] || [];
    return res.json({ photos });
  }
  res.json({ gallery: cloudStore.gallery });
});

app.post("/api/gallery", (req, res) => {
  const photo = req.body;
  if (!photo || !photo.profile_id || !photo.image_url) {
    return res.status(400).json({ error: "Invalid photo data" });
  }

  if (!photo.id) {
    photo.id = `photo-${Date.now()}`;
  }
  if (!photo.created_at) {
    photo.created_at = new Date().toISOString();
  }

  if (!cloudStore.gallery[photo.profile_id]) {
    cloudStore.gallery[photo.profile_id] = [];
  }

  // Check if exists
  const existingIdx = cloudStore.gallery[photo.profile_id].findIndex((p) => p.id === photo.id);
  if (existingIdx >= 0) {
    cloudStore.gallery[photo.profile_id][existingIdx] = photo;
  } else {
    cloudStore.gallery[photo.profile_id] = [photo, ...cloudStore.gallery[photo.profile_id]];
  }

  saveStore(cloudStore);
  broadcastSSE({
    type: "gallery_photo_added",
    photo,
    profileId: photo.profile_id,
  });

  res.json({ success: true, photo });
});

app.delete("/api/gallery/:id", (req, res) => {
  const { id } = req.params;
  const profileId = req.query.profile_id as string;

  let deleted = false;
  if (profileId && cloudStore.gallery[profileId]) {
    cloudStore.gallery[profileId] = cloudStore.gallery[profileId].filter((p) => p.id !== id);
    deleted = true;
  } else {
    for (const key of Object.keys(cloudStore.gallery)) {
      const originalLen = cloudStore.gallery[key].length;
      cloudStore.gallery[key] = cloudStore.gallery[key].filter((p) => p.id !== id);
      if (cloudStore.gallery[key].length !== originalLen) {
        deleted = true;
      }
    }
  }

  if (deleted) {
    saveStore(cloudStore);
    broadcastSSE({
      type: "gallery_photo_deleted",
      photoId: id,
      profileId,
    });
  }

  res.json({ success: true, deleted });
});

// 5. Image Upload Endpoint (Fail-safe for when Supabase Storage blocks uploads)
app.post("/api/upload", (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    // Match base64 data header
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "jpg";

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes("png")) ext = "png";
      else if (mime.includes("webp")) ext = "webp";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(imageBase64, "base64");
    }

    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    res.json({ success: true, url: publicUrl, filename: safeFilename });
  } catch (err: any) {
    console.error("[Upload] Error saving image:", err);
    res.status(500).json({ error: err.message || "Failed to save image" });
  }
});

// Start server with Vite middleware in dev or static files in prod
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TécnicoLink Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start();
