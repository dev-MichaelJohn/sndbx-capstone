import PDFDocument from "pdfkit";
import type { UnifiedFacultyReportDetail } from "@/types/evaluation-report.type.js";

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_MARGIN = 36; // ~20mm
const PAGE_W = 595.28; // A4 points
const CONTENT_W = PAGE_W - PAGE_MARGIN * 2;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hline(doc: PDFKit.PDFDocument, x1: number, x2: number, y: number, lw = 0.5) {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(lw).stroke().restore();
}

function vline(doc: PDFKit.PDFDocument, x: number, y1: number, y2: number, lw = 0.5) {
  doc.save().moveTo(x, y1).lineTo(x, y2).lineWidth(lw).stroke().restore();
}

function fillRect(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
) {
  doc.save().rect(x, y, w, h).fill(fill).restore();
}

function strokeRect(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, lw = 0.5) {
  doc.save().rect(x, y, w, h).lineWidth(lw).stroke().restore();
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateFedafPdfBuffer(data: UnifiedFacultyReportDetail): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, autoFirstPage: true });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(8).font("Helvetica").text("PALOMPON INSTITUTE OF TECHNOLOGY", { align: "center" });
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("FACULTY EVALUATION AND DEVELOPMENT ACKNOLWEDGEMENT FORM", { align: "center" });
    doc
      .fontSize(8)
      .font("Helvetica")
      .text("ANNEX D — CHED Memorandum Order No. 19, Series of 2025", { align: "center" });
    doc.moveDown(1);

    // ── Section A: Faculty Member Information ─────────────────────────────────
    doc.fontSize(10).font("Helvetica-Bold").text("A.  FACULTY MEMBER INFORMATION");
    doc.moveDown(0.3);

    const fac = data.faculty;
    const sem = data.semester;
    const infoRows: [string, string][] = [
      ["Name of Faculty", fac.name],
      ["Department/College", fac.department],
      ["Current Faculty Rank", fac.rank ?? ""],
      ["Semester/Term & Academic Year", `${sem.term} / ${sem.academic_year}`],
    ];

    const labelX = PAGE_MARGIN;
    const colonX = PAGE_MARGIN + CONTENT_W * 0.43;
    const valueX = colonX + 10;

    const MIN_ROW_H = 14; // minimum row height so empty values don't collapse
    doc.font("Helvetica").fontSize(9);
    for (const [label, value] of infoRows) {
      const y = doc.y;
      const valueW = PAGE_MARGIN + CONTENT_W - valueX; // remaining width for value

      doc.text(label, labelX, y, { continued: false, lineBreak: false });
      doc.text(":", colonX, y, { continued: false, lineBreak: false });

      let bottomY = y + MIN_ROW_H;
      if (value) {
        doc.font("Helvetica-Bold").text(value, valueX, y, { width: valueW, continued: false });
        bottomY = Math.max(bottomY, doc.y + 2);
        doc.font("Helvetica");
      }

      doc.y = bottomY;
    }
    doc.moveDown(1);

    // ── Section B: Faculty Evaluation Summary ─────────────────────────────────
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("B.  FACULTY EVALUATION SUMMARY", PAGE_MARGIN, doc.y);
    doc.moveDown(0.4);

    const rep = data.report;
    const overall_set = rep.overall_set_rating;
    const overall_sef = rep.overall_sef_rating;

    // Full-width 3-row table matching Annex D screenshot:
    //   Row 0: "Overall Rating" — spans full width (shaded header)
    //   Row 1: "SET" | "SEF"   — two equal sub-headers (shaded)
    //   Row 2: SET value | SEF value
    const halfW = CONTENT_W / 2;
    const sumX = PAGE_MARGIN;
    const midX = PAGE_MARGIN + halfW;

    let tY = doc.y;
    const row0H = 16;
    const row1H = 18;
    const row2H = 22;

    // Row 0
    fillRect(doc, sumX, tY, CONTENT_W, row0H, "#F0F0F0");
    strokeRect(doc, sumX, tY, CONTENT_W, row0H);
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .text("Overall Rating", sumX + 2, tY + 4, { width: CONTENT_W - 4, align: "center" });
    tY += row0H;

    // Row 1
    fillRect(doc, sumX, tY, CONTENT_W, row1H, "#F0F0F0");
    strokeRect(doc, sumX, tY, CONTENT_W, row1H);
    vline(doc, midX, tY, tY + row1H);
    doc.text("Student Evaluation of Teachers (SET)", sumX + 2, tY + 4, {
      width: halfW - 4,
      align: "center",
    });
    doc.text("Supervisor's Evaluation of Faculty (SAF)", midX + 2, tY + 4, {
      width: halfW - 4,
      align: "center",
    });
    tY += row1H;

    // Row 2
    strokeRect(doc, sumX, tY, CONTENT_W, row2H);
    vline(doc, midX, tY, tY + row2H);
    const valY2 = tY + (row2H - 9) / 2;
    doc.text(overall_set != null ? Number(overall_set).toFixed(2) : "N/A", sumX + 2, valY2, {
      width: halfW - 4,
      align: "center",
    });
    doc.text(overall_sef != null ? Number(overall_sef).toFixed(2) : "N/A", midX + 2, valY2, {
      width: halfW - 4,
      align: "center",
    });
    tY += row2H;

    doc.y = tY + 10;

    // ── Section C: Development Plan ───────────────────────────────────────────
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(
        "C.  Development Plan (to be jointly accomplished by the Supervisor and Faculty)",
        PAGE_MARGIN,
        doc.y,
      );
    doc.moveDown(0.4);

    const areas = rep.areas_for_improvement ?? "";
    const activities = rep.proposed_activities ?? "";
    const action = rep.action_plan ?? "";

    function drawDevBox(label: string, content: string, labelH = 15, contentH = 55) {
      const bY = doc.y;
      strokeRect(doc, PAGE_MARGIN, bY, CONTENT_W, labelH);
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .text(label, PAGE_MARGIN + 5, bY + 4, { width: CONTENT_W - 10 });
      strokeRect(doc, PAGE_MARGIN, bY + labelH, CONTENT_W, contentH);
      if (content) {
        doc.text(content, PAGE_MARGIN + 5, bY + labelH + 5, { width: CONTENT_W - 10 });
      }
      doc.y = bY + labelH + contentH;
    }

    drawDevBox("Areas for Improvement", areas);
    drawDevBox("Proposed Learning and Development Activities", activities);
    drawDevBox("Action Plan", action);
    doc.moveDown(1);

    // ── Acknowledgment Clause ──────────────────────────────────────────────────
    doc
      .font("Helvetica-Oblique")
      .fontSize(8.5)
      .text(
        "I acknowledge that I have received and reviewed the faculty evaluation conducted for the period mentioned above. " +
          "I understand that my signature below does not necessarily indicate agreement with the evaluation but confirms " +
          "that I have been given the opportunity to discuss it with my supervisor.",
        { width: CONTENT_W, align: "justify" },
      );
    doc.moveDown(1.2);

    // ── Signature Blocks (SUPERVISOR then FACULTY, full-width each) ───────────
    function drawSigSection(title: string, startY: number) {
      const x = PAGE_MARGIN;
      const w = CONTENT_W;
      const hdrH = 18;
      const rowH = 22;
      const labels = ["Signature", "Name", "Date Signed"] as const;
      const totalH = hdrH + rowH * labels.length;

      fillRect(doc, x, startY, w, hdrH, "#4A4A4A");
      strokeRect(doc, x, startY, w, totalH);
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("white")
        .text(title, x + 4, startY + 5, { width: w - 8, align: "center" });
      doc.fillColor("black");

      labels.forEach((label, i) => {
        const ry = startY + hdrH + rowH * i;
        hline(doc, x, x + w, ry);
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .text(`${label}  :`, x + 5, ry + 7, { width: w - 10 });
      });

      return startY + totalH;
    }

    const sigSupervisorBottom = drawSigSection("SUPERVISOR", doc.y);
    doc.y = sigSupervisorBottom + 8;
    drawSigSection("FACULTY", doc.y);

    doc.end();
  });
}
