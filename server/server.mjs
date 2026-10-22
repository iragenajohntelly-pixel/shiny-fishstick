import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { scryptSync, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isProduction = process.env.NODE_ENV === "production" || process.argv.includes("--production");
const isPreview = process.argv.includes("--preview");
const databasePath = resolve(process.env.DATABASE_PATH || resolve(root, "data", "imboni.sqlite"));
mkdirSync(dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(readFileSync(resolve(root, "database", "schema.sql"), "utf8"));
const userColumns = db.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((column) => column.name === "preferred_language")) {
  db.exec("ALTER TABLE users ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'kin' CHECK (preferred_language IN ('kin', 'en'))");
}
const invalidIremboLinks = db.prepare("SELECT id, irembo_url FROM service_catalogue").all()
  .filter(({ irembo_url }) => {
    try {
      const destination = new URL(irembo_url);
      return destination.protocol !== "https:" || destination.hostname !== "irembo.gov.rw";
    } catch {
      return true;
    }
  });
if (invalidIremboLinks.length) {
  throw new Error(`Service catalogue contains a non-Irembo URL: ${invalidIremboLinks[0].id}`);
}

const sessionLifetimeSeconds = 7 * 24 * 60 * 60;
const cookieName = "imboni_session";
const sessionsToPrune = db.prepare("DELETE FROM sessions WHERE expires_at <= ?");
const findUserBySession = db.prepare(`
  SELECT users.id, users.name, users.email, users.preferred_language
  FROM sessions JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ? AND sessions.expires_at > ?
`);
const createSession = db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)");
const userByEmail = db.prepare("SELECT id, name, email, password_hash, preferred_language FROM users WHERE email = ?");
const updatePreferredLanguage = db.prepare("UPDATE users SET preferred_language = ? WHERE id = ?");
const createUser = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
const dummySalt = Buffer.alloc(16);
const dummyPasswordHash = `${dummySalt.toString("hex")}:${scryptSync("not-a-real-password", dummySalt, 64).toString("hex")}`;

function sendJson(response, status, value, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(JSON.stringify(value));
}

function sessionCookie(token, maxAge = sessionLifetimeSeconds) {
  const secure = isProduction && !isPreview ? "; Secure" : "";
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function sessionToken(request) {
  const cookieHeader = request.headers.cookie || "";
  const value = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

function currentUser(request) {
  const token = sessionToken(request);
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  sessionsToPrune.run(now);
  return findUserBySession.get(createHash("sha256").update(token).digest("hex"), now) || null;
}

function requestOriginIsLocal(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

async function readJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 16_384) {
      const error = new Error("Request body is too large.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Send a valid JSON request.");
    error.status = 400;
    throw error;
  }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, preferred_language: user.preferred_language };
}

