import { CollegeDeans, Colleges } from "@/schemas/institution.schema.js";
import { and, ilike, isNull, or, getColumns, sql, type InferSelectModel, eq, asc, desc } from "drizzle-orm";
import z from "zod";
import { GetRecord, GetRecords } from "./db.service.js";
import { createPaginatedData } from "@/utils/response.util.js";
import { createSearchSchema } from "@/utils/request.util.js";
import { Accounts, PersonalDetails } from "@/schemas/auth.schema.js";

export const CollegeSearchQuerySchema = createSearchSchema("Colleges");
export type CollegeSearchQuery = z.infer<typeof CollegeSearchQuerySchema>;

export type CollegeWithDean = InferSelectModel<typeof Colleges> & {
  dean_account_id: number | null;
  dean_first_name: string | null;
  dean_last_name: string | null;
  dean_middle_name: string | null;
};

export type CollegeWithDeanAndTotal = CollegeWithDean & {
  totalItems: number;
};

class collegeService {
  constructor() { }
  private getSearchConditions(search: string) {
    return or(
      ilike(Colleges.name, `%${search}%`),
      ilike(Colleges.initialism, `%${search}%`),
      ilike(PersonalDetails.first_name, `%${search}%`),
      ilike(PersonalDetails.last_name, `%${search}%`),
      ilike(PersonalDetails.middle_name, `%${search}%`),
    );
  };

  async getColleges({ search, page, orderBy = "id", orderDir = "asc" }: CollegeSearchQuery) {
    const validation = await CollegeSearchQuerySchema.safeParseAsync({ search, page });
    if (!validation.success) throw validation.error;

    const PAGE_SIZE = 10;
    const searchConditions = this.getSearchConditions(search);

    const columns = getColumns(Colleges);
    const orderColumn = columns[orderBy as keyof typeof columns] ?? Colleges.id;
    const orderFn = orderDir === "asc" ? asc : desc;

    const rows = await GetRecords<"Colleges", CollegeWithDeanAndTotal>("Colleges", {
      select: (Colleges) => ({
        ...getColumns(Colleges),
        dean_account_id: Accounts.id,
        dean_first_name: PersonalDetails.first_name,
        dean_last_name: PersonalDetails.last_name,
        dean_middle_name: PersonalDetails.middle_name,
        totalItems: sql<number>`count(*) over()::int`.as("totalItems"),
      }),
      where: () => and(searchConditions, isNull(Colleges.deleted_at)),
      join: (query) => query
        .leftJoin(CollegeDeans, and(
          eq(CollegeDeans.college_id, Colleges.id),
          isNull(CollegeDeans.deleted_at),
        ))
        .leftJoin(Accounts, and(
          eq(Accounts.id, CollegeDeans.dean_id),
          isNull(Accounts.deleted_at),
        ))
        .leftJoin(PersonalDetails, eq(PersonalDetails.id, Accounts.personal_details_id))
        .orderBy(orderFn(orderColumn))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
    });

    const totalItems = rows[0]?.totalItems ?? 0;
    const data = rows.map(({ totalItems, ...rest }) => rest);

    return createPaginatedData<InferSelectModel<typeof Colleges>[]>({
      data,
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems,
    });
  };

  async getCollege(id: number) {
    const validation = await z.coerce.number().positive().safeParseAsync(id);
    if (!validation.success) throw validation.error;

    const data = await GetRecord("Colleges", {
      where: () => and(eq(Colleges.id, id), isNull(Colleges.deleted_at)),
    });

    return data;
  };
};

const CollegeService = new collegeService();
export default CollegeService;
