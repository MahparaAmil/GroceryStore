require("dotenv").config();
const path = require("path");
const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in the environment");
}

const isSQLite = databaseUrl.startsWith("sqlite:");

const buildSqliteConfig = () => {
  const storagePath = databaseUrl.replace("sqlite:", "") || "./data/dev.sqlite";
  const storage = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(__dirname, "..", "..", storagePath);

  return new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });
};

const buildPostgresConfig = () => {
  const shouldUseSSL = (process.env.DB_SSL || "true").toLowerCase() !== "false";

  return new Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: shouldUseSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
};

const sequelize = isSQLite ? buildSqliteConfig() : buildPostgresConfig();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(isSQLite ? "✅ SQLite database ready" : "✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
