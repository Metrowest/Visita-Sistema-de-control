// =========================================================================
// ARCHIVO: carpetas.js (MOTOR DINÁMICO EXCLUSIVO DE CONTROL PARA DRIVE)
// INTERFAZ: Modular, independiente y blindada contra corrupción
// =========================================================================

// =========================================================================
// SECCIÓN 1: CONFIGURACIÓN DE URL DEL SERVIDOR SEPARADO (CARPETAS.JS)
// =========================================================================
// Reemplaza estrictamente el texto de abajo por la URL que copiaste en el Paso 10
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbytVw039ontALGm4pqlbaZoNkHPTAaHgExZjSdBHd6LIEiWCq-IKwaOiiQOvj5WygOp/exec";

// Variables globales de memoria interna aislada
let drive_IdCarpetaActiva = "RAIZ";
let drive_ArchivoSeleccionadoObjeto = null;
let drive_NombreArchivoSeleccionado = "";
let drive_MimeTypeSeleccionado = "";
let drive_Base64DataSeleccionada = "";

// =========================================================================
// SECCIÓN 2: CONTROLADOR DE CONMUTACIÓN DE ENTORNOS VISUALES RESPONSIVOS
// =========================================================================
function Secc824_ControladorVisualDrive() {
    const selector = document.getElementById("selectorHoja");
    if (!selector) return;

    const hojaSeleccionada = selector.value;

    // Capturamos los bloques de Hojas y Drive para alternar su energía visual
    const moduloHojasFormulario = document.getElementById("formularioSuperintendentes") ? document.getElementById("formularioSuperintendentes").parentElement : null;
    const moduloHojasTablaVisual = document.getElementById("tablaRegistros") ? document.getElementById("tablaRegistros").parentElement.parentElement : null;
    const moduloDriveContenedor = document.getElementById("moduloGestorCarpetas");

    if (hojaSeleccionada === "Gestor_Carpetas") {
        console.log("¡Activando entorno aislado responsivo para el Gestor de Carpetas!");

        // Apagamos por completo las tarjetas de las Hojas de Cálculo
        if (moduloHojasFormulario) moduloHojasFormulario.style.display = "none";
        if (moduloHojasTablaVisual) moduloHojasTablaVisual.style.display = "none";

        // Encendemos el nuevo módulo de Drive
        if (moduloDriveContenedor) moduloDriveContenedor.style.display = "block";

        // Si es la primera vez que se abre, disparamos la lectura a Drive
        if (drive_IdCarpetaActiva === "RAIZ") {
            drive_CargarEstructuraNube("RAIZ");
        }
    } else {
        // Restauración automática si el usuario regresa a Superintendentes o Estudios
        if (moduloDriveContenedor) moduloDriveContenedor.style.display = "none";
        if (moduloHojasFormulario) moduloHojasFormulario.style.display = "block";
        if (moduloHojasTablaVisual) moduloHojasTablaVisual.style.display = "block";
    }
}

// =========================================================================
// SECCIÓN 3: EMISOR DE PETICIONES DE CONSULTA ASÍNCRONA (JSONP DRIVER)
// =========================================================================
function drive_CargarEstructuraNube(folderId) {
    console.log("Consultando subcarpetas y archivos a Drive para el ID: " + folderId);

    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    document.body.appendChild(script);
}

