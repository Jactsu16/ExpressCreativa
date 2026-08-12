(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const upload = $("sweater-upload");
  const art = $("sweater-art");
  const zone = $("sweater-zone");
  const scale = $("sweater-scale");
  const quality = $("sweater-quality");
  const position = { x: 50, y: 42 };
  const state = { width: 0, height: 0, name: "" };
  const PRINT_WIDTH_CM = 34;
  const MIN_DPI = 150;
  const PRODUCT_SKU = "EC-PR-SWT-001";
  const MAX_IMAGE_PIXELS = 40_000_000;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function renderPosition() {
    art.style.left = `${position.x}%`;
    art.style.top = `${position.y}%`;
  }

  function checkScale() {
    let value = Number(scale.value);
    if (state.width) {
      const maxWidthCm = (state.width / MIN_DPI) * 2.54;
      const safePercent = Math.floor((maxWidthCm / PRINT_WIDTH_CM) * 100);
      if (value > safePercent) {
        value = Math.max(Number(scale.min), safePercent);
        scale.value = String(value);
        quality.dataset.state = "error";
        quality.textContent = "No puedes agrandarlo más: la imagen no tiene resolución suficiente. Usa un PNG mayor o un SVG/PDF vectorial.";
      } else {
        const cm = PRINT_WIDTH_CM * value / 100;
        const dpi = Math.round(state.width / (cm / 2.54));
        quality.dataset.state = "ok";
        quality.textContent = `Calidad permitida: aproximadamente ${dpi} DPI a ${cm.toFixed(1)} cm.`;
      }
    }
    const cm = PRINT_WIDTH_CM * value / 100;
    $("sweater-scale-value").textContent = `${cm.toFixed(1)} cm`;
    art.style.width = `${value}%`;
  }

  upload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      quality.dataset.state = "error";
      quality.textContent = "Usa un archivo PNG, JPG o WebP.";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      quality.dataset.state = "error";
      quality.textContent = "El archivo supera el máximo de 20 MB.";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
          quality.dataset.state = "error";
          quality.textContent = "La imagen supera 40 megapíxeles. Reduce sus dimensiones antes de continuar.";
          return;
        }
        state.width = image.naturalWidth;
        state.height = image.naturalHeight;
        state.name = file.name;
        art.src = reader.result;
        art.hidden = false;
        checkScale();
      };
      image.onerror = () => {
        quality.dataset.state = "error";
        quality.textContent = "No pudimos leer esa imagen. Comprueba que el archivo no esté dañado.";
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      quality.dataset.state = "error";
      quality.textContent = "No pudimos abrir el archivo seleccionado.";
    };
    reader.readAsDataURL(file);
  });

  let dragging = false;
  art.addEventListener("pointerdown", (event) => { dragging = true; art.setPointerCapture(event.pointerId); event.preventDefault(); });
  art.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const bounds = zone.getBoundingClientRect();
    position.x = clamp((event.clientX - bounds.left) / bounds.width * 100, 3, 97);
    position.y = clamp((event.clientY - bounds.top) / bounds.height * 100, 6, 94);
    renderPosition();
  });
  ["pointerup", "pointercancel"].forEach((name) => art.addEventListener(name, () => { dragging = false; }));

  scale.addEventListener("input", checkScale);
  $("sweater-color").addEventListener("input", (event) => document.documentElement.style.setProperty("--shirt-color", event.target.value));
  $("sweater-side").addEventListener("change", (event) => $("sweater-side-label").textContent = event.target.value.toUpperCase());

  function totals() {
    const quantities = [...document.querySelectorAll(".size-quantity")];
    const total = quantities.reduce((sum, input) => sum + Math.max(Number(input.value) || 0, 0), 0);
    $("sweater-total-units").textContent = `${total} ${total === 1 ? "unidad" : "unidades"}`;
    $("sweater-total-price").textContent = `B/.${(total * 14).toFixed(2)}`;
    return { total, quantities };
  }
  document.querySelectorAll(".size-quantity").forEach((input) => input.addEventListener("input", totals));

  $("sweater-build").addEventListener("click", () => {
    const { total, quantities } = totals();
    if (total < 2) {
      quality.dataset.state = "error";
      quality.textContent = "El pedido mínimo es de 2 suéteres. Distribuye al menos 2 unidades entre las tallas.";
      return;
    }
    const sizes = quantities.filter((input) => Number(input.value) > 0).map((input) => `${input.dataset.size}: ${input.value}`).join(", ");
    const color = $("sweater-color").value;
    const side = $("sweater-side").value;
    const widthCm = (PRINT_WIDTH_CM * Number(scale.value) / 100).toFixed(1);
    const summary = [
      "Hola, quiero preparar un pedido de suéteres.",
      `SKU: ${PRODUCT_SKU}`,
      "Unidad de venta: suéter",
      "Precio unitario referencial: B/.14.00",
      `Cantidad y tallas: ${sizes}`,
      `Total: ${total} unidades`,
      `Color seleccionado: ${color}`,
      `Ubicación: ${side}`,
      `Ancho aproximado del arte: ${widthCm} cm`,
      `Archivo: ${state.name || "Pendiente"}`,
      `Subtotal referencial: B/.${(total * 14).toFixed(2)}`,
      "",
      "Entiendo que este resumen no confirma disponibilidad, precio final ni producción.",
    ].join("\n");
    $("sweater-summary").value = summary;
    $("sweater-whatsapp").href = `https://wa.me/50766043511?text=${encodeURIComponent(summary)}`;
    $("sweater-result").hidden = false;
  });

  $("sweater-copy").addEventListener("click", async () => {
    const text = $("sweater-summary").value;
    try { await navigator.clipboard.writeText(text); } catch { $("sweater-summary").select(); document.execCommand("copy"); }
  });
  renderPosition();
  totals();
})();
