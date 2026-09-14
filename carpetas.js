// =========================================================================
// CARPETAS.JS - SUBSISTEMA DE GESTIÓN INDEPENDIENTE PARA GOOGLE DRIVE
// Ubicación del bloque: CUMBRE ABSOLUTA Y CONFIGURACIÓN BASE
// =========================================================================

// Enlace exclusivo hacia la implementación del Apps Script de las carpetas
const CARPETAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxH1groi2vzSvUe4-BSqoLZj0S6h3UewJQHie_iOUhsLVCIdBKqzHWOu4nVGqHkqT1L7g/exec";

// Variables globales de control para la navegación profunda en la nube
let drive_IdCarpetaActiva = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
let drive_ArchivoSeleccionadoBinario = null;
let drive_NombreArchivoSeleccionado = "";

// =========================================================================
// SECCIÓN 1: INICIALIZACIÓN AUTÓNOMA REGULADA (PROTECCIÓN DE TRÁFICO MÁXIMA)
// Ubicación del bloque: CUMBRE DE CARPETAS.JS - AISLAMIENTO DE CONFLICTOS
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dando prioridad absoluta a la base de datos de las Hojas...");
    
    // Retrasamos la salida de Drive 1.2 segundos para evitar la colisión MIME y corrupción de red
    setTimeout(() => {
        console.log("¡Canal libre detectado! Despertando subcarpeta raíz de Drive de forma segura.");
        drive_CargarEstructuraNube(drive_IdCarpetaActiva);
    }, 1200);
});

