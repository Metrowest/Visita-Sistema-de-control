// =========================================================================
// SECCIÓN 1: VARIABLES MAESTRAS DE ACCESO REMOTO (APP.JS)
// Ubicación del bloque: ARRIBA DEL TODO
// =========================================================================

// Enlace exclusivo hacia la base de datos de las hojas (Google Sheets)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5f-HM7FAWTxf3oDPFafcZ4EUL-5Bbt6UtBU6JgqsHIqEGAN1Z5TFyx3af7B6nijvAvg/exec";

// Variable global de memoria para controlar el índice del registro en edición
let registroEditandoIndex = null;

// 🌟 DICCIONARIO COMPLETO: Enlaces a tus páginas web reales de GitHub Pages
const ENLACES_HOJAS = {
    "Superintendentes": "https://metrowest.github.io/Visita/desastre.html#punto-superintendentes",
    "Hospitalidad": "https://metrowest.github.io/Visita/Almuerzo.html",
    "Estudios Día 1": "https://metrowest.github.io/Visita/estudio1A.html",
    "Estudios Día 2": "https://metrowest.github.io/Visita/estudio2A.html",
    "Estudios Día 3": "https://metrowest.github.io/Visita/estudio3A.html",
    "Pastoreo Día 1": "https://metrowest.github.io/Visita/pastoreo1A.html",
    "Pastoreo Día 2": "https://metrowest.github.io/Visita/pastoreo2A.html",
    "Pastoreo Día 3": "https://metrowest.github.io/Visita/pastoreo3A.html",
    "Seguridad": "https://metrowest.github.io/Visita/seguridad.html"
};


// =========================================================================
// SECCIÓN 2: DISPARADOR AUTOMÁTICO DE LECTURA DINÁMICA (APP.JS)
// Ubicación del bloque: CENTRO (PARTE MEDIA - FUNCIÓN 1)
// =========================================================================
function cargarDatos() {
    console.log("¡Iniciando carga de tabla mediante inyección de script local!");

    // Capturamos el valor en vivo del selectorHoja que agregamos en el HTML
    const hoja = document.getElementById("selectorHoja").value;
    console.log("Solicitando registros para la sección: " + hoja);

    // BLINDAJE DE RED: Si el usuario elige las carpetas, este script se apaga de inmediato
    // y no ejecuta las llamadas de Sheets para evitar que las tablas se queden colgadas
    if (hoja === "Gestor_Carpetas") {
        console.log("Tablero de Sheets apagado. Cediendo control a carpetas.js...");
        return;
    }

    // Removemos ganchos viejos para evitar duplicación de scripts en memoria
    const scriptViejo = document.getElementById("script-carga-hojas");
    if (scriptViejo) scriptViejo.remove();

    // Inyectamos una etiqueta script dinámicamente pasándole la hoja seleccionada por URL
    const script = document.createElement("script");
    script.id = "script-carga-hojas";
    script.src = `${WEB_APP_URL}?accion=leer&hoja=${encodeURIComponent(hoja)}`;
    document.body.appendChild(script);
}

