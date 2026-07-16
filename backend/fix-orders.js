import { query } from "./src/config/database.js";

async function run() {
  await query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255)
  `);

  await query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'
  `);

  await query(`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255)
  `);

  console.log("✅ Fixed orders table");
  process.exit();
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});