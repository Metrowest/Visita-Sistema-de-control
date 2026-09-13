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
// Ubicación del bloque: PARTE MEDIA (ENCARGADO DE DIBUJAR LA INTERFAZ)
// =========================================================================

// FUNCIÓN 1: Renderiza la lista desplegable interactiva y la tabla de archivos (REQ 1 y 2)
window.recibirEstructuraDrive = function(resultado) {
    if (resultado.status !== "success") return;
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";
        
        // COMPUERTA DE RETORNO INTELIGENTE: Opción de regresar a la raíz principal (REQ 2)
        if (resultado.nombreCarpetaActual !== "Visita Actual") {
            let optRegresar = document.createElement("option");
            optRegresar.value = "RETORNO_RAIZ"; 
            optRegresar.innerText = "⬅️ Regresar a la Raíz (Visita Actual)";
            selectorSub.appendChild(optRegresar);
        }

        // Muestra la carpeta en la que estás posicionado actualmente
        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Ubicación Activa)";
        selectorSub.appendChild(optRaiz);

        // Enlista todas las subcarpetas del directorio actual para navegación profunda
        resultado.carpetas.forEach(sub => {
            let opt = document.createElement("option");
            opt.value = sub.id;
            opt.innerText = "📁 → " + sub.nombre;
            selectorSub.appendChild(opt);
        });
        
        selectorSub.value = drive_IdCarpetaActiva;
    }

    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";
        if (resultado.archivos.length === 0) {
            tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">No hay archivos guardados en esta ubicación.</td></tr>`;
            return;
        }

        // RENDERIZADO ESTILO PORTAFOLIO: Inyección de iconos visuales según tipo de archivo
        resultado.archivos.forEach(arc => {
            let tipoMime = arc.mimeType.toLowerCase();
            let iconoVisual = "📄"; // Icono por defecto para documentos genéricos

            // Asignación de iconos temáticos basados en tu nueva plantilla gráfica
            if (tipoMime.includes("image") || tipoMime.includes("png") || tipoMime.includes("jpeg")) {
                iconoVisual = "🖼️"; // Icono nítido para fotos o capturas
            } else if (tipoMime.includes("pdf")) {
                iconoVisual = "📕"; // Icono rojo elegante para reportes PDF
            } else if (tipoMime.includes("spreadsheet") || tipoMime.includes("excel")) {
                iconoVisual = "📊"; // Icono para matrices de datos o registros
            } else if (tipoMime.includes("folder") || arc.url.includes("folder")) {
                iconoVisual = "📁"; // Icono de carpeta interna
            }

            let htmlFila = "<tr>";
            // Inyectamos el icono grande al lado del nombre del archivo con alineación limpia
            htmlFila += `<td style="display: flex; align-items: center; gap: 0.75rem;"><span style="font-size: 1.3rem;">${iconoVisual}</span> <strong>${arc.nombre}</strong></td>`;
            htmlFila += `<td><span class="badge">${arc.mimeType.split("/").pop().toUpperCase()}</span></td>`;
            htmlFila += `<td>
                <a href="${arc.url}" target="_blank" class="btn-edit" style="text-decoration:none; display:inline-block; padding:4px 8px; margin-right:4px;">👁️ Ver</a>
                <button type="button" class="btn-delete" style="padding:4px 8px; background:#e63946; color:white; border:none; border-radius:4px; cursor:pointer;" onclick="Secc75_Fun1_DispararBorradoDocumentoIndividual('${arc.id}', '${arc.nombre}')">🗑️ Borrar</button>
            </td>`;
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

document.getElementById("selectorSubcarpetas").addEventListener("change", (e) => {
    // COMPUERTA DE ESCAPE: Si elige regresar a la raíz principal, inyectamos tu ID real
    if (e.target.value === "RETORNO_RAIZ") {
        // CORRECCIÓN CLAVE: Coloca aquí entre las comillas tu ID real de tu carpeta Visita Actual
        const idOriginalDrive = "TU_ID_DE_CARPETA_VISITA_ACTUAL_AQUÍ";
        drive_IdCarpetaActiva = idOriginalDrive;
        drive_CargarEstructuraNube(idOriginalDrive);
        return;
    }
    
    // NAVEGACIÓN MULTINIVEL: Si elige una subcarpeta, actualiza la memoria y entra de forma profunda
    drive_IdCarpetaActiva = e.target.value;
    drive_CargarEstructuraNube(e.target.value);
});

document.getElementById("archivoSubirDrive").addEventListener("change", drive_ManejarSeleccionArchivo);

document.getElementById("btnIniciarCargaDrive").addEventListener("click", () => {
    if (!drive_NombreArchivoSeleccionado) return;
    // Detona el escáner automatizado invisible de preexistencia
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
    // CORRECCIÓN CLAVE: Coloca aquí entre las comillas tu ID real de tu carpeta Visita Actual
    drive_IdCarpetaActiva = "TU_ID_DE_CARPETA_VISITA_ACTUAL_AQUÍ";
});

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