// ==========================================================
// SECCIÓN 3.0 (FIJA): MOTOR CONSTRUCTOR VISUAL DE FILAS
// Ubicación: Centro (Parte Media - Función Fija)
// ==========================================================
function Secc30_1_DibujarRenglonEnPantalla(
    indice, 
    objetoCampos, 
    columnasVisibles
) {
    const tablaCuerpo = document.getElementById("tablaCuerpo");
    
    // Construcción horizontal recorriendo las llaves
    let htmlFila = "<tr>";
    columnasVisibles.forEach(propiedad => {
        const val = objetoCampos[propiedad];
        htmlFila += `<td>${val !== undefined ? val : ""}</td>`;
    });
    
    // Inyección de botones con puentes de red locales
    const jsonLimpio = JSON.stringify(objetoCampos)
        .replace(/"/g, '&quot;');

    htmlFila += `<td>
        <button type="button" class="btn-edit" 
            style="cursor:pointer;" 
            onclick="window.editarRegistro(${indice}, ${jsonLimpio})">
            ✏️
        </button>
        <button type="button" class="btn-delete" 
            style="cursor:pointer;" 
            onclick="window.borrarRegistro(${indice})">
            🗑️
        </button>
    </td></tr>`;
    
    tablaCuerpo.insertAdjacentHTML("beforeend", htmlFila);
}

// ==========================================================
// SECCIÓN 3.1 (DINÁMICA): DECODIFICADOR MAESTRO DE MATRICES
// Ubicación: Centro (Sección de Cambios Frecuentes)
// ==========================================================
function recibirDatosDesdeGoogle(json) {
    console.log("¡Decodificador maestro activado!");
    const tCabecera = document.getElementById("tablaCabecera");
    const tCuerpo = document.getElementById("tablaCuerpo");
    
    if (tCuerpo) tCuerpo.innerHTML = "";

    let datosMatriz = json && json.data ? json.data : json;
    if (json && json.status === "success" && 
        json.message && Array.isArray(json.message)) { 
        datosMatriz = json.message; 
    }

    if (!datosMatriz || !Array.isArray(datosMatriz) || 
        datosMatriz.length === 0) {
        const hoja = document.getElementById("selectorHoja").value;
        const totalCol = (hoja.includes("Estudios") || 
            hoja.includes("Pastoreo")) ? 9 : 
            (hoja === "Hospitalidad" ? 5 : 4);
        
        if (tCuerpo) {
            tCuerpo.innerHTML = `<tr><td colspan="${totalCol}">
                No hay registros guardados en esta sección.
            </td></tr>`;
        }
        return;
    }

    const hojaActiva = document.getElementById("selectorHoja").value;
    let encTextos = [];
    let llavesMapeo = [];

    // CONFIGURACIÓN DE TABLAS: Títulos reales de tus hojas
    if (hojaActiva === "Seguridad") {
        encTextos = ["Fecha / Estado"];
        llavesMapeo = ["grupo"]; 
        
    } else if (hojaActiva === "Superintendentes") {
        encTextos = ["Grupo", "Superintendente", "Teléfono"];
        llavesMapeo = ["grupo", "superintendente", "telefono"];
        
    } else if (hojaActiva === "Hospitalidad") {
        encTextos = ["Día", "Nombre", "Teléfono", "Dirección"];
        llavesMapeo = ["grupo", "superintendente", "telefono", "direccion"];
        
    } else if (hojaActiva.includes("Estudios")) {
        encTextos = ["Día", "Visitante", "Acompañante", 
            "Teléfono", "Estudiante", "Dirección", 
            "Publicación", "Detalles"];
        llavesMapeo = ["grupo", "superintendente", "telefono", 
            "campo4", "campo5", "campo6", "campo7", "campo8"];
        
    } else if (hojaActiva.includes("Pastoreo")) {
        encTextos = ["Día", "Acompañante", "Teléfono", 
            "Hogar", "Contacto", "Dirección", 
            "Detalles", "Objetivo"];
        llavesMapeo = ["grupo", "superintendente", "telefono", 
            "campo4", "campo5", "campo6", "campo7", "campo8"];
    }

    // Dibujamos las cabeceras de columnas
    let htmlCabecera = "<tr>";
    encTextos.forEach(col => {
        htmlCabecera += `<th>${col}</th>`;
    });
    htmlCabecera += "<th>Acciones</th></tr>";
    if (tCabecera) tCabecera.innerHTML = htmlCabecera;

    // 🛡️ ENRUTADOR EXCLUSIVO ADAPTATIVO PARA HOJA SEGURIDAD
    if (hojaActiva === "Seguridad") {
        datosMatriz.forEach((row, index) => {
            let valReal = (typeof row === "object" && row !== null) ? 
                (row["Fecha / Estado"] || row["grupo"] || 
                Object.values(row)) : row;
                
            if (String(valReal).trim() === "Fecha / Estado") return;

            let htmlFila = "<tr>";
            htmlFila += `<td>${String(valReal || "").trim()}</td>`;
            let objetoFila = { grupo: String(valReal || "").trim() };
            
            htmlFila += `<td>
                <button type="button" class="btn-edit" 
                    style="cursor:pointer;" 
                    onclick="window.editarRegistro(${index}, 
                    ${JSON.stringify(objetoFila).replace(/"/g, '&quot;')})">
                    ✏️
                </button>
            </td></tr>`;
            
            if (tCuerpo) {
                tCuerpo.insertAdjacentHTML("beforeend", htmlFila);
            }
        });
        return; 
    }

    // ENRUTADOR VERTICAL CON EXTRACTOR ANTIDESFASE UNIFICADO
    if (hojaActiva.includes("Estudios") || 
        hojaActiva.includes("Pastoreo")) {
        
        let celdasPlanasRaw = [];
        datosMatriz.forEach(fila => {
            if (Array.isArray(fila)) {
                celdasPlanasRaw.push(fila !== undefined && 
                    fila !== null ? fila.toString().trim() : "");
            } else {
                celdasPlanasRaw.push(fila !== undefined && 
                    fila !== null ? fila.toString().trim() : "");
            }
        });

        let celdasPlanas = [];
        for (let k = 0; k < celdasPlanasRaw.length; k++) {
            if (k > 0 && celdasPlanasRaw[k] !== "" && 
                celdasPlanasRaw[k] === celdasPlanasRaw[k-1] && 
                celdasPlanasRaw[k].includes("Dia:")) {
                continue; 
            }
            celdasPlanas.push(celdasPlanasRaw[k]);
        }
        
        let contadorBloque = 0;
        
        for (let i = 0; i < celdasPlanas.length; i += 8) {
            if (i >= celdasPlanas.length) break;
            if (celdasPlanas[i] === "" && celdasPlanas[i+1] === "" && 
                celdasPlanas[i+2] === "") continue;

            let objetoFila = {
                grupo: celdasPlanas[i] || "",            
                superintendente: celdasPlanas[i+1] || "", 
                telefono: celdasPlanas[i+2] || "", 
                campo4: celdasPlanas[i+3] || "",   
                campo5: celdasPlanas[i+4] || "",   
                campo6: celdasPlanas[i+5] || "",   
                campo7: celdasPlanas[i+6] || "",   
                campo8: celdasPlanas[i+7] || ""    
            };

            Secc30_1_DibujarRenglonEnPantalla(
                contadorBloque, 
                objetoFila, 
                llavesMapeo
            );
            contadorBloque++;
        }
    } else {
        datosMatriz.forEach((objetoCampos, indice) => {
            Secc30_1_DibujarRenglonEnPantalla(
                indice, 
                objetoCampos, 
                llavesMapeo
            );
        });
    }
}

// ==========================================================
// ADICIÓN: INTERCEPTOR DE ALERTAS Y CONFIRMACIONES PASTELES
// ==========================================================
function mostrarAlertaPastel(mensaje, tipo) {
  const iconosAlerta = {
    'exito': '✨',         
    'confirmacion': '🤔',  
    'advertencia': '⚠️',   
    'error': '🚨'          
  };

  const iconoHtml = iconosAlerta[tipo] || '📌';

  let contenedorAlertas = document.getElementById(
      'contenedor-alertas-pasteles'
  );
  
  if (!contenedorAlertas) {
    contenedorAlertas = document.createElement('div');
    contenedorAlertas.id = 'contenedor-alertas-pasteles';
    contenedorAlertas.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 340px;
      width: calc(100% - 40px);
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(contenedorAlertas);
  }

  const alerta = document.createElement('div');
  alerta.className = `alerta-pastel alerta-${tipo}`;
  alerta.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background-color: var(--bg-pastel-${tipo}, #f3f4f6); 
    border-left: 5px solid var(--border-pastel-${tipo}, #9ca3af);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    pointer-events: auto;
    font-weight: 500;
    font-size: 0.95rem;
    animation: entradaAlertaPastel 0.3s ease-out forwards;
  `;

  alerta.innerHTML = `
    <span style="font-size:1.25rem; flex-shrink:0; 
        display:inline-flex; align-items:center;">
        ${iconoHtml}
    </span>
    <span style="flex-grow:1; color:#1e293b; line-height:1.4;">
        ${mensaje}
    </span>
  `;

  contenedorAlertas.appendChild(alerta);

  // Temporizador de lectura: 6 segundos en total
  setTimeout(() => {
    alerta.style.animation = 'salidaAlertaPastel 0.3s ease-in forwards';
    setTimeout(() => {
      alerta.remove();
      if (contenedorAlertas.childElementCount === 0) {
        contenedorAlertas.remove();
      }
    }, 300); 
  }, 6000); 
}

window.mostrarAlertaPastel = mostrarAlertaPastel;


// =========================================================================
// SECCIÓN 4: CONTROLADOR DE EDICIÓN PASIVA TOTALMENTE INTEGRADO (APP.JS)
// Ubicación del bloque: CENTRO (PARTE MEDIA - FUNCIÓN 3)
// =========================================================================
function editarRegistro(index, rowData) {
    console.log("Cargando registro seleccionado en los campos de edición superior...");
    const hojaActiva = document.getElementById("selectorHoja").value;
    
    // Almacenamos el índice del bloque en la memoria global
    registroEditandoIndex = index;
    
    // Rellenamos los primeros 3 inputs visuales comunes de tu pantalla
    document.getElementById("txtGrupo").value = rowData.grupo || "";
    document.getElementById("txtSuperintendente").value = rowData.superintendente || "";
    document.getElementById("txtTelefono").value = rowData.telefono || "";
    
    // CORRECCIÓN DE EDICIÓN: Validamos si la pestaña es de la familia de Estudios o Pastoreo
    if (hojaActiva.includes("Estudios") || hojaActiva.includes("Pastoreo")) {
        document.getElementById("txtCampo4").value = rowData.campo4 || "";
        document.getElementById("txtCampo5").value = rowData.campo5 || "";
        document.getElementById("txtCampo6").value = rowData.campo6 || "";
        document.getElementById("txtCampo7").value = rowData.campo7 || "";
        document.getElementById("txtCampo8").value = rowData.campo8 || ""; // <-- Asegura la octava celda (Detalles)
        document.getElementById("formTitulo").innerText = `Editar Registro (${hojaActiva.replace(/_/g, " ")})`;
    } else if (hojaActiva === "Hospitalidad") {
        document.getElementById("txtCampo4").value = rowData.direccion || "";
        document.getElementById("formTitulo").innerText = "Editar Registro (Hospitalidad)";
    } else if (hojaActiva === "Superintendentes") {
        document.getElementById("formTitulo").innerText = "Editar Registro (Superintendentes)";
    }
    
    document.getElementById("btnGuardar").innerText = "💾 Actualizar Registro";
    document.getElementById("btnCancelar").style.display = "inline-block";
}

// =========================================================================
// SECCIÓN 5: INTERCEPTOR DE GUARDADO CON TRADUCTOR DE ENTORNO UNIVERSAL (APP.JS)
// Ubicación del bloque: CENTRO (PARTE MEDIA - FUNCIÓN 4)
// Descripción: Empaqueta los datos del formulario antes de transmitir de forma remota.
// Envía el índice exacto de la línea y el valor del input a la nueva lógica del Code.gs.
// =========================================================================
function procesarGuardadoRegistro(evento) {
    evento.preventDefault();
    console.log("Procesando datos del formulario estructural antes de transmitir...");

    const btn = document.getElementById("btnGuardar");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Transmitiendo...";
    }

    const hojaRaw = document.getElementById("selectorHoja").value;
    
    // BLINDAJE DE CONVERSIÓN MAESTRO: Traduce los guiones bajos en los espacios reales de tu Sheets
    let hoja = hojaRaw.replace(/_/g, " ");
    if (hoja === "Estudios Dia 1") hoja = "Estudios Día 1";
    if (hoja === "Estudios Dia 2") hoja = "Estudios Día 2";
    if (hoja === "Estudios Dia 3") hoja = "Estudios Día 3";
    if (hoja === "Pastoreo Dia 1") hoja = "Pastoreo Día 1";
    if (hoja === "Pastoreo Dia 2") hoja = "Pastoreo Día 2";
    if (hoja === "Pastoreo Dia 3") hoja = "Pastoreo Día 3";

    console.log("Transmitiendo datos de forma segura hacia la pestaña de la nube: " + hoja);

    const grupo = document.getElementById("txtGrupo").value.trim();
    let superint = document.getElementById("txtSuperintendente").value.trim();
    let tel = document.getElementById("txtTelefono").value.trim();

    // 1. ACOPLE HORIZONTAL TRADICIONAL: Si es Hospitalidad, adjuntamos la dirección
    if (hoja === "Hospitalidad") {
        const direccionExtra = document.getElementById("txtCampo4").value.trim();
        tel = `${tel}&direccion=${encodeURIComponent(direccionExtra)}`;
    }
    // 2. ACOPLE VERTICAL REGULAR: Si la pestaña es de Estudios o Pastoreo, serializamos los 8 campos de forma normal
    else if (hoja.includes("Estudios") || hoja.includes("Pastoreo")) {
        const c4 = document.getElementById("txtCampo4").value.trim();
        const c5 = document.getElementById("txtCampo5").value.trim();
        const c6 = document.getElementById("txtCampo6").value.trim();
        const c7 = document.getElementById("txtCampo7").value.trim();
        const c8 = document.getElementById("txtCampo8").value.trim();
        
        tel = `${tel}&c4=${encodeURIComponent(c4)}&c5=${encodeURIComponent(c5)}&c6=${encodeURIComponent(c6)}&c7=${encodeURIComponent(c7)}&c8=${encodeURIComponent(c8)}`;
    }

    const scriptViejo = document.getElementById("script-guardar-hojas");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-guardar-hojas";
    
    // Despachamos la URL limpia hacia el backend
    script.src = `${WEB_APP_URL}?accion=guardar&hoja=${encodeURIComponent(hoja)}&index=${registroEditandoIndex}&grupo=${encodeURIComponent(grupo)}&superintendente=${encodeURIComponent(superint)}&telefono=${(hoja === "Hospitalidad" || hoja.includes("Estudios") || hoja.includes("Pastoreo")) ? tel : encodeURIComponent(tel)}`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 6: RECEPTOR UNIVERSAL DE RESPUESTAS DEL SERVIDOR (APP.JS)
// Ubicación del bloque: CENTRO (PARTE MEDIA - FUNCIÓN 5)
// =========================================================================
function recibirRespuestaAccion(resultado) {
    console.log("¡Respuesta recibida desde la nube de Google Sheets!", resultado);
    
    const btn = document.getElementById("btnGuardar");
    
    // RESTAURACIÓN INTEGRAL: Desbloqueamos el botón congelado al instante
    if (btn) {
        btn.disabled = false;
        btn.innerText = "💾 Guardar Registro";
    }

    if (resultado && resultado.status === "success") {
        // 🌟 REEMPLAZO 1: Toast elegante flotante en lugar del viejo alert() de éxito
        mostrarNotificacionToast(resultado.message || "¡Registro procesado con éxito!");

        // LIMPIEZA ADAPTATIVA: Vaciamos todas las cajas de texto superiores de forma segura
        document.getElementById("txtGrupo").value = "";
        document.getElementById("txtSuperintendente").value = "";
        document.getElementById("txtTelefono").value = "";
        document.getElementById("txtCampo4").value = "";
        document.getElementById("txtCampo5").value = "";
        document.getElementById("txtCampo6").value = "";
        document.getElementById("txtCampo7").value = "";
        document.getElementById("txtCampo8").value = "";

        // Restauramos el entorno visual y el índice de control
        document.getElementById("formTitulo").innerText = "Añadir Registro";
        document.getElementById("btnCancelar").style.display = "none";
        registroEditandoIndex = null;

        // RECONFIGURACIÓN VISUAL: Sincroniza los letreros correctos de la hoja activa antes de leer
        actualizarEnlaceUbicacion();

        // REFRESO DE RED AUTOMÁTICO: Llama al tablero maestro para recargar la tabla real limpia
        cargarDatos();
    } else {
        // 🌟 REEMPLAZO 2: Toast rojo flotante en lugar del alert() genérico de error del servidor
        mostrarNotificacionToast("Aviso del Servidor: " + (resultado.message || "No se pudo completar la acción."), true);
    }
}

// =========================================================================
// SECCIÓN 6.1 (NUEVA): MOTOR CONSTRUCTOR DE ALERTAS FLOTANTES (TOASTS)
// Ubicación del bloque: CENTRO (JUSTO DEBAJO DE LA SECCIÓN 6)
// Descripción: Crea dinámicamente tarjetas animadas que entran desde la derecha,
// permanecen 4 segundos visibles y se desvanecen de forma automática.
// =========================================================================
function mostrarNotificacionToast(mensaje, esError = false) {
    const contenedor = document.getElementById("contenedor-toasts");
    if (!contenedor) return;

    // Creamos el elemento HTML de la alerta sobre la marcha
    const toast = document.createElement("div");
    toast.className = `alerta-toast${esError ? " toast-error" : ""}`;
    toast.innerHTML = `<span>${mensaje}</span><span style="cursor:pointer; font-weight:bold; margin-left:10px;" onclick="this.parentElement.remove()">×</span>`;

    // Lo inyectamos físicamente dentro del contenedor fijo
    contenedor.appendChild(toast);

    // Ciclo de desvanecimiento temporizado: 4 segundos activo y 300ms de salida suave
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "scale(0.9)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Vinculamos de forma obligatoria en la ventana window para el constructor dinámico
window.mostrarNotificacionToast = mostrarNotificacionToast;


// =========================================================================
// SECCIÓN 7: EMISOR DE ORDENES FÍSICAS DE BORRADO (APP.JS)
// Ubicación del bloque: ABAJO DEL TODO (PARTE INFERIOR - FUNCIÓN 6)
// =========================================================================
function Secc53_1_ActivarBorradoPuente(index) {
    if (!confirm("¿Está seguro de que desea eliminar este registro de la base de datos de forma permanente?")) return;

    const hoja = document.getElementById("selectorHoja").value;
    console.log("Disparando comando de borrado seguro para la fila número: " + index);

    const scriptViejo = document.getElementById("script-borrar-hojas");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-borrar-hojas";
    script.src = `${WEB_APP_URL}?accion=borrar&hoja=${encodeURIComponent(hoja)}&index=${index}`;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 8: PUENTES DE COMPATIBILIDAD GLOBAL Y ESCUCHAS DE EVENTOS (APP.JS)
// Ubicación del bloque: ABAJO DEL TODO (AL CIERRE DEL ARCHIVO)
// =========================================================================

// 1. MANTENEMOS EL ESCUCHA DE ENVÍO (Inalterado y operativo)
document.getElementById("formularioSuperintendentes").addEventListener("submit", procesarGuardadoRegistro);

// 2. REEMPLAZO EXACTO: Escucha el botón de cancelar edición para limpiar las 8 cajas completas
document.getElementById("btnCancelar").addEventListener("click", () => {
    // Vaciamos de forma contundente las 8 cajas de texto superiores
    document.getElementById("txtGrupo").value = "";
    document.getElementById("txtSuperintendente").value = "";
    document.getElementById("txtTelefono").value = "";
    document.getElementById("txtCampo4").value = "";
    document.getElementById("txtCampo5").value = "";
    document.getElementById("txtCampo6").value = "";
    document.getElementById("txtCampo7").value = "";
    document.getElementById("txtCampo8").value = "";
    
    // Restauramos el botón y el índice de control
    document.getElementById("btnGuardar").innerText = "💾 Guardar Registro";
    document.getElementById("btnCancelar").style.display = "none";
    registroEditandoIndex = null;
    
    // CORRECCIÓN VISUAL: Forzamos a la interfaz a restablecer las etiquetas correctas de la hoja activa
    actualizarEnlaceUbicacion();
});

// Enlazamos forzosamente los receptores en la ventana window para el protocolo local file:///
window.recibirDatosDesdeGoogle = recibirDatosDesdeGoogle;
window.recibirRespuestaAccion = recibirRespuestaAccion;
window.editarRegistro = editarRegistro;
window.borrarRegistro = Secc53_1_ActivarBorradoPuente;

// Disparamos la lectura automática de la base de datos en cuanto se abre el archivo
document.addEventListener("DOMContentLoaded", cargarDatos);

// Enlazamos forzosamente los receptores en la ventana window para el protocolo local file:///
window.recibirDatosDesdeGoogle = recibirDatosDesdeGoogle;
window.recibirRespuestaAccion = recibirRespuestaAccion;
window.editarRegistro = editarRegistro;
window.borrarRegistro = Secc53_1_ActivarBorradoPuente;

// =========================================================================
// SECCIÓN 8.2.1 (FIJA - NO SE TOCA): MOTOR PURO DE INYECCIÓN LOCAL (APP.JS)
// Ubicación del bloque: ABAJO DEL TODO (FINAL ABSOLUTO DEL ARCHIVO)
// =========================================================================
function Secc821_1_DispararPeticionServidor(urlFinalConParametros) {
    console.log("¡Motor fijo inyectando script local libre de CORS!");
    const scriptViejo = document.getElementById("script-carga-hojas");
    if (scriptViejo) scriptViejo.remove();

    const script = document.createElement("script");
    script.id = "script-carga-hojas";
    script.src = urlFinalConParametros;
    document.body.appendChild(script);
}

// =========================================================================
// SECCIÓN 8.2.2 (CONFIGURACIÓN DINÁMICA): TABLERO DE CONTROL DE HOJAS TOLEANTE
// Ubicación del bloque: ABAJO DEL TODO (FINAL ABSOLUTO DEL ARCHIVO)
// =========================================================================
function cargarDatos() {
    const hojaRaw = document.getElementById("selectorHoja").value;
    console.log("Configurando parámetros de URL para la sección activa: " + hojaRaw);
    
    // BLINDAJE DE CONVERSIÓN: Traduce guiones bajos en espacios y quita acentos básicos si se requiere
    let hoja = hojaRaw.replace(/_/g, " ");
    if (hoja === "Estudios Dia 1") hoja = "Estudios Día 1";
    if (hoja === "Estudios Dia 2") hoja = "Estudios Día 2";
    if (hoja === "Estudios Dia 3") hoja = "Estudios Día 3";
    if (hoja === "Pastoreo Dia 1") hoja = "Pastoreo Día 1";
    if (hoja === "Pastoreo Dia 2") hoja = "Pastoreo Día 2";
    if (hoja === "Pastoreo Dia 3") hoja = "Pastoreo Día 3";
    
    let urlConstruida = "";

    // 🌟 VALIDACIÓN INTERACTIVA DINÁMICA CON REGISTRO DE CANAL PARA SEGURIDAD
    if (hoja === "Seguridad") {
        // Generamos el puente de lectura directo hacia la macro para tu hoja de control de una columna
        urlConstruida = `${WEB_APP_URL}?accion=leer&hoja=${encodeURIComponent(hoja)}`;
        
    } else if (hoja === "Superintendentes" || hoja === "Hospitalidad") {
        urlConstruida = `${WEB_APP_URL}?accion=leer&hoja=${encodeURIComponent(hoja)}`;
        
    } else if (hoja === "Estudios Día 1" || hoja === "Estudios Día 2" || hoja === "Estudios Día 3") {
        urlConstruida = `${WEB_APP_URL}?accion=leerVertical&hoja=${encodeURIComponent(hoja)}`;
        
    } else if (hoja === "Pastoreo Día 1" || hoja === "Pastoreo Día 2" || hoja === "Pastoreo Día 3") {
        urlConstruida = `${WEB_APP_URL}?accion=leerVertical&hoja=${encodeURIComponent(hoja)}`;
    }

    if (urlConstruida !== "") {
        Secc821_1_DispararPeticionServidor(urlConstruida);
    } else {
        console.error("Error: La hoja seleccionada no tiene una ruta en el tablero de control.");
    }
}

// =========================================================================
// SECCIÓN 8.2.3: ACTUALIZADOR EN VIVO CON CLAÚSULA DE ESCAPE PARA DRIVE (APP.JS)
// Ubicación del bloque: FINAL ABSOLUTO DE TU ARCHIVO APP.JS CENTRAL
// =========================================================================
function actualizarEnlaceUbicacion() {
    const selector = document.getElementById("selectorHoja");
    if (!selector) return;

    const hojaSeleccionada = selector.value;
    
    // CRUCIAL: Si el usuario selecciona el Gestor de Carpetas, este script detiene 
    // su ejecución al instante para dejar que carpetas.js pinte la tarjeta azul libremente
    if (hojaSeleccionada === "Gestor_Carpetas") {
        console.log("Cediendo control total visual al archivo carpetas.js...");
        return; 
    }

    const etiquetaEnlace = document.getElementById("enlaceDinamico");
    const tituloFormulario = document.getElementById("formTitulo");

    const lbl1 = document.getElementById("lblCampo1"), lbl2 = document.getElementById("lblCampo2"), lbl3 = document.getElementById("lblCampo3"), lbl4 = document.getElementById("lblCampo4"), lbl5 = document.getElementById("lblCampo5"), lbl6 = document.getElementById("lblCampo6"), lbl7 = document.getElementById("lblCampo7"), lbl8 = document.getElementById("lblCampo8");
    const c4 = document.getElementById("contenedorCampo4"), c5 = document.getElementById("contenedorCampo5"), c6 = document.getElementById("contenedorCampo6"), c7 = document.getElementById("contenedorCampo7"), c8 = document.getElementById("contenedorCampo8");

    // Bloques contenedores adicionales para campos 2 y 3 (vitales para ocultar en Seguridad)
    const c2 = document.getElementById("contenedorCampo2") || document.getElementById("txtSuperintendente")?.parentElement;
    const c3 = document.getElementById("contenedorCampo3") || document.getElementById("txtTelefono")?.parentElement;

    // Captura de los inputs físicos reales para manipular su obligatoriedad en red
    const input2 = document.getElementById("txtSuperintendente");
    const input3 = document.getElementById("txtTelefono");

    if (etiquetaEnlace) {
        etiquetaEnlace.target = "_blank";
        
        let nombreHojaLimpio = hojaSeleccionada.replace(/_/g, " ");
        if (nombreHojaLimpio === "Estudios Dia 1") nombreHojaLimpio = "Estudios Día 1";
        if (nombreHojaLimpio === "Estudios Dia 2") nombreHojaLimpio = "Estudios Día 2";
        if (nombreHojaLimpio === "Estudios Dia 3") nombreHojaLimpio = "Estudios Día 3";
        if (nombreHojaLimpio === "Pastoreo Dia 1") nombreHojaLimpio = "Pastoreo Día 1";
        if (nombreHojaLimpio === "Pastoreo Dia 2") nombreHojaLimpio = "Pastoreo Día 2";
        if (nombreHojaLimpio === "Pastoreo Dia 3") nombreHojaLimpio = "Pastoreo Día 3";

        const urlDestinoReal = ENLACES_HOJAS[nombreHojaLimpio];
        etiquetaEnlace.href = urlDestinoReal || "#";

        if (hojaSeleccionada === "Hospitalidad") {
            etiquetaEnlace.innerHTML = "🏨 Hospitalidad";
        } else if (hojaSeleccionada === "Superintendentes") {
            etiquetaEnlace.innerHTML = "👥 Superintendentes";
        } else if (hojaSeleccionada === "Seguridad") {
            etiquetaEnlace.innerHTML = "🛡️ Seguridad";
        } else {
            etiquetaEnlace.innerHTML = `📚 ${nombreHojaLimpio}`;
        }
    }

    // 🌟 RESTAURACIÓN GENERAL DE VISIBILIDAD Y OBLIGATORIEDAD (Protege las hojas de la 1 a la 8)
    if (c2) c2.style.display = "flex";
    if (c3) c3.style.display = "flex";
    if (input2) input2.required = true;
    if (input3) input3.required = true;

    // CONMUTADOR VISUAL DE ENTORNO RESPONSIVO TRADICIONAL PARA HOJAS
    if (hojaSeleccionada === "Seguridad") {
        if (tituloFormulario) tituloFormulario.innerText = "Control de Seguridad (Celda A1)";
        if (lbl1) lbl1.innerText = "Fecha / Estado";
        
        // 🌟 APAGADO DE OBLIGATORIEDAD: Evita el error de enfoque del navegador en controles ocultos
        if (input2) input2.required = false;
        if (input3) input3.required = false;

        // Ocultamos de forma absoluta los inputs redundantes para dejar un solo campo activo
        if (c2) c2.style.display = "none"; 
        if (c3) c3.style.display = "none";
        if (c4) c4.style.display = "none"; 
        if (c5) c5.style.display = "none";
        if (c6) c6.style.display = "none"; 
        if (c7) c7.style.display = "none"; 
        if (c8) c8.style.display = "none";

    } else if (hojaSeleccionada === "Hospitalidad") {
        if (tituloFormulario) tituloFormulario.innerText = "Añadir Registro (Hospitalidad)";
        if (lbl1) lbl1.innerText = "Día"; if (lbl2) lbl2.innerText = "Encargado"; if (lbl3) lbl3.innerText = "Contacto";
        if (lbl4) lbl4.innerText = "Dirección";

        if (c4) c4.style.display = "flex";
        if (c5) c5.style.display = "none"; if (c6) c6.style.display = "none"; if (c7) c7.style.display = "none"; if (c8) c8.style.display = "none";

    } else if (hojaSeleccionada.includes("Estudios")) {
        if (tituloFormulario) tituloFormulario.innerText = `Añadir Registro (${hojaSeleccionada.replace(/_/g, " ")})`;
        if (lbl1) lbl1.innerText = "Día"; if (lbl2) lbl2.innerText = "Visitante"; if (lbl3) lbl3.innerText = "Acompañante";
        if (lbl4) lbl4.innerText = "Teléfono"; if (lbl5) lbl5.innerText = "Estudiante"; if (lbl6) lbl6.innerText = "Dirección"; if (lbl7) lbl7.innerText = "Publicación"; if (lbl8) lbl8.innerText = "Detalles";
        
        if (c4) c4.style.display = "flex"; if (c5) c5.style.display = "flex";
        if (c6) c6.style.display = "flex"; if (c7) c7.style.display = "flex"; if (c8) c8.style.display = "flex";

    } else if (hojaSeleccionada.includes("Pastoreo")) {
        if (tituloFormulario) tituloFormulario.innerText = `Añadir Registro (${hojaSeleccionada.replace(/_/g, " ")})`;
        if (lbl1) lbl1.innerText = "Día"; if (lbl2) lbl2.innerText = "Acompañante"; if (lbl3) lbl3.innerText = "Teléfono";
        if (lbl4) lbl4.innerText = "Hogar"; if (lbl5) lbl5.innerText = "Contacto"; if (lbl6) lbl6.innerText = "Dirección"; if (lbl7) lbl7.innerText = "Detalles"; if (lbl8) lbl8.innerText = "Objetivo";
        
        if (c4) c4.style.display = "flex"; if (c5) c5.style.display = "flex";
        if (c6) c6.style.display = "flex"; if (c7) c7.style.display = "flex"; if (c8) c8.style.display = "flex";
        
    } else {
        if (lbl1) lbl1.innerText = "Grupo / Día"; if (lbl2) lbl2.innerText = "Superintendente / Encargado"; if (lbl3) lbl3.innerText = "Teléfono / Contacto";
        
        if (c4) c4.style.display = "none"; if (c5) c5.style.display = "none";
        if (c6) c6.style.display = "none"; if (c7) c7.style.display = "none"; if (c8) c8.style.display = "none";
        if (tituloFormulario) tituloFormulario.innerText = "Añadir Registro (Superintendentes)";
    }
}


// =========================================================================
// SECCIÓN 9 (NUEVA): MAQUINARIA INTERACTIVA DE INSTALACIÓN PWA (APP.JS)
// Ubicación del bloque: FINAL ABSOLUTO DEL SCRIPT CENTRAL APP.JS
// =========================================================================
let disparadorInstalacionPWA = null;

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("¡Service Worker registrado con éxito! Scope: ", reg.scope))
            .catch(err => console.error("Fallo al dar de alta el Service Worker: ", err));
    });
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    disparadorInstalacionPWA = e;
    
    const banner = document.getElementById("bannerInstalacionPWA");
    if (banner) banner.style.display = "block";
});

document.getElementById("btnInstalarPWA").addEventListener("click", async () => {
    if (!disparadorInstalacionPWA) return;
    
    disparadorInstalacionPWA.prompt();
    
    const { outcome } = await disparadorInstalacionPWA.userChoice;
    console.log(`El usuario respondió a la instalación con la opción: ${outcome}`);
    
    disparadorInstalacionPWA = null;
    const banner = document.getElementById("bannerInstalacionPWA");
    if (banner) banner.style.display = "none";
});

window.addEventListener("appinstalled", () => {
    console.log("¡Éxito total! La aplicación ha sido instalada de forma nativa.");
    disparadorInstalacionPWA = null;
    const banner = document.getElementById("bannerInstalacionPWA");
    if (banner) banner.style.display = "none";
});
