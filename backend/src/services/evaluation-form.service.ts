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
import db, { type PgTransaction } from "@/configs/db.config.js";
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
  CreateFormReqSchema,
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
  getForms(type: EvaluationType): Promise<FormSelect[]>;
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
  private async relinkCategoryQuestions(
    qTable: typeof StudentEvaluationQuestions | typeof SupervisorEvaluationQuestions,
    oldCategoryId: number,
    newCategoryId: number,
    tx: PgTransaction,
  ): Promise<void> {
    await tx
      .update(qTable)
      .set({ category_id: newCategoryId } as any)
      .where(and(eq(qTable.category_id, oldCategoryId), isNull(qTable.deleted_at)));
  }

  private async relinkQuestionMeans(
    oldQuestionId: number,
    newQuestionId: number,
    tx: PgTransaction,
  ): Promise<void> {
    await tx
      .update(SupervisorEvaluationMeans)
      .set({ question_id: newQuestionId })
      .where(
        and(
          eq(SupervisorEvaluationMeans.question_id, oldQuestionId),
          isNull(SupervisorEvaluationMeans.deleted_at),
        ),
      );
  }

  private buildFormTreeStructure(rows: FormTreeJoinRow[]): EvaluationFormTree {
    const baseRow = rows[0]!;
    const formTree: EvaluationFormTree = {
      id: baseRow.id,
      title: baseRow.title,
      description: baseRow.description,
      min_rating: baseRow.min_rating ?? 1,
      max_rating: baseRow.max_rating ?? 5,
      created_at: baseRow.created_at,
      updated_at: baseRow.updated_at,
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
            parent_id: row.category_parent_id,
            name: row.category_name as string,
            description: row.category_description,
            order: row.category_order as number,
            version: row.category_version as number,
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
            parent_id: row.question_parent_id,
            question: row.question_text as string,
            max_rating: row.max_rating as number,
            order: row.question_order as number,
            version: row.question_version as number,
            created_at: row.question_created_at as Date,
            updated_at: row.question_updated_at as Date,
            deleted_at: row.question_deleted_at,
          });
        }
      }
    }

    return formTree;
  }

  async getForms(type: EvaluationType): Promise<FormSelect[]> {
    const isStudent = type === "student";
    const tableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationForms"
      : "SupervisorEvaluationForms";
    const schemaTable = isStudent ? StudentEvaluationForms : SupervisorEvaluationForms;

    const records = await GetRecords(tableName, {
      where: () => isNull(schemaTable.deleted_at),
    });
    return records as FormSelect[];
  }

  async createForm(type: EvaluationType, payload: CreateFormReq): Promise<{ form: FormSelect }> {
    const validation = await CreateFormReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const tableName: TableNames =
      type === "student" ? "StudentEvaluationForms" : "SupervisorEvaluationForms";
    const record = await CreateRecord(tableName, validation.data);
    return { form: record as FormSelect };
  }

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
        category_parent_id: catTable.parent_id,
        category_name: catTable.name,
        category_description: catTable.description,
        category_order: catTable.order,
        category_version: catTable.version,
        category_created_at: catTable.created_at,
        category_updated_at: catTable.updated_at,
        category_deleted_at: catTable.deleted_at,
        question_id: qTable.id,
        question_parent_id: qTable.parent_id,
        question_text: qTable.question,
        max_rating: qTable.max_rating,
        question_order: qTable.order,
        question_version: qTable.version,
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

    if (!rows.length || !rows[0]) throw new AppError(404, "Form not found.");

    return this.buildFormTreeStructure(rows);
  }

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
      version: 1,
    });
    return { category: category as CategorySelect };
  }

  async updateCategory(
    type: EvaluationType,
    categoryId: number,
    payload: Partial<UpsertCategoryReq>,
  ): Promise<{ category: CategorySelect }> {
    const validation = await UpsertCategoryReqSchema.partial().safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const isStudent = type === "student";
    const tableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationCategories"
      : "SupervisorEvaluationCategories";

    const catTable = isStudent ? StudentEvaluationCategories : SupervisorEvaluationCategories;
    const qTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    return await db.transaction(async (tx) => {
      const oldRecord = await GetRecord(tableName, {
        where: () => and(eq(catTable.id, categoryId), isNull(catTable.deleted_at)),
        tx,
      });

      if (!oldRecord) throw new AppError(404, "Category not found.");

      // 1. Soft delete old category version
      await SoftDeleteRecord(tableName, categoryId, catTable.id, tx);

      // 2. Create new category version
      const newRecord = (await CreateRecord(
        tableName,
        {
          form_id: oldRecord.form_id,
          name: validation.data.name ?? oldRecord.name,
          description:
            validation.data.description !== undefined
              ? validation.data.description
              : oldRecord.description,
          order: validation.data.order ?? oldRecord.order,
          parent_id: oldRecord.id,
          version: ((oldRecord.version as number) ?? 1) + 1,
        },
        tx,
      )) as CategorySelect;

      // 3. Migrate active questions to new category version ID
      await this.relinkCategoryQuestions(qTable, oldRecord.id, newRecord.id, tx);

      return { category: newRecord };
    });
  }

  async deleteCategory(type: EvaluationType, categoryId: number): Promise<void> {
    const isStudent = type === "student";
    const catTableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationCategories"
      : "SupervisorEvaluationCategories";
    const qTableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationQuestions"
      : "SupervisorEvaluationQuestions";
    const catTable = isStudent ? StudentEvaluationCategories : SupervisorEvaluationCategories;
    const qTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    await db.transaction(async (tx) => {
      const cat = await SoftDeleteRecord(catTableName, categoryId, catTable.id, tx);
      if (!cat) throw new AppError(404, "Category not found.");

      const questions = await GetRecords(qTableName, {
        where: () => and(eq(qTable.category_id, categoryId), isNull(qTable.deleted_at)),
        tx,
      });

      for (const q of questions) {
        await SoftDeleteRecord(qTableName, q.id, qTable.id, tx);
      }
    });
  }

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
      version: 1,
    });
    return { question: question as QuestionSelect };
  }

  async updateQuestion(
    type: EvaluationType,
    questionId: number,
    payload: Partial<UpsertQuestionReq>,
  ): Promise<{ question: QuestionSelect }> {
    const validation = await UpsertQuestionReqSchema.partial().safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const isStudent = type === "student";
    const tableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationQuestions"
      : "SupervisorEvaluationQuestions";
    const qTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    return await db.transaction(async (tx) => {
      const oldRecord = await GetRecord(tableName, {
        where: () => and(eq(qTable.id, questionId), isNull(qTable.deleted_at)),
        tx,
      });

      if (!oldRecord) throw new AppError(404, "Question not found.");

      // 1. Soft delete old question version
      await SoftDeleteRecord(tableName, questionId, qTable.id, tx);

      // 2. Create new question version
      const newRecord = (await CreateRecord(
        tableName,
        {
          category_id: oldRecord.category_id,
          question: validation.data.question ?? oldRecord.question,
          max_rating: validation.data.max_rating ?? oldRecord.max_rating,
          order: validation.data.order ?? oldRecord.order,
          parent_id: oldRecord.id,
          version: ((oldRecord.version as number) ?? 1) + 1,
        },
        tx,
      )) as QuestionSelect;

      // 3. If supervisor mode, migrate MOVs (means) to new question version ID
      if (!isStudent) {
        await this.relinkQuestionMeans(oldRecord.id, newRecord.id, tx);
      }

      return { question: newRecord };
    });
  }

  async deleteQuestion(type: EvaluationType, questionId: number): Promise<void> {
    const isStudent = type === "student";
    const qTableName: SoftDeletableTables = isStudent
      ? "StudentEvaluationQuestions"
      : "SupervisorEvaluationQuestions";
    const qTable = isStudent ? StudentEvaluationQuestions : SupervisorEvaluationQuestions;

    await db.transaction(async (tx) => {
      const q = await SoftDeleteRecord(qTableName, questionId, qTable.id, tx);
      if (!q) throw new AppError(404, "Question not found.");

      if (!isStudent) {
        const means = await GetRecords("SupervisorEvaluationMeans", {
          where: () =>
            and(
              eq(SupervisorEvaluationMeans.question_id, questionId),
              isNull(SupervisorEvaluationMeans.deleted_at),
            ),
          tx,
        });
        for (const m of means) {
          await SoftDeleteRecord(
            "SupervisorEvaluationMeans",
            m.id,
            SupervisorEvaluationMeans.id,
            tx,
          );
        }
      }
    });
  }

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

  async addSupervisorMean(
    questionId: number,
    payload: UpsertMeanReq,
  ): Promise<{ mean: MeanSelect }> {
    const validation = await UpsertMeanReqSchema.safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const mean = await CreateRecord("SupervisorEvaluationMeans", {
      question_id: questionId,
      ...validation.data,
      version: 1,
    });
    return { mean: mean as MeanSelect };
  }

  async updateSupervisorMean(
    meanId: number,
    payload: Partial<UpsertMeanReq>,
  ): Promise<{ mean: MeanSelect }> {
    const validation = await UpsertMeanReqSchema.partial().safeParseAsync(payload);
    if (!validation.success) throw validation.error;

    const tableName: SoftDeletableTables = "SupervisorEvaluationMeans";

    return await db.transaction(async (tx) => {
      const oldRecord = await GetRecord(tableName, {
        where: () =>
          and(
            eq(SupervisorEvaluationMeans.id, meanId),
            isNull(SupervisorEvaluationMeans.deleted_at),
          ),
        tx,
      });

      if (!oldRecord) throw new AppError(404, "Mean descriptor not found.");

      await SoftDeleteRecord(tableName, meanId, SupervisorEvaluationMeans.id, tx);

      const newRecord = (await CreateRecord(
        tableName,
        {
          question_id: oldRecord.question_id,
          descriptor: validation.data.descriptor ?? oldRecord.descriptor,
          parent_id: oldRecord.id,
          version: ((oldRecord.version as number) ?? 1) + 1,
        },
        tx,
      )) as MeanSelect;

      return { mean: newRecord };
    });
  }

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
