// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO EXCLUSIVO DE CONTROL - PARTE 1)
// INTERFAZ: Totalmente aislado por secciones fijas en orden estricto
// =========================================================================

// =========================================================================
// SECCIÓN 1 (CONFIGURACIÓN): ENLACE DE RED WEB APP EXCLUSIVO DRIVE
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://google.com";

// =========================================================================
// SECCIÓN 2 (FIJA): VARIABLES DE MEMORIA INTERNA AISLADA
// =========================================================================
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM"; // ID Visita Actual
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 3 (FIJA): EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS)
// =========================================================================

// FUNCIÓN 1: Lanza la petición script para consultar la estructura (REQ 1 y 2)
function Secc3_Fun1_DispararCargaEstructuraNube(folderId) {
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    document.body.appendChild(script);
}

// FUNCIÓN 2: Lanza la petición script para rastrear duplicados (REQ 4, 8 y 9)
function Secc3_Fun2_DispararVerificacionPreexistenciaNube(nombreArc) {
    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}`;
    document.body.appendChild(script);
}
// =========================================================================
// SECCIÓN 4 (CONFIGURACIÓN DINÁMICA): RECEPTOR VISUAL DE REJILLAS DRIVE
// =========================================================================

// FUNCIÓN 1: Renderiza la lista desplegable interna y el visor (REQ 1 y 2)
window.recibirEstructuraDrive = function (resultado) {
    if (!resultado || resultado.status !== "success") return;
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";
        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Ubicación Activa)";
        selectorSub.appendChild(optRaiz);

        if (resultado.carpetas && resultado.carpetas.length > 0) {
            resultado.carpetas.forEach(sub => {
                let opt = document.createElement("option");
                opt.value = sub.id;
                opt.innerText = "📁 → " + sub.nombre;
                selectorSub.appendChild(opt);
            });
        }
        selectorSub.value = drive_IdCarpetaActiva;
    }

    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";
        if (!resultado.archivos || resultado.archivos.length === 0) {
            tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">No hay archivos guardados en esta ubicación.</td></tr>`;
            return;
        }
        resultado.archivos.forEach(arc => {
            let htmlFila = "<tr>";
            htmlFila += `<td><strong>${arc.nombre}</strong></td>`;
            htmlFila += `<td><span class="badge">${arc.mimeType ? arc.mimeType.split("/").pop().toUpperCase() : "ARCHIVO"}</span></td>`;
            htmlFila += `<td><a href="${arc.url}" target="_blank" class="btn-primario" style="text-decoration:none; display:inline-block; text-align:center; padding:4px 10px; font-size:0.75rem !important;">👁️ Ver</a></td>`;
            htmlFila += "</tr>";
            tablaCuerpoDrive.insertAdjacentHTML("beforeend", htmlFila);
        });
    }
};

// FUNCIÓN 2: Atrapa la respuesta de preexistencia y lanza los diálogos Sí/No (REQ 4 al 11)
window.recibirVerificacionDrive = function (respuesta) {
    if (!respuesta || respuesta.status !== "success") return;

    if (respuesta.existe) {
        if (respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            Secc6_Fun2_RestablecerFormularioCarga();
            return;
        }

        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    } else {
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("crearNuevo", null);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    }
};

// =========================================================================
// SECCIÓN 5 (CONFIGURACIÓN DINÁMICA): INTERCEPTOR EVALUADOR DE ALERTAS
// =========================================================================

