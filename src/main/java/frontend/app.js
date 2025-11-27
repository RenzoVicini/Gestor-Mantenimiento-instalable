/* ============================================================
   VALIDACIÓN DE PATENTES Y FORMATO DE FECHAS
   ============================================================ */

// Valida en vivo los formatos de patente Argentina (ABC123 o AB123CD)
function validatePatenteInput(input) {
    let v = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Reglas:
    // ABC123 → 3 letras + 3 números
    // AB123CD → 2 letras + 3 números + 2 letras

    // 1) No permitir más de 3 letras al inicio
    if (/^[A-Z]{4,}/.test(v)) {
        v = v.slice(0, 3); // recorta a 3 letras
    }

    // 2) Si empezó con 3 letras, solo permitir números después
    if (/^[A-Z]{3}/.test(v)) {
        const rest = v.slice(3);
        if (/[^0-9]/.test(rest)) {
            v = v.replace(/[^A-Z0-9]/g, "").replace(/([A-Z]{3}).*/, "$1" + rest.replace(/[^0-9]/g, ""));
        }
        if (rest.length > 3) {
            v = v.slice(0, 6);
        }
    }

    // 3) Si empezó con 2 letras, permitir números y luego hasta 2 letras finales
    if (/^[A-Z]{2}/.test(v) && !/^[A-Z]{3}/.test(v)) {
        const tail = v.slice(2);

        // Bloquear más de 3 números seguidos
        const matchNums = tail.match(/^[0-9]{4,}/);
        if (matchNums) {
            v = v.slice(0, 5);
        }

        // Permitir letras solo después de 2L + 3N
        const numsPart = tail.slice(0, 3);
        const lettersPart = tail.slice(3);

        if (/[^0-9]/.test(numsPart)) {
            v = v.replace(/[^A-Z0-9]/g, "");
            const fixedNums = numsPart.replace(/[^0-9]/g, "");
            v = v.slice(0, 2) + fixedNums;
        }

        if (lettersPart.length > 2) {
            v = v.slice(0, 7);
        }
    }

    input.value = v;
}
const API = "http://localhost:8080/tarjetas";

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    const d = String(fecha.getDate()).padStart(2, '0');
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const y = fecha.getFullYear();
    return `${d}/${m}/${y}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const closeModalHTML = `
        <div id="closeCardModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:2000;">
            <div style="background:#1B2537; padding:20px; border-radius:12px; width:320px; box-shadow:0 4px 18px rgba(0,0,0,0.4);">
                <h3 style="margin-top:0; color:white;">Cerrar Tarjeta</h3>

                <label style="color:#9BA1AE; font-size:12px;">Motivo</label>
                <select id="closeMotivo" style="width:100%; padding:8px; margin:6px 0 20px; border-radius:8px; border:none;">
                    <option value="" disabled selected>Seleccionar...</option>
                    <option value="mantenimiento finalizado en tiempo y forma">Mantenimiento finalizado en tiempo y forma</option>
                    <option value="tarjeta desestimada">Tarjeta desestimada</option>
                </select>

                <label style="color:#9BA1AE; font-size:12px;">Mecánico responsable</label>
                <input id="closeMecanico" type="text" placeholder="Nombre del mecánico" style="color:black; width:95%; padding:8px; margin:6px 0 18px; border-radius:8px; border:none;">

                <div style="display:flex; gap:10px;">
                    <button id="confirmarCerrarBtn" class="btn-primary" style="flex:1;">Cerrar</button>
                    <button id="cancelarCerrarBtn" class="btn-secondary" style="flex:1;">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", closeModalHTML);

    actualizarTablas();

    const confirmarBtn = document.getElementById("confirmarFechaBtn");
    const cancelarBtn = document.getElementById("cancelarFechaBtn");

    if (confirmarBtn) {
        confirmarBtn.addEventListener("click", () => {
            const modal = document.getElementById("dateModal");
            const id = modal.getAttribute("data-id");
            const tipo = modal.getAttribute("data-tipo");
            const fecha = document.getElementById("fechaPicker").value;

            if (!fecha) {
                alert("Debe seleccionar una fecha.");
                return;
            }

            let endpoint = "";
            if (tipo === "programar") {
                endpoint = `${API}/${id}/programar?fecha=${fecha}`;
            } else if (tipo === "reprogramar") {
                endpoint = `${API}/${id}/reprogramar?fecha=${fecha}`;
            }

            fetch(endpoint, { method: "PUT" })
                .then(res => {
                    if (!res.ok) throw new Error("Error en la operación");
                    return res.json();
                })
                .then(() => {
                    cerrarDateModal();
                    actualizarTablas();
                })
                .catch(() => alert("Error al enviar la fecha"));
        });
    }

    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", cerrarDateModal);
    }

    const toggleFormularioBtn = document.getElementById("toggleFormularioBtn");
    const formulario = document.getElementById("formularioSolicitud");

    if (toggleFormularioBtn && formulario) {
        toggleFormularioBtn.addEventListener("click", () => {
            formulario.style.display = formulario.style.display === "none" ? "block" : "none";
        });
    }

    const closeModal = document.getElementById("closeCardModal");
    const confirmarCerrarBtn = document.getElementById("confirmarCerrarBtn");
    const cancelarCerrarBtn = document.getElementById("cancelarCerrarBtn");

    confirmarCerrarBtn.addEventListener("click", () => {
        const id = closeModal.getAttribute("data-id");
        const motivo = document.getElementById("closeMotivo").value;
        const mecanico = document.getElementById("closeMecanico").value.trim();

        if (!motivo || !mecanico) {
            alert("Debe completar todos los campos.");
            return;
        }

        fetch(`${API}/${id}/cerrar?motivo=${encodeURIComponent(motivo)}&mecanico=${encodeURIComponent(mecanico)}`, {
            method: "PUT"
        })
            .then(() => {
                closeModal.style.display = "none";
                actualizarTablas();
            })
            .catch(() => alert("Error al cerrar tarjeta"));
    });

    cancelarCerrarBtn.addEventListener("click", () => {
        closeModal.style.display = "none";
    });
});

