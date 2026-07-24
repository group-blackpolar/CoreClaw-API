import { prisma } from "../lib/database.js";
export async function userRoutes(app) {
    // Lista de usuarios — solo para admins (agregar middleware de rol después)
    app.get("/users", async () => {
        return prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
    });
    app.get("/users/:id", async (request) => {
        const { id } = request.params;
        return prisma.user.findUnique({ where: { id } });
    });
}
