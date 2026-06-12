import { config } from "dotenv";

config({ override: true });

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.DIRECT_URL = process.env.TEST_DATABASE_URL;
}

if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET =
    "integration-test-secret-must-be-at-least-32-chars";
}

if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = "http://localhost:3000";
}

process.env.INTEGRATION_TEST = "true";
