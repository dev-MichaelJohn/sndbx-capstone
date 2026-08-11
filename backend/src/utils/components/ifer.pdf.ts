import PDFDocument from "pdfkit";
import type { UnifiedFacultyReportDetail } from "@/types/evaluation-report.type.js";

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE_MARGIN = 36; // ~20mm
const PAGE_W = 595.28; // A4 points
const CONTENT_W = PAGE_W - PAGE_MARGIN * 2;

// Column x-positions for Section B table (all derived, never undefined)
const COL = {
  SEQ: PAGE_MARGIN,
  COURSE: PAGE_MARGIN + CONTENT_W * 0.07,
  SECTION: PAGE_MARGIN + CONTENT_W * 0.22,
  STUDENTS: PAGE_MARGIN + CONTENT_W * 0.42,
  AVG_SET: PAGE_MARGIN + CONTENT_W * 0.57,
  WEIGHTED: PAGE_MARGIN + CONTENT_W * 0.77,
  END: PAGE_MARGIN + CONTENT_W,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hline(doc: PDFKit.PDFDocument, x1: number, x2: number, y: number, lw = 0.5) {
  doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(lw).stroke().restore();
}

/**
 * Draw all borders for a single table row.
 * `colStartXs` must be a non-empty tuple — first element is the left edge.
 */
function drawRowBorders(
  doc: PDFKit.PDFDocument,
  y: number,
  rowH: number,
  colStartXs: readonly [number, ...number[]],
) {
  const endX = PAGE_MARGIN + CONTENT_W;
  doc.save().lineWidth(0.5);
  // top line (left edge guaranteed by tuple type)
  doc.moveTo(colStartXs[0], y).lineTo(endX, y).stroke();
  // vertical dividers
  for (const x of colStartXs) {
    doc
      .moveTo(x, y)
      .lineTo(x, y + rowH)
      .stroke();
  }
  // right edge
  doc
    .moveTo(endX, y)
    .lineTo(endX, y + rowH)
    .stroke();
  // bottom line
  doc
    .moveTo(colStartXs[0], y + rowH)
    .lineTo(endX, y + rowH)
    .stroke();
  doc.restore();
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateIferPdfBuffer(data: UnifiedFacultyReportDetail): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, autoFirstPage: true });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // ── Header ────────────────────────────────────────────────────────────────
    doc.fontSize(8).font("Helvetica").text("PALOMPON INSTITUTE OF TECHNOLOGY", { align: "center" });
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("INDIVIDUAL FACULTY EVALUATION REPORT (IFER)", { align: "center" });
    doc
      .fontSize(8)
      .font("Helvetica")
      .text("ANNEX C — CHED Memorandum Order No. 19, Series of 2025", { align: "center" });
    doc.moveDown(1);

    // ── Section A: Faculty Information ───────────────────────────────────────
    doc.fontSize(9.5).font("Helvetica-Bold").text("A.  Faculty Information");
    doc.moveDown(0.3);

    const infoRows: [string, string][] = [
      ["Name of Faculty Evaluated", data.faculty.name],
      ["Department/College", data.faculty.department],
      ["Current Faculty Rank", data.faculty.rank ?? ""],
      ["Semester/Term & Academic Year", `${data.semester.term} / ${data.semester.academic_year}`],
    ];
    const labelX = PAGE_MARGIN;
    const colonX = PAGE_MARGIN + CONTENT_W * 0.4;
    const valueX = colonX + 10;

    doc.font("Helvetica").fontSize(9);
    for (const [label, value] of infoRows) {
      const y = doc.y;
      doc.text(label, labelX, y, { continued: false });
      doc.text(":", colonX, y, { continued: false });
      doc.font("Helvetica-Bold").text(value, valueX, y, { continued: false });
      doc.font("Helvetica");
      doc.y += 2;
    }
    doc.moveDown(0.8);

    // ── Section B: Summary of Average SET Rating ──────────────────────────────
    doc
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .text("B.  Summary of Average SET Rating Computation", PAGE_MARGIN, doc.y);
    doc.moveDown(0.3);

    // Typed as a non-empty tuple so colStartXs[0] is always number, not number|undefined
    const colXs: [number, number, number, number, number, number] = [
      COL.SEQ,
      COL.COURSE,
      COL.SECTION,
      COL.STUDENTS,
      COL.AVG_SET,
      COL.WEIGHTED,
    ];

    const HDR_H = 28;
    const ROW_H = 18;
    let tableY = doc.y;

    // Header background + borders
    doc.save().rect(PAGE_MARGIN, tableY, CONTENT_W, HDR_H).fill("#F0F0F0").restore();
    drawRowBorders(doc, tableY, HDR_H, colXs);

    const hdrLabels = [
      { x: COL.SEQ, w: COL.COURSE - COL.SEQ, text: "Seq" },
      { x: COL.COURSE, w: COL.SECTION - COL.COURSE, text: "(1)\nCourse Code" },
      { x: COL.SECTION, w: COL.STUDENTS - COL.SECTION, text: "(2)\nYear/Section" },
      { x: COL.STUDENTS, w: COL.AVG_SET - COL.STUDENTS, text: "(3)\nNo. of Students" },
      { x: COL.AVG_SET, w: COL.WEIGHTED - COL.AVG_SET, text: "(4)\nAverage SET Rating" },
      { x: COL.WEIGHTED, w: COL.END - COL.WEIGHTED, text: "(3 \u00d7 4)\nWeighted SET Score" },
    ] as const;

    doc.font("Helvetica-Bold").fontSize(8);
    for (const { x, w, text } of hdrLabels) {
      doc.text(text, x + 2, tableY + 4, { width: w - 4, align: "center" });
    }
    tableY += HDR_H;

    // Data rows
    let totalStudents = 0;
    let totalWeighted = 0;

    doc.font("Helvetica").fontSize(8);
    data.class_summaries.forEach((cls, i) => {
      const n = cls.student_count;
      const avg = Number(cls.average_set_rating);
      const weighted = Number(cls.weighted_set_score);
      totalStudents += n;
      totalWeighted += weighted;

      drawRowBorders(doc, tableY, ROW_H, colXs);
      const textY = tableY + (ROW_H - 8) / 2;

      doc.text(String(i + 1), COL.SEQ + 2, textY, {
        width: COL.COURSE - COL.SEQ - 4,
        align: "center",
      });
      doc.text(cls.course_code, COL.COURSE + 2, textY, {
        width: COL.SECTION - COL.COURSE - 4,
        align: "center",
      });
      doc.text(cls.section, COL.SECTION + 2, textY, {
        width: COL.STUDENTS - COL.SECTION - 4,
        align: "center",
      });
      doc.text(String(n), COL.STUDENTS + 2, textY, {
        width: COL.AVG_SET - COL.STUDENTS - 4,
        align: "center",
      });
      doc.text(avg.toFixed(2), COL.AVG_SET + 2, textY, {
        width: COL.WEIGHTED - COL.AVG_SET - 4,
        align: "center",
      });
      doc.text(weighted.toLocaleString(), COL.WEIGHTED + 2, textY, {
        width: COL.END - COL.WEIGHTED - 4,
        align: "center",
      });

      tableY += ROW_H;
    });

    // Total row
    doc.save().rect(PAGE_MARGIN, tableY, CONTENT_W, ROW_H).fill("#F7F7F7").restore();
    drawRowBorders(doc, tableY, ROW_H, colXs);
    const totY = tableY + (ROW_H - 8) / 2;
    doc.font("Helvetica-Bold");
    doc.text("TOTAL", COL.COURSE + 2, totY, {
      width: COL.SECTION - COL.COURSE - 4,
      align: "center",
    });
    doc.text(String(totalStudents), COL.STUDENTS + 2, totY, {
      width: COL.AVG_SET - COL.STUDENTS - 4,
      align: "center",
    });
    doc.text("TOTAL", COL.AVG_SET + 2, totY, {
      width: COL.WEIGHTED - COL.AVG_SET - 4,
      align: "center",
    });
    doc.text(totalWeighted.toLocaleString(), COL.WEIGHTED + 2, totY, {
      width: COL.END - COL.WEIGHTED - 4,
      align: "center",
    });
    tableY += ROW_H;

    doc.y = tableY + 8;
    doc.moveDown(0.5);

    // ── Section C: SET and SEF Ratings ────────────────────────────────────────
    doc.fontSize(9.5).font("Helvetica-Bold").text("C.  SET and SEF Ratings", PAGE_MARGIN, doc.y);
    doc.moveDown(0.3);

    const overall_set = data.report.overall_set_rating;
    const overall_sef = data.report.overall_sef_rating;

    // Ratings table — 3 cols, destructured to avoid noUncheckedIndexedAccess
    const ratingY = doc.y;
    const rColW = CONTENT_W / 3;
    const [rX0, rX1, rX2]: [number, number, number] = [
      PAGE_MARGIN,
      PAGE_MARGIN + rColW,
      PAGE_MARGIN + rColW * 2,
    ];
    const rHdrH = 18;
    const rValH = 22;
    const rEndX = rX2 + rColW;

    // Header background (cols 1-2 only)
    doc
      .save()
      .rect(rX1, ratingY, rColW * 2, rHdrH)
      .fill("#F0F0F0")
      .restore();

    // Grid verticals
    for (const x of [rX0, rX1, rX2, rEndX]) {
      doc
        .save()
        .moveTo(x, ratingY)
        .lineTo(x, ratingY + rHdrH + rValH)
        .lineWidth(0.5)
        .stroke()
        .restore();
    }
    // Grid horizontals
    doc.save().lineWidth(0.5);
    for (const y of [ratingY, ratingY + rHdrH, ratingY + rHdrH + rValH]) {
      doc.moveTo(rX0, y).lineTo(rEndX, y).stroke();
    }
    doc.restore();

    doc.font("Helvetica-Bold").fontSize(8.5);
    doc.text("SET Rating", rX1 + 2, ratingY + 5, { width: rColW - 4, align: "center" });
    doc.text("*SEF Rating", rX2 + 2, ratingY + 5, { width: rColW - 4, align: "center" });

    const valY = ratingY + rHdrH + (rValH - 9) / 2;
    doc.text("OVERALL RATING", rX0 + 2, valY, { width: rColW - 4, align: "left" });
    doc.text(overall_set != null ? Number(overall_set).toFixed(2) : "N/A", rX1 + 2, valY, {
      width: rColW - 4,
      align: "center",
    });
    doc.text(overall_sef != null ? Number(overall_sef).toFixed(2) : "N/A", rX2 + 2, valY, {
      width: rColW - 4,
      align: "center",
    });

    doc.y = ratingY + rHdrH + rValH + 4;
    doc
      .font("Helvetica-Oblique")
      .fontSize(7.5)
      .text("*Note: rating given by the supervisor using the SEF instrument");

    if (data.combined_weighted_rating != null) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(`Combined Weighted Rating: ${data.combined_weighted_rating.toFixed(2)}`);
    }
    doc.moveDown(0.8);

    // ── Section D: Qualitative Comments ──────────────────────────────────────
    doc
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .text("D.  Summary of Qualitative Comments and Suggestions", PAGE_MARGIN, doc.y);
    doc.moveDown(0.4);

    function drawCommentTable(title: string, comments: string[]) {
      const hdrH2 = 18;
      const rowH2 = 18;
      const seqW = CONTENT_W * 0.08;
      const textW = CONTENT_W - seqW;
      const seqX = PAGE_MARGIN;
      const textX = PAGE_MARGIN + seqW;
      let y2 = doc.y;

      // Header row
      doc.save().rect(seqX, y2, CONTENT_W, hdrH2).fill("#F0F0F0").restore();
      doc.save().rect(seqX, y2, CONTENT_W, hdrH2).lineWidth(0.5).stroke().restore();
      doc
        .save()
        .moveTo(textX, y2)
        .lineTo(textX, y2 + hdrH2)
        .lineWidth(0.5)
        .stroke()
        .restore();
      doc.font("Helvetica-Bold").fontSize(8);
      doc.text("Seq", seqX + 2, y2 + 5, { width: seqW - 4, align: "center" });
      doc.text(title, textX + 4, y2 + 5, { width: textW - 8, align: "center" });
      y2 += hdrH2;

      const rows: string[] = comments.length > 0 ? comments : Array<string>(5).fill("");
      rows.forEach((comment, i) => {
        doc.save().rect(seqX, y2, CONTENT_W, rowH2).lineWidth(0.5).stroke().restore();
        doc
          .save()
          .moveTo(textX, y2)
          .lineTo(textX, y2 + rowH2)
          .lineWidth(0.5)
          .stroke()
          .restore();
        const ty = y2 + (rowH2 - 8) / 2;
        doc.font("Helvetica");
        doc.text(String(i + 1), seqX + 2, ty, { width: seqW - 4, align: "center" });
        if (comment) doc.text(comment, textX + 4, ty, { width: textW - 8 });
        y2 += rowH2;
      });

      // "add rows" footer
      doc.save().rect(seqX, y2, CONTENT_W, rowH2).lineWidth(0.5).stroke().restore();
      doc
        .save()
        .moveTo(textX, y2)
        .lineTo(textX, y2 + rowH2)
        .lineWidth(0.5)
        .stroke()
        .restore();
      doc.font("Helvetica").text("\u2026", seqX + 2, y2 + 5, { width: seqW - 4, align: "center" });
      doc
        .font("Helvetica-Oblique")
        .fontSize(7.5)
        .text("(add additional rows if necessary)", textX + 4, y2 + 6, { width: textW - 8 });

      doc.y = y2 + rowH2 + 6;
    }

    drawCommentTable("Comments and Suggestions from the Students", data.student_comments ?? []);
    doc.moveDown(0.4);
    drawCommentTable(
      "Comments and Suggestions from the Supervisor",
      data.supervisor_comments ?? [],
    );
    doc.moveDown(1.5);

    // ── Signatures ────────────────────────────────────────────────────────────
    const colHalf = CONTENT_W / 2 - 8;

    function drawSigBlock(title: string, x: number, startY: number) {
      const w = colHalf;
      const hdrH3 = 15;
      const rowH3 = 20;
      const rows3 = ["Signature of Staff", "Name of Staff", "Date"] as const;
      const totalH = hdrH3 + rowH3 * rows3.length;

      doc.save().rect(x, startY, w, hdrH3).fill("#333333").restore();
      doc.save().rect(x, startY, w, totalH).lineWidth(0.5).stroke().restore();
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("white")
        .text(title, x + 4, startY + 4, { width: w - 8, align: "center" });
      doc.fillColor("black");

      rows3.forEach((label, i) => {
        const ry = startY + hdrH3 + rowH3 * i;
        hline(doc, x, x + w, ry);
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(`${label}  :`, x + 5, ry + 6, { width: w - 10 });
      });
    }

    const sigY = doc.y;
    drawSigBlock("Prepared by:", PAGE_MARGIN, sigY);
    drawSigBlock("Reviewed by:", PAGE_MARGIN + CONTENT_W / 2 + 8, sigY);

    doc.end();
  });
}
