// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO EXCLUSIVO DE CONTROL - PARTE 1)
// INTERFAZ: Totalmente aislado por secciones fijas en orden estricto
// =========================================================================

// =========================================================================
// SECCIÓN 1 (CONFIGURACIÓN): ENLACE DE RED WEB APP EXCLUSIVO DRIVE
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";

// =========================================================================
// SECCIÓN 2: VARIABLES DE MEMORIA INTERNA AISLADA
// =========================================================================
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM"; // ID Visita Actual
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 3: EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS CORREGIDOS)
// =========================================================================

// REQ 1 y 2: Lanza la petición script para consultar la estructura de carpetas y archivos
function Secc3_Fun1_DispararCargaEstructuraNube(folderId) {
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}&prefix=recibirEstructuraDrive`;
    document.body.appendChild(script);
}

// REQ 4: Lanza la petición script adjuntando el callback obligatorio para rastrear duplicados
function Secc3_Fun2_DispararVerificacionPreexistenciaNube(nombreArc) {
    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}&prefix=recibirVerificacionDrive`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 4: RECEPTOR VISUAL DE REJILLAS Y TABLAS DE DRIVE
// =========================================================================

// REQ 1 y 2: Procesa y renderiza de forma responsiva la lista desplegable y el visor
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

// =========================================================================
// SECCIÓN 5: RECEPTOR DE PREEXISTENCIA CON VALIDADOR LOCAL DE SEGURIDAD (BLINDADO)
// Ubicación del bloque: PARTE MEDIA DEL ARCHIVO CARPETAS.JS
// =========================================================================
window.recibirVerificacionDrive = function (respuesta) {
    if (!respuesta || respuesta.status !== "success") return;

    // VALIDACIÓN VISUAL EN PANTALLA: Inspeccionamos si el nombre está escrito en la tabla real
    let seMuestraEnPantalla = false;
    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    
    if (tablaCuerpoDrive) {
        const filas = tablaCuerpoDrive.getElementsByTagName("tr");
        for (let i = 0; i < filas.length; i++) {
            // Buscamos coincidencia exacta de texto en la fila del visor
            if (filas[i].innerText.includes(drive_NombreArchivoSeleccionado)) {
                seMuestraEnPantalla = true;
                break;
            }
        }
    }

    // NORMA DE SEGURIDAD: Solo si el archivo FÍSICAMENTE SE VE EN LA PANTALLA, es un REEMPLAZO
    if (seMuestraEnPantalla === true) {
        
        // REQUISITO 8: Validación de formato idéntico estricto
        if (respuesta.mimeTypeOriginal && respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            Secc6_Fun2_RestablecerFormularioCarga();
            return;
        }

        // REQUISITO 5: Mensaje flotante de confirmación para documentos ya existentes
        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    } else {
        // REQUISITO 9: Si la tabla de la pantalla está limpia (como en Firefox), es un DOCUMENTO NUEVO
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("crearNuevo", null);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    }
};
// =========================================================================
// INTERCEPTOR DE ARCHIVOS LOCALES REQUERIDO
// =========================================================================
function Secc5_Fun1_ProcesarSeleccionArchivoLocal(evento) {
    const listaArchivos = evento.target.files;
    const txtNombre = document.getElementById("nombreArchivoSeleccionado");
    const btnSubir = document.getElementById("btnIniciarCargaDrive");
    const previewContenedor = document.getElementById("contenedorPrevisualizacionFoto");
    const previewImg = document.getElementById("previewFotoDriveImg");

    if (!listaArchivos || listaArchivos.length === 0) {
        if (txtNombre) txtNombre.innerText = "Ningún archivo seleccionado";
        if (btnSubir) btnSubir.style.display = "none";
        if (previewContenedor) previewContenedor.style.display = "none";
        return;
    }

    const archivoFisico = listaArchivos[0];
    drive_NombreArchivoSeleccionado = archivoFisico.name;
    drive_MimeTypeSeleccionado = archivoFisico.type;
    
    if (txtNombre) txtNombre.innerText = archivoFisico.name;
    if (btnSubir) btnSubir.style.display = "inline-block";

    if (archivoFisico.type.startsWith("image/")) {
        const lectorVistaPrevia = new FileReader();
        lectorVistaPrevia.onload = function (e) {
            if (previewImg) previewImg.src = e.target.result;
            if (previewContenedor) previewContenedor.style.display = "flex";
        };
        lectorVistaPrevia.readAsDataURL(archivoFisico);
    } else {
        if (previewContenedor) previewContenedor.style.display = "none";
    }

    const lectorBase64 = new FileReader();
    lectorBase64.onload = function (e) {
        drive_Base64DataSeleccionada = e.target.result.split(",")[1];
    };
    lectorBase64.readAsDataURL(archivoFisico);
}

// =========================================================================
// SECCIÓN 6: MOTOR DE EMISIÓN DE TRANSFERENCIA DE BYTES (POST ENGINE - FORM)
// Ubicación del bloque: PARTE INFERIOR DEL ARCHIVO CARPETAS.JS
// =========================================================================

