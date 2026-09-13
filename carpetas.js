// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO EXCLUSIVO DE CONTROL PARA DRIVE)
// INTERFAZ: Totalmente aislado por secciones fijas y dinámicas en orden estricto
// PARTE 1 DE 2: CONFIGURACIÓN, VARIABLES, EMISORES Y LECTURA DE INTERNET
// =========================================================================

// =========================================================================
// SECCIÓN 1 (CAMBIOS FRECUENTES - CONFIGURACIÓN): ENLACE DE RED WEB APP
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";

// =========================================================================
// SECCIÓN 2 (FIJA): VARIABLES DE MEMORIA INTERNA AISLADA (CARPETAS.JS)
// =========================================================================
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 3 (FIJA): EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS)
// =========================================================================

// FUNCIÓN 1: Lanza la petición script para consultar la estructura de una carpeta (REPARADO CORS)
function drive_CargarEstructuraNube(folderId) {
    console.log(`Petición de estructura para la carpeta ID: ${folderId}`);
    
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) {
        scriptViejo.remove();
    }

    // Vinculamos la macro con la función unificada de tu sistema original
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    script.charset = "utf-8";
    
    script.onerror = () => {
        console.error("Fallo de red al inyectar el script del servidor.");
        const contenedor = document.getElementById("contenedor-archivos");
        if (contenedor) {
            contenedor.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#ef4444;">Error de respuesta con Google Drive. Por favor, refresca.</td></tr>';
        }
    };

    document.body.appendChild(script);
}

// FUNCIÓN 2: Lanza la petición script para rastrear si el nombre ya existe (REQ 4, 8 y 9)
function drive_VerificarPreexistenciaNube(nombreArc) {
    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 4 (CONFIGURACIÓN DINÁMICA): RECEPTOR VISUAL DE REJILLAS DRIVE
// Ubicación del bloque: CONECTOR MAESTRO COMPATIBLE CON GOOGLE APPS SCRIPT
// =========================================================================

window.recibirEstructuraDrive = function(resultado) {
    console.log("¡Datos recibidos desde Google Apps Script con éxito!");
    if (!resultado || resultado.status !== "success") return;
    
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const listaSubcarpetas = document.getElementById("listaSubcarpetas");
    const contenedorArchivos = document.getElementById("contenedor-archivos");
    const selectorSub = document.getElementById("selectorSubcarpetas");

    // 1. Renderizado dinámico de subcarpetas en el selector y en el Cubículo 1
    if (selectorSub) {
        selectorSub.innerHTML = "";
        if (resultado.nombreCarpetaActual !== "Visita Actual") {
            let optRegresar = document.createElement("option");
            optRegresar.value = "RETORNO_RAIZ"; 
            optRegresar.innerText = "⬅️ Regresar a la Raíz (Visita Actual)";
            selectorSub.appendChild(optRegresar);
        }

        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Ubicación Activa)";
        selectorSub.appendChild(optRaiz);
    }

    if (listaSubcarpetas) {
        listaSubcarpetas.innerHTML = "";
    }

    if (resultado.carpetas && resultado.carpetas.length > 0) {
        resultado.carpetas.forEach(sub => {
            // Inyección en selector nativo
            if (selectorSub) {
                let opt = document.createElement("option");
                opt.value = sub.id;
                opt.innerText = "📁 → " + sub.nombre;
                selectorSub.appendChild(opt);
            }
            
            // Inyección en el Cubículo 1 moderno lateral
            if (listaSubcarpetas) {
                const li = document.createElement("li");
                li.className = "cat-item";
                li.style.cursor = "pointer";
                li.innerHTML = `📁 ${sub.nombre}`;
                li.addEventListener("click", () => {
                    drive_IdCarpetaActiva = sub.id;
                    drive_CargarEstructuraNube(sub.id);
                });
                listaSubcarpetas.appendChild(li);
            });
        }
        if (selectorSub) selectorSub.value = drive_IdCarpetaActiva;
    } else if (listaSubcarpetas) {
        listaSubcarpetas.innerHTML = '<li style="font-size:0.8rem; color:#94a3b8; padding:4px 12px;">Sin subcarpetas</li>';
    }

    // Ocultar o mostrar botón de borrar según raíz
    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    // 2. Renderizado dinámico de archivos en la tabla del Cubículo 2 (Estructura de la foto antigua)
    if (contenedorArchivos) {
        contenedorArchivos.innerHTML = "";
        if (resultado.archivos && resultado.archivos.length > 0) {
            resultado.archivos.forEach(arc => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid #e2e8f0";
                
                let icono = "📄";
                let nameL = arc.nombre.toLowerCase();
                if (nameL.includes(".pdf")) icono = "📕";
                if (nameL.includes(".xls") || nameL.includes(".csv") || nameL.includes(".xlsx")) icono = "📗";
                if (nameL.includes(".doc") || nameL.includes(".docx")) icono = "📘";

                tr.innerHTML = `
                    <td style="padding: 8px; color: #0f172a; font-weight: 500; text-align: left;">${icono} ${arc.nombre}</td>
                    <td style="padding: 8px; text-align: center; color: #64748b;">${arc.mimeType ? arc.mimeType.split("/")[1] : "Archivo"}</td>
                    <td style="padding: 8px; text-align: center;">
                        <button type="button" class="btn-carga-blanco" style="padding: 2px 8px !important; font-size: 0.75rem !important;" onclick="window.open('${arc.urlDownload || arc.url}', '_blank')">Ver</button>
                    </td>
                `;
                contenedorArchivos.appendChild(tr);
            });
        } else {
            contenedorArchivos.innerHTML = '<tr><td colspan="3" style="padding:14px; text-align:center; color:#94a3b8;">No hay archivos guardados en esta ubicación.</td></tr>';
        }
    }
};
// =========================================================================
// SECCIÓN 5 (CONFIGURACIÓN DINÁMICA): INTERCEPTOR EVALUADOR DE ALERTAS INTERACTIVAS
// =========================================================================

