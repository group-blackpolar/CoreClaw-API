#!/usr/bin/env node

/**
 * Script para inicializar usuario admin
 * Uso: node scripts/create-admin.js
 */

import { prisma } from "../src/lib/database.js";
import { randomBytes } from "crypto";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log("\n=== Black Polar Admin Setup ===\n");

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("❌ Admin ya existe:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   ID: ${existingAdmin.id}`);
      rl.close();
      process.exit(1);
    }

    // Pedir datos
    const email = await question("Email del admin: ");
    const name = await question("Nombre del admin: ");
    const customId = await question(
      "Admin ID único (o presiona Enter para generar): "
    );

    const adminUniqueId =
      customId.trim() || `ADMIN_${randomBytes(8).toString("hex").toUpperCase()}`;

    console.log("\n📋 Verificando datos...");

    // Validar email
    if (!email.includes("@")) {
      console.log("❌ Email inválido");
      rl.close();
      process.exit(1);
    }

    // Verificar que email no exista
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      console.log("❌ Email ya existe");
      rl.close();
      process.exit(1);
    }

    // Crear admin
    console.log("\n✅ Creando admin...");
    const admin = await prisma.user.create({
      data: {
        email,
        name: name || "Admin",
        role: "ADMIN",
        adminUniqueId,
        emailVerified: true,
      },
    });

    console.log("\n✅ Admin creado exitosamente!\n");
    console.log("📝 Credenciales:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Admin ID: ${admin.adminUniqueId}`);
    console.log(`   User ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}`);
    console.log("\n💡 Guarda el Admin ID en un lugar seguro!\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
