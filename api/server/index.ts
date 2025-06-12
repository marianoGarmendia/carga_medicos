import express from "express";
import multer from "multer";
import cors from "cors";
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

// Actualizar los dias y campos parciales
app.patch("/api/actualizar-medico", express.json(), (req, res) => {
  const {
    nombre_medico,
    apellido_medico,
    especialidad,
    dias_atencion,
    obra_social
  } = req.body;

  if (!nombre_medico || !apellido_medico || !especialidad || !dias_atencion) {
     res.status(400).json({ success: false, message: "Faltan datos requeridos." });
     return
  }

  // Construir SQL dinámicamente según si se informa obra_social
  let sql = `
    UPDATE medicos
    SET dias_atencion = ?
  `;
  const params: (string | number)[] = [JSON.stringify(dias_atencion)];

  if (obra_social && obra_social.trim() !== "") {
    sql += `, obra_social = ?`;
    params.push(obra_social.trim());
  }

  sql += `
    WHERE LOWER(nombre_medico) = LOWER(?) 
      AND LOWER(apellido_medico) = LOWER(?) 
      AND LOWER(especialidad) = LOWER(?)
  `;

  params.push(nombre_medico, apellido_medico, especialidad);

  const stmt = db.prepare(sql);
  const info = stmt.run(...params);

  if (info.changes > 0) {
    res.json({ success: true, updated: info.changes });
  } else {
    res.status(404).json({ success: false, message: "Médico no encontrado." });
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



app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
