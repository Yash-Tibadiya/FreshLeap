const { Client } = require("pg");

// Your Neon DB connection string
const connectionString =
  "";
const client = new Client({
  connectionString: connectionString,
});

async function dropAllTablesAndEnums() {
  try {
    // Connect to the Neon DB
    await client.connect();
    console.log("Connected to Neon DB");

    // 1. Drop Enums
    console.log("Dropping enums...");

    // Enum types based on your schema
    const enums = ["role", "category", "order_status"];

    for (const enumName of enums) {
      console.log(`Dropping enum: ${enumName}`);
      await client.query(`DROP TYPE IF EXISTS public.${enumName} CASCADE;`);
      console.log(`Enum ${enumName} dropped successfully`);
    }

    // 2. Drop tables in the correct order (to avoid foreign key dependency issues)
    console.log("Dropping tables...");

    const tables = [
      "product_reviews",
      "order_items",
      "orders",
      "cart_items",
      "carts",
      "products",
      "farmers",
      "users",
    ];

    // Drop each table
    for (const tableName of tables) {
      console.log(`Dropping table: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS public.${tableName} CASCADE;`);
      console.log(`Table ${tableName} dropped successfully`);
    }
  } catch (err) {
    console.error("Error dropping tables and enums:", err);
  } finally {
    // Close the database connection
    await client.end();
    console.log("Database connection closed");
  }
}

dropAllTablesAndEnums();