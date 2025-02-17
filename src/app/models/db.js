const { Sequelize } = require("sequelize");

// PostgreSQL connection configuration
const sequelize = new Sequelize("OnlineOrder", "postgres", "_Bontle146", {
    host: "localhost",
    dialect: "postgres",
    port: 5433,  // Set the correct PostgreSQL port
    logging: false, // Disable query logging
});

// Test connection
sequelize.authenticate()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch(err => console.error("❌ Database connection failed:", err));

module.exports = sequelize;
