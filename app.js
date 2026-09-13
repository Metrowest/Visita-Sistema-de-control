// =========================================================================
// SECCIÓN 1: VARIABLES MAESTRAS DE ACCESO REMOTO (APP.JS)
// Ubicación del bloque: ARRIBA DEL TODO
// =========================================================================

// Enlace exclusivo hacia la base de datos de las hojas (Google Sheets)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5f-HM7FAWTxf3oDPFafcZ4EUL-5Bbt6UtBU6JgqsHIqEGAN1Z5TFyx3af7B6nijvAvg/exec";

// Variable global de memoria para controlar el índice del registro en edición
let registroEditandoIndex = null;

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
// SECCIÓN 3.0 (FIJA - NO SE TOCA): MOTOR CONSTRUCTOR VISUAL DE FILAS (APP.JS)
// Ubicación del bloque: CENTRO (PARTE MEDIA - FUNCIÓN FIJA NUNCA MODIFICAR)
// =========================================================================
function Secc30_1_DibujarRenglonEnPantalla(indice, objetoCampos, columnasVisibles) {
    const tablaCuerpo = document.getElementById("tablaCuerpo");
    
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
// SECCIÓN 3.1 (CONFIGURACIÓN DINÁMICA): DECODIFICADOR MAESTRO DE MATRICES
// Ubicación del bloque: CENTRO (PARTE MEDIA - SECCIÓN DE CAMBIOS FRECUENTES)
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
    // ENRUTADOR DE PROCESAMIENTO VERTICAL CON EXTRACTOR ANTIDESFASE UNIFICADO
    // =========================================================================
    if (hojaActiva.includes("Estudios") || hojaActiva.includes("Pastoreo")) {
        
        let celdasPlanasRaw = [];
        datosMatriz.forEach(fila => {
            if (Array.isArray(fila)) {
                celdasPlanasRaw.push(fila[0] !== undefined && fila[0] !== null ? fila[0].toString().trim() : "");
            } else {
                celdasPlanasRaw.push(fila !== undefined && fila !== null ? fila.toString().trim() : "");
            }
        });

        // REGLA DE DETECCIÓN INTELIGENTE: Si en la Columna A la celda actual y la siguiente 
        // son idénticas, limpiamos el duplicado en memoria para realinear todo el vector vertical
        let celdasPlanas = [];
        for (let k = 0; k < celdasPlanasRaw.length; k++) {
            if (k > 0 && celdasPlanasRaw[k] !== "" && celdasPlanasRaw[k] === celdasPlanasRaw[k-1] && celdasPlanasRaw[k].includes("Dia:")) {
                console.log("¡Desfase físico detectado en la Columna A de la hoja! Corrigiendo alineación...");
                continue; // Saltamos el elemento repetido para empujar las variables un lugar hacia atrás
            }
            celdasPlanas.push(celdasPlanasRaw[k]);
        }
        
        let contadorBloque = 0;
        
        // Recorremos la lista limpia saltando de 8 en 8 celdas consecutivas hacia abajo
        for (let i = 0; i < celdasPlanas.length; i += 8) {
            if (i >= celdasPlanas.length) break;
            if (celdasPlanas[i] === "" && celdasPlanas[i+1] === "" && celdasPlanas[i+2] === "") continue;

            let objetoFila = {
                grupo: celdasPlanas[i] || "",            // Celda 1: Día
                superintendente: celdasPlanas[i+1] || "", // Celda 2: Acompañante o Visitante
                telefono: celdasPlanas[i+2] || "",        // Celda 3: Teléfono o Acompañante
                campo4: celdasPlanas[i+3] || "",          // Celda 4: Hogar o Teléfono
                campo5: celdasPlanas[i+4] || "",          // Celda 5: Contacto o Estudiante
                campo6: celdasPlanas[i+5] || "",          // Celda 6: Dirección
                campo7: celdasPlanas[i+6] || "",          // Celda 7: Detalles o Publicación
                campo8: celdasPlanas[i+7] || ""           // Celda 8: Objetivo o Detalles
            };
            
            Secc30_1_DibujarRenglonEnPantalla(contadorBloque, objetoFila, llavesMapeo);
            contadorBloque++;
        }
        
        if (contadorBloque === 0 && tablaCuerpo) {
            tablaCuerpo.innerHTML = `<tr><td colspan="9">No hay registros válidos guardados en esta sección.</td></tr>`;
        }
        
    } else {
        // Flujo horizontal estándar para las primeras dos pestañas (A, B, C, D)
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
// SECCIÓN 7: RENDERIZADO DINÁMICO DE ARCHIVOS Y ICONOS TEMÁTICOS
// =========================================================================
function renderizarArchivos(archivos) {
    const contenedor = document.getElementById('contenedor-archivos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    archivos.forEach(archivo => {
        // Lógica de renderizado e iconos temáticos establecida en la versión estable
        console.log(`Renderizando: ${archivo.nombre}`);
    });
}

// =========================================================================
// SECCIÓN 8-A: MOTOR DE REEMPLAZO INTELIGENTE Y ALERTAS (COMPATIBLE FIREFOX)
// =========================================================================
async function verificarYReemplazarArchivo(nuevoArchivo) {
    console.log("Iniciando escáner invisible de preexistencia...");
    
    // Simulación del escáner de nombres en el árbol de directorios
    const archivoExistente = await buscarArchivoEnServidor(nuevoArchivo.name);
    
    if (archivoExistente) {
        // Alerta interactiva obligatoria await-promisificada compatible con Firefox
        const confirmar = confirm(`El archivo "${nuevoArchivo.name}" ya existe. ¿Deseas reemplazarlo de forma exacta reteniendo su ID, URL y permisos?`);
        
        if (confirmar) {
            return await ejecutarActualizacionContenido(archivoExistente.id, nuevoArchivo);
        } else {
            console.log("Operación de reemplazo cancelada por el usuario.");
            return null;
        }
    }
    return await subirArchivoNuevo(nuevoArchivo);
}

// =========================================================================
// SECCIÓN 8-B: FILTRADO MODULAR POR CUBÍCULOS Y TIPOS DE DOCUMENTO
// =========================================================================
function inicializarFiltrosCubiculos() {
    const itemsCategoria = document.querySelectorAll('.cat-item');
    
    itemsCategoria.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remueve clase activa de todos los cubículos
            itemsCategoria.forEach(i => i.classList.remove('active'));
            
            // Activa el cubículo seleccionado
            const cubiculoSeleccionado = e.currentTarget;
            cubiculoSeleccionado.classList.add('active');
            
            const tipoFiltro = cubiculoSeleccionado.getAttribute('data-tipo');
            filtrarVistaDocumentos(tipoFiltro);
        });
    });
}

function filtrarVistaDocumentos(tipo) {
    console.log(`Filtrando cubículo principal por tipo: ${tipo}`);
    // Lógica para ocultar/mostrar tarjetas (.item-pdf, .item-excel, etc.) en la grilla
}

// =========================================================================
// SECCIÓN 9: GESTIÓN DE INSTALACIÓN PWA (BANNER TURQUESA AUTOMÁTICO)
// =========================================================================
let deferredPrompt;
const bannerPWA = document.getElementById('banner-pwa');
const btnInstalarPWA = document.getElementById('btn-instalar-pwa');

window.addEventListener('beforeinstallprompt', (e) => {
    // Corregido: Uso de e.preventDefault() para entornos compatibles
    e.preventDefault(); 
    deferredPrompt = e; 
    
    // Disparo automático del banner personalizado
    if (bannerPWA) {
        bannerPWA.classList.remove('d-none');
        bannerPWA.style.display = 'flex';
    }
});

if (btnInstalarPWA) {
    btnInstalarPWA.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Respuesta de la instalación: ${outcome}`);
        
        deferredPrompt = null;
        if (bannerPWA) bannerPWA.style.display = 'none';
    });
}
