document.addEventListener('DOMContentLoaded', () => {
    const tipoPrestamoDesplegable = document.getElementById('tipoPrestamoDesplegable');

    fetch('./prestamos.json')
        .then(response => response.json())
        .then(prestamos => {
            prestamos.forEach(prestamo => {
                const eleccionPrestamo = document.createElement('option');
                eleccionPrestamo.value = prestamo.tipo;
                eleccionPrestamo.text = prestamo.tipo;
                tipoPrestamoDesplegable.appendChild(eleccionPrestamo);
            });
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No fue posible cargar los préstamos. Intentalo más tarde.',
            });
        });
});

function obtenerTasa(tipo) {
    return fetch('./prestamos.json')
        .then(response => response.json())
        .then(prestamos => {
            const prestamo = prestamos.find(p => p.tipo === tipo);
            return prestamo ? prestamo.tasa : null;
        });
}

const calcularCuotaMensual = (tipo, plazo, monto) =>
    obtenerTasa(tipo).then(tasa => {
        if (tasa) {
            return ((monto * tasa) / (1 - Math.pow(1 + tasa, -plazo))).toFixed(2);
        }
        return null;
    });

function calcularPrestamo() {
    const tipo = document.getElementById('tipoPrestamoDesplegable').value;
    const monto = Math.abs(parseFloat(document.getElementById('monto').value));
    const plazo = Math.abs(parseInt(document.getElementById('plazo').value));

    if (isNaN(monto) || isNaN(plazo) || monto <= 0 || plazo <= 0) {
        Swal.fire({
            title: "Error en los datos ingresados",
            text: "Por favor ingrese valores válidos para los campo plazo y monto.",
            icon: "info"
        });
        return;
    }

    calcularCuotaMensual(tipo, plazo, monto).then(cuotaMensual => {
        if (cuotaMensual !== null) {
            obtenerTasa(tipo).then(tasa => {
                const prestamoSeleccionado = { tipo, plazo, monto, cuotaMensual, tasa };

                let simulaciones = JSON.parse(localStorage.getItem('simulaciones')) || [];
                
                simulaciones.push(prestamoSeleccionado);
                
                localStorage.setItem('simulaciones', JSON.stringify(simulaciones));

                mostrarResumen();
            });
        } else {
            Swal.fire({
                title: "Error",
                text: "No se pudo calcular la cuota mensual.",
                icon: "error"
            });
        }
    });
}

function mostrarResumen() {
    const simulaciones = JSON.parse(localStorage.getItem('simulaciones')) || [];
    const resultadoElement = document.getElementById('simulacion');

    if (simulaciones.length > 0) {
        resultadoElement.innerHTML = simulaciones.map(simulacion => `
            <div class="card mb-3" style="background-color: rgb(8, 161, 231); color: white;">
                <div class="card-body">
                    <h5 class="card-title">Resumen de la Simulación</h5>
                    <p class="card-text">Tipo de Préstamo: ${simulacion.tipo}</p>
                    <p class="card-text">Monto: ${simulacion.monto} pesos</p>
                    <p class="card-text">Plazo: ${simulacion.plazo} meses</p>
                    <p class="card-text">Tasa aplicada: ${(simulacion.tasa * 100).toFixed(2)}% mensual</p>
                    <p class="card-text">Cuota Mensual: ${simulacion.cuotaMensual} pesos</p>
                </div>
            </div>
        `).join('');

        resultadoElement.innerHTML += `
            <div class="d-flex flex-column gap-3">
                <button type="button" class="btn btn-primary w-100"
                    style="background-color: rgba(8, 160, 231, 0.836); color: rgb(238, 250, 235); font-family: 'IBM Plex Mono', monospace;"
                    onclick="reiniciarFormulario()">Volver a Simular
                </button>
                <button type="button" class="btn btn-danger w-100"
                    style="background-color: rgba(231, 76, 60, 0.836); color: white; font-family: 'IBM Plex Mono', monospace;"
                    onclick="limpiarSimulaciones()">Limpiar Resumen
                </button>
            </div>
        `;
    }
}

function reiniciarFormulario() {
    document.getElementById('prestamoForm').reset();
}

function limpiarSimulaciones() {
    localStorage.removeItem('simulaciones');
    document.getElementById('simulacion').innerHTML = "";
    document.getElementById('prestamoForm').reset();
}

document.addEventListener('DOMContentLoaded', () => {
    const botonCalcular = document.querySelector('.button_grey');
    botonCalcular.addEventListener('click', calcularPrestamo);
});

function agregarCotizaciones(cotizaciones) {
    const container = document.getElementById('cards-container');

    cotizaciones.forEach(element => {
        const card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-md-4'; 
        card.innerHTML = `
            <div class="cotizacion-card">
                <h5 class="h5-card">${element.nombre} (${element.moneda})</h5>
                ${element.compra !== null ? `<p>Compra: ${element.compra}</p>` : ''}
                ${element.venta !== null ? `<p>Venta: ${element.venta}</p>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

fetch("https://uy.dolarapi.com/v1/cotizaciones")
    .then(response => response.json())
    .then(data => {
        agregarCotizaciones(data);
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No fue posible obtener las cotizaciones. Intenta nuevamente más tarde.',
        });
    });


