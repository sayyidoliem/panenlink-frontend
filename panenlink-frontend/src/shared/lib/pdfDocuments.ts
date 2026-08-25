import { jsPDF } from "jspdf";

type ShipmentDocumentData = {
  loadId: string;
  commodity: string;
  weight: string;
  origin: string;
  destination: string;
  driverName: string;
  vehiclePlate: string;
  vehicleType: string;
  status: string;
  date: string;
};

const COLORS = {
  primary: [33, 70, 22] as const,
  primaryContainer: [56, 94, 43] as const,
  secondary: [143, 76, 42] as const,
  text: [26, 28, 24] as const,
  muted: [66, 73, 62] as const,
  line: [194, 201, 187] as const,
  low: [244, 244, 237] as const,
  white: [255, 255, 255] as const,
};

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
}

function drawDocumentHeader(
  pdf: jsPDF,
  title: string,
  documentNumber: string,
) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFillColor(...COLORS.primaryContainer);
  pdf.rect(0, 0, pageWidth, 35, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("PanenLink", 16, 16);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Agritech Logistics Marketplace", 16, 23);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(title, pageWidth - 16, 16, {
    align: "right",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(documentNumber, pageWidth - 16, 23, {
    align: "right",
  });

  pdf.setTextColor(...COLORS.text);
}

function drawSectionTitle(
  pdf: jsPDF,
  title: string,
  y: number,
) {
  pdf.setFillColor(...COLORS.low);
  pdf.roundedRect(16, y, 178, 10, 2, 2, "F");

  pdf.setTextColor(...COLORS.primary);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text(title, 20, y + 6.5);

  pdf.setTextColor(...COLORS.text);

  return y + 16;
}

function drawInformationRow(
  pdf: jsPDF,
  label: string,
  value: string,
  y: number,
) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(label, 20, y);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...COLORS.text);

  const splitValue = pdf.splitTextToSize(
    value || "-",
    108,
  );

  pdf.text(splitValue, 76, y);

  const rowHeight = Math.max(
    8,
    splitValue.length * 5,
  );

  pdf.setDrawColor(...COLORS.line);
  pdf.line(20, y + rowHeight - 3, 190, y + rowHeight - 3);

  return y + rowHeight;
}

function drawRoute(
  pdf: jsPDF,
  origin: string,
  destination: string,
  y: number,
) {
  pdf.setFillColor(...COLORS.low);
  pdf.roundedRect(16, y, 178, 34, 3, 3, "F");

  pdf.setFillColor(...COLORS.primaryContainer);
  pdf.circle(26, y + 17, 3, "F");
  pdf.circle(184, y + 17, 3, "F");

  pdf.setDrawColor(...COLORS.primaryContainer);
  pdf.setLineWidth(1);
  pdf.line(29, y + 17, 181, y + 17);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.text);

  const originText = pdf.splitTextToSize(
    origin,
    65,
  );

  const destinationText = pdf.splitTextToSize(
    destination,
    65,
  );

  pdf.text(originText, 20, y + 27);
  pdf.text(destinationText, 190, y + 27, {
    align: "right",
  });

  return y + 42;
}

function drawSignatureSection(
  pdf: jsPDF,
  leftTitle: string,
  rightTitle: string,
  y: number,
) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...COLORS.muted);

  pdf.text(leftTitle, 45, y, {
    align: "center",
  });

  pdf.text(rightTitle, 165, y, {
    align: "center",
  });

  pdf.setDrawColor(...COLORS.line);
  pdf.line(20, y + 28, 70, y + 28);
  pdf.line(140, y + 28, 190, y + 28);

  pdf.setFontSize(8);
  pdf.text("Nama dan tanda tangan", 45, y + 34, {
    align: "center",
  });

  pdf.text("Nama dan tanda tangan", 165, y + 34, {
    align: "center",
  });
}