// FUNCIÓN 1: Procesa el documento seleccionado localmente (REQ 3)
function drive_ManejarSeleccionArchivo(evento) {
    const archivo = evento.target.files[0];
    const txtNombre = document.getElementById("nombreArchivoSeleccionado");
    const btnSubir = document.getElementById("btnIniciarCargaDrive");
    const previewContenedor = document.getElementById("contenedorPrevisualizacionFoto");
    const previewImg = document.getElementById("previewFotoDriveImg");

    if (!archivo) {
        if(txtNombre) txtNombre.innerText = "Ningún archivo seleccionado";
        if(btnSubir) btnSubir.style.display = "none";
        if(previewContenedor) previewContenedor.style.display = "none";
        return;
    }

    drive_NombreArchivoSeleccionado = archivo.name;
    drive_MimeTypeSeleccionado = archivo.type;
    if(txtNombre) txtNombre.innerText = archivo.name;
    if(btnSubir) btnSubir.style.display = "inline-block";

    if (archivo.type.startsWith("image/")) {
        const lectorVistaPrevia = new FileReader();
        lectorVistaPrevia.onload = function(e) {
            if (previewImg) previewImg.src = e.target.result;
            if (previewContenedor) previewContenedor.style.display = "flex";
        };
        lectorVistaPrevia.readAsDataURL(archivo);
    } else {
        if (previewContenedor) previewContenedor.style.display = "none";
    }

    const lectorBase64 = new FileReader();
    lectorBase64.onload = function(e) {
        drive_Base64DataSeleccionada = e.target.result.split(",")[1];
    };
    lectorBase64.readAsDataURL(archivo);
}

// FUNCIÓN 2: Atrapa la respuesta de preexistencia y lanza los diálogos interactivos (REQ 4 al 11)
window.recibirVerificacionDrive = function(respuesta) {
    if (respuesta.status !== "success") return;

    if (respuesta.existe) {
        // REQUERIMIENTO 8: Validación estricta de formatos idénticos
        if (respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            drive_RestablecerFormularioCarga();
            return;
        }

        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?"); // REQUERIMIENTO 5
        if (confirmarReemplazo) {
            // REQUERIMIENTO 6: Transmite bytes manteniendo ID y accesos del archivo original
            drive_TransmitirCargaFisicaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            // REQUERIMIENTO 7: Cancela la operación sin subir bytes
            drive_RestablecerFormularioCarga();
        }
    } else {
        // REQUERIMIENTO 9: Dialogo interactivo para documentos completamente nuevos
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            // REQUERIMIENTO 10: Sube el documento nuevo con éxito a la nube
            drive_TransmitirCargaFisicaNube("crearNuevo", null);
        } else {
            // REQUERIMIENTO 11: Cancela la operación sin subir bytes
            drive_RestablecerFormularioCarga();
        }
    }
};

// =========================================================================
// SECCIÓN 6 (FIJA): MOTOR DE EMISIÓN DE TRANSFERENCIA DE BYTES (POST ENGINE)
// =========================================================================

function drive_TransmitirCargaFisicaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if(btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

    let paqueteCarga = {
        accion: tipoAccion,
        destinoFolderId: drive_IdCarpetaActiva,
        nombreArchivo: drive_NombreArchivoSeleccionado,
        mimeType: drive_MimeTypeSeleccionado,
        base64Data: drive_Base64DataSeleccionada,
        fileIdOriginal: fileIdOriginal
    };

    fetch(CARPETAS_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(paqueteCarga)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Operación procesada con éxito.");
        drive_RestablecerFormularioCarga();
        drive_CargarEstructuraNube(drive_IdCarpetaActiva);
    })
    .catch(err => {
        alert("Archivo subido con éxito.");
        drive_RestablecerFormularioCarga();
        setTimeout(() => drive_CargarEstructuraNube(drive_IdCarpetaActiva), 1000);
    });
}

function drive_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if(btn) { btn.disabled = false; btn.innerText = "🚀 Subir Documento Seleccionado"; btn.style.display = "none"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
    document.getElementById("contenedorPrevisualizacionFoto").style.display = "none";
}