// REQ 6 y 10: Despacha la carga física de bytes en formato URL plano inmune a bloqueos
function Secc6_Fun1_TransmitirBytesHaciaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

    // CORRECCIÓN DE PROTOCOLO: Empaquetamos los datos en formato URLSearchParams plano
    const parametrosFormulario = new URLSearchParams();
    parametrosFormulario.append("accion", tipoAccion);
    parametrosFormulario.append("destinoFolderId", drive_IdCarpetaActiva);
    parametrosFormulario.append("nombreArchivo", drive_NombreArchivoSeleccionado);
    parametrosFormulario.append("mimeType", drive_MimeTypeSeleccionado);
    parametrosFormulario.append("base64Data", drive_Base64DataSeleccionada);
    parametrosFormulario.append("fileIdOriginal", fileIdOriginal || "");

    fetch(CARPETAS_WEB_APP_URL, {
        method: "POST",
        body: parametrosFormulario,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(() => {
        // REQUERIMIENTO 6 y 10: Letrero de confirmación visual para la WebApp
        alert("Recuerda confirmar si el nuevo documento se ve en el WebApp \"Visita\".");
        Secc6_Fun2_RestablecerFormularioCarga();
        Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
    })
    .catch(err => {
        console.error(err);
        alert("Recuerda confirmar si el nuevo documento se ve en el WebApp \"Visita\".");
        Secc6_Fun2_RestablecerFormularioCarga();
        setTimeout(() => Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva), 1000);
    });
}

// FUNCIÓN 2: Restaura las cajas y limpia la memoria de la carga actual
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
// SECCIÓN 7: MOTOR DE EMISIÓN DE TRANSFERENCIA DE BYTES (POST ENGINE)
// =========================================================================

// REQ 6 y 10: Empaqueta los datos en JSON y despacha la carga física de bytes
function Secc6_Fun1_TransmitirBytesHaciaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

    let paqueteCarga = {
        accion: tipoAccion,
        destinoFolderId: drive_IdCarpetaActiva,
        nombreArchivo: drive_NombreArchivoSeleccionado,
        mimeType: drive_MimeTypeSeleccionado,
        // CORRECCIÓN DE TRANSMISIÓN: Envía estrictamente la cadena de bytes pura del índice 1
        base64Data: drive_Base64DataSeleccionada[1],
        fileIdOriginal: fileIdOriginal
    };

    fetch(CARPETAS_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(paqueteCarga)
    })
        .then(res => res.json())
        .then(data => {
            // REQUERIMIENTO 6 y 10: Letrero obligatorio de confirmación visual para la WebApp
            alert("Recuerda confirmar si el nuevo documento se ve en el WebApp \"Visita\".");
            Secc6_Fun2_RestablecerFormularioCarga();
            Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
        })
        .catch(err => {
            console.error(err);
            alert("Recuerda confirmar si el nuevo documento se ve en el WebApp \"Visita\".");
            Secc6_Fun2_RestablecerFormularioCarga();
            setTimeout(() => Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva), 1000);
        });
}

// Restaura los campos de la interfaz y limpia la memoria caché local
function Secc6_Fun2_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = false; btn.innerText = "🚀 Subir a Carpeta Activa"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
    if (document.getElementById("contenedorPrevisualizacionFoto")) {
        document.getElementById("contenedorPrevisualizacionFoto").style.display = "none";
    }
}

// REQ 7 y 11: Receptor secundario asíncrono para confirmaciones de scripts
window.recibirRespuestaAccionDrive = function (res) {
    alert(res.message || "Acción completada de forma correcta.");
    Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
};
// =========================================================================
// SECCIÓN 8 (FIJA): ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS (PURIFICADO)
// Ubicación del bloque: CIERRE TOTAL Y EXCLUSIVO DE CARPETAS.JS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    
    // REQ 1 y 2: Escucha interactiva que actualiza la ID activa al cambiar de subcarpeta
    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.addEventListener("change", (e) => {
            const idSeleccionada = e.target.value;
            drive_IdCarpetaActiva = idSeleccionada;
            
            const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
            if (tablaCuerpoDrive) {
                tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">⏳ Sincronizando archivos de la subcarpeta...</td></tr>`;
            }
            Secc3_Fun1_DispararCargaEstructuraNube(idSeleccionada);
        });
    }

    // REQ 3: Escucha nativa independiente de la caja de carga responsiva
    const inputArchivo = document.getElementById("archivoSubirDrive");
    if (inputArchivo) {
        inputArchivo.addEventListener("change", Secc5_Fun1_ProcesarSeleccionArchivoLocal);
    }

    // REQ 4: Escucha nativa del botón de subir que activa la validación redundante
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

    // REQ 3: Escucha nativa independiente para Crear Carpetas internas en caliente
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

    // Inicializador con micro-retraso para mitigar tráfico y dar prioridad a las Hojas
    setTimeout(() => {
        Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
    }, 1200);
});
