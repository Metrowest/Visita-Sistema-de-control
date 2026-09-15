// =========================================================================
// ARCHIVO PARALELO: laboratorio.js (ENTORNO DE PRUEBAS - PARTE 1)
// REQUISITOS INTEGRADOS: CUMPLIMIENTO ESTRICTO DE LAS EMISIONES 1 A 11
// =========================================================================

// URL del nuevo Apps Script "Laboratorio_Pruebas_Reemplazo" que creaste desde cero
const CARPETAS_WEB_APP_URL = "https://google.com";

// Variables globales de control en memoria aislada
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM"; // Carpeta raíz
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// MOTORES DE EMISIÓN DE RED (JSONP ENGINES)
// =========================================================================

// REQ 1 y 2: Lanza la petición script para consultar la estructura de carpetas
function Secc3_Fun1_DispararCargaEstructuraNube(folderId) {
    const viejo = document.getElementById("script-drive-carga");
    if (viejo) viejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}&prefix=recibirEstructuraDrive`;
    document.body.appendChild(script);
}

// REQ 4: Envía el nombre del archivo a Google para validar duplicados
function Secc3_Fun2_DispararVerificacionPreexistenciaNube(nombreArc) {
    const viejo = document.getElementById("script-drive-verificar");
    if (viejo) viejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}&prefix=recibirVerificacionDrive`;
    document.body.appendChild(script);
}

// =========================================================================
// RECEPTORES DE RESPUESTAS ASÍNCRONAS (REJILLAS NATIVAS)
// =========================================================================

// REQ 1 y 2: Procesa la estructura e inyecta las opciones en el visor visual
window.recibirEstructuraDrive = function (resultado) {
    if (!resultado || resultado.status !== "success") return;
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";
        
        let optRaiz = document.createElement("option");
        optRaiz.value = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
        optRaiz.innerText = "⬅️ Regresar a la Raíz (Visita Actual)";
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
// RECEPTORES DE VERIFICACIÓN Y DIÁLOGOS SÍ/NO
// =========================================================================

// REQ 4 al 11: Atrapa el duplicado y gestiona las ventanas interactiva
window.recibirVerificacionDrive = function (respuesta) {
    if (!respuesta || respuesta.status !== "success") return;

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

    if (respuesta.existe === true || seMuestraEnPantalla === true) {
        // REQUISITO 8: Validación estricta de formato idéntico
        if (respuesta.mimeTypeOriginal && respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            Secc6_Fun2_RestablecerFormularioCarga();
            return;
        }

        // REQUISITO 5: Ventana interactiva de confirmación de reemplazo
        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    } 
    else {
        // REQUISITO 9: Ventana interactiva para documento completamente nuevo
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            Secc6_Fun1_TransmitirBytesHaciaNube("crearNuevo", null);
        } else {
            Secc6_Fun2_RestablecerFormularioCarga();
        }
    }
};

// =========================================================================
// INTERCEPCIÓN DE ARCHIVOS LOCALES Y CONVERSIÓN
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
        drive_Base64DataSeleccionada = e.target.result;
    };
    lectorBase64.readAsDataURL(archivoFisico);
}

// =========================================================================
// TRANSMISOR FINAL (POST) EN FORMATO PLANO TEXTO COMPATIBLE
// =========================================================================

function Secc6_Fun1_TransmitirBytesHaciaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo archivo..."; }

    const base64Limpia = drive_Base64DataSeleccionada.indexOf(",") > -1 ? drive_Base64DataSeleccionada.split(",")[1] : drive_Base64DataSeleccionada;

    const parametrosFormulario = new URLSearchParams();
    parametrosFormulario.append("accion", tipoAccion);
    parametrosFormulario.append("destinoFolderId", drive_IdCarpetaActiva);
    parametrosFormulario.append("nombreArchivo", drive_NombreArchivoSeleccionado);
    parametrosFormulario.append("mimeType", drive_MimeTypeSeleccionado);
    parametrosFormulario.append("base64Data", base64Limpia);
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
// ESCUCHAS DE EVENTOS AUTOMÁTICOS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
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

    const inputArchivo = document.getElementById("archivoSubirDrive");
    if (inputArchivo) {
        inputArchivo.addEventListener("change", Secc5_Fun1_ProcesarSeleccionArchivoLocal);
    }

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

    setTimeout(() => {
        Secc3_Fun1_DispararCargaEstructuraNube(drive_IdCarpetaActiva);
    }, 1000);
});