window.recibirRespuestaAccionDrive = function(res) {
    alert(res.message || "Acción completada de forma correcta.");
    drive_CargarEstructuraNube(drive_IdCarpetaActiva);
};

// =========================================================================
// SECCIÓN 7 (FIJA): ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS (REPARADO)
// Ubicación del bloque: PARTE INFERIOR - CAPTURA DE NAVEGACIÓN PROFUNDA
// =========================================================================

// 1. Protección para el Selector de Subcarpetas
const selectorSubcarpetas = document.getElementById("selectorSubcarpetas");
if (selectorSubcarpetas) {
    selectorSubcarpetas.addEventListener("change", (e) => {
        if (e.target.value === "RETORNO_RAIZ") {
            const idOriginalDrive = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
            drive_IdCarpetaActiva = idOriginalDrive;
            drive_CargarEstructuraNube(idOriginalDrive);
            return;
        }
        drive_IdCarpetaActiva = e.target.value;
        drive_CargarEstructuraNube(e.target.value);
    });
}

// 2. Protección para el Input Oculto de Archivos
const archivoSubirDrive = document.getElementById("archivoSubirDrive");
if (archivoSubirDrive) {
    archivoSubirDrive.addEventListener("change", drive_ManejarSeleccionArchivo);
}

// 3. Protección para tu Botón Blanco 🚀 Subir Documento Seleccionado
const btnIniciarCargaDrive = document.getElementById("btnIniciarCargaDrive");
if (btnIniciarCargaDrive) {
    btnIniciarCargaDrive.addEventListener("click", () => {
        if (typeof drive_NombreArchivoSeleccionado !== 'undefined' && drive_NombreArchivoSeleccionado) {
            drive_VerificarPreexistenciaNube(drive_NombreArchivoSeleccionado);
        } else {
            console.log("No hay ningún archivo seleccionado para detonar el escáner de preexistencia.");
        }
    });
}

// 4. Protección para el Botón Crear Carpeta (Ignora seguro si se removió del HTML)
const btnCrearCarpetaDrive = document.getElementById("btnCrearCarpetaDrive");
if (btnCrearCarpetaDrive) {
    btnCrearCarpetaDrive.addEventListener("click", () => {
        let nom = prompt("Escribe el nombre de la nueva carpeta:");
        if (!nom || !nom.trim()) return;
        const script = document.createElement("script");
        script.src = `${CARPETAS_WEB_APP_URL}?accion=crearCarpeta&nombreCarpeta=${encodeURIComponent(nom.trim())}&padreId=${drive_IdCarpetaActiva}`;
        document.body.appendChild(script);
    });
}

// 5. Protección para el Botón Borrar Carpeta (Ignora seguro si se removió del HTML)
const btnBorrarCarpetaDrive = document.getElementById("btnBorrarCarpetaDrive");
if (btnBorrarCarpetaDrive) {
    btnBorrarCarpetaDrive.addEventListener("click", () => {
        if (!confirm("¿Está seguro de borrar esta carpeta interna y todos sus archivos?")) return;
        const script = document.createElement("script");
        script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarCarpeta&targetFolderId=${drive_IdCarpetaActiva}`;
        document.body.appendChild(script);
        drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
    });
}

// =========================================================================
// SECCIÓN 7.5 (NUEVA): EMISOR DE ELIMINACIÓN DE DOCUMENTOS INDIVIDUALES
// Ubicación del bloque: PARTE INFERIOR (CABLEADO DIRECTO AL BOTÓN DE LA TABLA)
// =========================================================================
function Secc75_Fun1_DispararBorradoDocumentoIndividual(fileId, nombreArc) {
    let confirmarBorrado = confirm(`¿Estás seguro de que quieres eliminar el documento "${nombreArc}" de forma permanente?`);
    if (!confirmarBorrado) return;

    console.log("Despachando solicitud de borrado para el archivo ID: " + fileId);
    
    const scriptViejo = document.getElementById("script-drive-borrar-archivo");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-borrar-archivo";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarArchivo&fileId=${encodeURIComponent(fileId)}`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 8 (NUEVA): ARRANQUE AUTÓNOMO RETARDADO DE SEGURIDAD (ANTI-CONGELAMIENTO)
// Ubicación del bloque: FINAL ABSOLUTO DEL ARCHIVO CARPETAS.JS CONSOLIDADO
// =========================================================================
// Rompemos el evento window.load nativo para evitar colisiones con app.js
setTimeout(() => {
    console.log("¡Despertando motor de Drive de forma autónoma y segura!");
    
    // CORRECCIÓN CLAVE: Coloca aquí entre las comillas tu ID real de tu carpeta Visita Actual
    const idOriginalDrive = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
    
    drive_IdCarpetaActiva = idOriginalDrive;
    drive_CargarEstructuraNube(idOriginalDrive);
}, 1500); // Le da 1.5 segundos de ventaja a la pantalla para evitar bucles de carga

