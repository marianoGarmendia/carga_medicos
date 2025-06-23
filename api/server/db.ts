// db.ts
import Database from "better-sqlite3";
import fs from 'fs';

import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Crea la carpeta si no existe
const dbDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'medicos.db');
const db = new Database(dbPath);

// Crea la tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_carga TEXT NOT NULL,
    especialidad TEXT NOT NULL,
    nombre_medico TEXT NOT NULL,
    apellido_medico TEXT NOT NULL,
    categoria TEXT,
    obra_social TEXT,
    dias_atencion TEXT
  )
`);

export default db;
