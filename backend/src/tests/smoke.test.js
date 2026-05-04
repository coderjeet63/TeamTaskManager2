const app = require("../app");

if (!app || typeof app !== "function") {
  throw new Error("Express app failed to initialize.");
}

console.log("Backend smoke test passed.");
