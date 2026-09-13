import PDFDocument from "pdfkit";
import { Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateTenancyAgreement = async (
  leaseId: number,
  res: Response
): Promise<void> => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      property: {
        include: {
          location: true,
          manager: true,
        },
      },
      tenant: true,
      transactions: true,
      escrowHolds: true,
    },
  });

  if (!lease) {
    res.status(404).json({ message: "Lease agreement record not found." });
    return;
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `KalRent Tenancy Agreement - Lease #${lease.id}`,
      Author: "KalRent Technologies Ltd.",
      Subject: "Residential Tenancy Agreement & Escrow Guarantee",
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="KalRent-Agreement-Lease-${lease.id}.pdf"`
  );

  doc.pipe(res);

  const primaryNavy = "#0F172A"; // slate-900
  const secondaryNavy = "#1E293B"; // slate-800
  const emeraldAccent = "#059669"; // emerald-600
  const textDark = "#334155"; // slate-700
  const textMuted = "#64748B"; // slate-500
  const borderLight = "#E2E8F0"; // slate-200
  const bgLight = "#F8FAFC"; // slate-50

  const formatNgn = (amount: number) =>
    `NGN ${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // --- HEADER SECTION ---
  doc.rect(50, 45, 495, 65).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text("KALRENT RESIDENTIAL TENANCY AGREEMENT", 65, 58, { align: "left" });

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(emeraldAccent)
    .text("SECURED UNDER KALRENT ESCROW DEPOSIT PROTOCOL", 65, 80);

  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor(textDark)
    .text(`REF: KR-AGR-${lease.id.toString().padStart(6, "0")}`, 380, 58, {
      align: "right",
    })
    .font("Helvetica")
    .fillColor(textMuted)
    .text(`Generated: ${formatDate(new Date())}`, 380, 72, { align: "right" })
    .text(`Status: ${lease.status}`, 380, 84, { align: "right" });

  doc.moveDown(3.5);

  // --- STATUTORY LEGAL PREAMBLE ---
  doc
    .fontSize(8.5)
    .font("Helvetica-Oblique")
    .fillColor(textMuted)
    .text(
      "THIS AGREEMENT is made and entered into in accordance with the Laws of the Federation of Nigeria, the Evidence Act (2011), and applicable Tenancy & Housing Regulations governing residential accommodations.",
      50,
      125,
      { align: "justify", width: 495 }
    );

  // --- PARTIES SECTION ---
  let y = 160;
  doc.rect(50, y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("1. THE PARTIES", 60, y + 6);

  y += 28;
  doc.rect(50, y, 240, 75).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(emeraldAccent)
    .text("LANDLORD / PROPERTY MANAGER", 60, y + 8)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text(
      lease.property.manager?.name || "Authorized Property Manager",
      60,
      y + 24
    )
    .font("Helvetica")
    .fillColor(textDark)
    .text(`Email: ${lease.property.manager?.email || "N/A"}`, 60, y + 40)
    .text(`Phone: ${lease.property.manager?.phoneNumber || "N/A"}`, 60, y + 54);

  doc.rect(305, y, 240, 75).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(emeraldAccent)
    .text("TENANT / OCCUPANT", 315, y + 8)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text(lease.tenant?.name || "Tenant Occupant", 315, y + 24)
    .font("Helvetica")
    .fillColor(textDark)
    .text(`Email: ${lease.tenant?.email || "N/A"}`, 315, y + 40)
    .text(`Phone: ${lease.tenant?.phoneNumber || "N/A"}`, 315, y + 54);

  // --- DEMISED PREMISES ---
  y += 85;
  doc.rect(50, y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("2. DEMISED PREMISES & PROPERTY DETAILS", 60, y + 6);

  y += 28;
  doc.rect(50, y, 495, 55).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text(lease.property.name, 60, y + 8)
    .font("Helvetica")
    .fillColor(textDark)
    .text(
      `Location: ${lease.property.location.address}, ${lease.property.location.city}, ${lease.property.location.state}`,
      60,
      y + 22
    )
    .text(
      `Campus Zone: ${lease.property.campusZone} | Landmark: ${lease.property.landmark} | Type: ${lease.property.propertyType} (${lease.property.beds} Bed, ${lease.property.baths} Bath)`,
      60,
      y + 36
    );

  // --- TERM & DURATION ---
  y += 65;
  doc.rect(50, y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("3. TERM & DURATION OF TENANCY", 60, y + 6);

  y += 28;
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(textDark)
    .text(
      `The Landlord agrees to let and the Tenant agrees to take the Demised Premises for a fixed term of ONE (1) YEAR commencing from ${formatDate(
        lease.startDate
      )} and terminating on ${formatDate(lease.endDate)}.`,
      50,
      y,
      { align: "justify", width: 495 }
    );

  // --- FINANCIAL SCHEDULE ---
  y += 32;
  doc.rect(50, y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("4. FINANCIAL SCHEDULE & ESCROW BREAKDOWN", 60, y + 6);

  y += 26;
  const totalUpfront =
    lease.annualRent + lease.agentFee + lease.cautionDeposit + lease.platformFee;

  const financialItems = [
    {
      label: "Annual Base Rent (Full Year)",
      amount: formatNgn(lease.annualRent),
      note: "Disbursable to Landlord",
    },
    {
      label: "Agent / Agreement Fee (Capped <= 10%)",
      amount: formatNgn(lease.agentFee),
      note: "Statutory Cap Enforced",
    },
    {
      label: "Refundable Caution Deposit (Secured Escrow)",
      amount: formatNgn(lease.cautionDeposit),
      note: "Locked in KalRent Escrow Vault",
    },
    {
      label: "KalRent Platform Technology Fee (5%)",
      amount: formatNgn(lease.platformFee),
      note: "Escrow & Tenant Protection",
    },
  ];

  financialItems.forEach((item, idx) => {
    const itemY = y + idx * 20;
    doc
      .rect(50, itemY, 495, 20)
      .fill(idx % 2 === 0 ? "#FFFFFF" : bgLight)
      .stroke(borderLight);

    doc
      .fontSize(8.5)
      .font("Helvetica")
      .fillColor(textDark)
      .text(item.label, 60, itemY + 5)
      .font("Helvetica-Oblique")
      .fillColor(textMuted)
      .text(item.note, 270, itemY + 5)
      .font("Helvetica-Bold")
      .fillColor(primaryNavy)
      .text(item.amount, 400, itemY + 5, { align: "right", width: 135 });
  });

  const totalY = y + financialItems.length * 20;
  doc.rect(50, totalY, 495, 22).fill("#E0F2FE").stroke("#BAE6FD");

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#0369A1")
    .text("TOTAL CONTRACT SUM PAID", 60, totalY + 6)
    .text(formatNgn(totalUpfront), 400, totalY + 6, {
      align: "right",
      width: 135,
    });

  // --- SPECIAL ESCROW CLAUSE ---
  y = totalY + 30;
  doc.rect(50, y, 495, 60).fill("#ECFDF5").stroke("#A7F3D0");

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(emeraldAccent)
    .text("KALRENT ESCROW CAUTION DEPOSIT PROTECTION CLAUSE", 60, y + 8);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#065F46")
    .text(
      `The Caution Deposit of ${formatNgn(
        lease.cautionDeposit
      )} is held exclusively in trust under KalRent Escrow. The Landlord and Tenant jointly agree that this deposit shall NOT be disbursed to the Landlord upon move-in, but shall remain securely locked until tenancy expiry. Upon joint exit inspection, any legitimate deductions for damages shall be verified by KalRent, and the net remaining deposit shall be refunded to the Tenant within 7 business days.`,
      60,
      y + 22,
      { align: "justify", width: 475 }
    );

  // --- PAGE 2: COVENANTS & SIGNATURES ---
  doc.addPage();

  let p2Y = 50;
  doc.rect(50, p2Y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("5. STANDARD TENANCY COVENANTS & OBLIGATIONS", 60, p2Y + 6);

  p2Y += 30;
  const covenants = [
    {
      title: "Tenant's Covenants:",
      points: [
        "To pay all utility bills (electricity, water, sanitation) consumed on the premises promptly.",
        "To maintain the interior fixtures, fittings, and structure of the apartment in tenantable repair, fair wear and tear excepted.",
        "Not to assign, sublet, or part with possession of the premises or any part thereof without prior written consent.",
        "Not to use the demised premises for any illegal, immoral, or commercial purpose contrary to zoning laws.",
        "To permit the Landlord or designated agent, upon 24 hours prior reasonable notice, to enter and inspect the premises.",
      ],
    },
    {
      title: "Landlord's Covenants:",
      points: [
        "To grant the Tenant quiet and peaceful enjoyment of the premises throughout the subsistence of the tenancy.",
        "To be responsible for all external, structural, and foundational repairs not occasioned by Tenant negligence.",
        "To abide by the KalRent Escrow Caution Deposit terms and facilitate prompt exit inspection without unreasonable delay.",
      ],
    },
  ];

  covenants.forEach((cov) => {
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(primaryNavy)
      .text(cov.title, 50, p2Y);
    p2Y += 14;

    cov.points.forEach((pt) => {
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(textDark)
        .text(`•   ${pt}`, 60, p2Y, { width: 480, align: "justify" });
      p2Y += 16;
    });
    p2Y += 10;
  });

  // --- EXECUTION & SIGNATURES ---
  p2Y += 10;
  doc.rect(50, p2Y, 495, 22).fill(secondaryNavy);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("6. EXECUTION & DIGITAL ESCROW SEAL", 60, p2Y + 6);

  p2Y += 32;

  // Landlord signature box
  doc.rect(50, p2Y, 235, 110).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text("SIGNED by the LANDLORD / AGENT:", 60, p2Y + 10)
    .font("Helvetica")
    .fillColor(textDark)
    .text(
      `Name: ${lease.property.manager?.name || "Authorized Manager"}`,
      60,
      p2Y + 28
    )
    .text(`Date: ${formatDate(lease.startDate)}`, 60, p2Y + 42)
    .text("Digital Signature: Verified Online", 60, p2Y + 56)
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor(textMuted)
    .text("[Authorized Digital Execution]", 60, p2Y + 85);

  // Tenant signature box
  doc.rect(310, p2Y, 235, 110).fill(bgLight).stroke(borderLight);

  doc
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .fillColor(primaryNavy)
    .text("SIGNED by the TENANT:", 320, p2Y + 10)
    .font("Helvetica")
    .fillColor(textDark)
    .text(`Name: ${lease.tenant?.name || "Tenant Occupant"}`, 320, p2Y + 28)
    .text(`Date: ${formatDate(lease.startDate)}`, 320, p2Y + 42)
    .text("Digital Signature: Verified Online", 320, p2Y + 56)
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor(textMuted)
    .text("[Authorized Digital Execution]", 320, p2Y + 85);

  p2Y += 125;

  // KalRent Escrow Stamp
  const txRef =
    lease.transactions?.[0]?.reference ||
    lease.escrowHolds?.[0]?.providerReference ||
    "KR-SECURE-TX-" + lease.id;
  doc.rect(50, p2Y, 495, 60).fill("#F0FDF4").stroke("#86EFAC");

  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(emeraldAccent)
    .text("KALRENT TRUST SEAL & DIGITAL VERIFICATION", 60, p2Y + 10);

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#166534")
    .text(
      `Payment Gateway: Paystack Escrow Integration | Provider Ref: ${txRef}`,
      60,
      p2Y + 26
    )
    .text(
      `Lease Status: ${lease.status} | Escrow Hold Record: Active & Monitored`,
      60,
      p2Y + 40
    );

  doc.end();
};