function drawFooter(pdf: jsPDF) {
  const pageHeight =
    pdf.internal.pageSize.getHeight();
  const pageWidth =
    pdf.internal.pageSize.getWidth();

  pdf.setDrawColor(...COLORS.line);
  pdf.line(
    16,
    pageHeight - 18,
    pageWidth - 16,
    pageHeight - 18,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.muted);

  pdf.text(
    "Dokumen dibuat secara elektronik melalui PanenLink.",
    16,
    pageHeight - 11,
  );

  pdf.text(
    `Dicetak: ${new Date().toLocaleString("id-ID")}`,
    pageWidth - 16,
    pageHeight - 11,
    {
      align: "right",
    },
  );
}

export function downloadSuratJalanPdf(
  data: ShipmentDocumentData,
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawDocumentHeader(
    pdf,
    "SURAT JALAN",
    `Nomor: SJ-${data.loadId}`,
  );

  let y = 45;

  y = drawSectionTitle(
    pdf,
    "INFORMASI PENGIRIMAN",
    y,
  );

  y = drawInformationRow(
    pdf,
    "ID Muatan",
    data.loadId,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Tanggal",
    data.date,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Komoditas",
    data.commodity,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Berat Muatan",
    data.weight,
    y,
  );

  y += 4;

  y = drawSectionTitle(pdf, "RUTE", y);
  y = drawRoute(
    pdf,
    data.origin,
    data.destination,
    y,
  );

  y = drawSectionTitle(
    pdf,
    "INFORMASI ARMADA",
    y,
  );

  y = drawInformationRow(
    pdf,
    "Nama Pengemudi",
    data.driverName,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Nomor Polisi",
    data.vehiclePlate,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Jenis Kendaraan",
    data.vehicleType,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Status",
    data.status,
    y,
  );

  y += 12;

  drawSignatureSection(
    pdf,
    "Pengirim",
    "Pengemudi",
    y,
  );

  drawFooter(pdf);

  pdf.save(
    `Surat-Jalan-${sanitizeFileName(data.loadId)}.pdf`,
  );
}

export function downloadPodPdf(
  data: ShipmentDocumentData,
) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  drawDocumentHeader(
    pdf,
    "PROOF OF DELIVERY",
    `Nomor: POD-${data.loadId}`,
  );

  let y = 45;

  pdf.setFillColor(...COLORS.primary);
  pdf.roundedRect(16, y, 178, 22, 3, 3, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("PENGIRIMAN SELESAI", 105, y + 9, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(
    "Muatan telah diterima oleh pihak penerima",
    105,
    y + 16,
    {
      align: "center",
    },
  );

  pdf.setTextColor(...COLORS.text);
  y += 32;

  y = drawSectionTitle(
    pdf,
    "DETAIL PENGIRIMAN",
    y,
  );

  y = drawInformationRow(
    pdf,
    "ID Muatan",
    data.loadId,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Komoditas",
    data.commodity,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Berat",
    data.weight,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Tanggal Terkirim",
    data.date,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Status Pembayaran",
    "Selesai / Lunas",
    y,
  );

  y += 4;

  y = drawSectionTitle(pdf, "RUTE PENGIRIMAN", y);
  y = drawRoute(
    pdf,
    data.origin,
    data.destination,
    y,
  );

  y = drawSectionTitle(
    pdf,
    "INFORMASI PENGEMUDI",
    y,
  );

  y = drawInformationRow(
    pdf,
    "Nama Pengemudi",
    data.driverName,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Nomor Polisi",
    data.vehiclePlate,
    y,
  );

  y = drawInformationRow(
    pdf,
    "Jenis Kendaraan",
    data.vehicleType,
    y,
  );

  y += 12;

  drawSignatureSection(
    pdf,
    "Pengemudi",
    "Penerima",
    y,
  );

  drawFooter(pdf);

  pdf.save(
    `POD-${sanitizeFileName(data.loadId)}.pdf`,
  );
}