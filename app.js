/* =============================================
   MINI TIENDA — App JavaScript
   Archivo principal de lógica de la aplicación.
   Contiene: Carrito de compras, Panel lateral,
   Dialog modal, Notificaciones Toast, y Buscador.
   ============================================= */

// Esperamos a que todo el HTML se cargue antes de ejecutar el código.
// "DOMContentLoaded" se dispara cuando el navegador termina de leer el HTML.
// Esto evita errores al intentar acceder a elementos que aún no existen.
document.addEventListener('DOMContentLoaded', () => {

  // =========================================================
  // ESTADO DEL CARRITO (Variable global de la aplicación)
  // =========================================================
  // "cart" es un arreglo (array) que almacena los productos agregados.
  // Cada producto es un objeto con: { name: "Camisa", price: 12.00, qty: 1 }
  // "let" permite reasignar la variable (necesario al vaciar el carrito).
  let cart = [];

  // =========================================================
  // REFERENCIAS AL DOM
  // Usamos document.getElementById() y document.querySelectorAll()
  // para obtener referencias a los elementos HTML que necesitamos
  // manipular. Los guardamos en constantes ("const") para reutilizarlos.
  // =========================================================

  // --- Elementos del panel del carrito ---
  // Botón "🛒 Carrito" en el header que abre/cierra el panel
  const cartBtn = document.getElementById('cart-btn');
  // Panel lateral (<aside>) que contiene la lista del carrito
  const cartPanel = document.getElementById('cart-panel');
  // Fondo oscuro semitransparente que aparece detrás del panel
  const cartOverlay = document.getElementById('cart-overlay');
  // Lista <ul> donde se renderizan los items del carrito dinámicamente
  const cartItemsList = document.getElementById('cart-items');
  // <span> que muestra el número de items en el botón del carrito
  const cartCount = document.getElementById('cart-count');
  // <span> que muestra el precio total en el footer del panel
  const cartTotal = document.getElementById('cart-total');
  // Botón "Comprar" dentro del panel del carrito
  const buyBtn = document.getElementById('buy-btn');
  // Botón "✕" para cerrar el panel del carrito
  const cartCloseBtn = document.getElementById('cart-close-btn');

  // --- Elementos del buscador ---
  // Campo de texto <input> en el header para buscar productos
  const searchInput = document.getElementById('search-input');
  // Todas las tarjetas de producto (<li class="product-card">)
  // querySelectorAll devuelve una NodeList (similar a un array)
  const productCards = document.querySelectorAll('.product-card');
  // Mensaje "No se encontraron productos" que se muestra/oculta
  const noResults = document.getElementById('no-results');

  // --- Elementos del dialog (modal de compra) ---
  // El elemento <dialog> nativo de HTML5 para el resumen de compra
  const dialog = document.getElementById('purchase-dialog');
  // Lista <ol> dentro del dialog donde se muestran los productos comprados
  const dialogItemsList = document.getElementById('dialog-items');
  // <span> que muestra el total dentro del dialog
  const dialogTotal = document.getElementById('dialog-total-value');
  // Botón "Cancelar" del dialog
  const dialogCloseBtn = document.getElementById('dialog-close-btn');
  // Botón "Confirmar Compra" del dialog
  const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');

  // --- Elementos de notificaciones ---
  // Contenedor <div> fijo en la esquina inferior derecha para los toasts
  const toastContainer = document.getElementById('toast-container');

  // --- Botones "Agregar al carrito" de cada producto ---
  // Selecciona TODOS los botones con la clase "add-to-cart-btn"
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  // =========================================================
  // 1. CARRITO: Agregar productos
  // Cada botón "Agregar al carrito" tiene un evento click
  // que lee los datos del producto y lo agrega al array "cart".
  // =========================================================

  // .forEach() recorre cada botón encontrado y le asigna un evento
  addToCartBtns.forEach((btn) => {
    // Escuchamos el evento "click" en cada botón
    btn.addEventListener('click', () => {
      // .closest() busca el ancestro más cercano con la clase "product-card"
      // Esto nos permite acceder a los datos (data-name, data-price) del producto
      const card = btn.closest('.product-card');
      console.log('hello, world');
      // .dataset accede a los atributos "data-*" del HTML
      // data-name="Camisa" → card.dataset.name = "Camisa"
      const name = card.dataset.name;
      console.log("nombre", name);
      // data-price="12.00" viene como string, parseFloat() lo convierte a número
      // parseFloat("12.00") → 12.00
      const price = parseFloat(card.dataset.price);
      console.log("precio", price);

      // Buscamos si el producto ya existe en el carrito
      // .find() retorna el primer elemento que cumple la condición, o undefined
      const existingItem = cart.find((item) => item.name === name);

      if (existingItem) {
        // Si ya existe, simplemente incrementamos la cantidad en 1
        existingItem.qty += 1;
      } else {
        // Si no existe, agregamos un nuevo objeto al array del carrito
        // { name, price, qty: 1 } es shorthand para { name: name, price: price, qty: 1 }
        cart.push({ name, price, qty: 1 });
      }

      // Actualizamos toda la interfaz del carrito (contador, lista, total)
      updateCartUI();

      // Mostramos una notificación toast confirmando la acción
      // Template literal (backticks `) permite insertar variables con ${}
      showToast(`✅ ${name} agregado al carrito`);

      // Ejecutamos la animación "bump" en el contador del carrito
      animateCartCount();
    });
  });

  // =========================================================
  // 2. CARRITO: Eliminar productos
  // Función que remueve un producto del carrito por su nombre.
  // =========================================================
  function removeFromCart(name) {
    // .filter() crea un NUEVO array excluyendo el item con el nombre dado
    // Solo mantiene los items cuyo nombre NO coincide con el parámetro
    // Ejemplo: si name="Camisa", se quedan todos excepto "Camisa"
    cart = cart.filter((item) => item.name !== name);

    // Actualizamos la interfaz para reflejar el cambio
    updateCartUI();

    // Mostramos un toast de tipo "warning" (amarillo) confirmando la eliminación
    showToast(`🗑️ ${name} eliminado del carrito`, 'warning');
  }

  // =========================================================
  // 3. CARRITO: Actualizar la interfaz (UI)
  // Esta función se llama cada vez que el carrito cambia.
  // Recalcula totales y re-renderiza la lista de items.
  // =========================================================
  function updateCartUI() {
    // .reduce() recorre el array y acumula un valor
    // Aquí suma todas las cantidades (qty) para obtener el total de items
    // Empieza con sum=0 y en cada iteración suma item.qty
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // Calcula el precio total: precio × cantidad de cada item, todo sumado
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // --- Actualizar el contador visual en el botón del carrito ---
    // .textContent cambia el texto visible del elemento
    cartCount.textContent = totalItems;
    // dataset.count actualiza el atributo data-count (usado por CSS para mostrar/ocultar)
    cartCount.dataset.count = totalItems;

    // --- Actualizar el texto del total ---
    // .toFixed(2) formatea el número con 2 decimales: 47 → "47.00"
    cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

    // --- Habilitar/deshabilitar botón "Comprar" ---
    // Si el carrito está vacío (length === 0), disabled = true → botón gris
    // Si tiene items, disabled = false → botón activo
    buyBtn.disabled = cart.length === 0;

    // --- Renderizar la lista de items del carrito ---
    // Si el carrito está vacío, mostramos un mensaje
    if (cart.length === 0) {
      // .innerHTML permite insertar HTML como string dentro del elemento
      cartItemsList.innerHTML = `
        <li class="cart-empty-msg">
          <span class="empty-icon">🛒</span>
          Tu carrito está vacío
        </li>
      `;
      // "return" detiene la función aquí, no ejecuta el código de abajo
      return;
    }

    // Si hay items, generamos el HTML de cada uno
    // .map() transforma cada objeto del array en un string de HTML
    // .join('') une todos los strings en uno solo (sin separador)
    cartItemsList.innerHTML = cart
      .map(
        (item) => `
      <li class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price.toFixed(2)} × ${item.qty}</span>
          <span class="cart-item-qty">Subtotal: $${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <button class="cart-item-remove" data-name="${item.name}" title="Eliminar" aria-label="Eliminar ${item.name}">✕</button>
      </li>
    `
      )
      .join('');

    // --- Asignar eventos a los botones de eliminar recién creados ---
    // Como los botones se generaron dinámicamente con innerHTML,
    // debemos agregar los event listeners DESPUÉS de crearlos
    cartItemsList.querySelectorAll('.cart-item-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        // Leemos el data-name del botón para saber qué producto eliminar
        removeFromCart(btn.dataset.name);
      });
    });
  }

  // =========================================================
  // Animación "bump" del contador
  // Hace que el número del carrito "salte" brevemente.
  // =========================================================
  function animateCartCount() {
    // Primero quitamos la clase "bump" por si ya la tenía
    cartCount.classList.remove('bump');

    // "void cartCount.offsetWidth" fuerza al navegador a recalcular el layout.
    // Esto es un truco para reiniciar una animación CSS:
    // sin esta línea, quitar y agregar la clase en el mismo ciclo no dispara la animación.
    void cartCount.offsetWidth;

    // Agregamos la clase "bump" que activa la animación CSS @keyframes bump
    cartCount.classList.add('bump');
  }

  // =========================================================
  // 4. TOGGLE DEL CARRITO (Abrir / Cerrar)
  // El panel del carrito se desliza desde la derecha.
  // Un overlay oscuro aparece detrás para enfocarse en el carrito.
  // =========================================================

  // Función para ABRIR el panel del carrito
  function openCart() {
    // .classList.add() agrega una clase CSS al elemento
    // La clase "open" mueve el panel de right:-420px a right:0 (visible)
    cartPanel.classList.add('open');
    // La clase "visible" hace visible el overlay (fondo oscuro)
    cartOverlay.classList.add('visible');
    // Deshabilitamos el scroll del body para que no se desplace detrás del panel
    document.body.style.overflow = 'hidden';
  }

  // Función para CERRAR el panel del carrito
  function closeCart() {
    // .classList.remove() quita la clase, volviendo el panel a su posición oculta
    cartPanel.classList.remove('open');
    // Ocultamos el overlay
    cartOverlay.classList.remove('visible');
    // Restauramos el scroll normal del body (string vacío = valor por defecto)
    document.body.style.overflow = '';
  }

  // Evento click en el botón "🛒 Carrito" — funciona como toggle (abrir/cerrar)
  cartBtn.addEventListener('click', () => {
    // .classList.contains() verifica si el elemento tiene la clase
    if (cartPanel.classList.contains('open')) {
      // Si ya está abierto, lo cerramos
      closeCart();
    } else {
      // Si está cerrado, lo abrimos
      openCart();
    }
  });

  // Al hacer clic en el botón "✕" del panel, cerramos el carrito
  cartCloseBtn.addEventListener('click', closeCart);

  // Al hacer clic en el overlay (fondo oscuro), también cerramos el carrito
  cartOverlay.addEventListener('click', closeCart);

  // --- Cerrar el carrito con la tecla Escape ---
  // Escuchamos el evento "keydown" en todo el documento
  document.addEventListener('keydown', (e) => {
    // e.key contiene el nombre de la tecla presionada
    if (e.key === 'Escape') {
      closeCart();
    }
  });

  // =========================================================
  // 5. DIALOG: Resumen de compra (Modal nativo de HTML5)
  // Al presionar "Comprar", se abre un modal con el resumen.
  // Usa la API nativa <dialog> con showModal() y close().
  // =========================================================

  // Evento click en el botón "Comprar"
  buyBtn.addEventListener('click', () => {
    // Si el carrito está vacío, no hacemos nada
    // "return" sale de la función inmediatamente
    if (cart.length === 0) return;

    // Calculamos el total de la compra
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Generamos el HTML de la lista de items para el dialog
    // Mismo patrón que en updateCartUI: .map() + .join('')
    dialogItemsList.innerHTML = cart
      .map(
        (item) => `
      <li>
        <span class="dialog-item-name">${item.name}</span>
        <span class="dialog-item-detail">×${item.qty} — $${(item.price * item.qty).toFixed(2)}</span>
      </li>
    `
      )
      .join('');

    // Mostramos el total en el dialog
    dialogTotal.textContent = `$${totalPrice.toFixed(2)}`;

    // Primero cerramos el panel del carrito para que no se superponga
    closeCart();

    // .showModal() es un método nativo del elemento <dialog>
    // Abre el dialog como un modal: bloquea la interacción con el resto de la página
    // y muestra el backdrop (fondo oscuro del ::backdrop en CSS)
    dialog.showModal();
  });

  // Botón "Cancelar" dentro del dialog — cierra sin hacer nada
  dialogCloseBtn.addEventListener('click', () => {
    // .close() es el método nativo de <dialog> para cerrarlo
    dialog.close();
  });

  // Botón "Confirmar Compra" — finaliza la compra
  dialogConfirmBtn.addEventListener('click', () => {
    // Cerramos el dialog
    dialog.close();

    // Vaciamos el carrito asignando un array vacío
    cart = [];

    // Actualizamos la interfaz (mostrará "carrito vacío")
    updateCartUI();

    // Mostramos un toast de éxito
    showToast('🎉 ¡Compra realizada con éxito!', 'success');
  });

  // --- Cerrar dialog al hacer clic en el backdrop (fuera del contenido) ---
  dialog.addEventListener('click', (e) => {
    // e.target es el elemento exacto donde se hizo clic
    // Si es el propio <dialog> (el backdrop) y no un hijo, cerramos
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // =========================================================
  // 6. NOTIFICACIONES TOAST
  // Mensajes temporales que aparecen en la esquina inferior
  // derecha y desaparecen automáticamente después de 3 segundos.
  // =========================================================

  // Parámetro "type" tiene valor por defecto "success" (si no se especifica)
  function showToast(message, type = 'success') {
    // document.createElement() crea un nuevo elemento <div> en memoria
    const toast = document.createElement('div');

    // Asignamos las clases CSS: "toast" (estilos base) + "toast-success/warning/error"
    toast.className = `toast toast-${type}`;

    // Objeto que mapea cada tipo de toast a su ícono correspondiente
    const iconMap = {
      success: '✅',   // Para acciones exitosas (agregar, confirmar compra)
      warning: '⚠️',   // Para advertencias (eliminar del carrito)
      error: '❌',     // Para errores (no usado actualmente, pero disponible)
    };

    // Insertamos el HTML del toast con su ícono y mensaje
    // iconMap[type] busca el ícono según el tipo; si no existe, usa '✅'
    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || '✅'}</span>
      <span>${message}</span>
    `;

    // .appendChild() agrega el toast al contenedor visible en la página
    toastContainer.appendChild(toast);

    // setTimeout() ejecuta una función después de un tiempo (en milisegundos)
    // 3000ms = 3 segundos — tiempo para que se lea y se reproduzca la animación de salida
    setTimeout(() => {
      // Verificamos que el toast todavía esté en el DOM antes de eliminarlo
      // (podría haber sido eliminado manualmente)
      if (toast.parentNode) {
        // .remove() elimina el elemento del DOM
        toast.remove();
      }
    }, 3000);
  }

  // =========================================================
  // 7. BUSCADOR / FILTRO DE PRODUCTOS
  // Filtra las tarjetas de producto en tiempo real según
  // lo que el usuario escribe en el campo de búsqueda.
  // =========================================================

  // "input" se dispara cada vez que cambia el valor del campo
  // (cada tecla presionada, pegado de texto, etc.)
  searchInput.addEventListener('input', () => {
    // Obtenemos el texto escrito, lo convertimos a minúsculas y quitamos espacios
    // .toLowerCase() → para que la búsqueda no distinga mayúsculas/minúsculas
    // .trim() → elimina espacios al inicio y final del texto
    const query = searchInput.value.toLowerCase().trim();

    // Contador de productos visibles (que coinciden con la búsqueda)
    let visibleCount = 0;

    // Recorremos cada tarjeta de producto
    productCards.forEach((card) => {
      // Obtenemos el nombre del producto del atributo data-name y lo pasamos a minúsculas
      const name = card.dataset.name.toLowerCase();

      // .includes() verifica si el nombre contiene el texto buscado
      // Ejemplo: "camisa".includes("cam") → true
      const matches = name.includes(query);

      // .classList.toggle(clase, condición):
      // Si condición es true → agrega la clase
      // Si condición es false → quita la clase
      // Aquí: si NO coincide (!matches), agrega "hidden" (oculta la tarjeta)
      card.classList.toggle('hidden', !matches);

      // Si coincide, incrementamos el contador
      if (matches) visibleCount++;
    });

    // Mostramos el mensaje "No se encontraron productos" solo si:
    // - No hay productos visibles (visibleCount === 0)
    // - Y el usuario escribió algo (query.length > 0)
    // Si el campo está vacío, no mostramos el mensaje
    noResults.classList.toggle('visible', visibleCount === 0 && query.length > 0);
  });

  // =========================================================
  // INICIALIZACIÓN
  // Llamamos a updateCartUI() una vez al cargar la página
  // para mostrar el estado inicial del carrito (vacío).
  // =========================================================
  updateCartUI();

  // Fin del evento DOMContentLoaded
});
