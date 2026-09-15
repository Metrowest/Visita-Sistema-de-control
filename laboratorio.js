// =========================================================================
// ARCHIVO PARALELO: laboratorio.js (ENTORNO DE PRUEBAS - PARTE 1 REAL)
// REQUISITOS INTEGRADOS: CUMPLIMIENTO ESTRICTO DE LAS EMISIONES 1 A 11
// =========================================================================

// =========================================================================
// SECCIÓN 1: ENLACE DE RED WEB APP EXCLUSIVO DEL LABORATORIO DE DRIVE
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyTjFd6E3bbZvfdK0ltV85SFqLHukNOQsKBhxB5HXtj2GBa3SegPSaMl2eOmyccCnK7CQ/exec";

// =========================================================================
// SECCIÓN 2: VARIABLES DE MEMORIA INTERNA AISLADA DEL LABORATORIO
// =========================================================================
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM"; // Carpeta raíz
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 3: EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS CALLBACK API)
// =========================================================================

// REQ 1 y 2: Lanza la petición script sincronizada con la macro de Google
function Secc3_Fun1_DispararCargaEstructuraNube(folderId) {
    const viejo = document.getElementById("script-drive-carga");
    if (viejo) viejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}&callback=recibirEstructuraDrive`;
    document.body.appendChild(script);
}

// REQ 4: Envía el nombre del archivo para validar duplicados usando el callback correcto
function Secc3_Fun2_DispararVerificacionPreexistenciaNube(nombreArc) {
    const viejo = document.getElementById("script-drive-verificar");
    if (viejo) viejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}&callback=recibirVerificacionDrive`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 4: RECEPTORES VISUALES DE RESPUESTAS ASÍNCRONAS (CORREGIDO)
// Ubicación del bloque: PARTE SUPERIOR MEDIA DE LABORATORIO.JS
// =========================================================================
window.recibirEstructuraDrive = function (resultado) {
    if (!resultado || resultado.status !== "success") return;
    
    // Sincronizamos la memoria global con el ID real devuelto por el servidor
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";
        
        // REQUISITO 1 y 2 CORREGIDO: La opción inicial se acopla a la ubicación activa actual
        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Ubicación Activa)";
        selectorSub.appendChild(optRaiz);

        // Si estamos metidos en una subcarpeta profunda, inyectamos la vía de escape estricta
        if (resultado.idCarpetaActual !== "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM") {
            let optEscape = document.createElement("option");
            optEscape.value = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
            optEscape.innerText = "⬅️ Regresar a la Raíz (Visita Actual)";
            selectorSub.appendChild(optEscape);
        }

        // Mapeamos e inyectamos las carpetas hijas disponibles en el nivel actual
        if (resultado.carpetas && resultado.carpetas.length > 0) {
            resultado.carpetas.forEach(sub => {
                let opt = document.createElement("option");
                opt.value = sub.id;
                opt.innerText = "📁 → " + sub.nombre;
                selectorSub.appendChild(opt);
            });
        }
        
        // Forzamos al selector a retener visualmente el identificador activo sin resetearse
        selectorSub.value = drive_IdCarpetaActiva;
    }

    // REQUISITO 2: Renderiza las filas físicas de archivos detectados en la tabla responsiva
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
            htmlFila += `<td><a href="${arc.url}" target="_blank" class="btn-primario" style="text-decoration:none; display:inline-block; padding:4px 10px; font-size:0.75rem !important;">👁️ Ver</a></td>`;
            htmlFila += "</tr>";
            tablaCuerpoDrive.insertAdjacentHTML("beforeend", htmlFila);
        });
    }
};

// =========================================================================
// SECCIÓN 5: INTERCEPTOR EVALUADOR DE PREEXISTENCIA Y DIÁLOGOS SÍ/NO
// =========================================================================

