import PDFDocument from "pdfkit";
import type { UnifiedFacultyReportDetail } from "@/types/evaluation-report.type.js";
import { PDF_LAYOUT } from "@/utils/evaluation-report.util.js";

export function generateFedafPdfBuffer(data: UnifiedFacultyReportDetail): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: PDF_LAYOUT.PAGE_MARGIN });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Header
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.FOOTER_NOTE)
      .text("PALOMPON INSTITUTE OF TECHNOLOGY", { align: "center" });
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.FEDAF_TITLE)
      .font("Helvetica-Bold")
      .text("FACULTY EVALUATION AND DEVELOPMENT ACKNOWLEDGMENT FORM (FEDAF)", { align: "center" });
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.FOOTER_NOTE)
      .font("Helvetica")
      .text("ANNEX D — CHED Memorandum Order No. 19, Series of 2025", { align: "center" });
    doc.moveDown(PDF_LAYOUT.SPACING.LARGE);

    // Section A: Faculty Info
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.SECTION_TITLE)
      .font("Helvetica-Bold")
      .text("A. FACULTY MEMBER INFORMATION");
    doc.font("Helvetica").fontSize(PDF_LAYOUT.FONT_SIZE.BODY);
    doc.text(`Name of Faculty: ${data.faculty.name}`);
    doc.text(`Department / College: ${data.faculty.department}`);
    doc.text(`Semester / AY: ${data.semester.term} / AY ${data.semester.academic_year}`);
    doc.moveDown(PDF_LAYOUT.SPACING.DEFAULT);

    // Section B: Faculty Evaluation Summary (Annex D Independent Scores)
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.SECTION_TITLE)
      .font("Helvetica-Bold")
      .text("B. FACULTY EVALUATION SUMMARY");
    doc.font("Helvetica").fontSize(PDF_LAYOUT.FONT_SIZE.BODY);
    doc.text(`Student Evaluation of Teachers (SET): ${data.report.overall_set_rating ?? "N/A"}`);
    doc.text(
      `Supervisor's Evaluation of Faculty (SEF): ${data.report.overall_sef_rating ?? "N/A"}`,
    );
    doc.moveDown(PDF_LAYOUT.SPACING.DEFAULT);

    // Section C: Development Plan
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.SECTION_TITLE)
      .font("Helvetica-Bold")
      .text("C. DEVELOPMENT PLAN (Jointly accomplished by Supervisor and Faculty)");
    doc.font("Helvetica").fontSize(PDF_LAYOUT.FONT_SIZE.BODY_SMALL);
    doc.text(
      `Areas for Improvement:\n${data.report.areas_for_improvement || "To be filled during feedback meeting."}`,
    );
    doc.moveDown(PDF_LAYOUT.SPACING.MEDIUM);
    doc.text(
      `Proposed Learning and Development Activities:\n${data.report.proposed_activities || "To be filled during feedback meeting."}`,
    );
    doc.moveDown(PDF_LAYOUT.SPACING.MEDIUM);
    doc.text(`Action Plan:\n${data.report.action_plan || "To be filled during feedback meeting."}`);
    doc.moveDown(PDF_LAYOUT.SPACING.XLARGE);

    // Mandatory CHED Acknowledgment Clause
    doc
      .fontSize(PDF_LAYOUT.FONT_SIZE.FOOTER_NOTE)
      .font("Helvetica-Oblique")
      .text(
        "I acknowledge that I have received and reviewed the faculty evaluation conducted for the period mentioned above. " +
          "I understand that my signature below does not necessarily indicate agreement with the evaluation but confirms " +
          "that I have been given the opportunity to discuss it with my supervisor.",
        { align: "justify" },
      );
    doc.moveDown(PDF_LAYOUT.SPACING.DOUBLE);

    // Signatures
    const y = doc.y;
    doc.font("Helvetica").fontSize(PDF_LAYOUT.FONT_SIZE.FOOTER_NOTE);
    doc.text("_________________________", PDF_LAYOUT.SIGNATURE_POSITIONS.LEFT_COL, y);
    doc.text("_________________________", PDF_LAYOUT.SIGNATURE_POSITIONS.RIGHT_COL, y);
    doc.text(
      "Supervisor Signature",
      PDF_LAYOUT.SIGNATURE_POSITIONS.LEFT_COL,
      y + PDF_LAYOUT.SIGNATURE_POSITIONS.LABEL_OFFSET_Y,
    );
    doc.text(
      "Faculty Member Signature",
      PDF_LAYOUT.SIGNATURE_POSITIONS.RIGHT_COL,
      y + PDF_LAYOUT.SIGNATURE_POSITIONS.LABEL_OFFSET_Y,
    );
    doc.text(
      `Date: ${data.report.updated_at ? new Date(data.report.updated_at).toLocaleDateString() : "________"}`,
      PDF_LAYOUT.SIGNATURE_POSITIONS.LEFT_COL,
      y + PDF_LAYOUT.SIGNATURE_POSITIONS.DATE_OFFSET_Y,
    );
    doc.text(
      `Date Signed: ${data.report.acknowledged_at ? new Date(data.report.acknowledged_at).toLocaleDateString() : "________"}`,
      PDF_LAYOUT.SIGNATURE_POSITIONS.RIGHT_COL,
      y + PDF_LAYOUT.SIGNATURE_POSITIONS.DATE_OFFSET_Y,
    );

    doc.end();
  });
}
