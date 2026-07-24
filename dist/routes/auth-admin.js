import { prisma } from "../lib/database.js";
/**
 * Admin authentication routes
 * - POST /api/admin/login - Login con unique ID
 * - POST /api/admin/init - Inicializar usuario admin (solo si no existe)
 */
export async function authAdminRoutes(app) {
    /**
     * Login de admin con unique ID
     * Body: { adminUniqueId: string }
     */
    app.post("/admin/login", async (request, reply) => {
        try {
            const { adminUniqueId } = request.body;
            if (!adminUniqueId || adminUniqueId.trim().length === 0) {
                return reply.status(400).send({ error: "Admin ID is required" });
            }
            // Buscar admin por unique ID
            const admin = await prisma.user.findUnique({
                where: { adminUniqueId: adminUniqueId.trim() },
            });
            if (!admin) {
                return reply.status(401).send({ error: "Invalid admin ID" });
            }
            if (admin.role !== "ADMIN") {
                return reply.status(403).send({ error: "User is not an admin" });
            }
            // Crear o actualizar sesión
            const session = await prisma.session.create({
                data: {
                    userId: admin.id,
                    token: generateToken(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                    ipAddress: request.ip,
                    userAgent: request.headers["user-agent"],
                },
            });
            return reply.send({
                success: true,
                session: {
                    id: session.id,
                    token: session.token,
                    userId: session.userId,
                    expiresAt: session.expiresAt,
                },
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                },
            });
        }
        catch (error) {
            app.log.error(error);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    /**
     * Inicializar usuario admin (solo si no existe ninguno)
     * Body: { adminUniqueId: string, email: string, name?: string }
     * IMPORTANTE: Esto debería estar protegido en producción (requiere token especial o solo localhost)
     */
    app.post("/admin/init", async (request, reply) => {
        try {
            const { adminUniqueId, email, name } = request.body;
            // Verificar si ya existe algún admin
            const existingAdmin = await prisma.user.findFirst({
                where: { role: "ADMIN" },
            });
            if (existingAdmin) {
                return reply.status(403).send({
                    error: "Admin user already exists",
                    adminId: existingAdmin.id,
                });
            }
            // Validar entrada
            if (!adminUniqueId || !email) {
                return reply.status(400).send({
                    error: "adminUniqueId and email are required",
                });
            }
            // Validar que el email no exista
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (existingEmail) {
                return reply.status(400).send({
                    error: "Email already in use",
                });
            }
            // Validar que el adminUniqueId no exista
            const existingId = await prisma.user.findUnique({
                where: { adminUniqueId },
            });
            if (existingId) {
                return reply.status(400).send({
                    error: "Admin ID already in use",
                });
            }
            // Crear admin
            const admin = await prisma.user.create({
                data: {
                    email,
                    name: name || "Admin",
                    role: "ADMIN",
                    adminUniqueId: adminUniqueId.trim(),
                    emailVerified: true, // Los admins inician verificados
                },
            });
            return reply.status(201).send({
                success: true,
                admin: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                    adminUniqueId: admin.adminUniqueId,
                },
            });
        }
        catch (error) {
            app.log.error(error);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
    /**
     * Verificar si existe admin
     */
    app.get("/admin/exists", async (request, reply) => {
        try {
            const admin = await prisma.user.findFirst({
                where: { role: "ADMIN" },
                select: { id: true, email: true, name: true },
            });
            return reply.send({
                exists: !!admin,
                admin: admin || null,
            });
        }
        catch (error) {
            app.log.error(error);
            return reply.status(500).send({ error: "Internal server error" });
        }
    });
}
/**
 * Generar token aleatorio para sesión
 */
function generateToken() {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
}
