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

// =========================================================================
// SECCIÓN 3 (CONFIGURACIÓN DINÁMICA): DECODIFICADOR MAESTRO DE MATRICES
// Ubicación del bloque: CENTRO (PARTE MEDIA - SECCIÓN DE CAMBIOS FRECUENTES)
// =========================================================================
function Secc30_1_DibujarRenglonEnPantalla(indice, objetoCampos, columnasVisibles) {
    const tablaCuerpo = document.getElementById("tablaCuerpo");
    if (!tablaCuerpo) return;
    
    // Construimos la fila en sentido estrictamente horizontal recorriendo las llaves del registro
    let htmlFila = "<tr>";
    columnasVisibles.forEach(propiedad => {
        htmlFila += `<td>${objetoCampos[propiedad] !== undefined ? objetoCampos[propiedad] : ""}</td>`;
    });
    
    // Inyección fija universal de botones interactivos con sus puentes de red locales
    htmlFila += `<td>
        <button type="button" class="btn-edit" style="cursor:pointer;" onclick="window.editarRegistro(${indice}, ${JSON.stringify(objetoCampos).replace(/"/g, '&quot;')})">✏️</button>
        <button type="button" class="btn-delete" style="cursor:pointer;" onclick="window.borrarRegistro(${indice})">🗑️</button>
    </td></tr>`;
    
    tablaCuerpo.insertAdjacentHTML("beforeend", htmlFila);
}