/* ============================================================
   CARGA Y ACTUALIZACIÓN DE TABLEROS
   ============================================================ */

function actualizarTablas() {
    cargarTabla("SOLICITUD", "tabla-solicitud");
    cargarTabla("PROGRAMADO", "tabla-programado");
    cargarTabla("CERRADA", "tabla-cerrada");
}

function cargarTabla(estado, tablaId) {
    fetch(`${API}?estado=${estado}`)
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById(
                estado === "SOLICITUD" ? "cards-solicitud" :
                estado === "PROGRAMADO" ? "cards-programado" :
                "cards-cerrada"
            );
            contenedor.innerHTML = "";

            data.forEach(tarjeta => {
                if (estado === "SOLICITUD") {
                    contenedor.innerHTML += renderCardSolicitud(tarjeta);
                } else if (estado === "PROGRAMADO") {
                    contenedor.innerHTML += renderCardProgramado(tarjeta);
                } else {
                    contenedor.innerHTML += renderCardCerrada(tarjeta);
                }
            });
        });
}

/* ============================================================
   RENDERIZADO DE TARJETAS SEGÚN ESTADO
   ============================================================ */

function renderCardSolicitud(t) {
    return `
    <div class="card">
        <div class="card-header">
            <div class="card-row">
                <div class="card-col">
                    <div class="card-label">ID</div>
                    <div class="card-value">${t.id}</div>
                </div>
                <div class="card-col" style="text-align:right;">
                    <div class="card-label">Patente</div>
                    <div class="card-value">${t.patenteCamion}</div>
                </div>
            </div>
        </div>

        <div class="card-section">
            <div class="card-label">Descripción</div>
            <div class="card-value">${t.descripcionSolicitud}</div>
        </div>

        <div class="card-actions">
            <button class="btn-primary" onclick="programar(${t.id})">Programar</button>
            <button class="btn-secondary" onclick="cerrar(${t.id})">Desestimar</button>
        </div>
    </div>`;
}

