import CollegeService from "@/services/college.service.js";
import { extractSearchParams } from "@/utils/request.util.js";
import type { NextFunction, Request, Response } from "express";

class collegeController {
  constructor(private collegeService = CollegeService) {}

  async getColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const searchParams = await extractSearchParams("Colleges", req);
      const 
    }
  };
}

const CollegeController = new collegeController();
export default CollegeController;
