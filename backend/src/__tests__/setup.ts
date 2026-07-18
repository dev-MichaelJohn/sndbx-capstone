import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = "a".repeat(32);
process.env.REFRESH_SECRET = "b".repeat(32);
process.env.GMAIL_APP_USER = "test@example.com";
process.env.GMAIL_APP_PASSWORD = "test-password";

const mockQueryBuilder = {
  $dynamic: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
};

vi.mock("@/configs/db.config.js", () => ({
  default: {
    transaction: vi.fn(),
    select: vi.fn(() => ({ ...mockQueryBuilder })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}));

vi.mock("@/utils/logger.util.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    http: vi.fn(),
  },
}));
