import { config } from "dotenv";

config({ override: true });

async function main() {
  console.log("No seed data configured. Create users via the sign-up form.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
