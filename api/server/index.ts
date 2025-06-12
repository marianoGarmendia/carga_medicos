import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db"; // importa tu instancia de SQLite

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta a la carpeta

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para manejar formularios

const upload = multer(); // Solo campos de texto, no archivos


// Ruta para guardar JSON de médicos
app.post("/api/guardar-medico", upload.none(), async (req, res) => {
  try {
    const {
      fecha_carga,
      especialidad,
      nombre_medico,
      apellido_medico,
      categoria,
      obra_social,
      dias_atencion,
    } = req.body;

    if (!fecha_carga || !especialidad || !nombre_medico || !apellido_medico) {
      res
        .status(400)
        .json({ success: false, message: "Faltan campos obligatorios." });
        return
    }

    const stmtCheck = db.prepare(`
      SELECT COUNT(*) as total FROM medicos
      WHERE LOWER(nombre_medico) = LOWER(?) AND LOWER(apellido_medico) = LOWER(?) AND LOWER(especialidad) = LOWER(?)
    `);

    const { total } = stmtCheck.get(
      nombre_medico,
      apellido_medico,
      especialidad
    ) as { total: number };
    if (total > 0) {
      res
        .status(409)
        .json({
          success: false,
          message: "Ya existe ese médico con esa especialidad.",
        })
        return
    }

    const stmtInsert = db.prepare(`
      INSERT INTO medicos (fecha_carga, especialidad, nombre_medico, apellido_medico, categoria, obra_social, dias_atencion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmtInsert.run(
      fecha_carga,
      especialidad.trim().toLowerCase(),
      nombre_medico.trim(),
      apellido_medico.trim(),
      categoria,
      obra_social,
      JSON.stringify(dias_atencion)
    );

    res.json({ success: true });
    return;
  } catch (err) {
    console.error("Error al guardar médico:", err);
    res.status(500).json({ success: false, error: err.message });
    return;
  }
});


// Delete endpoint para eliminar un médico
app.delete("/api/eliminar-medico", express.json(), (req, res) => {
  const { nombre_medico, apellido_medico, especialidad } = req.body;

  if (!nombre_medico || !apellido_medico || !especialidad) {
    res.status(400).json({ success: false, message: "Faltan datos para eliminar." });
    return
  }

  const stmt = db.prepare(`
    DELETE FROM medicos
    WHERE LOWER(nombre_medico) = LOWER(?) AND LOWER(apellido_medico) = LOWER(?) AND LOWER(especialidad) = LOWER(?)
  `);

  const info = stmt.run(nombre_medico, apellido_medico, especialidad);

  if (info.changes > 0) {
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "Médico no encontrado." });
  }
});

// Actualizar los dias y campos parciales
app.patch("/api/actualizar-dias", express.json(), (req, res) => {
  const { nombre_medico, apellido_medico, especialidad, dias_atencion } = req.body;

  if (!nombre_medico || !apellido_medico || !especialidad || !dias_atencion) {
    res.status(400).json({ success: false, message: "Faltan datos requeridos." });
    return
  }

  const stmt = db.prepare(`
    UPDATE medicos
    SET dias_atencion = ?
    WHERE LOWER(nombre_medico) = LOWER(?) AND LOWER(apellido_medico) = LOWER(?) AND LOWER(especialidad) = LOWER(?)
  `);

  const info = stmt.run(
    JSON.stringify(dias_atencion),
    nombre_medico,
    apellido_medico,
    especialidad
  );

  if (info.changes > 0) {
    res.json({ success: true, updated: info.changes });
  } else {
    res.status(404).json({ success: false, message: "Médico no encontrado." });
  }
});



app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
