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

/**
 * SECCIÓN 1: INICIALIZACIÓN AUTÓNOMA LIBRE DE CONFUGURACIONES CON APPS.JS
 * Despierta el motor de Drive en cuanto el documento HTML está completamente listo.
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("¡Despertando motor de Drive de forma autónoma y segura!");
    drive_CargarEstructuraNube(drive_IdCarpetaActiva);
});

/**
 * SECCIÓN 2: MOTORES EMISORES DE PETICIONES (JSONP ENGINE)
 * Lanza etiquetas script dinámicas para evitar el bloqueo estricto de CORS.
 */
function drive_CargarEstructuraNube(folderId) {
    console.log(`Petición de estructura para la carpeta ID: ${folderId}`);
    
    // Eliminación de scripts huérfanos anteriores para liberar memoria de red
    const scriptViejo = document.getElementById("script-drive-carga");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-drive-carga";
    script.src = `${CARPETAS_WEB_APP_URL}?accion=listarEstructura&folderId=${encodeURIComponent(folderId)}`;
    script.charset = "utf-8";
    
    script.onerror = () => {
        console.error("Fallo crítico de red al conectar con el servidor de Google Drive.");
    };

    document.body.appendChild(script);
}
