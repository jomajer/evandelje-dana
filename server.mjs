import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { dohvatiEvandjelje } from "./api/evandjelje.js";

const korijen = dirname(fileURLToPath(import.meta.url));
const PORT = 8788;

http
  .createServer(async (zahtjev, odgovor) => {
    try {
      if (zahtjev.url.startsWith("/api/evandjelje")) {
        const podaci = await dohvatiEvandjelje();
        odgovor.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        odgovor.end(JSON.stringify(podaci));
        return;
      }
      const html = await readFile(join(korijen, "index.html"));
      odgovor.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      odgovor.end(html);
    } catch (gr) {
      odgovor.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      odgovor.end(JSON.stringify({ greska: gr.message }));
    }
  })
  .listen(PORT, () => console.log(`Evanđelje dana: http://localhost:${PORT}`));
