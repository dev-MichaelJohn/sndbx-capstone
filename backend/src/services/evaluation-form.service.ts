import { and, asc, eq, getColumns, isNull } from "drizzle-orm";
import {
  CreateRecord,
  SoftDeleteRecord,
  GetRecord,
  GetRecords,
  type TableNames,
  type SoftDeletableTables,
} from "./db.service.js";
import { AppError } from "@/utils/error.util.js";
import db from "@/configs/db.config.js";
import {
  StudentEvaluationForms,
  StudentEvaluationCategories,
  StudentEvaluationQuestions,
  SupervisorEvaluationForms,
  SupervisorEvaluationCategories,
  SupervisorEvaluationQuestions,
  SupervisorEvaluationMeans,
} from "@/schemas/evaluation-form.schema.js";
import {
  UpsertCategoryReqSchema,
  UpsertQuestionReqSchema,
  UpsertMeanReqSchema,
  type UpsertCategoryReq,
  type UpsertQuestionReq,
  type UpsertMeanReq,
  type CreateFormReq,
  type FormSelect,
  type EvaluationFormTree,
  type CategorySelect,
  type QuestionSelect,
  type MeanSelect,
  type FormTreeJoinRow,
  type EvaluationCategoryNode,
  type EvaluationType,
} from "@/types/evaluation-form.type.js";

export interface IEvaluationFormService {
  createForm(type: EvaluationType, payload: CreateFormReq): Promise<{ form: FormSelect }>;
  getFormTree(id: number, type: EvaluationType): Promise<EvaluationFormTree>;
  getCategories(type: EvaluationType, formId: number): Promise<CategorySelect[]>;
  addCategory(
    type: EvaluationType,
    formId: number,
    payload: UpsertCategoryReq,
  ): Promise<{ category: CategorySelect }>;
  updateCategory(
    type: EvaluationType,
    categoryId: number,
    payload: Partial<UpsertCategoryReq>,
  ): Promise<{ category: CategorySelect }>;
  deleteCategory(type: EvaluationType, categoryId: number): Promise<void>;
  getQuestions(type: EvaluationType, categoryId: number): Promise<QuestionSelect[]>;
  addQuestion(
    type: EvaluationType,
    categoryId: number,
    payload: UpsertQuestionReq,
  ): Promise<{ question: QuestionSelect }>;
  updateQuestion(
    type: EvaluationType,
    questionId: number,
    payload: Partial<UpsertQuestionReq>,
  ): Promise<{ question: QuestionSelect }>;
  deleteQuestion(type: EvaluationType, questionId: number): Promise<void>;
  getSupervisorMeans(questionId: number): Promise<MeanSelect[]>;
  addSupervisorMean(questionId: number, payload: UpsertMeanReq): Promise<{ mean: MeanSelect }>;
  updateSupervisorMean(
    meanId: number,
    payload: Partial<UpsertMeanReq>,
  ): Promise<{ mean: MeanSelect }>;
  deleteSupervisorMean(meanId: number): Promise<void>;
}

export class evaluationFormService implements IEvaluationFormService {
  /**
   * Initializes a new top-level evaluation form template (Student or Supervisor).
   *
   * @param type - specifies whether the form belongs to the 'student' or 'supervisor' suite
   * @param payload - the title and optional description for the form
   * @returns an object containing the newly created form record
   */
  async createForm(type: EvaluationType, payload: CreateFormReq): Promise<{ form: FormSelect }> {
    const tableName: TableNames =
      type === "student" ? "StudentEvaluationForms" : "SupervisorEvaluationForms";
    const record = await CreateRecord(tableName, payload);
    return { form: record as FormSelect };
  }