// =========================================================================
// SECCIÓN 3.1: DECODIFICADOR MAESTRO DE MATRICES - PROCESAR DATOS GOOGLE
// Ubicación del bloque: CENTRO (PARTE MEDIA)
// =========================================================================
function recibirDatosDesdeGoogle(json) {
    console.log("¡Decodificador maestro activado! Clasificando datos de Google por su tipo de estructura...");
    const tablaCabecera = document.getElementById("tablaCabecera");
    const tablaCuerpo = document.getElementById("tablaCuerpo");
    
    if(tablaCuerpo) tablaCuerpo.innerHTML = "";

    let datosMatriz = json && json.data ? json.data : json;
    if (json && json.status === "success" && json.message && Array.isArray(json.message)) { 
        datosMatriz = json.message; 
    }

    if (!datosMatriz || !Array.isArray(datosMatriz) || datosMatriz.length === 0) {
        const hojaActiva = document.getElementById("selectorHoja").value;
        const totalColumnas = (hojaActiva.includes("Estudios") || hojaActiva.includes("Pastoreo")) ? 9 : (hojaActiva === "Hospitalidad" ? 5 : 4);
        if(tablaCuerpo) tablaCuerpo.innerHTML = `<tr><td colspan="${totalColumnas}">No hay registros guardados en esta sección.</td></tr>`;
        return;
    }

    const hojaActiva = document.getElementById("selectorHoja").value;
    let encabezadosTextos = [];
    let llavesMapeo = [];

    // =========================================================================
    // CONFIGURACIÓN DE TABLAS: Mapeamos los títulos reales de tus hojas
    // =========================================================================
    if (hojaActiva === "Superintendentes") {
        encabezadosTextos = ["Grupo", "Superintendente", "Teléfono"];
        llavesMapeo = ["grupo", "superintendente", "telefono"];
        
    } else if (hojaActiva === "Hospitalidad") {
        encabezadosTextos = ["Día", "Nombre", "Teléfono", "Dirección"];
        llavesMapeo = ["grupo", "superintendente", "telefono", "direccion"];
        
    } else if (hojaActiva === "Seguridad") {
        encabezadosTextos = ["Grupo / Día", "Superintendente / Encargado", "Teléfono / Contacto"];
        llavesMapeo = ["grupo", "superintendente", "telefono"];
        
    } else if (hojaActiva.includes("Estudios")) {
        encabezadosTextos = ["Día", "Visitante", "Acompañante", "Teléfono", "Estudiante", "Dirección", "Publicación", "Detalles"];
        llavesMapeo = ["grupo", "superintendente", "telefono", "campo4", "campo5", "campo6", "campo7", "campo8"];
        
    } else if (hojaActiva.includes("Pastoreo")) {
        encabezadosTextos = ["Día", "Acompañante", "Teléfono", "Hogar", "Contacto", "Dirección", "Detalles", "Objetivo"];
        llavesMapeo = ["grupo", "superintendente", "telefono", "campo4", "campo5", "campo6", "campo7", "campo8"];
    }

    // Dibujamos las cabeceras de columnas en sentido estrictamente horizontal
    let htmlCabecera = "<tr>";
    encabezadosTextos.forEach(col => htmlCabecera += `<th>${col}</th>`);
    htmlCabecera += "<th>Acciones</th></tr>";
    if(tablaCabecera) tablaCabecera.innerHTML = htmlCabecera;

    // =========================================================================
    // ENRUTADOR DE PROCESAMIENTO EXCLUSIVO SEGÚN LA HOJA ACTIVA
    // =========================================================================
    
    // 🌟 1. CONFIGURACIÓN EXCLUSIVA PARA SEGURIDAD (Muestra SOLO A1 y limpia las otras dos columnas)
    if (hojaActiva === "Seguridad") {
        let celdasPlanas = [];
        
        datosMatriz.forEach(fila => {
            if (Array.isArray(fila)) {
                celdasPlanas.push(fila[0] !== undefined && fila[0] !== null ? fila[0].toString().trim() : "");
            } else {
                celdasPlanas.push(fila !== undefined && fila !== null ? fila.toString().trim() : "");
            }
        });

        // 🌟 ELIMINACIÓN DE CELDAS EXTRA: Extraemos celda A1 y dejamos las columnas 2 y 3 vacías en pantalla
        let objetoFila = {
            grupo: celdasPlanas[0] || "", // Muestra exclusivamente la celda A1 (Ej. "Actualizado: 09/17/2026")
            superintendente: "",         // ❌ ELIMINADO: Celda A2 queda oculta visualmente
            telefono: ""                // ❌ ELIMINADO: Celda A3 queda oculta visualmente
        };
        
        // Lo mandamos a pintar a la tabla con el índice fijo 0
        Secc30_1_DibujarRenglonEnPantalla(0, objetoFila, llavesMapeo);

    // 2. TU FLUJO VERTICAL ORIGINAL PARA ESTUDIOS Y PASTOREO (Intacto de fábrica)
    } else if (hojaActiva.includes("Estudios") || hojaActiva.includes("Pastoreo")) {
        let celdasPlanasRaw = [];
        datosMatriz.forEach(fila => {
            if (Array.isArray(fila)) {
                celdasPlanasRaw.push(fila[0] !== undefined && fila[0] !== null ? fila[0].toString().trim() : "");
            } else {
                celdasPlanasRaw.push(fila !== undefined && fila !== null ? fila.toString().trim() : "");
            }
        });

        let celdasPlanas = [];
        for (let k = 0; k < celdasPlanasRaw.length; k++) {
            if (k > 0 && celdasPlanasRaw[k] !== "" && celdasPlanasRaw[k] === celdasPlanasRaw[k-1] && celdasPlanasRaw[k].includes("Dia:")) {
                console.log("¡Desfase físico detectado en la Columna A de la hoja! Corrigiendo alineación...");
                continue; 
            }
            celdasPlanas.push(celdasPlanasRaw[k]);
        }
        
        let contadorBloque = 0;
        for (let i = 0; i < celdasPlanas.length; i += 8) {
            if (i >= celdasPlanas.length) break;
            if (celdasPlanas[i] === "" && celdasPlanas[i+1] === "" && celdasPlanas[i+2] === "") continue;

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
            
            Secc30_1_DibujarRenglonEnPantalla(contadorBloque, objetoFila, llavesMapeo);
            contadorBloque++;
        }
        
        if (contadorBloque === 0 && tablaCuerpo) {
            tablaCuerpo.innerHTML = `<tr><td colspan="9">No hay registros válidos guardados en esta sección.</td></tr>`;
        }
        
    } else {
        // 3. TU FLUJO HORIZONTAL ORIGINAL PARA LAS PRIMERAS DOS PESTAÑAS (Intacto de fábrica)
        for (let i = 1; i < datosMatriz.length; i++) {
            const fila = datosMatriz[i];
            if (!fila || fila.length === 0) continue;

            let objetoFila = {
                grupo: fila[0] !== undefined && fila[0] !== null ? fila[0].toString().trim() : "",
                superintendente: fila[1] !== undefined && fila[1] !== null ? fila[1].toString().trim() : "",
                telefono: fila[2] !== undefined && fila[2] !== null ? fila[2].toString().trim() : "",
                direccion: fila[3] !== undefined && fila[3] !== null ? fila[3].toString().trim() : ""
            };
            
            Secc30_1_DibujarRenglonEnPantalla(i - 1, objetoFila, llavesMapeo);
        }
    }
}

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
    const superint = document.getElementById("txtSuperintendente").value.trim();
    let tel = document.getElementById("txtTelefono").value.trim();

    // 1. ACOPLE HORIZONTAL: Si es Hospitalidad, adjuntamos la dirección
    if (hoja === "Hospitalidad") {
        const direccionExtra = document.getElementById("txtCampo4").value.trim();
        tel = `${tel}&direccion=${encodeURIComponent(direccionExtra)}`;
    }
    // 2. ACOPLE VERTICAL: Si la pestaña es de Estudios o Pastoreo, serializamos los 8 campos consecutivos
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
    
    // Despachamos la URL corregida con el nombre de hoja purificado con espacios y acentos
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
        // Desplegamos un aviso limpio en tu pantalla confirmando el éxito
        alert(resultado.message || "¡Operación realizada con éxito en la base de datos!");

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
        // Si Google reporta algún fallo o bloqueo, avisamos al usuario y liberamos el botón
        alert("Aviso del Servidor: " + (resultado.message || "No se pudo completar la acción. Revisa tu conexión."));
    }
}
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
// SECCIÓN 8.2.2 (CONFIGURACIÓN DINÁMICA): TABLERO DE CONTROL DE HOJAS TOLEANTE
// Ubicación del bloque: ABAJO DEL TODO (FINAL ABSOLUTO DEL ARCHIVO)
// =========================================================================
function cargarDatos() {
    const hojaRaw = document.getElementById("selectorHoja").value;
    console.log("Configurando parámetros de URL para la sección activa: " + hojaRaw);
    
    const bloqueSuper = document.getElementById("contenedorCampo2");
    const bloqueTelef = document.getElementById("contenedorCampo3");
    const inputSuper = document.getElementById("txtSuperintendente");
    const inputTelef = document.getElementById("txtTelefono");

    // REGLA DE ADAPTACIÓN DE FORMULARIO PARA SEGURIDAD
    if (hojaRaw === "Seguridad") {
        console.log("Adaptando formulario para Seguridad: Ocultando campos excedentes.");
        if (bloqueSuper) bloqueSuper.style.display = "none";
        if (bloqueTelef) bloqueTelef.style.display = "none";
        if (inputSuper) inputSuper.required = false;
        if (inputTelef) inputTelef.required = false;
    } else {
        if (bloqueSuper) bloqueSuper.style.display = "block";
        if (bloqueTelef) bloqueTelef.style.display = "block";
        if (inputSuper) inputSuper.required = true;
        if (inputTelef) inputTelef.required = true;
    }
    
    let hoja = hojaRaw.replace(/_/g, " ");
    if (hoja === "Estudios Dia 1") hoja = "Estudios Día 1";
    if (hoja === "Estudios Dia 2") hoja = "Estudios Día 2";
    if (hoja === "Estudios Dia 3") hoja = "Estudios Día 3";
    if (hoja === "Pastoreo Dia 1") hoja = "Pastoreo Día 1";
    if (hoja === "Pastoreo Dia 2") hoja = "Pastoreo Día 2";
    if (hoja === "Pastoreo Dia 3") hoja = "Pastoreo Día 3";
    
    let urlConstruida = "";

    if (hoja === "Superintendentes" || hoja === "Hospitalidad" || hoja === "Seguridad") {
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
    
    if (hojaSeleccionada === "Gestor_Carpetas") {
        console.log("Cediendo control total visual al archivo carpetas.js...");
        return; 
    }

    const etiquetaEnlace = document.getElementById("enlaceDinamico");
    const tituloFormulario = document.getElementById("formTitulo");

    const lbl1 = document.getElementById("lblCampo1");
    const c4 = document.getElementById("contenedorCampo4"), c5 = document.getElementById("contenedorCampo5"), c6 = document.getElementById("contenedorCampo6"), c7 = document.getElementById("contenedorCampo7"), c8 = document.getElementById("contenedorCampo8");

    if (etiquetaEnlace) {
        etiquetaEnlace.target = "_blank";
        if (hojaSeleccionada === "Hospitalidad") {
            etiquetaEnlace.href = "https://github.io";
            etiquetaEnlace.innerHTML = "🏨 Hospitalidad";
        } else if (hojaSeleccionada === "Superintendentes") {
            etiquetaEnlace.href = "https://github.io";
            etiquetaEnlace.innerHTML = "👥 Superintendentes";
        } else if (hojaSeleccionada === "Seguridad") {
            etiquetaEnlace.href = `${WEB_APP_URL}?hoja=${encodeURIComponent(hojaSeleccionada)}`;
            etiquetaEnlace.innerHTML = "🛡️ Seguridad";
        } else {
            etiquetaEnlace.href = `${WEB_APP_URL}?hoja=${encodeURIComponent(hojaSeleccionada)}`;
            etiquetaEnlace.innerHTML = `📚 ${hojaSeleccionada}`;
        }
    }

    if (hojaSeleccionada === "Hospitalidad") {
        if (tituloFormulario) tituloFormulario.innerText = "Añadir Registro (Hospitalidad)";
        if (lbl1) lbl1.innerText = "Día";
        if (c4) c4.style.display = "flex";
        if (c5) c5.style.display = "none"; if (c6) c6.style.display = "none"; if (c7) c7.style.display = "none"; if (c8) c8.style.display = "none";

    } else if (hojaSeleccionada === "Seguridad") {
        if (tituloFormulario) tituloFormulario.innerText = "Modificar Programa (Seguridad)";
        if (lbl1) lbl1.innerText = "Fecha / Estado"; 
        if (c4) c4.style.display = "none"; if (c5) c5.style.display = "none";
        if (c6) c6.style.display = "none"; if (c7) c7.style.display = "none"; if (c8) c8.style.display = "none";

    } else if (hojaSeleccionada.includes("Estudios")) {
        if (tituloFormulario) tituloFormulario.innerText = `Añadir Registro (${hojaSeleccionada})`;
        if (lbl1) lbl1.innerText = "Día";
        if (c4) c4.style.display = "flex"; if (c5) c5.style.display = "flex";
        if (c6) c6.style.display = "flex"; if (c7) c7.style.display = "flex"; if (c8) c8.style.display = "flex";

    } else if (hojaSeleccionada.includes("Pastoreo")) {
        if (tituloFormulario) tituloFormulario.innerText = `Añadir Registro (${hojaSeleccionada})`;
        if (lbl1) lbl1.innerText = "Día";
        if (c4) c4.style.display = "flex"; if (c5) c5.style.display = "flex";
        if (c6) c6.style.display = "flex"; if (c7) c7.style.display = "flex"; if (c8) c8.style.display = "flex";
        
    } else {
        if (lbl1) lbl1.innerText = "Grupo / Día";
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
