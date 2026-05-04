const app = require("./app");
const connectDatabase = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Backend server listening on port ${env.port}.`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
