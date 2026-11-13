# KOVALENKO — demo

Catálogo de calzado en ruso. Web estática: servir la raíz, sin instalación ni compilación.

- 10 modelos con las 30 fotografías proporcionadas: frontal, lateral y trasera en tres cuartos.
- Fotos de detalle WebP sin pérdida, a resolución original; tarjetas de 640 px para cargar rápido.
- Galería con miniaturas, flechas, teclado y ampliación.
- Selección de talla obligatoria; carrito por modelo y talla, cantidades, eliminación y total.
- Carrito conservado en localStorage. Si el navegador bloquea el almacenamiento, funciona durante la sesión.
- Resumen final del pedido con vuelta al carrito y opción de seguir comprando.

Las tallas 35–40, los códigos KOV y los precios son datos de demostración, no inventario confirmado. Los precios de las primeras ocho posiciones se conservan del catálogo anterior; las dos nuevas posiciones tienen precios provisionales.

La pasarela de pagos no está configurada: no se cobran pagos ni se envían pedidos reales. Para habilitar cobros es necesario integrar un proveedor de pago, validar precios y disponibilidad en un servidor y confirmar la operación mediante webhook. Nunca recopilar datos de tarjeta en esta web estática.