function renderCardProgramado(t) {
    return `
    <div class="card">

        <div class="card-header">
            <div class="card-row">
                <div class="card-col">
                    <div class="card-label">ID</div>
                    <div class="card-value">${t.id}</div>
                </div>
                <div class="card-col" style="text-align:right;">
                    <div class="card-label">Patente</div>
                    <div class="card-value">${t.patenteCamion}</div>
                </div>
            </div>
        </div>

        <div class="card-section">
            <div class="card-label">Fecha Mantenimiento</div>
            <div class="card-value">${formatearFecha(t.fechaProgramada)}</div>
        </div>

        <div class="card-actions">
            <button class="btn-primary" onclick="reprogramar(${t.id})">Reprogramar</button>
            <button class="btn-secondary" onclick="cerrar(${t.id})">Cerrar</button>
        </div>
    </div>`;
}

function renderCardCerrada(t) {
    return `
    <div class="card">

        <div class="card-header">
            <div class="card-row">
                <div class="card-col">
                    <div class="card-label">ID</div>
                    <div class="card-value">${t.id}</div>
                </div>
                <div class="card-col" style="text-align:right;">
                    <div class="card-label">Patente</div>
                    <div class="card-value">${t.patenteCamion}</div>
                </div>
            </div>
        </div>

        <div class="card-section">
            <div class="card-label">Motivo</div>
            <div class="card-value">${t.motivoCierre}</div>
        </div>

        <div class="card-section">
            <div class="card-label">Mecánico</div>
            <div class="card-value">${t.mecanicoResponsable ?? "-"}</div>
        </div>

        <div class="card-section">
            <div class="card-label">Fecha cierre</div>
            <div class="card-value">${formatearFecha(t.fechaCierre)}</div>
        </div>
    </div>`;
}

/* ============================================================
   ACCIONES POR ESTADO (opcional)
   ============================================================ */

function obtenerAcciones(t) {
    if (t.estado === "SOLICITUD") {
        return `<button onclick="programar(${t.id})">Programar</button>`;
    }
    if (t.estado === "PROGRAMADO") {
        return `
            <button onclick="reprogramar(${t.id})">Reprogramar</button>
            <button onclick="cerrar(${t.id})">Cerrar</button>
        `;
    }
    return `N/A`;
}

/* ============================================================
   CONTROL DE MODAL DE FECHAS
   ============================================================ */

function abrirDateModal(id, tipo) {
    const modal = document.getElementById("dateModal");
    modal.style.display = "flex";
    modal.setAttribute("data-id", id);
    modal.setAttribute("data-tipo", tipo);
}

function cerrarDateModal() {
    const modal = document.getElementById("dateModal");
    modal.style.display = "none";
    modal.removeAttribute("data-id");
    modal.removeAttribute("data-tipo");
}

/* ============================================================
   CREACIÓN DE TARJETAS (SOLICITUDES)
   ============================================================ */
function crearTarjeta() {
    console.log("Intentando crear tarjeta...");

    const tarjeta = {
        patenteCamion: document.getElementById("patente").value.trim(),
        descripcionSolicitud: document.getElementById("descripcion").value.trim()
    };

    if (!tarjeta.patenteCamion || !tarjeta.descripcionSolicitud) {
        alert("Debe completar ambos campos.");
        return;
    }

    // Validación de formato de patente (Argentina)
    const regexPatente = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;

    if (!regexPatente.test(tarjeta.patenteCamion)) {
        alert("La patente no es válida. Formatos permitidos: ABC123 o AB123CD");
        return;
    }

    // Límite de caracteres para descripción
    if (tarjeta.descripcionSolicitud.length > 120) {
        alert("La descripción no puede superar los 120 caracteres.");
        return;
    }

    fetch(API, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(tarjeta)
    })
        .then(res => {
            if (!res.ok) {
                return res.text().then(msg => { throw new Error(msg); });
            }
            return res.json();
        })
        .then(() => {
            alert("Solicitud creada correctamente ✅");
            document.getElementById("formularioSolicitud").style.display = "none";
            actualizarTablas();
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Error al crear la solicitud ❌");
        });
}

/* ============================================================
   OPERACIONES SOBRE TARJETAS (PROGRAMAR / REPROGRAMAR / CERRAR)
   ============================================================ */
function programar(id) {
    abrirDateModal(id, "programar");
}

function reprogramar(id) {
    abrirDateModal(id, "reprogramar");
}

function cerrar(id) {
    const modal = document.getElementById("closeCardModal");
    modal.style.display = "flex";
    modal.setAttribute("data-id", id);
}