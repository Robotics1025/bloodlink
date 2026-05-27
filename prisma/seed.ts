import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Blood Link System database...");

  // Seed Admin
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@bloodlink.com" },
    update: {},
    create: {
      fullName: "System Administrator",
      email: "admin@bloodlink.com",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Admin created:", admin.email);

  // Seed Hospital
  const hospitalHash = await bcrypt.hash("hospital123", 12);
  const hospital = await prisma.hospital.upsert({
    where: { email: "nairobi@bloodlink.com" },
    update: {},
    create: {
      hospitalName: "Nairobi General Hospital",
      email: "nairobi@bloodlink.com",
      passwordHash: hospitalHash,
      phone: "+254700000001",
      location: "Nairobi, Kenya",
      licenseNumber: "KNH-2024-001",
      status: "APPROVED",
    },
  });
  console.log("✓ Hospital created:", hospital.hospitalName);

  // Seed inventory for hospital
  const bloodGroups = [
    "A_POS", "A_NEG", "B_POS", "B_NEG",
    "AB_POS", "AB_NEG", "O_POS", "O_NEG",
  ] as const;

  const inventoryUnits = [12, 3, 18, 5, 8, 2, 25, 14];

  for (let i = 0; i < bloodGroups.length; i++) {
    const existing = await prisma.inventory.findFirst({
      where: {
        hospitalId: null,
        bloodGroup: bloodGroups[i],
      },
    });

    if (existing) {
      await prisma.inventory.update({
        where: { id: existing.id },
        data: { availableUnits: inventoryUnits[i] },
      });
    } else {
      await prisma.inventory.create({
        data: {
          bloodGroup: bloodGroups[i],
          availableUnits: inventoryUnits[i],
          hospitalId: null,
        },
      });
    }
  }
  console.log("✓ Central Inventory seeded");

  // Seed Donors
  const donorHash = await bcrypt.hash("donor123", 12);
  const donors = [
    { fullName: "James Mwangi", email: "james@bloodlink.com", bloodGroup: "O_POS" as const, location: "Nairobi, Kenya", phone: "+254700000002" },
    { fullName: "Grace Wanjiru", email: "grace@bloodlink.com", bloodGroup: "A_POS" as const, location: "Mombasa, Kenya", phone: "+254700000003" },
    { fullName: "Samuel Otieno", email: "samuel@bloodlink.com", bloodGroup: "B_NEG" as const, location: "Nairobi, Kenya", phone: "+254700000004" },
    { fullName: "Faith Kamau", email: "faith@bloodlink.com", bloodGroup: "AB_POS" as const, location: "Kisumu, Kenya", phone: "+254700000005" },
  ];

  for (const donor of donors) {
    await prisma.donor.upsert({
      where: { email: donor.email },
      update: {},
      create: { ...donor, passwordHash: donorHash, availabilityStatus: "AVAILABLE" },
    });
  }
  console.log("✓ Donors created");

  // Seed Blood Requests
  await prisma.bloodRequest.createMany({
    skipDuplicates: true,
    data: [
      { hospitalId: hospital.id, bloodGroup: "O_NEG", unitsRequired: 5, urgencyLevel: "CRITICAL", reason: "Emergency surgery patient", location: "Nairobi, Kenya", status: "PENDING" },
      { hospitalId: hospital.id, bloodGroup: "AB_NEG", unitsRequired: 3, urgencyLevel: "URGENT", reason: "Trauma patient", location: "Nairobi, Kenya", status: "PENDING" },
      { hospitalId: hospital.id, bloodGroup: "A_POS", unitsRequired: 8, urgencyLevel: "NORMAL", reason: "Elective surgery", location: "Nairobi, Kenya", status: "APPROVED" },
    ],
  });
  console.log("✓ Blood requests created");

  // Seed Blood Drive
  await prisma.bloodDrive.create({
    data: {
      title: "National Blood Drive — Nairobi",
      location: "Uhuru Park, Nairobi",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: "08:00",
      endTime: "17:00",
      status: "PUBLISHED",
      description: "Join us for the national blood donation drive. Every drop counts!",
      createdById: admin.id,
    },
  });
  console.log("✓ Blood drive created");

  console.log("\n🩸 Blood Link System seeded successfully!");
  console.log("\nTest credentials:");
  console.log("  Admin: admin@bloodlink.com / admin123");
  console.log("  Hospital: nairobi@bloodlink.com / hospital123");
  console.log("  Donor: james@bloodlink.com / donor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
