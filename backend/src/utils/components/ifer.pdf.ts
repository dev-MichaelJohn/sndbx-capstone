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

    // Section A: Faculty Information
    doc.fontSize(9.5).font("Helvetica-Bold").text("A. Faculty Information");
    doc.font("Helvetica").fontSize(9);
    doc.text(`Name of Faculty: ${data.faculty.name}`);
    doc.text(`Department / College: ${data.faculty.department}`);
    doc.text(`Academic Rank: ${data.faculty.rank || "N/A"}`);
    doc.text(`Semester / AY: ${data.semester.term} / AY ${data.semester.academic_year}`);
    doc.moveDown(1);

    // Section B: Summary of Average SET Rating Computation
    doc.font("Helvetica-Bold").fontSize(9.5).text("B. Summary of Average SET Rating Computation");
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Course Code", 40, y);
    doc.text("Year / Section", 150, y);
    doc.text("No. of Students", 250, y);
    doc.text("Average SET Rating", 340, y);
    doc.text("Weighted SET Score", 440, y);
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

    // Section C: SET and SEF Ratings (Annex C Layout)
    doc.font("Helvetica-Bold").fontSize(9.5).text("C. SET and SEF Ratings");
    doc.font("Helvetica").fontSize(9);
    doc.text(`OVERALL SET RATING: ${data.report.overall_set_rating ?? "N/A"}`);
    doc.text(`OVERALL SEF RATING: ${data.report.overall_sef_rating ?? "N/A"}`);
    if (data.combined_weighted_rating !== null) {
      doc.text(`COMBINED RATING: ${data.combined_weighted_rating.toFixed(2)}`);
    }
    doc.moveDown(1);

    // Section D: Summary of Qualitative Comments
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text("D. Summary of Qualitative Comments and Suggestions");
    doc.font("Helvetica").fontSize(8.5);
    doc.text("Comments from Students: " + (data.student_comments.join("; ") || "None recorded."));
    doc.moveDown(0.5);
    doc.text(
      "Comments from Supervisor: " + (data.supervisor_comments.join("; ") || "None recorded."),
    );
    doc.moveDown(2);

    // Signatures
    doc.font("Helvetica").fontSize(8);
    doc.text("_________________________", 40, doc.y);
    doc.text("_________________________", 350, doc.y - 10);
    doc.text("Prepared By (Authorized Staff)", 40, doc.y + 2);
    doc.text("Reviewed By (Authorized Official)", 350, doc.y - 10);

    doc.end();
  });
}
