const startedAt = Date.now();
export async function healthRoutes(app) {
    app.get("/", async (req, reply) => {
        return reply.redirect("/health");
    });
    app.get("/health", async (req, reply) => {
        const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        reply.type("text/html").send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Black Polar Core Crow</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0a;
      color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .card {
      text-align: center;
      padding: 2.5rem 3rem;
      border: 1px solid #262626;
      border-radius: 12px;
      background: #111;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #4ade80;
      margin-bottom: 1rem;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 8px #4ade80;
    }
    h1 { font-size: 1.4rem; margin: 0 0 0.5rem; font-weight: 600; }
    p { color: #a3a3a3; margin: 0.25rem 0; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="status"><span class="dot"></span> Operativo</div>
    <h1>CoreCrow API</h1>
    <p>Uptime: ${hours}h ${minutes}m</p>
    <p>api.blackpolar.org</p>
  </div>
</body>
</html>
    `);
    });
}