  /**
   * Fetches an evaluation form and constructs its complete nested tree structure
   * (Form -> Categories -> Questions) using GetRecords with relational joins, sorted by order indices.
   *
   * @param id - the primary key ID of the evaluation form
   * @param type - specifies whether to query the 'student' or 'supervisor' tables
   * @returns the structured form tree object with its associated categories and questions
   */
  async getFormTree(id: number, type: EvaluationType): Promise<EvaluationFormTree> {
    const isStudent = type === "student";
    const formTableName: TableNames = isStudent
      ? "StudentEvaluationForms"
      : "SupervisorEvaluationForms";
    const formTable = isStudent ? StudentEvaluationForms : SupervisorEvaluationForms;
    const catTable = isStudent ? StudentEvaluationCategories : SupervisorEvaluationCategories;
    const qTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    const rows = await GetRecords<TableNames, FormTreeJoinRow>(formTableName, {
      select: (table) => ({
        ...getColumns(table),
        category_id: catTable.id,
        category_name: catTable.name,
        category_description: catTable.description,
        category_order: catTable.order,
        category_created_at: catTable.created_at,
        category_updated_at: catTable.updated_at,
        category_deleted_at: catTable.deleted_at,
        question_id: qTable.id,
        question_text: qTable.question,
        max_rating: qTable.max_rating,
        question_order: qTable.order,
        question_created_at: qTable.created_at,
        question_updated_at: qTable.updated_at,
        question_deleted_at: qTable.deleted_at,
      }),
      join: (query) =>
        query
          .leftJoin(catTable, and(eq(catTable.form_id, formTable.id), isNull(catTable.deleted_at)))
          .leftJoin(qTable, and(eq(qTable.category_id, catTable.id), isNull(qTable.deleted_at)))
          .orderBy(asc(catTable.order), asc(qTable.order)),
      where: () => and(eq(formTable.id, id), isNull(formTable.deleted_at)),
    });

    if (rows.length === 0 || !rows[0]) throw new AppError(404, "Evaluation form not found.");

    const baseRow = rows[0];
    const formTree: EvaluationFormTree = {
      id: baseRow.id,
      title: baseRow.title,
      description: baseRow.description,
      created_at: baseRow.created_at,
      deleted_at: baseRow.deleted_at,
      categories: [],
    };

    const categoryMap = new Map<number, EvaluationCategoryNode>();

    for (const row of rows) {
      if (row.category_id && !row.category_deleted_at) {
        if (!categoryMap.has(row.category_id)) {
          const newCategory: EvaluationCategoryNode = {
            id: row.category_id,
            form_id: row.id,
            name: row.category_name as string,
            description: row.category_description,
            order: row.category_order as number,
            created_at: row.category_created_at as Date,
            updated_at: row.category_updated_at as Date,
            deleted_at: row.category_deleted_at,
            questions: [],
          };
          categoryMap.set(row.category_id, newCategory);
          formTree.categories.push(newCategory);
        }
        if (row.question_id && !row.question_deleted_at) {
          categoryMap.get(row.category_id)!.questions.push({
            id: row.question_id,
            category_id: row.category_id,
            question: row.question_text as string,
            max_rating: row.max_rating as number,
            order: row.question_order as number,
            created_at: row.question_created_at as Date,
            updated_at: row.question_updated_at as Date,
            deleted_at: row.question_deleted_at,
          });
        }
      }
    }

    return formTree;
  }

  /**
   * Retrieves all active categories associated with a given evaluation form using GetRecords.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param formId - the target evaluation form identifier
   * @returns an array of active category records
   */
  async getCategories(type: EvaluationType, formId: number): Promise<CategorySelect[]> {
    const isStudent = type === "student";
    const tableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationCategories"
      : "SupervisorEvaluationCategories";
    const schemaTable = isStudent ? StudentEvaluationCategories : SupervisorEvaluationCategories;

    const records = await GetRecords(tableName, {
      where: () => and(eq(schemaTable.form_id, formId), isNull(schemaTable.deleted_at)),
    });
    return records as CategorySelect[];
  }

  /**
   * Adds a new category to an evaluation form blueprint.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param formId - the parent form identifier
   * @param payload - category details including name, description, and order
   * @returns the created category record wrapped in an object
   */
  async addCategory(
    type: EvaluationType,
    formId: number,
    payload: UpsertCategoryReq,
  ): Promise<{ category: CategorySelect }> {
    const validation = await UpsertCategoryReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationCategories" : "SupervisorEvaluationCategories";
    const category = await CreateRecord(tableName, {
      form_id: formId,
      ...validation.data,
    });
    return { category: category as CategorySelect };
  }

