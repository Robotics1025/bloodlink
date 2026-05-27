"use server"
import { prisma } from "@/lib/prisma"

export async function getAdminStats() {
  const [donors, hospitals, requests, lowStock] = await Promise.all([
    prisma.donor.count(),
    prisma.hospital.count({ where: { status: "APPROVED" } }),
    prisma.bloodRequest.count(),
    prisma.inventory.count({ where: { availableUnits: { lte: 5 } } }),
  ])
  return { donors, hospitals, requests, lowStock }
}

export async function getAllDonors() {
  return prisma.donor.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateDonorStatus(donorId: number, status: "AVAILABLE" | "UNAVAILABLE") {
  await prisma.donor.update({ where: { id: donorId }, data: { availabilityStatus: status } })
  return { success: true }
}

export async function deleteDonor(donorId: number) {
  await prisma.donor.delete({ where: { id: donorId } })
  return { success: true }
}

export async function getAllHospitals() {
  return prisma.hospital.findMany({ orderBy: { createdAt: "desc" } })
}

export async function updateHospitalStatus(hospitalId: number, status: "PENDING" | "APPROVED" | "DISABLED") {
  await prisma.hospital.update({ where: { id: hospitalId }, data: { status } })
  return { success: true }
}

export async function deleteHospital(hospitalId: number) {
  await prisma.hospital.delete({ where: { id: hospitalId } })
  return { success: true }
}

export async function getReportData() {
  const requests = await prisma.bloodRequest.groupBy({
    by: ["bloodGroup", "status"],
    _count: { id: true },
  })
  const monthlyRequests = await prisma.bloodRequest.findMany({
    select: { createdAt: true, status: true, bloodGroup: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  })
  return { requests, monthlyRequests }
}