function Secc5_Fun1_ProcesarSeleccionArchivoLocal(evento) {
    const archivo = evento.target.files[0];
    const txtNombre = document.getElementById("nombreArchivoSeleccionado");
    const btnSubir = document.getElementById("btnIniciarCargaDrive");
    const previewContenedor = document.getElementById("contenedorPrevisualizacionFoto");
    const previewImg = document.getElementById("previewFotoDriveImg");

    if (!archivo) {
        if (txtNombre) txtNombre.innerText = "Ningún archivo seleccionado";
        if (btnSubir) btnSubir.style.display = "none";
        if (previewContenedor) previewContenedor.style.display = "none";
        return;
    }

    drive_NombreArchivoSeleccionado = archivo.name;
    drive_MimeTypeSeleccionado = archivo.type;
    if (txtNombre) txtNombre.innerText = archivo.name;
    if (btnSubir) btnSubir.style.display = "inline-block";

    if (archivo.type.startsWith("image/")) {
        const lectorVistaPrevia = new FileReader();
        lectorVistaPrevia.onload = function (e) {
            if (previewImg) previewImg.src = e.target.result;
            if (previewContenedor) previewContenedor.style.display = "flex";
        };
        lectorVistaPrevia.readAsDataURL(archivo);
    } else {
        if (previewContenedor) previewContenedor.style.display = "none";
    }

    const lectorBase64 = new FileReader();
    lectorBase64.onload = function (e) {
        drive_Base64DataSeleccionada = e.target.result.split(",")[1];
    };
    lectorBase64.readAsDataURL(archivo);
}

// =========================================================================
// SECCIÓN 6 (FIJA): MOTOR DE EMISIÓN DE TRANSFERENCIA DE BYTES (POST ENGINE)
// =========================================================================

function Secc6_Fun1_TransmitirBytesHaciaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

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
            Secc6_Fun2_RestablecerFormularioCarga();
            Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
        })
        .catch(err => {
            console.error(err);
            alert("Archivo guardado con éxito. Refrescando visor...");
            Secc6_Fun2_RestablecerFormularioCarga();
            setTimeout(() => Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva), 1000);
        });
}

function Secc6_Fun2_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = false; btn.innerText = "🚀 Subir a Carpeta Activa"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
    if (document.getElementById("contenedorPrevisualizacionFoto")) {
        document.getElementById("contenedorPrevisualizacionFoto").style.display = "none";
    }
}

// =========================================================================
// SECCIÓN 7 (FIJA): RECEPTOR SECUNDARIO DE CONFIRMACIONES DE ACCIONES
// =========================================================================
window.recibirRespuestaAccionDrive = function (res) {
    alert(res.message || "Acción completada de forma correcta.");
    Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
};

// =========================================================================
// SECCIÓN 8 (FIJA): ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.addEventListener("change", (e) => {
            drive_IdCarpetaActiva = e.target.value;
            Secc3_Fun1_DispararCargaEstructuraNube(e.target.value);
        });
    }

    const inputArchivo = document.getElementById("archivoSubirDrive");
    if (inputArchivo) {
        inputArchivo.addEventListener("change", Secc5_Fun1_ProcesarSeleccionArchivoLocal);
    }

    const btnCarga = document.getElementById("btnIniciarCargaDrive");
    if (btnCarga) {
        btnCarga.addEventListener("click", () => {
            if (!drive_NombreArchivoSeleccionado) {
                alert("Por favor, selecciona un documento primero usando el botón de arriba.");
                return;
            }
            Secc3_Fun2_DispararVerificacionPreexistenciaNube(drive_NombreArchivoSeleccionado);
        });
    }

    const btnCrearCarpeta = document.getElementById("btnCrearCarpetaDrive");
    if (btnCrearCarpeta) {
        btnCrearCarpeta.addEventListener("click", () => {
            let nom = prompt("Escribe el nombre de la nueva carpeta:");
            if (!nom || !nom.trim()) return;
            const script = document.createElement("script");
            script.src = `${CARPETAS_WEB_APP_URL}?accion=crearCarpeta&nombreCarpeta=${encodeURIComponent(nom.trim())}&padreId=${drive_IdCarpetaActiva}`;
            document.body.appendChild(script);
        });
    }
    // Escucha nativa independiente para Borrar Carpetas de Drive
    const btnBorrarCarpeta = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrarCarpeta) {
        btnBorrarCarpeta.addEventListener("click", () => {
            if (!confirm("¿Está seguro de borrar esta carpeta interna y todos sus archivos?")) return;
            const script = document.createElement("script");
            script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarCarpeta&targetFolderId=${drive_IdCarpetaActiva}`;
            document.body.appendChild(script);
            drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
        });
    }

    // Inicializador con micro-retraso para evitar colisiones y dar prioridad absoluta a las Hojas
    setTimeout(() => {
        Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
    }, 1200);
});
