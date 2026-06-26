// app.js

// 1. Seleccionar los elementos del HTML creados por tus compañeros
const btnCarrito = document.querySelector('header div > button'); // El botón "🛒 Carrito"
const contenedorCarrito = document.querySelector('header div > div'); // La caja desplegable del carrito
const listaCarrito = document.querySelector('header div > div ul'); // La lista de items (<ul>)
const botonesAgregar = document.querySelectorAll('main button'); // Los botones "Agregar al carrito"
const btnComprar = document.querySelector('header div > div button'); // El botón "Comprar"
const modalResumen = document.querySelector('dialog'); // La ventana emergente
const listaResumen = document.querySelector('dialog ol'); // La lista numerada del resumen (<ol>)
const btnCerrarModal = document.querySelector('dialog button'); // El botón "Cerrar"

// Variable para guardar los productos
let carrito = [];

// Ocultar la caja del carrito al cargar la página (para no modificar el CSS de ellos)
contenedorCarrito.style.display = 'none';
// Limpiar los datos "quemados" (hardcodeados) que dejaron de prueba
listaCarrito.innerHTML = '';
listaResumen.innerHTML = '';

// 2. Funcionalidad: Mostrar/Ocultar el carrito
btnCarrito.addEventListener('click', () => {
    if (contenedorCarrito.style.display === 'none') {
        contenedorCarrito.style.display = 'block';
    } else {
        contenedorCarrito.style.display = 'none';
    }
});

// 3. Funcionalidad: Agregar productos al carrito
botonesAgregar.forEach((boton) => {
    boton.addEventListener('click', (e) => {
        // Encontrar el producto al que se le hizo clic
        const productoElement = e.target.parentElement;
        const nombre = productoElement.querySelector('h3').textContent;
        const precio = productoElement.querySelector('p').textContent;

        // Guardar en nuestro arreglo (memoria)
        carrito.push({ nombre, precio });
        
        // Actualizar lo que se ve en la pantalla
        actualizarPantalla();
        alert(`¡Añadiste ${nombre} al carrito!`);
    });
});

// 4. Función para dibujar los items en el HTML
function actualizarPantalla() {
    listaCarrito.innerHTML = '';
    listaResumen.innerHTML = '';

    carrito.forEach((item) => {
        // Crear elemento para la cajita del carrito
        const liCarrito = document.createElement('li');
        liCarrito.textContent = `${item.nombre} - ${item.precio}`;
        listaCarrito.appendChild(liCarrito);

        // Crear elemento para el resumen final
        const liResumen = document.createElement('li');
        liResumen.textContent = item.nombre;
        listaResumen.appendChild(liResumen);
    });
}

// 5. Funcionalidad: Botón Comprar (Abre el resumen)
btnComprar.addEventListener('click', () => {
    if (carrito.length === 0) {
        alert("El carrito está vacío. ¡Agrega algo primero!");
        return;
    }
    contenedorCarrito.style.display = 'none'; // Cierra la cajita
    modalResumen.showModal(); // Abre la ventana emergente nativa
});

// 6. Funcionalidad: Cerrar y finalizar compra
btnCerrarModal.addEventListener('click', () => {
    modalResumen.close();
    alert("¡Gracias por tu compra!");
    carrito = []; // Vaciar el carrito
    actualizarPantalla();
});