function passwordMatches(password, storedHash) {
  const [saltHex, expectedHex] = storedHash.split(":");
  if (!saltHex || !expectedHex || !/^[a-f0-9]+$/.test(saltHex) || !/^[a-f0-9]+$/.test(expectedHex)) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/catalogue" && request.method === "GET") {
    const rows = db.prepare(`
      SELECT s.id, s.category_id, c.name_en AS category_en, c.name_kin AS category_kin,
        s.title_en, s.title_kin, s.requirements_en, s.requirements_kin,
        s.fee_rwf, s.processing_days, s.irembo_url, s.verification_status, s.updated_at
      FROM service_catalogue s
      JOIN categories c ON c.id = s.category_id
      ORDER BY c.name_en, s.title_en
    `).all();
    sendJson(response, 200, rows);
    return;
  }

  if (url.pathname === "/api/service-activity") {
    const user = currentUser(request);
    if (!user) {
      sendJson(response, 401, { error: "Sign in to view your Irembo link history." });
      return;
    }
    if (request.method === "GET") {
      const rows = db.prepare(`
        SELECT a.id, a.service_id, s.title_en, s.title_kin, a.created_at
        FROM service_activity a
        JOIN service_catalogue s ON s.id = a.service_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT 50
      `).all(user.id);
      sendJson(response, 200, rows);
      return;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." }, { Allow: "GET, POST" });
      return;
    }
    if (!requestOriginIsLocal(request)) {
      sendJson(response, 403, { error: "This request could not be verified." });
      return;
    }
    const body = await readJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.serviceId !== "string") {
      sendJson(response, 400, { error: "A valid service ID is required." });
      return;
    }
    const service = db.prepare("SELECT id FROM service_catalogue WHERE id = ?").get(body.serviceId);
    if (!service) {
      sendJson(response, 404, { error: "Service not found." });
      return;
    }
    db.prepare("INSERT INTO service_activity (user_id, service_id, action) VALUES (?, ?, 'irembo_link_opened')")
      .run(user.id, service.id);
    sendJson(response, 201, { recorded: true });
    return;
  }

  if (url.pathname === "/api/auth/me" && request.method === "GET") {
    sendJson(response, 200, { user: currentUser(request) });
    return;
  }

  if (!url.pathname.startsWith("/api/auth/")) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  if (!requestOriginIsLocal(request)) {
    sendJson(response, 403, { error: "This request could not be verified." });
    return;
  }

  if (url.pathname === "/api/auth/preferences") {
    if (request.method !== "PUT") {
      sendJson(response, 405, { error: "Method not allowed." }, { Allow: "PUT" });
      return;
    }
    const user = currentUser(request);
    if (!user) {
      sendJson(response, 401, { error: "Sign in to update your preferences." });
      return;
    }
    const body = await readJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body) || !["kin", "en"].includes(body.preferredLanguage)) {
      sendJson(response, 400, { error: "Choose Kinyarwanda or English." });
      return;
    }
    updatePreferredLanguage.run(body.preferredLanguage, user.id);
    sendJson(response, 200, { preferredLanguage: body.preferredLanguage });
    return;
  }

  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    const token = sessionToken(request);
    if (token) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(createHash("sha256").update(token).digest("hex"));
    sendJson(response, 200, { user: null }, { "Set-Cookie": sessionCookie("", 0) });
    return;
  }

  if (url.pathname !== "/api/auth/register" && url.pathname !== "/api/auth/login") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." }, { Allow: "POST" });
    return;
  }

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    sendJson(response, 400, { error: "Send a JSON object." });
    return;
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendJson(response, 400, { error: "Enter a valid email address." });
    return;
  }
  if (password.length < 12 || password.length > 128) {
    sendJson(response, 400, { error: "Use a password between 12 and 128 characters." });
    return;
  }

  let user;
  if (url.pathname === "/api/auth/register") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) {
      sendJson(response, 400, { error: "Enter a name between 1 and 80 characters." });
      return;
    }
    const salt = randomBytes(16);
    const passwordHash = `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
    try {
      const result = createUser.run(name, email, passwordHash);
      user = { id: Number(result.lastInsertRowid), name, email, preferred_language: "kin" };
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE" || error.message.includes("UNIQUE constraint failed: users.email")) {
        sendJson(response, 409, { error: "An account with that email already exists. Sign in instead." });
        return;
      }
      throw error;
    }
  } else {
    const stored = userByEmail.get(email);
    const passwordIsValid = passwordMatches(password, stored?.password_hash || dummyPasswordHash);
    if (!stored || !passwordIsValid) {
      sendJson(response, 401, { error: "Email or password is incorrect." });
      return;
    }
    user = { id: stored.id, name: stored.name, email: stored.email, preferred_language: stored.preferred_language };
  }

  const token = randomBytes(32).toString("hex");
  const now = Math.floor(Date.now() / 1000);
  sessionsToPrune.run(now);
  createSession.run(createHash("sha256").update(token).digest("hex"), user.id, now + sessionLifetimeSeconds);
  sendJson(response, 200, { user: publicUser(user) }, { "Set-Cookie": sessionCookie(token) });
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function serveProductionFile(request, response, pathname) {
  const distDirectory = resolve(root, "dist");
  const decodedPath = decodeURIComponent(pathname);
  let filePath = resolve(distDirectory, `.${decodedPath}`);
  if (!filePath.startsWith(`${distDirectory}${sep}`) && filePath !== distDirectory) {
    response.writeHead(400).end("Bad request");
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) filePath = resolve(distDirectory, "index.html");
  const body = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(request.method === "HEAD" ? undefined : body);
}

const vite = isProduction ? null : await createViteServer({
  configFile: resolve(root, "vite.config.ts"),
  root,
  server: { middlewareMode: true },
  appType: "spa",
});

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }
    if (vite) {
      vite.middlewares(request, response, (error) => {
        if (error) {
          vite.ssrFixStacktrace(error);
          console.error(error);
          if (!response.headersSent) response.writeHead(500).end("Internal server error");
        }
      });
      return;
    }
    await serveProductionFile(request, response, url.pathname);
  } catch (error) {
    console.error("Request failed:", error);
    sendJson(response, error.status || 500, { error: error.status ? error.message : "The request could not be completed." });
  }
});

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";
server.listen(port, host, () => {
  console.log(`Imboni is ready at http://${host}:${port}`);
  console.log(`SQLite database: ${databasePath}`);
  if (isProduction) console.log("Production cookies require HTTPS at the public endpoint.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => {
      vite?.close();
      db.close();
      process.exit(0);
    });
  });
}