function drive_VerificarPreexistenciaNube(nombreArc) {
    console.log("Verificando duplicados en la carpeta activa para: " + nombreArc);

    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 4: RECEPTOR Y DECODIFICADOR DE MATRICES DE DRIVE (READ ENGINE)
// =========================================================================
window.recibirEstructuraDrive = function (resultado) {
    console.log("Datos de estructura Drive recibidos:", resultado);
    if (resultado.status !== "success") return;

    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    // REQUERIMIENTO 1: Llenamos e inyectamos la lista desplegable de carpetas
    const selectorSub = document.getElementById("selectorSubcarpetas");
    if (selectorSub) {
        selectorSub.innerHTML = "";

        // Dejamos la opción base de la carpeta actual fija arriba
        let optRaiz = document.createElement("option");
        optRaiz.value = resultado.idCarpetaActual;
        optRaiz.innerText = "📁 " + resultado.nombreCarpetaActual + " (Carpeta Activa)";
        selectorSub.appendChild(optRaiz);

        // Agregamos las subcarpetas de forma consecutiva
        resultado.carpetas.forEach(sub => {
            let opt = document.createElement("option");
            opt.value = sub.id;
            opt.innerText = "📁 → " + sub.nombre;
            selectorSub.appendChild(opt);
        });
    }

    // REQUERIMIENTO 2: Llenamos la tabla responsiva con los archivos disponibles
    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";

        if (resultado.archivos.length === 0) {
            tablaCuerpoDrive.innerHTML = `<tr><td colspan="3" class="celda-carga">No hay archivos guardados en esta carpeta interna.</td></tr>`;
            return;
        }

        resultado.archivos.forEach(arc => {
            let htmlFila = "<tr>";
            htmlFila += `<td><strong>${arc.nombre}</strong></td>`;
            htmlFila += `<td><span class="badge-formato">${arc.mimeType.split("/")[1].toUpperCase()}</span></td>`;
            htmlFila += `<td><a href="${arc.url}" target="_blank" class="btn-edit" style="text-decoration:none; display:inline-block; text-align:center;">👁️ Ver</a></td>`;
            htmlFila += "</tr>";
            tablaCuerpoDrive.insertAdjacentHTML("beforeend", htmlFila);
        });
    }
};
// =========================================================================
// SECCIÓN 5: PROCESADOR DE ARCHIVOS LOCALES Y CONVERSOR BASE64
// =========================================================================
function drive_ManejarSeleccionArchivo(evento) {
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

    // RESPONSIVE PARA FOTOS: Si el documento es una imagen, encendemos la vista previa fluida
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

    // Convertimos el documento completo a ráfaga Base64 para poder enviarlo por internet
    const lectorBase64 = new FileReader();
    lectorBase64.onload = function (e) {
        drive_Base64DataSeleccionada = e.target.result.split(",")[1];
    };
    lectorBase64.readAsDataURL(archivo);
}

