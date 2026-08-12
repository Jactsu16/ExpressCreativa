(() => {
  "use strict";
  const PHONE = "50766043511";

  document.querySelectorAll(".sku-whatsapp").forEach((link) => {
    const sku = link.dataset.sku;
    const product = link.dataset.product;
    const unit = link.dataset.unit || "unidad";
    const quantity = Math.max(1, Number(link.dataset.quantity) || 1);
    const unitPrice = link.dataset.price || "Pendiente de confirmar";
    if (!sku || !product) return;

    const message = [
      "Hola, quiero solicitar información sobre este producto o servicio:",
      `SKU: ${sku}`,
      `Producto/servicio: ${product}`,
      `Unidad de venta: ${unit}`,
      `Cantidad inicial: ${quantity}`,
      `Precio unitario referencial: ${unitPrice}`,
      "",
      "Entiendo que este mensaje no confirma disponibilidad, reserva, precio final ni contratación.",
    ].join("\n");

    link.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Consultar ${product}, SKU ${sku}, por WhatsApp`);
  });
})();