// =========================================================================
// SECCIÓN 2: MOTORES EMISORES DE PETICIONES (JSONP ENGINE - RECTIFICADO)
// Ubicación del bloque: PARTE MEDIA DEL ARCHIVO CARPETAS.JS
// =========================================================================
function drive_CargarEstructuraNube(folderId) {
    console.log(`Petición de estructura para la carpeta ID: ${folderId}`);
    
    // Eliminación de scripts huérfanos anteriores para liberar memoria de red
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-carga";
    
    // CORRECCIÓN DE PROTOCOLO: Reemplaza callback por prefix para sincronizar con la salida de tu macro
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}&prefix=recibirEstructuraDrive`;
    script.charset = "utf-8";

    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 3: RECEPTOR VISUAL INTEGRADO Y COMPATIBLE CON GOOGLE DRIVE API (REPARADO)
// Ubicación del bloque: MITAD INFERIOR DEL ARCHIVO CARPETAS.JS
// =========================================================================
function recibirEstructuraDrive(resultado) {
    console.log("¡Datos de Drive interceptados en el receptor físico!", resultado);
    if (!resultado || resultado.status !== "success") return;
    
    // Sincronizamos la memoria activa con el directorio devuelto por Google
    drive_IdCarpetaActiva = resultado.idCarpetaActual;

    const selectorSub = document.getElementById("selectorSubcarpetas");
    const tablaCuerpoDrive = document.getElementById("tablaCuerpoDrive");

    // 1. RECONSTRUCCIÓN HORIZONTAL DE LA LISTA DESPLEGABLE DE CARPETAS
    if (selectorSub) {
        selectorSub.innerHTML = "";
        
        // Opción de retorno obligatoria
        let optRegresar = document.createElement("option");
        optRegresar.value = "RETORNO_RAIZ"; 
        optRegresar.innerText = "⬅️ Regresar a la Raíz (Visita Actual)";
        selectorSub.appendChild(optRegresar);

        if (resultado.nombreCarpetaActual && resultado.nombreCarpetaActual !== "Visita Actual") {
            let optUbicacion = document.createElement("option");
            optUbicacion.value = resultado.idCarpetaActual;
            optUbicacion.innerText = `📁 ${resultado.nombreCarpetaActual} (Ubicación Activa)`;
            selectorSub.appendChild(optUbicacion);
        }

        if (resultado.carpetas && resultado.carpetas.length > 0) {
            resultado.carpetas.forEach(sub => {
                let opt = document.createElement("option");
                opt.value = sub.id;
                opt.innerText = `📁 → ${sub.nombre}`;
                selectorSub.appendChild(opt);
            });
        }
        selectorSub.value = drive_IdCarpetaActiva;
    }

    // 2. RENDERIZADO FLUIDO DE ARCHIVOS EN TU TABLA ORIGINAL NATIVA
    if (tablaCuerpoDrive) {
        tablaCuerpoDrive.innerHTML = "";
        
        if (resultado.archivos && resultado.archivos.length > 0) {
            resultado.archivos.forEach(arc => {
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid var(--color-borde)";
                
                let icono = "📄";
                let nameL = arc.nombre.toLowerCase();
                if (nameL.includes(".pdf")) icono = "📕";
                if (nameL.includes(".xls") || nameL.includes(".csv") || nameL.includes(".xlsx")) icono = "📗";
                if (nameL.includes(".doc") || nameL.includes(".docx")) icono = "📘";

                let tipoTexto = "Archivo";
                if (arc.mimeType && arc.mimeType.includes("/")) {
                    tipoTexto = arc.mimeType.split("/")[1].toUpperCase();
                }

                tr.innerHTML = `
                    <td style="padding: 12px 14px; font-weight: 500;">${icono} ${arc.nombre}</td>
                    <td style="padding: 12px 14px; color: var(--color-texto-medio); font-size: 0.8rem;">${tipoTexto}</td>
                    <td style="padding: 12px 14px;">
                        <button type="button" class="btn-primario" style="padding: 4px 10px !important; font-size: 0.75rem !important;" onclick="window.open('${arc.urlDownload || arc.url}', '_blank')">Ver</button>
                    </td>
                `;
                tablaCuerpoDrive.appendChild(tr);
            });
        } else {
            tablaCuerpoDrive.innerHTML = '<tr><td colspan="3" style="padding:20px; text-align:center; color:var(--color-texto-medio);">No hay archivos disponibles en esta carpeta.</td></tr>';
        }
    }
}

// ENLACE GLOBAL INMEDIATO: Registra la función en la ventana antes de procesar el DOM
window.recibirEstructuraDrive = recibirEstructuraDrive;

// =========================================================================
// SECCIÓN 4: ESCUCHAS DE EVENTOS INTERACTIVOS (DRIVE BINDINGS)
// Ubicación del bloque: BASE ABSOLUTA DEL ARCHIVO CARPETAS.JS
// =========================================================================

// INTERCEPTOR BINARIO DE ARCHIVOS LOCALES (CORREGIDO)
function drive_ManejarSeleccionArchivo(evento) {
    const listaArchivos = evento.target.files;
    if (!listaArchivos || listaArchivos.length === 0) return;
    
    // CORRECCIÓN RECTIFICADA: Extrae y almacena el archivo exacto en el índice 0
    drive_ArchivoSeleccionadoBinario = listaArchivos[0];
    drive_NombreArchivoSeleccionado = listaArchivos[0].name;
    
    const textoNombre = document.getElementById("nombreArchivoSeleccionado");
    if (textoNombre) {
        textoNombre.innerText = `Preparado: ${listaArchivos[0].name}`;
    }
    console.log(`Archivo cargado localmente en memoria: ${listaArchivos[0].name}`);
}

// 2. Vinculación estricta de las escuchas al cargar el DOM de forma protegida
document.addEventListener("DOMContentLoaded", () => {
    
    // Escucha para la navegación profunda usando el selector de subcarpetas
    const selectorSubcarpetas = document.getElementById("selectorSubcarpetas");
    if (selectorSubcarpetas) {
        selectorSubcarpetas.addEventListener("change", (e) => {
            if (e.target.value === "RETORNO_RAIZ") {
                const idRaizOriginal = "1FaVX1EbJlhJWSgnaoqL7WqJqRaJbGzKM";
                drive_IdCarpetaActiva = idRaizOriginal;
                drive_CargarEstructuraNube(idRaizOriginal);
                return;
            }
            drive_IdCarpetaActiva = e.target.value;
            drive_CargarEstructuraNube(e.target.value);
        });
    }

    // Escucha para capturar el archivo cuando el usuario lo selecciona
    const inputArchivoDrive = document.getElementById("archivoSubirDrive");
    if (inputArchivoDrive) {
        inputArchivoDrive.addEventListener("change", drive_ManejarSeleccionArchivo);
    }

    // Botón para simular o alertar la preparación de la carga física
    const btnIniciarCargaDrive = document.getElementById("btnIniciarCargaDrive");
    if (btnIniciarCargaDrive) {
        btnIniciarCargaDrive.addEventListener("click", () => {
            if (drive_NombreArchivoSeleccionado) {
                alert(`¡Gatillando motor de subida! Archivo listo para transmitir: ${drive_NombreArchivoSeleccionado}`);
            } else {
                alert("Por favor, selecciona un documento primero usando el botón de arriba.");
            }
        });
    }
});