// REQ 4 al 11: Atrapa la respuesta de duplicados de Google y gestiona las alertas
window.recibirVerificacionDrive = function (respuesta) {
    if (!respuesta || respuesta.status !== "success") return;

    // VALIDACIÓN VISUAL LOCAL EN PANTALLA: Inspecciona las filas impresas en el visor
    let seMuestraEnPantalla = false;
    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        const filas = tablaCuerpoDrive.getElementsByTagName("tr");
        for (let i = 0; i < filas.length; i++) {
            if (filas[i].innerText.includes(drive_NombreArchivoSeleccionado)) {
                seMuestraEnPantalla = true;
                break;
            }
        }
    }

    // EVALUACIÓN CONDICIONAL DE DUPLICADOS (SITUACIÓN DE REEMPLAZO)
    if (respuesta.existe === true || seMuestraEnPantalla === true) {
        // REQUISITO 8: Validación estricta de formato idéntico en carga
        if (respuesta.mimeTypeOriginal && respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            Secc6_Fun2_RestablecerFormularioCarga();
            return;
        }

        // REQUISITO 5: Ventana interactiva de confirmación de reemplazo (Aceptar o Cancelar)
        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            // REQUISITO 6: Si decide "Sí", ejecuta la sobreescritura manteniendo el ID original
            Secc6_Fun1_TransmitirBytesHaciaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            // REQUISITO 7: Bloqueo de reemplazo por selección "No"
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    } 
    // EVALUACIÓN CONDICIONAL DE ARCHIVO NUEVO
    else {
        // REQUISITO 9: Ventana interactiva para documento completamente nuevo
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            // REQUISITO 10: Carga de documento nuevo y alerta de éxito en la nube
            Secc6_Fun1_TransmitirBytesHaciaNube("crearNuevo", null);
        } else {
            // REQUISITO 11: Bloqueo de documento nuevo por selección "No"
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    }
};

// =========================================================================
// SECCIÓN 6: INTERCEPCIÓN DE ARCHIVOS LOCALES (VISTA PREVIA Y MEMORIA)
// =========================================================================

// REQUISITO 3: Procesa el documento seleccionado y lo aisla en memoria local
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
        // Almacenamos los datos de texto base64 limpios
        drive_Base64DataSeleccionada = e.target.result;
    };
    lectorBase64.readAsDataURL(archivoFisico);
}

// =========================================================================
// SECCIÓN 7: TRANSMISOR DE BYTES BINARIOS (URL PLANO COMPATIBLE)
// =========================================================================

// REQ 6 y 10 RECTIFICADO: Aísla la cadena pura de bytes (Índice 1) antes de compactar y transmitir
function Secc6_Fun1_TransmitirBytesHaciaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

    // Saneamiento de datos: extraemos estrictamente los bytes puros después de la coma (Índice 1)
    const cadenaRaw = drive_Base64DataSeleccionada.toString();
    const base64Pura = cadenaRaw.indexOf(",") > -1 ? cadenaRaw.split(",")[1] : cadenaRaw;

    // Compactación final redundante de seguridad en texto plano puro
    const base64Compacta = Array.isArray(base64Pura) ? base64Pura.join("") : base64Pura;

    const parametrosFormulario = new URLSearchParams();
    parametrosFormulario.append("accion", tipoAccion);
    parametrosFormulario.append("destinoFolderId", drive_IdCarpetaActiva);
    parametrosFormulario.append("nombreArchivo", drive_NombreArchivoSeleccionado);
    parametrosFormulario.append("mimeType", drive_MimeTypeSeleccionado);
    parametrosFormulario.append("base64Data", base64Compacta);
    parametrosFormulario.append("fileIdOriginal", fileIdOriginal || "");

    fetch(CARPETAS_WEB_APP_URL, {
        method: "POST",
        body: parametrosFormulario,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
    .then(() => {
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

// Función encargada de limpiar las cajas de texto y restablecer el formulario local
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
// SECCIÓN 8: ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    
    // REQ 1 y 2: Escucha interactiva propia para el cambio de subcarpetas en caliente
    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.addEventListener("change", (e) => {
            drive_IdCarpetaActiva = e.target.value;
            const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
            if (tablaCuerpoDrive) {
                tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">⏳ Sincronizando archivos...</td></tr>`;
            }
            Secc3_Fun1_DispararCargaEstructuraNube(e.target.value);
        });
    }

    // REQ 3: Escucha interactiva para capturar el documento local al seleccionarlo
    const inputArchivo = document.getElementById("archivoSubirDrive");
    if (inputArchivo) {
        inputArchivo.addEventListener("change", Secc5_Fun1_ProcesarSeleccionArchivoLocal);
    }

    // REQ 4: Escucha interactiva para detonar el validador al presionar el botón
    const btnCarga = document.getElementById("btnIniciarCargaDrive");
    if (btnCarga) {
        btnCarga.addEventListener("click", () => {
            if (!drive_NombreArchivoSeleccionado) {
                alert("Por favor, selecciona un documento primero.");
                return;
            }
            Secc3_Fun2_DispararVerificacionPreexistenciaNube(drive_NombreArchivoSeleccionado);
        });
    }

    // Inicializador con retardo técnico de 1 segundo para garantizar arranque limpio
    setTimeout(() => {
        Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
    }, 1000);
});
