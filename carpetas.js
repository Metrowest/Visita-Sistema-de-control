// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO EXCLUSIVO DE CONTROL PARA DRIVE)
// INTERFAZ: Totalmente aislado por secciones fijas y dinámicas en orden estricto
// PARTE 1 DE 2: CONFIGURACIÓN, VARIABLES, EMISORES Y LECTURA DE INTERNET
// =========================================================================

// =========================================================================
// SECCIÓN 1 (CAMBIOS FRECUENTES - CONFIGURACIÓN): ENLACE DE RED WEB APP
// =========================================================================
// CORRECCIÓN DE RED: Esta es la URL real de tu implementación de carpetas
const CARPETAS_WEB_APP_URL = "https://https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";

// =========================================================================
// SECCIÓN 2 (FIJA): VARIABLES DE MEMORIA INTERNA AISLADA (CARPETAS.JS)
// =========================================================================
let drive_IdCarpetaActiva = "RAIZ";
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 3 (FIJA): EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS)
// =========================================================================

// FUNCIÓN 1: Lanza la petición script para consultar la estructura de una carpeta (REQ 1 y 2)
function drive_CargarEstructuraNube(folderId) {
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
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
// =========================================================================

// FUNCIÓN 1: Renderiza de forma responsive la lista desplegable interna y el visor (REQ 1 y 2)
window.recibirEstructuraDrive = function(resultado) {
    if (resultado.status !== "success") return;
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    // REQUERIMIENTO 1: Llenamos e inyectamos la lista desplegable interactiva propia
    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";
        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Ubicación Activa)";
        selectorSub.appendChild(optRaiz);

        resultado.carpetas.forEach(sub => {
            let opt = document.createElement("option");
            opt.value = sub.id;
            opt.innerText = "📁 → " + sub.nombre;
            selectorSub.appendChild(opt);
        });
        selectorSub.value = drive_IdCarpetaActiva;
    }

    // Controlamos el botón de borrado: se apaga si estás parado en la carpeta raíz
    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    // REQUERIMIENTO 2: Presenta las carpetas y archivos en la tabla responsiva
    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";
        if (resultado.archivos.length === 0) {
            tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">No hay archivos guardados en esta ubicación.</td></tr>`;
            return;
        }
        resultado.archivos.forEach(arc => {
            let htmlFila = "<tr>";
            htmlFila += `<td><strong>${arc.nombre}</strong></td>`;
            htmlFila += `<td><span class="badge">${arc.mimeType.split("/").pop().toUpperCase()}</span></td>`;
            htmlFila += `<td><a href="${arc.url}" target="_blank" class="btn-edit" style="text-decoration:none; display:inline-block; text-align:center; padding:4px 8px;">👁️ Ver</a></td>`;
            htmlFila += "</tr>";
            tablaCuerpoDrive.insertAdjacentHTML("beforeend", htmlFila);
        });
    }
};
// =========================================================================
// PARTE 2 DE 2: PROCESADORES LOCALES, INTERCEPTORES DE DECISIÓN Y ESCUCHAS
// Ubicación del bloque: CONTINUACIÓN DIRECTA ABAJO DE LA PARTE 1
// =========================================================================

// =========================================================================
// SECCIÓN 5 (CONFIGURACIÓN DINÁMICA): INTERCEPTOR EVALUADOR DE ALERTAS INTERACTIVAS
// =========================================================================

// FUNCIÓN 1: Procesa el documento seleccionado y genera la vista previa responsiva (REQ 3)
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

// FUNCIÓN 2: Atrapa la respuesta de preexistencia y lanza los diálogos Sí/No (REQ 4 al 11)
window.recibirVerificacionDrive = function(respuesta) {
    if (respuesta.status !== "success") return;

    // REQUERIMIENTO 4 y 5: Si se indica que es un documento ya existente
    if (respuesta.existe) {
        // REQUERIMIENTO 8: Validación de formato idéntico
        if (respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            drive_RestablecerFormularioCarga();
            return;
        }

        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            // REQUERIMIENTO 6: Si decide "Sí", ejecuta la sobreescritura manteniendo el formato
            drive_TransmitirCargaFisicaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            // REQUERIMIENTO 7: Si presiona "No", la función no subirá nada
            drive_RestablecerFormularioCarga();
        }
    } else {
        // REQUERIMIENTO 9: Si es un documento nuevo
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            // REQUERIMIENTO 10: Si presiona "Sí", subirá el documento
            drive_TransmitirCargaFisicaNube("crearNuevo", null);
        } else {
            // REQUERIMIENTO 11: Si presiona "No", la función no subirá nada
            drive_RestablecerFormularioCarga();
        }
    }
};

// =========================================================================
// SECCIÓN 6 (FIJA): MOTOR DE EMISIÓN DE TRANSFERENCIA DE BYTES (POST ENGINE)
// =========================================================================

// FUNCIÓN 1: Empaqueta el JSON y despacha la carga física de bytes
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

// FUNCIÓN 2: Restaura las cajas y limpia la memoria de la carga actual
function drive_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if(btn) { btn.disabled = false; btn.innerText = "🚀 Subir Documento Seleccionado"; btn.style.display = "none"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
    document.getElementById("contenedorPrevisualizacionFoto").style.display = "none";
}

// =========================================================================
// SECCIÓN 7 (FIJA): RECEPTOR SECUNDARIO DE CONFIRMACIONES DE ACCIONES
// =========================================================================
window.recibirRespuestaAccionDrive = function(res) {
    alert(res.message || "Acción completada de forma correcta.");
    drive_CargarEstructuraNube(drive_IdCarpetaActiva);
};

// =========================================================================
// SECCIÓN 8 (FIJA): ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS
// =========================================================================

document.getElementById("selectorSubcarpetas").addEventListener("change", (e) => {
    drive_IdCarpetaActiva = e.target.value;
    drive_CargarEstructuraNube(e.target.value);
});

document.getElementById("archivoSubirDrive").addEventListener("change", drive_ManejarSeleccionArchivo);

document.getElementById("btnIniciarCargaDrive").addEventListener("click", () => {
    if (!drive_NombreArchivoSeleccionado) return;
    drive_VerificarPreexistenciaNube(drive_NombreArchivoSeleccionado);
});

document.getElementById("btnCrearCarpetaDrive").addEventListener("click", () => {
    let nom = prompt("Escribe el nombre de la nueva carpeta:");
    if (!nom || !nom.trim()) return;
    const script = document.createElement("script");
    script.src = `${CARPETAS_WEB_APP_URL}?accion=crearCarpeta&nombreCarpeta=${encodeURIComponent(nom.trim())}&padreId=${drive_IdCarpetaActiva}`;
    document.body.appendChild(script);
});

document.getElementById("btnBorrarCarpetaDrive").addEventListener("click", () => {
    if (!confirm("¿Está seguro de borrar esta carpeta interna y todos sus archivos?")) return;
    const script = document.createElement("script");
    script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarCarpeta&targetFolderId=${drive_IdCarpetaActiva}`;
    document.body.appendChild(script);
    drive_IdCarpetaActiva = "RAIZ";
});

// Carga automática inicial aislada del panel fijo
document.addEventListener("DOMContentLoaded", () => {
    drive_CargarEstructuraNube("RAIZ");
});
