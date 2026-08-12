(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const choices = [...document.querySelectorAll(".dtf-choice")];
  const quality = $("dtf-quality");
  const state = { type: "textil", image: "", name: "", width: 0, height: 0 };
  const MIN_DPI = 150;
  const GAP_CM = 0.5;
  const MAX_IMAGE_PIXELS = 40_000_000;

  function selectType(type) {
    state.type = type;
    choices.forEach((choice) => choice.setAttribute("aria-pressed", String(choice.dataset.type === type)));
    const textil = type === "textil";
    $("dtf-mode-description").textContent = textil
      ? "DTF Textil seleccionado: requiere plancha o prensa térmica para fijarlo sobre la tela."
      : "UV DTF seleccionado: se adhiere en frío sobre vasos y superficies rígidas lisas; no requiere calor.";
    $("sheet-width").value = textil ? "56" : "30";
    $("sheet-height").value = "100";
  }

  choices.forEach((choice) => choice.addEventListener("click", () => selectType(choice.dataset.type)));

  $("dtf-upload").addEventListener("change", (event) => {
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
        state.image = reader.result;
        state.name = file.name;
        state.width = image.naturalWidth;
        state.height = image.naturalHeight;
        validateQuality();
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

  function measurements() {
    const sheetWidth = Math.max(1, Number($("sheet-width").value) || 1);
    const sheetHeight = Math.max(1, Number($("sheet-height").value) || 1);
    const copyWidth = Math.max(0.1, Number($("copy-width").value) || 0.1);
    const aspect = state.width && state.height ? state.height / state.width : 1;
    const copyHeight = copyWidth * aspect;
    const columns = Math.floor((sheetWidth + GAP_CM) / (copyWidth + GAP_CM));
    const rows = Math.floor((sheetHeight + GAP_CM) / (copyHeight + GAP_CM));
    return { sheetWidth, sheetHeight, copyWidth, copyHeight, columns, rows, capacity: Math.max(0, columns * rows) };
  }

  function validateQuality() {
    if (!state.width) return true;
    const copyWidth = Math.max(0.1, Number($("copy-width").value) || 0.1);
    const dpi = Math.round(state.width / (copyWidth / 2.54));
    if (dpi < MIN_DPI) {
      quality.dataset.state = "error";
      quality.textContent = `Calidad insuficiente: aproximadamente ${dpi} DPI. Reduce el ancho o usa un archivo de mayor resolución.`;
      return false;
    }
    quality.dataset.state = "ok";
    quality.textContent = `Calidad permitida: aproximadamente ${dpi} DPI a ${copyWidth.toFixed(1)} cm de ancho.`;
    return true;
  }

  $("copy-width").addEventListener("input", validateQuality);

  $("dtf-build").addEventListener("click", () => {
    if (!state.image) {
      quality.dataset.state = "error";
      quality.textContent = "Primero sube el diseño que quieres organizar.";
      return;
    }
    if (!validateQuality()) return;
    const data = measurements();
    if (!data.capacity) {
      quality.dataset.state = "error";
      quality.textContent = "El diseño no cabe en la carta con las medidas seleccionadas.";
      return;
    }
    const quantity = Math.max(1, Number($("copy-quantity").value) || 1);
    const visibleCopies = Math.min(quantity, data.capacity);
    const sheets = Math.ceil(quantity / data.capacity);
    const use = Math.min(100, (visibleCopies * data.copyWidth * data.copyHeight) / (data.sheetWidth * data.sheetHeight) * 100);
    const sheet = $("dtf-sheet");
    sheet.innerHTML = "";
    const maximumWidth = Math.min(420, window.innerWidth * 0.82);
    const maximumHeight = 600;
    const ratio = data.sheetWidth / data.sheetHeight;
    const availableRatio = maximumWidth / maximumHeight;
    const previewWidth = ratio >= availableRatio ? maximumWidth : maximumHeight * ratio;
    const previewHeight = ratio >= availableRatio ? maximumWidth / ratio : maximumHeight;
    sheet.style.width = `${previewWidth}px`;
    sheet.style.height = `${previewHeight}px`;
    sheet.style.gridTemplateColumns = `repeat(${data.columns}, minmax(0, 1fr))`;
    sheet.style.gridTemplateRows = `repeat(${data.rows}, minmax(0, 1fr))`;
    for (let index = 0; index < visibleCopies; index += 1) {
      const cell = document.createElement("div");
      cell.className = "dtf-copy";
      const image = document.createElement("img");
      image.src = state.image;
      image.alt = "";
      cell.appendChild(image);
      sheet.appendChild(cell);
    }
    $("dtf-capacity").textContent = `${data.capacity} copias`;
    $("dtf-sheets").textContent = String(sheets);
    $("dtf-use").textContent = `${use.toFixed(0)}%`;
    const label = state.type === "textil" ? "DTF Textil (con planchado)" : "UV DTF (aplicación sin calor)";
    const sku = state.type === "textil" ? "EC-PR-DTF-TXT-001" : "EC-PR-DTF-UV-001";
    const summary = [
      "Hola, quiero solicitar una carta DTF.",
      `SKU: ${sku}`,
      `Sistema: ${label}`,
      "Unidad de venta: carta",
      `Medida de la carta: ${data.sheetWidth} × ${data.sheetHeight} cm`,
      `Diseño: ${data.copyWidth.toFixed(1)} × ${data.copyHeight.toFixed(1)} cm`,
      `Copias solicitadas: ${quantity}`,
      `Capacidad estimada por carta: ${data.capacity}`,
      `Cartas estimadas: ${sheets}`,
      `Archivo: ${state.name}`,
      "",
      "Entiendo que el impresor debe confirmar medidas, separación, materiales y preparación final.",
    ].join("\n");
    $("dtf-summary").value = summary;
    $("dtf-whatsapp").href = `https://wa.me/50766043511?text=${encodeURIComponent(summary)}`;
    $("dtf-result").hidden = false;
  });

  $("dtf-copy-summary").addEventListener("click", async () => {
    const text = $("dtf-summary").value;
    try { await navigator.clipboard.writeText(text); } catch { $("dtf-summary").select(); document.execCommand("copy"); }
  });
})();