  /**
   * Updates an existing evaluation category by decommissioning the old record and inserting a new version.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param categoryId - the primary key ID of the category to update
   * @param payload - partial fields to update
   * @returns the newly created version of the category record
   */
  async updateCategory(
    type: EvaluationType,
    categoryId: number,
    payload: Partial<UpsertCategoryReq>,
  ): Promise<{ category: CategorySelect }> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationCategories" : "SupervisorEvaluationCategories";
    const catTable =
      type === "student" ? StudentEvaluationCategories : SupervisorEvaluationCategories;

    return await db.transaction(async (tx) => {
      const existing = await GetRecord(tableName, {
        where: () => and(eq(catTable.id, categoryId), isNull(catTable.deleted_at)),
        tx,
      });

      if (!existing) {
        throw new AppError(404, "Category not found or already decommissioned.");
      }

      await SoftDeleteRecord(tableName, categoryId, catTable.id, tx);

      const newCategory = await CreateRecord(
        tableName,
        {
          form_id: existing.form_id,
          name: payload.name ?? existing.name,
          description:
            payload.description !== undefined ? payload.description : existing.description,
          order: payload.order ?? existing.order,
        },
        tx,
      );

      return { category: newCategory as CategorySelect };
    });
  }

  /**
   * Soft-deletes an evaluation category.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param categoryId - the primary key ID of the category to soft-delete
   */
  async deleteCategory(type: EvaluationType, categoryId: number): Promise<void> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationCategories" : "SupervisorEvaluationCategories";
    const categorySchema =
      type === "student" ? StudentEvaluationCategories : SupervisorEvaluationCategories;

    const deleted = await SoftDeleteRecord(tableName, categoryId, categorySchema.id);
    if (!deleted) throw new AppError(404, "Category not found.");
  }

  /**
   * Retrieves all active questions belonging to a specific evaluation category using GetRecords.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param categoryId - the target category identifier
   * @returns an array of active question records
   */
  async getQuestions(type: EvaluationType, categoryId: number): Promise<QuestionSelect[]> {
    const isStudent = type === "student";
    const tableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationQuestions"
      : "SupervisorEvaluationQuestions";
    const schemaTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    const records = await GetRecords(tableName, {
      where: () => and(eq(schemaTable.category_id, categoryId), isNull(schemaTable.deleted_at)),
    });
    return records as QuestionSelect[];
  }

  /**
   * Adds a new question item to an evaluation category.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param categoryId - the parent category identifier
   * @param payload - question text, maximum rating scale, and order index
   * @returns the created question record
   */
  async addQuestion(
    type: EvaluationType,
    categoryId: number,
    payload: UpsertQuestionReq,
  ): Promise<{ question: QuestionSelect }> {
    const validation = await UpsertQuestionReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationQuestions" : "SupervisorEvaluationQuestions";
    const question = await CreateRecord(tableName, {
      category_id: categoryId,
      ...validation.data,
    });
    return { question: question as QuestionSelect };
  }

  /**
   * Updates an existing evaluation question by decommissioning the old record and inserting a new version.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param questionId - the primary key ID of the question to update
   * @param payload - partial question fields to modify
   * @returns the newly created version of the question record
   */
  async updateQuestion(
    type: EvaluationType,
    questionId: number,
    payload: Partial<UpsertQuestionReq>,
  ): Promise<{ question: QuestionSelect }> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationQuestions" : "SupervisorEvaluationQuestions";
    const qTable = type === "student" ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    return await db.transaction(async (tx) => {
      const existing = await GetRecord(tableName, {
        where: () => and(eq(qTable.id, questionId), isNull(qTable.deleted_at)),
        tx,
      });

      if (!existing) {
        throw new AppError(404, "Question not found or already decommissioned.");
      }

      await SoftDeleteRecord(tableName, questionId, qTable.id, tx);

      const newQuestion = await CreateRecord(
        tableName,
        {
          category_id: existing.category_id,
          question: payload.question ?? existing.question,
          max_rating: payload.max_rating ?? existing.max_rating,
          order: payload.order ?? existing.order,
        },
        tx,
      );

      return { question: newQuestion as QuestionSelect };
    });
  }

  /**
   * Soft-deletes an evaluation question.
   *
   * @param type - specifies 'student' or 'supervisor' evaluation domain
   * @param questionId - the primary key ID of the question to soft-delete
   */
  async deleteQuestion(type: EvaluationType, questionId: number): Promise<void> {
    const tableName: SoftDeletableTables =
      type === "student" ? "StudentEvaluationQuestions" : "SupervisorEvaluationQuestions";
    const questionSchema =
      type === "student" ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    const deleted = await SoftDeleteRecord(tableName, questionId, questionSchema.id);
    if (!deleted) throw new AppError(404, "Question not found.");
  }

  /**
   * Retrieves all means/descriptors associated with a specific supervisor evaluation question using GetRecords.
   *
   * @param questionId - the target supervisor question identifier
   * @returns an array of supervisor mean descriptors
   */
  async getSupervisorMeans(questionId: number): Promise<MeanSelect[]> {
    const records = await GetRecords("SupervisorEvaluationMeans", {
      where: () =>
        and(
          eq(SupervisorEvaluationMeans.question_id, questionId),
          isNull(SupervisorEvaluationMeans.deleted_at),
        ),
    });
    return records as MeanSelect[];
  }

  /**
   * Adds a mean descriptor to a supervisor evaluation question item.
   *
   * @param questionId - the parent supervisor question identifier
   * @param payload - the mean descriptor text
   * @returns the created mean descriptor record
   */
  async addSupervisorMean(
    questionId: number,
    payload: UpsertMeanReq,
  ): Promise<{ mean: MeanSelect }> {
    const validation = await UpsertMeanReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const mean = await CreateRecord("SupervisorEvaluationMeans", {
      question_id: questionId,
      ...validation.data,
    });
    return { mean: mean as MeanSelect };
  }

  /**
   * Updates an existing supervisor mean descriptor by decommissioning the old record and inserting a new version.
   *
   * @param meanId - the primary key ID of the mean descriptor to update
   * @param payload - partial descriptor fields to update
   * @returns the newly created version of the mean descriptor record
   */
  async updateSupervisorMean(
    meanId: number,
    payload: Partial<UpsertMeanReq>,
  ): Promise<{ mean: MeanSelect }> {
    const tableName: SoftDeletableTables = "SupervisorEvaluationMeans";

    return await db.transaction(async (tx) => {
      const existing = await GetRecord(tableName, {
        where: () =>
          and(
            eq(SupervisorEvaluationMeans.id, meanId),
            isNull(SupervisorEvaluationMeans.deleted_at),
          ),
        tx,
      });

      if (!existing) {
        throw new AppError(404, "Mean descriptor not found or already decommissioned.");
      }

      await SoftDeleteRecord(tableName, meanId, SupervisorEvaluationMeans.id, tx);

      const newMean = await CreateRecord(
        tableName,
        {
          question_id: existing.question_id,
          descriptor: payload.descriptor ?? existing.descriptor,
        },
        tx,
      );

      return { mean: newMean as MeanSelect };
    });
  }

  /**
   * Soft deletes a supervisor mean descriptor.
   *
   * @param meanId - the primary key ID of the mean descriptor to delete
   */
  async deleteSupervisorMean(meanId: number): Promise<void> {
    const deleted = await SoftDeleteRecord(
      "SupervisorEvaluationMeans",
      meanId,
      SupervisorEvaluationMeans.id,
    );
    if (!deleted) throw new AppError(404, "Mean descriptor not found.");
  }
}

const EvaluationFormService = new evaluationFormService();
export default EvaluationFormService;
