# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Students:** Complete anonymous Student Evaluation of Teaching (SET) forms during active evaluation windows for subjects they are enrolled in. Primary activity is rating instructors across defined criteria.

**Faculty:** View their consolidated evaluation results (IFER), acknowledge FEDAF development plans, and track performance feedback across semesters.

**Supervisors (Deans & Program Chairs):** Conduct Supervisor Evaluation Form (SEF) assessments for faculty under their jurisdiction, providing evidence-based ratings with Means of Verification (MOVs).

**System Administrators:** Configure evaluation cycles and windows, manage institutional data (colleges, programs, courses, offerings), generate consolidated reports, and oversee the complete evaluation lifecycle.

All roles are equally active during evaluation periods, with workflows that run concurrently rather than sequentially.

## Product Purpose

PIT-FES automates faculty performance evaluation for Palompon Institute of Technology per CHED CMO No. 19, Series of 2025. The system replaces manual paper-based evaluation with a digital portal that collects student and supervisor ratings, automatically calculates Individual Faculty Evaluation Report (IFER) scores using the Annex C formula, and tracks Faculty Evaluation and Development Action Form (FEDAF) plans.

Success means accurate, timely completion of evaluation cycles with valid multi-stakeholder input and defensible consolidated reports that meet CHED compliance requirements.

## Positioning

Multi-stakeholder integration combining SET and SEF ratings in one system with role-based workflows and consolidated reporting. A neighboring evaluation tool might handle student surveys or supervisor assessments separately, but PIT-FES unifies both instruments with automated CHED Annex C calculation, evidence-based MOV tracking, and semester-scoped evaluation windows that ensure all stakeholders contribute to a single authoritative performance record per faculty member.

## Operating Context

**Evaluation Cycles:** Semester-based windows (typically mid-term or end-of-term) when students can submit SET forms and supervisors complete SEF assessments. Windows are institution-wide but scoped to specific offerings and faculty assignments.

**Academic Structure:** Organized by college → program → curriculum → courses → class offerings. Faculty are assigned to specific class sections, and evaluations are tied to those teaching assignments.

**Reporting Workflow:** After evaluation windows close, administrators generate consolidated IFER reports showing weighted SET + SEF scores per CHED formula. Faculty review results, and FEDAF development plans are created for growth areas.

**Data Entry:** Student evaluations are anonymous and cannot be modified after submission. Supervisor evaluations require documented evidence (MOVs) and can be revised before window closure. Bulk import tools support mass student enrollment and class assignments.

## Capabilities and Constraints

**Evaluation Instruments:**
- SET: Student-submitted ratings across teaching effectiveness criteria
- SEF: Supervisor-submitted performance assessments with MOV evidence
- IFER: Auto-calculated consolidated scores per CHED Annex C weighting formula
- FEDAF: Development action plans tied to performance results

**Role-Based Access:**
- Students see only their enrolled classes during active windows
- Faculty view their own historical results and acknowledgment workflows
- Supervisors access faculty under their organizational jurisdiction
- Admins have full system configuration and reporting access

**Technical Constraints:**
- Real-time evaluation feed showing recent submissions (live dashboard feature)
- Anonymous student submissions with no identifying metadata stored
- Semester scoping ensures evaluations are isolated per academic term
- Socket.io integration for live activity monitoring

**Terminology:**
- SET: Student Evaluation of Teaching
- SEF: Supervisor Evaluation Form
- IFER: Individual Faculty Evaluation Report
- FEDAF: Faculty Evaluation and Development Action Form
- MOV: Means of Verification (evidence documents for SEF)
- CMO: CHED Memorandum Order

## Evidence on Hand

**Real institutional context:** Palompon Institute of Technology, located at Evangelista St., Palompon, Leyte, Philippines.

**Regulatory authority:** CHED CMO No. 19, Series of 2025 mandates the evaluation structure and Annex C calculation formula.

**Visual reference:** Current landing page uses unsplash.com stock imagery (university campus scene). Production deployment may require licensed or institutional photography.

**No fabricated content:** The system does not invent testimonials, benchmark statistics, or specific evaluation criteria. Actual evaluation forms, rating scales, and CHED formulas must come from institutional sources or the cited CMO.

## Product Principles

1. **Evidence-based accountability:** Every evaluation and report must be traceable to documented submissions and verifiable sources (MOVs for SEF, enrollment records for SET eligibility).

2. **Multi-stakeholder fairness:** Students, supervisors, and faculty all contribute distinct perspectives to performance assessment. No single voice dominates the final IFER score.

3. **Regulatory fidelity:** CHED compliance is non-negotiable. Annex C calculations, terminology, and reporting formats follow the published CMO exactly as written.

4. **Temporal integrity:** Evaluation windows are bounded and immutable after closure. Historical records cannot be altered retroactively, preserving institutional audit trails.

5. **Operational clarity:** The system surfaces what needs action now (active evaluations, pending acknowledgments, open windows) and makes administrative oversight efficient across concurrent evaluation cycles.
