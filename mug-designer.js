(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const upload = $("mug-upload");
  const art = $("mug-art");
  const previewArt = $("mug-preview-art");
  const wrap = $("mug-wrap");
  const scale = $("mug-scale");
  const quality = $("mug-quality");
  const state = { width: 0, height: 0, name: "", x: 50, y: 50 };
  const WRAP_WIDTH_CM = 21;
  const MIN_DPI = 150;
  const PRODUCT_SKU = "EC-PR-MUG-SUB-001";
  const MAX_IMAGE_PIXELS = 40_000_000;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function render() {
    art.style.left = `${state.x}%`;
    art.style.top = `${state.y}%`;
    previewArt.style.objectPosition = `${state.x}% ${state.y}%`;
  }

  function checkScale() {
    let value = Number(scale.value);
    if (state.width) {
      const safeWidthCm = (state.width / MIN_DPI) * 2.54;
      const safePercent = Math.floor((safeWidthCm / WRAP_WIDTH_CM) * 100);
      if (value > safePercent) {
        value = Math.max(Number(scale.min), safePercent);
        scale.value = String(value);
        quality.dataset.state = "error";
        quality.textContent = "No puedes agrandarlo más: la imagen perdería calidad al imprimir. Usa un archivo de mayor resolución.";
      } else {
        const widthCm = WRAP_WIDTH_CM * value / 100;
        const dpi = Math.round(state.width / (widthCm / 2.54));
        quality.dataset.state = "ok";
        quality.textContent = `Calidad permitida: aproximadamente ${dpi} DPI a ${widthCm.toFixed(1)} cm.`;
      }
    }
    const widthCm = WRAP_WIDTH_CM * value / 100;
    $("mug-scale-value").textContent = `${widthCm.toFixed(1)} cm`;
    art.style.width = `${value}%`;
    previewArt.style.width = `${Math.min(value * 1.25, 88)}%`;
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
        previewArt.src = reader.result;
        art.hidden = false;
        previewArt.hidden = false;
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
  art.addEventListener("pointerdown", (event) => {
    dragging = true;
    art.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  art.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const bounds = wrap.getBoundingClientRect();
    state.x = clamp((event.clientX - bounds.left) / bounds.width * 100, 3, 97);
    state.y = clamp((event.clientY - bounds.top) / bounds.height * 100, 7, 93);
    render();
  });
  ["pointerup", "pointercancel"].forEach((name) => art.addEventListener(name, () => { dragging = false; }));
  scale.addEventListener("input", checkScale);

  $("mug-build").addEventListener("click", () => {
    const quantity = Math.max(1, Number($("mug-quantity").value) || 1);
    const widthCm = (WRAP_WIDTH_CM * Number(scale.value) / 100).toFixed(1);
    const summary = [
      "Hola, quiero solicitar tazas personalizadas por sublimación.",
      `SKU: ${PRODUCT_SKU}`,
      "Unidad de venta: taza",
      "Precio unitario: pendiente de confirmar",
      `Cantidad: ${quantity}`,
      `Archivo: ${state.name || "Pendiente"}`,
      `Ancho aproximado del diseño: ${widthCm} cm`,
      `Posición horizontal en la plantilla: ${Math.round(state.x)}%`,
      "",
      "Entiendo que el modelo, la plantilla exacta, el precio y la disponibilidad deben confirmarse antes de producir.",
    ].join("\n");
    $("mug-summary").value = summary;
    $("mug-whatsapp").href = `https://wa.me/50766043511?text=${encodeURIComponent(summary)}`;
    $("mug-result").hidden = false;
  });

  $("mug-copy").addEventListener("click", async () => {
    const text = $("mug-summary").value;
    try { await navigator.clipboard.writeText(text); } catch { $("mug-summary").select(); document.execCommand("copy"); }
  });
  render();
  checkScale();
})();
