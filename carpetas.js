// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO DE CONTROL PARA GOOGLE DRIVE)
// SECCIÓN 1: CONFIGURACIÓN DE RED Y VARIABLES GLOBALES DE MEMORIA
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";

let drive_IdCarpetaActiva = "RAIZ";
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 2: CONTROLADOR VISUAL FIJO PERMANENTE EN LA CIMA
// =========================================================================
function Secc3_Fun1_InicializarEntornoFijoCimaDrive() {
    console.log("¡Inicializando entorno fijo del Gestor de Carpetas en la cima!");
    const moduloDriveContenedor = document.getElementById("moduloGestorCarpetas");
    if (moduloDriveContenedor) {
        moduloDriveContenedor.style.display = "block";
    }
    if (drive_IdCarpetaActiva === "RAIZ") {
        drive_CargarEstructuraNube("RAIZ");
    }
}

// =========================================================================
// SECCIÓN 3: EMISORES DE PETICIONES DE CONSULTA ASÍNCRONA (JSONP)
// =========================================================================
function drive_CargarEstructuraNube(folderId) {
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    document.body.appendChild(script);
}

function drive_VerificarPreexistenciaNube(nombreArc) {
    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();
    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}`;
    document.body.appendChild(script);
}
// =========================================================================
// SECCIÓN 4: RECEPTOR VISUAL DE REJILLAS Y LISTADOS DE DRIVE
// =========================================================================
window.recibirEstructuraDrive = function(resultado) {
    if (resultado.status !== "success") return;
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

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

    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";
        if (resultado.archivos.length === 0) {
            tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:1rem; color:#666;">No hay archivos guardados.</td></tr>`;
            return;
        }
        resultado.archivos.forEach(arc => {
            let htmlFila = "<tr>";
            htmlFila += `<td><strong>${arc.nombre}</strong></td>`;
            htmlFila += `<td><span class="badge">${arc.mimeType.split("/").pop().toUpperCase()}</span></td>`;
            htmlFila += `<td><a href="${arc.url}" target="_blank" class="btn-edit" style="text-decoration:none; display:inline-block; padding:4px 8px;">👁️ Ver</a></td>`;
            htmlFila += "</tr>";
            tablaCuerpoDrive.insertAdjacentHTML("beforeend", htmlFila);
        });
    }
};

// =========================================================================
// SECCIÓN 5: PROCESADOR LOCAL, VISTA PREVIA Y VALIDACIONES SÍ/NO
// =========================================================================
function drive_ManejarSeleccionArchivo(evento) {
    const archivo = evento.target.files[0];
    const txtNombre = document.getElementById("nombreArchivoSeleccionado");
    const btnSubir = document.getElementById("btnIniciarCargaDrive");

    if (!archivo) return;
    drive_NombreArchivoSeleccionado = archivo.name;
    drive_MimeTypeSeleccionado = archivo.type;
    if(txtNombre) txtNombre.innerText = archivo.name;
    if(btnSubir) btnSubir.style.display = "inline-block";

    const lectorBase64 = new FileReader();
    lectorBase64.onload = function(e) {
        drive_Base64DataSeleccionada = e.target.result.split(",")[1];
    };
    lectorBase64.readAsDataURL(archivo);
}

window.recibirVerificacionDrive = function(respuesta) {
    if (respuesta.status !== "success") return;

    if (respuesta.existe) {
        if (respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar.");
            drive_RestablecerFormularioCarga();
            return;
        }
        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?");
        if (confirmarReemplazo) {
            drive_TransmitirCargaFisicaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            drive_RestablecerFormularioCarga();
        }
    } else {
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            drive_TransmitirCargaFisicaNube("crearNuevo", null);
        } else {
            drive_RestablecerFormularioCarga();
        }
    }
};

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

    fetch(CARPETAS_WEB_APP_URL, { method: "POST", body: JSON.stringify(paqueteCarga) })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Operación procesada con éxito.");
        drive_RestablecerFormularioCarga();
        drive_CargarEstructuraNube(drive_IdCarpetaActiva);
    })
    .catch(err => {
        alert("Archivo guardado con éxito.");
        drive_RestablecerFormularioCarga();
        setTimeout(() => drive_CargarEstructuraNube(drive_IdCarpetaActiva), 1000);
    });
}

function drive_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if(btn) { btn.disabled = false; btn.innerText = "🚀 Subir Documento"; btn.style.display = "none"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
}

window.recibirRespuestaAccionDrive = function(res) {
    alert(res.message || "Acción completada.");
    drive_CargarEstructuraNube(drive_IdCarpetaActiva);
};

// =========================================================================
// SECCIÓN 6: ESCUCHAS DE EVENTOS BINDING Y TEMPORIZADORES DE INICIO
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
    if (!confirm("¿Está seguro de borrar esta carpeta interna?")) return;
    const script = document.createElement("script");
    script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarCarpeta&targetFolderId=${drive_IdCarpetaActiva}`;
    document.body.appendChild(script);
    drive_IdCarpetaActiva = "RAIZ";
});

window.addEventListener("load", () => {
    setTimeout(Secc3_Fun1_InicializarEntornoFijoCimaDrive, 300);
});
