import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// High body limits for compressed base64 images upload fallback
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

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