// =========================================================================
// SECCIÓN 6: INTERCEPTOR EVALUADOR DE DECISIONES INTERACTIVAS SÍ/NO
// =========================================================================
window.recibirVerificacionDrive = function (respuesta) {
    console.log("Respuesta de preexistencia recibida:", respuesta);
    if (respuesta.status !== "success") return;

    // REQUERIMIENTO 4 y 5: Si el documento ya existe, disparamos la ventana interactiva de reemplazo
    if (respuesta.existe) {
        // REQUERIMIENTO 8: Alerta de validación de formato idéntico antes de proceder
        if (respuesta.mimeTypeOriginal !== drive_MimeTypeSeleccionado) {
            alert("No es el mismo formato, no se puede actualizar."); // REQUERIMIENTO 8
            drive_RestablecerFormularioCarga();
            return;
        }

        let confirmarReemplazo = confirm("¿Estás seguro de que quieres reemplazar el documento?"); // REQUERIMIENTO 5
        if (confirmarReemplazo) {
            // REQUERIMIENTO 6: Si decide "Sí", ejecuta la sobreescritura preservando el ID original
            drive_TransmitirCargaFisicaNube("actualizarExistente", respuesta.fileIdOriginal);
        } else {
            // REQUERIMIENTO 7: Si presiona "No", la función no subirá nada
            drive_RestablecerFormularioCarga();
        }
    } else {
        // REQUERIMIENTO 9: Si es un documento completamente nuevo, dispara su ventana interactiva
        let confirmarNuevo = confirm("Este es un documento que no está en la carpeta, debes confirmar si quieres subirlo");
        if (confirmarNuevo) {
            // REQUERIMIENTO 10: Si presiona "Sí", se crea de forma limpia en la carpeta activa
            drive_TransmitirCargaFisicaNube("crearNuevo", null);
        } else {
            // REQUERIMIENTO 11: Si presiona "No", la función aborta la carga
            drive_RestablecerFormularioCarga();
        }
    }
};
// =========================================================================
// SECCIÓN 7: EMISOR VELOZ DE TRANSFERENCIA DE BYTES (POST ENGINE)
// =========================================================================
function drive_TransmitirCargaFisicaNube(tipoAccion, fileIdOriginal) {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = true; btn.innerText = "Subiendo bytes..."; }
    let paqueteCarga = {
        accion: tipoAccion,
        destinoFolderId: drive_IdCarpetaActiva,
        nombreArchivo: drive_NombreArchivoSeleccionado,
        mimeType: drive_MimeTypeSeleccionado,
        base64Data: drive_Base64DataSeleccionada,
        fileIdOriginal: fileIdOriginal
    };
    // Despachamos la ráfaga de bytes mediante protocolo POST seguro hacia la Web App
    fetch(CARPETAS_WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(paqueteCarga)
    })
        .then(res => res.json())
        .then(data => {
            // REQUERIMIENTO 6 y 10: Lanzamos el letrero de confirmación exitoso solicitado
            alert(data.message || "Operación procesada.");
            drive_RestablecerFormularioCarga();
            drive_CargarEstructuraNube(drive_IdCarpetaActiva); // Refrescamos el visor de archivos al instante
        })
        .catch(err => {
            console.error("Error en la transmisión de bytes:", err);
            alert("Fallo al subir el archivo.");
            drive_RestablecerFormularioCarga();
        });
}
function drive_RestablecerFormularioCarga() {
    const btn = document.getElementById("btnIniciarCargaDrive");
    if (btn) { btn.disabled = false; btn.innerText = "🚀 Subir a Carpeta Activa"; btn.style.display = "none"; }
    document.getElementById("archivoSubirDrive").value = "";
    document.getElementById("nombreArchivoSeleccionado").innerText = "Ningún archivo seleccionado";
    document.getElementById("contenedorPrevisualizacionFoto").style.display = "none";
}
// =========================================================================
// SECCIÓN 8: ESCUCHAS DE EVENTOS CONTROLADAS DE ALTA SENSIBILIDAD (CARPETAS.JS)
// Ubicación del bloque: FINAL ABSOLUTO DE TU ARCHIVO CARPETAS.JS SEPARADO
// =========================================================================

// Escucha el menú desplegable de forma nativa e inmediata
document.getElementById("selectorHoja").addEventListener("change", () => {
    console.log("Menú desplegable movido, ejecutando controlador de carpetas...");
    Secc824_ControladorVisualDrive();
});

// Escucha el selector de carpetas internas de Drive para navegar de forma infinita
document.getElementById("selectorSubcarpetas").addEventListener("change", (e) => {
    drive_IdCarpetaActiva = e.target.value;
    drive_CargarEstructuraNube(e.target.value);
});

// Escucha el input file responsivo cuando se selecciona un documento o foto
document.getElementById("archivoSubirDrive").addEventListener("change", drive_ManejarSeleccionArchivo);

// Escucha el botón para iniciar el proceso de verificación y subida
document.getElementById("btnIniciarCargaDrive").addEventListener("click", () => {
    if (!drive_NombreArchivoSeleccionado) return;
    drive_VerificarPreexistenciaNube(drive_NombreArchivoSeleccionado);
});

// Inicializador forzado de doble ráfaga para asegurar el arranque limpio
window.addEventListener("load", () => {
    setTimeout(Secc824_ControladorVisualDrive, 100);
    setTimeout(Secc824_ControladorVisualDrive, 300);
});

