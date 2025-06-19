import express from "express";
import multer from "multer";
import cors from "cors";
import path from 'path';
import db from "./db"; // importa tu instancia de SQLite



export interface Medico {
  id: number;
  fecha_carga: string;          // formato ISO (YYYY-MM-DD)
  especialidad: string;
  nombre_medico: string;
  apellido_medico: string;
  categoria: string;            // puede ser 'A', 'B', etc.
  obra_social: string;
  dias_atencion: string[];      // array de días como strings
}

type RawMedico = Omit<Medico, "dias_atencion"> & { dias_atencion: string };


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para manejar formularios

const upload = multer(); // Solo campos de texto, no archivos

const PORT = process.env.PORT || 3000;

const clientPath = path.resolve(__dirname, '../../dist-client');
app.use(express.static(clientPath));

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});




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
    return
  } else {
    res.status(404).json({ success: false, message: "Médico no encontrado." });
    return
  }
});


// En SQL, SET se usa para especificar los campos que vas a modificar en un UPDATE.

// Sintaxis general
// sql
// 
// 
// UPDATE tabla
// SET campo1 = valor1, campo2 = valor2
// WHERE condicion;

// Actualizar los dias y campos parciales
app.patch("/api/actualizar-medico", express.json(), (req, res) => {
  const {
    nombre_medico,
    apellido_medico,
    dias_atencion,
    obra_social
  } = req.body;

  if (!nombre_medico || !apellido_medico) {
    res.status(400).json({ success: false, message: "Faltan nombre o apellido." });
    return
  }

  const campos: string[] = [];
  const params: (string | number)[] = [];

  // Agregar campos a actualizar dinámicamente
  if (Array.isArray(dias_atencion) && dias_atencion.length > 0) {
    campos.push("dias_atencion = ?");
    params.push(JSON.stringify(dias_atencion));
  }

  if (obra_social && obra_social.trim() !== "") {
    campos.push("obra_social = ?");
    params.push(obra_social.trim());
  }

  if (campos.length === 0) {
    res.status(400).json({ success: false, message: "No se proporcionó ningún dato para actualizar." });
    return
  }

  // Construcción dinámica del SQL
  const sql = `
    UPDATE medicos
    SET ${campos.join(", ")}
    WHERE LOWER(nombre_medico) = LOWER(?)
      AND LOWER(apellido_medico) = LOWER(?)
  `;

  params.push(nombre_medico, apellido_medico);

  const stmt = db.prepare(sql);
  const info = stmt.run(...params);

  if (info.changes > 0) {
    res.json({ success: true, updated: info.changes });
    return
  } else {
    res.status(404).json({ success: false, message: "Médico no encontrado." });
    return
  }
});



app.get("/api/medicos", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM medicos ORDER BY apellido_medico ASC, nombre_medico ASC");
   const rawMedicos = stmt.all() as RawMedico[];

const medicos: Medico[] = rawMedicos.map((m) => ({
  ...m,
  dias_atencion: JSON.parse(m.dias_atencion)
}));

    res.json(medicos);
    return
  } catch (err) {
    console.error("Error al listar médicos:", err);
    res.status(500).json({ success: false, error: err.message });
    return
  }
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});