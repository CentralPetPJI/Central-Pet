import type { FilePayload } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function obterImagemFixtureParaUpload(): FilePayload {
  const fixturePath = path.join(__dirname, "..", "fixtures", "pet-photo.jpeg");

  if (fs.existsSync(fixturePath)) {
    return {
      name: "pet-photo.jpeg",
      mimeType: "image/jpeg",
      buffer: fs.readFileSync(fixturePath),
    };
  }

  // Fallback para um pixel vermelho se o arquivo não existir (para robustez em CI)
  return {
    name: "red-pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  };
}
