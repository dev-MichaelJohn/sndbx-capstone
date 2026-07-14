import env from "@/configs/env.config.js";
import SeederService from "@/services/seeder.service.js";
import { logger } from "@/utils/logger.util.js";

export async function seederFunction() {
  // 1. Handle Roles Seeding
  try {
    const rolesResult = await SeederService.seedRoles();
    logger.info(rolesResult.message);
  } catch (error: any) {
    // 409 means roles are already there, which is fine. Crash on any other error (like a 500).
    if (error.status !== 409) {
      return handleFatalError("Roles validation failed", error);
    }
    logger.info("System roles already present.");
  }

  // 2. Handle Super Admin Seeding
  try {
    await SeederService.seedSuperAdmin({
      credentials: { email: env.GMAIL_APP_USER, password: "!SuperAdmin123" },
      personalDetails: { first_name: "Michael John", last_name: "Larido", institutional_id: "SYS-00-0000-001" }
    });
    logger.info("Superadmin created successfully. Continuing application setup...");
  } catch (error: any) {
    // If it's a 409, it means a Super Admin already exists. This is your safe "continue" condition!
    if (error.status === 409) {
      logger.info("An active Superadmin already exists. Safe to continue application startup.");
      return; // Exit the seeder function cleanly and let the server continue booting up
    }

    // If it is ANY other error (validation failed, DB down, etc.), it means NO super admin exists or can be made. Stop!
    return handleFatalError("Super Admin verification failed", error);
  }
}

// Reusable shutdown helper
function handleFatalError(context: string, error: any) {
  logger.error(`FATAL SYSTEM ERROR: ${context}. ${error.message || error}`);
  logger.error("Shutting down application process because no Super Admin is guaranteed.");
  process.exit(1);
}
