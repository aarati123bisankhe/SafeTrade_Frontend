import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const certDirectory = path.resolve(__dirname, "../certs");
const certPath = path.join(certDirectory, "localhost-cert.pem");
const keyPath = path.join(certDirectory, "localhost-key.pem");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: fs.existsSync(certPath) && fs.existsSync(keyPath)
    ? {
        host: "localhost",
        https: {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        },
      }
    : {
        host: "localhost",
      },
});
