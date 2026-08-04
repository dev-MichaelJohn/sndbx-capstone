import PDFDocument from "pdfkit";
import type { UnifiedFacultyReportDetail } from "@/types/evaluation-report.type.js";

export function generateIferPdfBuffer(data: UnifiedFacultyReportDetail): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Header
    doc.fontSize(8).text("PALOMPON INSTITUTE OF TECHNOLOGY", { align: "center" });
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("INDIVIDUAL FACULTY EVALUATION REPORT (IFER)", { align: "center" });
    doc
      .fontSize(8)
      .font("Helvetica")
      .text("ANNEX C — CHED Memorandum Order No. 19, Series of 2025", { align: "center" });
    doc.moveDown(1.2);

    // Section A: Faculty Info
    doc.fontSize(9.5).font("Helvetica-Bold").text("A. Faculty Information");
    doc.font("Helvetica").fontSize(9);
    doc.text(`Name of Faculty: ${data.faculty.name}`);
    doc.text(`Department / College: ${data.faculty.department}`);
    doc.text(`Academic Rank: ${data.faculty.rank || "N/A"}`);
    doc.text(`Semester / AY: ${data.semester.term} / AY ${data.semester.academic_year}`);
    doc.moveDown(1);

    // Section B: Class Summary Table
    doc.font("Helvetica-Bold").fontSize(9.5).text("B. Summary of Average SET Rating Computation");
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Course", 40, y);
    doc.text("Section", 150, y);
    doc.text("Students", 250, y);
    doc.text("Avg SET", 340, y);
    doc.text("Weighted Score", 440, y);
    doc.moveDown(0.5);

    doc.font("Helvetica");
    data.class_summaries.forEach((item) => {
      y = doc.y;
      doc.text(item.course_code, 40, y);
      doc.text(item.section, 150, y);
      doc.text(String(item.student_count), 250, y);
      doc.text(Number(item.average_set_rating).toFixed(2), 340, y);
      doc.text(Number(item.weighted_set_score).toFixed(2), 440, y);
      doc.moveDown(0.4);
    });
    doc.moveDown(1);

    // Section C: Ratings Summary
    doc.font("Helvetica-Bold").fontSize(9.5).text("C. Ratings Summary");
    doc.font("Helvetica").fontSize(9);
    doc.text(`Overall SET Rating: ${data.report.overall_set_rating ?? "N/A"}`);
    doc.text(`Overall SEF Rating: ${data.report.overall_sef_rating ?? "N/A"}`);
    doc.text(
      `Combined Rating (60% SET / 40% SEF): ${data.combined_weighted_rating?.toFixed(2) ?? "N/A"}`,
    );
    doc.moveDown(1);

    // Section D: Qualitative Comments
    doc.font("Helvetica-Bold").fontSize(9.5).text("D. Qualitative Comments");
    doc.font("Helvetica").fontSize(8.5);
    doc.text("Student Comments: " + (data.student_comments.join("; ") || "None recorded."));
    doc.moveDown(0.5);
    doc.text("Supervisor Comments: " + (data.supervisor_comments.join("; ") || "None recorded."));
    doc.moveDown(2);

    // Signatures
    doc.font("Helvetica").fontSize(8);
    doc.text("_________________________", 40, doc.y);
    doc.text("_________________________", 350, doc.y - 10);
    doc.text("Prepared By (Authorized Staff)", 40, doc.y + 2);
    doc.text("Reviewed By (Dean / Chair)", 350, doc.y - 10);

    doc.end();
  });
}
