import "@testing-library/jest-dom/vitest";

// Load the client script content and eval it in global scope
import fs from "fs";
import path from "path";

const clientScript = fs.readFileSync(
  path.join(__dirname, "public/fx-client.js"),
  "utf8",
);
eval(clientScript);

(global as any).window = globalThis;
