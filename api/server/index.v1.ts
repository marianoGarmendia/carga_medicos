// import express from "express";
// import multer from "multer";
// import cors from "cors";
// import fs from "fs/promises";
// import path from "path";
// import { fileURLToPath } from 'url';



// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



// // Ruta absoluta a la carpeta



// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Para manejar formularios

// const upload = multer(); // Solo campos de texto, no archivos

// const FILE_PATH = path.join(__dirname, "../medicos/listado.json");





// const ensureJsonFile = async () => {
//   try {
//     await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
//     try {
//       await fs.access(FILE_PATH);
//     } catch {
//       // Si no existe, lo inicializa como array vacío
//       await fs.writeFile(FILE_PATH, "[]", "utf-8");
//     }
//   } catch (err) {
//     console.error("Error preparando archivo JSON:", err);
//     process.exit(1);
//   }
// }

// // Ruta para guardar JSON de médicos
// app.post("/api/guardar-medico", upload.none(), async (req, res) => {
//   try {
//     const {
//       fecha_carga,
//       especialidad,
//       nombre_medico,
//       apellido_medico,
//       categoria,
//       obra_social,
//       dias_atencion,
//     } = req.body;

    
    

//     const nuevoMedico = {
//       fecha_carga,
//       especialidad: especialidad.trim().toLowerCase(),
//       nombre_medico: nombre_medico.trim(),
//       apellido_medico: apellido_medico.trim(),
//       categoria,
//       obra_social,
//       dias_atencion
//     };

//     await ensureJsonFile();

//     const contenido = await fs.readFile(FILE_PATH, "utf-8");
//     const listaActual = JSON.parse(contenido);

//     const yaExiste = listaActual.some((m) =>
//       m.nombre_medico.trim().toLowerCase() === nuevoMedico.nombre_medico.toLowerCase() &&
//       m.apellido_medico.trim().toLowerCase() === nuevoMedico.apellido_medico.toLowerCase() &&
//       m.especialidad === nuevoMedico.especialidad
//     );

//     if (yaExiste) {
//        res.status(409).json({
//         success: false,
//         message: "Este médico con esa especialidad ya está registrado.",
//       });
//       return
//     }

//     listaActual.push(nuevoMedico);
//     await fs.writeFile(FILE_PATH, JSON.stringify(listaActual, null, 2), "utf-8");

//     res.json({ success: true, added: nuevoMedico });
//     return
//   } catch (err) {
//     console.error("Error al guardar médico:", err);
//     res.status(500).json({ success: false, error: err.message });
//     return
//   }
// })


// app.listen(3000, () => {
//   console.log("Servidor escuchando en http://localhost:3000");
// })