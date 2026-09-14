// =========================================================================
// CARPETAS.JS - PARTE 1: CAPA DE CONFIGURACIÓN Y VARIABLES OPERATIVAS
// =========================================================================
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
let drive_ArchivoSeleccionadoBinario = null;
let drive_NombreArchivoSeleccionado = "";

// =========================================================================
// SECCIÓN 1: INICIALIZACIÓN AUTÓNOMA DEL SUBSISTEMA DRIVE
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("¡Despertando motor de Drive de forma autónoma y segura!");
    drive_CargarEstructuraNube(drive_IdCarpetaActiva);
});

// =========================================================================
// SECCIÓN 2: MANEJADORES DE SELECCIÓN LOCAL DE MULTIMEDIA
// =========================================================================
function drive_ManejarSeleccionArchivo(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    drive_ArchivoSeleccionadoBinario = archivo;
    drive_NombreArchivoSeleccionado = archivo.name;
    console.log(`Archivo preparado localmente: ${archivo.name}`);
}

function drive_RestablecerFormularioCarga() {
    drive_ArchivoSeleccionadoBinario = null;
    drive_NombreArchivoSeleccionado = "";
    const inputF = document.getElementById("archivoSubirDrive");
    if (inputF) inputF.value = "";
}

// =========================================================================
// SECCIÓN 3: EMISORES DE PETICIONES DE CONSULTA (JSONP MOTORS)
// =========================================================================
function drive_CargarEstructuraNube(folderId) {
    console.log(`Petición de estructura para la carpeta ID: ${folderId}`);
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    script.charset = "utf-8";
    document.body.appendChild(script);
}

function drive_VerificarPreexistenciaNube(nombreArc) {
    const scriptViejo = document.getElementById("script-drive-verificar");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-verificar";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=verificarArchivo&nombreArchivo=${encodeURIComponent(nombreArc)}&destinoFolderId=${encodeURIComponent(drive_IdCarpetaActiva)}`;
    script.charset = "utf-8";
    document.body.appendChild(script);
}
// =========================================================================
// CARPETAS.JS - PARTE 2: RECEPTOR COMPATIBLE GOOGLE Y ESCUCHAS DE EVENTOS
// =========================================================================

// SECCIÓN 4 (CONFIGURACIÓN DINÁMICA): RECEPTOR VISUAL DE REJILLAS DRIVE
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

    // CORREGIDO: Cierre sintáctico perfecto del forEach para evitar SyntaxError
    if (resultado.carpetas && resultado.carpetas.length > 0) {
        resultado.carpetas.forEach(sub => {
            if (selectorSub) {
                let opt = document.createElement("option");
                opt.value = sub.id;
                opt.innerText = "📁 → " + sub.nombre;
                selectorSub.appendChild(opt);
            }
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
            }
        });
        if (selectorSub) selectorSub.value = drive_IdCarpetaActiva;
    } else if (listaSubcarpetas) {
        listaSubcarpetas.innerHTML = '<li style="font-size:0.8rem; color:#94a3b8; padding:4px 12px;">Sin subcarpetas</li>';
    }

    const btnBorrar = document.getElementById("btnBorrarCarpetaDrive");
    if (btnBorrar) btnBorrar.style.display = (resultado.nombreCarpetaActual === "Visita Actual") ? "none" : "inline-block";

    // 2. Renderizado dinámico de archivos en la tabla del Cubículo 2 (Módulo de Control)
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
// SECCIÓN 7 (FIJA): ESCUCHAS DE EVENTOS BINDING AUTOMÁTICOS PROTEGIDOS
// =========================================================================
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

const archivoSubirDrive = document.getElementById("archivoSubirDrive");
if (archivoSubirDrive) {
    archivoSubirDrive.addEventListener("change", drive_ManejarSeleccionArchivo);
}

const btnIniciarCargaDrive = document.getElementById("btnIniciarCargaDrive");
if (btnIniciarCargaDrive) {
    btnIniciarCargaDrive.addEventListener("click", () => {
        if (typeof drive_NombreArchivoSeleccionado !== 'undefined' && drive_NombreArchivoSeleccionado) {
            drive_VerificarPreexistenciaNube(drive_NombreArchivoSeleccionado);
        } else {
            console.log("No hay archivo preparado.");
        }
    });
}

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

const btnBorrarCarpetaDrive = document.getElementById("btnBorrarCarpetaDrive");
if (btnBorrarCarpetaDrive) {
    btnBorrarCarpetaDrive.addEventListener("click", () => {
        if (!confirm("¿Está seguro de borrar esta carpeta?")) return;
        const script = document.createElement("script");
        script.src = `${CARPETAS_WEB_APP_URL}?accion=borrarCarpeta&targetFolderId=${drive_IdCarpetaActiva}`;
        document.body.appendChild(script);
        drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
    });
}
