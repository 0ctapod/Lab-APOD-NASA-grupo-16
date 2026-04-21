const CLAVE_API = "M5L9IVwKtS0EMiVMpbR5o9UuzheKfD3YHs3qIOoe";
const URL_BASE = "https://api.nasa.gov/planetary/apod";

const contenedorApod = document.getElementById("contenedorApod");
const listaFavoritos = document.getElementById("listaFavoritos");
const entradaFecha = document.getElementById("entradaFecha");
const botonBuscar = document.getElementById("botonBuscar");
const botonHoy = document.getElementById("botonHoy");

let apodActual = null;

async function obtenerApod(fecha = "") {
    try {
        let url = `${URL_BASE}?api_key=${CLAVE_API}`;

        if (fecha) {
            url += `&date=${fecha}`;
        }

        console.log("Consultando URL:", url);

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!datos || !datos.url) {
            throw new Error("La API no devolvió una APOD válida");
        }

        apodActual = datos;
        mostrarApod(datos);
    } catch (error) {
        console.error("Error al obtener APOD:", error);

        contenedorApod.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar la APOD: ${error.message}
            </div>
        `;
    }
}

function mostrarApod(datos) {
    let contenidoMultimedia = "";

    if (datos.media_type === "image") {
        contenidoMultimedia = `
            <img src="${datos.url}" alt="${datos.title}" class="img-fluid shadow rounded">
        `;
    } else if (datos.media_type === "video") {
        contenidoMultimedia = `
            <div class="ratio ratio-16x9">
                <iframe src="${datos.url}" title="${datos.title}" allowfullscreen></iframe>
            </div>
            <p class="mt-2">
                Si el video no se visualiza correctamente, ábrelo
                <a href="${datos.url}" target="_blank" class="link-warning">aquí</a>.
            </p>
        `;
    } else {
        contenidoMultimedia = `
            <div class="alert alert-warning">
                No se pudo mostrar el contenido multimedia.
            </div>
        `;
    }

    contenedorApod.innerHTML = `
        <div class="card bg-secondary text-light">
            <div class="card-body">
                <h2 class="card-title">${datos.title}</h2>
                <p class="text-warning fw-bold">${datos.date}</p>

                <div class="mb-3 text-center">
                    ${contenidoMultimedia}
                </div>

                <p class="card-text">${datos.explanation}</p>

                <button class="btn btn-success" onclick="agregarAFavoritos()">
                    Guardar en favoritos
                </button>
            </div>
        </div>
    `;
}

function obtenerFavoritos() {
    return JSON.parse(localStorage.getItem("favoritos")) || [];
}

function guardarFavoritos(favoritos) {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function agregarAFavoritos() {
    if (!apodActual || !apodActual.date || !apodActual.title) {
        alert("No hay una APOD válida para guardar");
        return;
    }

    const favoritos = obtenerFavoritos();

    const yaExiste = favoritos.some(item => item && item.date === apodActual.date);

    if (yaExiste) {
        alert("Esta APOD ya está guardada en favoritos");
        return;
    }

    favoritos.push(apodActual);
    guardarFavoritos(favoritos);
    mostrarFavoritos();
}

function mostrarFavoritos() {
    const favoritos = obtenerFavoritos();
    const favoritosValidos = favoritos.filter(item => item && item.date && item.title);

    if (favoritosValidos.length === 0) {
        listaFavoritos.innerHTML = `
            <li class="list-group-item bg-dark text-light">
                No hay favoritos guardados
            </li>
        `;
        return;
    }

    listaFavoritos.innerHTML = "";

    favoritosValidos.forEach(item => {
        const elemento = document.createElement("li");
        elemento.className = "list-group-item bg-dark text-light item-favorito";
        elemento.textContent = `${item.date} - ${item.title}`;

        elemento.addEventListener("click", () => {
            apodActual = item;
            mostrarApod(item);
        });

        listaFavoritos.appendChild(elemento);
    });
}

function validarFecha(fechaSeleccionada) {
    const fechaHoy = new Date().toISOString().split("T")[0];
    return fechaSeleccionada <= fechaHoy;
}

botonBuscar.addEventListener("click", () => {
    const fechaSeleccionada = entradaFecha.value;

    if (!fechaSeleccionada) {
        alert("Por favor selecciona una fecha");
        return;
    }

    if (!validarFecha(fechaSeleccionada)) {
        alert("No puedes seleccionar una fecha futura");
        return;
    }

    obtenerApod(fechaSeleccionada);
});

botonHoy.addEventListener("click", () => {
    obtenerApod();
});

window.addEventListener("DOMContentLoaded", () => {
    entradaFecha.max = new Date().toISOString().split("T")[0];
    obtenerApod();
    mostrarFavoritos();
});