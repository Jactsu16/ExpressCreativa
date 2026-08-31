(() => {
  "use strict";

  const state = {
    sourceImage: null,
    sourceName: "arte",
    sourceWidth: 0,
    sourceHeight: 0,
    processedUrl: "",
    garmentPosition: { x: 50, y: 42 },
    mugPosition: { x: 50, y: 50 },
  };

  const $ = (id) => document.getElementById(id);
  const upload = $("art-upload");
  const sourceCanvas = $("source-canvas");
  const resultCanvas = $("result-canvas");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const resultContext = resultCanvas.getContext("2d", { willReadFrequently: true });
  const threshold = $("white-threshold");
  const softness = $("edge-softness");
  const thresholdValue = $("white-threshold-value");
  const softnessValue = $("edge-softness-value");
  const downloadButton = $("download-art");
  const resetButton = $("reset-art");
  const emptyState = $("empty-state");
  const workspace = $("image-workspace");
  const garmentArtwork = $("garment-artwork");
  const garment = $("garment-preview");
  const garmentArtboard = $("garment-artboard");
  const garmentColor = $("garment-color");
  const garmentSide = $("garment-side");
  const garmentSideLabel = $("garment-side-label");
  const printScale = $("print-scale");
  const printScaleValue = $("print-scale-value");
  const garmentQualityLock = $("garment-quality-lock");
  const mugScale = $("mug-scale");
  const mugScaleValue = $("mug-scale-value");
  const mugQualityLock = $("mug-quality-lock");
  const mugWrapEditor = $("mug-wrap-editor");
  const mugFlatArtwork = $("mug-flat-art");
  const mugPreviewArtwork = $("mug-preview-art");
  const targetWidth = $("target-width");
  const targetDpi = $("target-dpi");

  const PRINT_MIN_DPI = 150;
  const MAX_IMAGE_PIXELS = 40_000_000;
  const GARMENT_PRINT_WIDTH_CM = 34;
  const MUG_WRAP_WIDTH_CM = 21;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (edge0, edge1, value) => {
    const x = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
    return x * x * (3 - 2 * x);
  };

  function setStatus(message, type = "info") {
    const status = $("tool-status");
    status.textContent = message;
    status.dataset.type = type;
  }

  function physicalWidth(baseWidthCm, percentage) {
    return baseWidthCm * (Number(percentage) / 100);
  }

  function maximumSafePercentage(baseWidthCm) {
    if (!state.sourceImage) return 100;
    const maximumWidthCm = (state.sourceWidth / PRINT_MIN_DPI) * 2.54;
    return clamp(Math.floor((maximumWidthCm / baseWidthCm) * 100), 1, 100);
  }

  function qualityForScale(input, baseWidthCm, lock, label, art, contextName) {
    const minimum = Number(input.min);
    let requested = Number(input.value);
    const safeMaximum = maximumSafePercentage(baseWidthCm);
    let wasLimited = false;

    if (state.sourceImage && requested > safeMaximum) {
      requested = Math.max(minimum, safeMaximum);
      input.value = String(requested);
      wasLimited = true;
    }

    const widthCm = physicalWidth(baseWidthCm, requested);
    label.textContent = `${widthCm.toFixed(1)} cm`;
    art.style.width = `${requested}%`;

    if (!state.sourceImage) {
      lock.dataset.state = "waiting";
      lock.textContent = "Carga un arte arriba para calcular el tamaño máximo recomendado.";
      return;
    }

    const effectiveDpi = Math.round(state.sourceWidth / (widthCm / 2.54));
    if (wasLimited || safeMaximum < minimum) {
      lock.dataset.state = "error";
      lock.textContent =
        `Límite de calidad: ${contextName} no puede ampliarse más con este archivo. ` +
        `Quedaría cerca de ${effectiveDpi} DPI. Usa un PNG de mayor resolución o un vector SVG/PDF.`;
    } else {
      lock.dataset.state = "ok";
      lock.textContent =
        `Tamaño permitido: ${widthCm.toFixed(1)} cm de ancho, aproximadamente ${effectiveDpi} DPI.`;
    }
  }

  function updateScaleQuality() {
    qualityForScale(
      printScale,
      GARMENT_PRINT_WIDTH_CM,
      garmentQualityLock,
      printScaleValue,
      garmentArtwork,
      "el logo del suéter",
    );
    qualityForScale(
      mugScale,
      MUG_WRAP_WIDTH_CM,
      mugQualityLock,
      mugScaleValue,
      mugFlatArtwork,
      "el arte de la taza",
    );
    renderMugPreview();
  }

  function updateLabels() {
    thresholdValue.textContent = `${threshold.value}%`;
    softnessValue.textContent = `${softness.value}%`;
    updateScaleQuality();
  }

  function loadImage(file) {
    if (!file) return;

    const supported = ["image/png", "image/jpeg", "image/webp"];
    if (!supported.includes(file.type)) {
      setStatus("Usa un archivo PNG, JPG o WebP.", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setStatus("El archivo supera el límite local de 20 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
          setStatus("La imagen supera 40 megapíxeles. Reduce sus dimensiones antes de continuar.", "error");
          return;
        }
        state.sourceImage = image;
        state.sourceName = file.name.replace(/\.[^.]+$/, "") || "arte";
        state.sourceWidth = image.naturalWidth;
        state.sourceHeight = image.naturalHeight;

        sourceCanvas.width = image.naturalWidth;
        sourceCanvas.height = image.naturalHeight;
        resultCanvas.width = image.naturalWidth;
        resultCanvas.height = image.naturalHeight;
        sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
        sourceContext.drawImage(image, 0, 0);

        emptyState.hidden = true;
        workspace.hidden = false;
        downloadButton.disabled = false;
        resetButton.disabled = false;
        processImage();
        updateScaleQuality();
        setStatus("Archivo cargado. Ajusta la limpieza y revisa los bordes.", "success");
      };
      image.onerror = () => setStatus("No pudimos leer esa imagen.", "error");
      image.src = reader.result;
    };
    reader.onerror = () => setStatus("No pudimos abrir el archivo seleccionado.", "error");
    reader.readAsDataURL(file);
  }

  function processImage() {
    if (!state.sourceImage) return;

    const source = sourceContext.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height,
    );
    const output = new ImageData(
      new Uint8ClampedArray(source.data),
      source.width,
      source.height,
    );

    const removeDistance = Number(threshold.value) / 100;
    const featherDistance = Number(softness.value) / 100;
    let transparentPixels = 0;
    let affectedPixels = 0;

    for (let index = 0; index < output.data.length; index += 4) {
      const red = source.data[index];
      const green = source.data[index + 1];
      const blue = source.data[index + 2];
      const originalAlpha = source.data[index + 3] / 255;
      const distanceFromWhite =
        Math.sqrt(
          (255 - red) ** 2 + (255 - green) ** 2 + (255 - blue) ** 2,
        ) / 441.67295593;
      const keepFactor = smoothstep(
        removeDistance,
        removeDistance + featherDistance,
        distanceFromWhite,
      );
      const newAlpha = originalAlpha * keepFactor;

      if (keepFactor < 0.999) {
        affectedPixels += 1;
        if (keepFactor > 0.01) {
          output.data[index] = clamp(
            Math.round((red - 255 * (1 - keepFactor)) / keepFactor),
            0,
            255,
          );
          output.data[index + 1] = clamp(
            Math.round((green - 255 * (1 - keepFactor)) / keepFactor),
            0,
            255,
          );
          output.data[index + 2] = clamp(
            Math.round((blue - 255 * (1 - keepFactor)) / keepFactor),
            0,
            255,
          );
        }
      }

      output.data[index + 3] = Math.round(newAlpha * 255);
      if (newAlpha < 0.01) transparentPixels += 1;
    }

    resultContext.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
    resultContext.putImageData(output, 0, 0);
    updateProcessedPreview();
    updateQualityReport(transparentPixels, affectedPixels);
  }

  function updateProcessedPreview() {
    if (state.processedUrl) URL.revokeObjectURL(state.processedUrl);
    resultCanvas.toBlob((blob) => {
      if (!blob) return;
      state.processedUrl = URL.createObjectURL(blob);
      [garmentArtwork, mugFlatArtwork, mugPreviewArtwork].forEach((art) => {
        art.src = state.processedUrl;
        art.hidden = false;
      });
      renderGarmentPosition();
      renderMugPosition();
      updateScaleQuality();
    }, "image/png");
  }

  function updateQualityReport(transparentPixels = 0, affectedPixels = 0) {
    if (!state.sourceImage) return;

    const widthCm = Math.max(Number(targetWidth.value) || 1, 1);
    const effectiveDpi = Math.round(state.sourceWidth / (widthCm / 2.54));
    const requestedDpi = Number(targetDpi.value);
    const heightCm = (state.sourceHeight / state.sourceWidth) * widthCm;
    const megapixels = (
      (state.sourceWidth * state.sourceHeight) /
      1_000_000
    ).toFixed(2);

    $("file-dimensions").textContent =
      `${state.sourceWidth} × ${state.sourceHeight} px`;
    $("file-megapixels").textContent = `${megapixels} MP`;
    $("physical-size").textContent =
      `${widthCm.toFixed(1)} × ${heightCm.toFixed(1)} cm`;
    $("effective-dpi").textContent = `${effectiveDpi} DPI`;
    $("removed-pixels").textContent =
      `${((affectedPixels / (state.sourceWidth * state.sourceHeight)) * 100).toFixed(1)}%`;

    const quality = $("quality-verdict");
    if (effectiveDpi >= requestedDpi) {
      quality.textContent = "Resolución ideal";
      quality.dataset.level = "good";
    } else if (effectiveDpi >= PRINT_MIN_DPI) {
      quality.textContent = "Útil con precaución";
      quality.dataset.level = "warning";
    } else {
      quality.textContent = "Resolución baja";
      quality.dataset.level = "danger";
    }

    const transparentShare =
      transparentPixels / (state.sourceWidth * state.sourceHeight);
    $("transparency-status").textContent =
      transparentShare > 0.01 ? "Fondo transparente detectado" : "Sin transparencia";
  }

  function renderGarmentPosition() {
    garmentArtwork.style.left = `${state.garmentPosition.x}%`;
    garmentArtwork.style.top = `${state.garmentPosition.y}%`;
  }

  function renderMugPosition() {
    mugFlatArtwork.style.left = `${state.mugPosition.x}%`;
    mugFlatArtwork.style.top = `${state.mugPosition.y}%`;
    renderMugPreview();
  }

  function renderMugPreview() {
    const previewX = clamp(50 + (state.mugPosition.x - 50) * 0.42, 18, 82);
    const previewY = clamp(state.mugPosition.y, 15, 85);
    mugPreviewArtwork.style.left = `${previewX}%`;
    mugPreviewArtwork.style.top = `${previewY}%`;
    mugPreviewArtwork.style.width = `${Math.min(Number(mugScale.value) * 1.3, 110)}%`;
  }

  function makeDraggable(container, artwork, position, render) {
    let dragging = false;

    artwork.addEventListener("pointerdown", (event) => {
      if (!state.sourceImage) return;
      dragging = true;
      artwork.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    artwork.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const bounds = container.getBoundingClientRect();
      position.x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 3, 97);
      position.y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 6, 94);
      render();
    });

    const stop = (event) => {
      dragging = false;
      if (artwork.hasPointerCapture?.(event.pointerId)) {
        artwork.releasePointerCapture(event.pointerId);
      }
    };
    artwork.addEventListener("pointerup", stop);
    artwork.addEventListener("pointercancel", stop);
  }

  function resetTool() {
    state.sourceImage = null;
    state.sourceWidth = 0;
    state.sourceHeight = 0;
    state.garmentPosition.x = 50;
    state.garmentPosition.y = 42;
    state.mugPosition.x = 50;
    state.mugPosition.y = 50;
    if (state.processedUrl) URL.revokeObjectURL(state.processedUrl);
    state.processedUrl = "";
    upload.value = "";
    sourceCanvas.width = 1;
    sourceCanvas.height = 1;
    resultCanvas.width = 1;
    resultCanvas.height = 1;
    [garmentArtwork, mugFlatArtwork, mugPreviewArtwork].forEach((art) => {
      art.removeAttribute("src");
      art.hidden = true;
    });
    emptyState.hidden = false;
    workspace.hidden = true;
    downloadButton.disabled = true;
    resetButton.disabled = true;
    renderGarmentPosition();
    renderMugPosition();
    updateScaleQuality();
    setStatus("Tu archivo se procesa únicamente en este dispositivo.");
  }

  upload.addEventListener("change", (event) => loadImage(event.target.files[0]));

  ["dragenter", "dragover"].forEach((eventName) => {
    $("drop-zone").addEventListener(eventName, (event) => {
      event.preventDefault();
      $("drop-zone").classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    $("drop-zone").addEventListener(eventName, (event) => {
      event.preventDefault();
      $("drop-zone").classList.remove("is-dragging");
    });
  });

  $("drop-zone").addEventListener("drop", (event) => {
    loadImage(event.dataTransfer.files[0]);
  });

  threshold.addEventListener("input", () => {
    updateLabels();
    processImage();
  });
  softness.addEventListener("input", () => {
    updateLabels();
    processImage();
  });
  targetWidth.addEventListener("input", () => updateQualityReport());
  targetDpi.addEventListener("change", () => updateQualityReport());

  garmentColor.addEventListener("input", () => {
    garment.style.setProperty("--garment-color", garmentColor.value);
  });
  garmentSide.addEventListener("change", () => {
    garmentSideLabel.textContent = garmentSide.value.toUpperCase();
  });
  printScale.addEventListener("input", updateScaleQuality);
  mugScale.addEventListener("input", updateScaleQuality);

  makeDraggable(
    garmentArtboard,
    garmentArtwork,
    state.garmentPosition,
    renderGarmentPosition,
  );
  makeDraggable(
    mugWrapEditor,
    mugFlatArtwork,
    state.mugPosition,
    renderMugPosition,
  );

  downloadButton.addEventListener("click", () => {
    if (!state.sourceImage) return;
    resultCanvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${state.sourceName}-sin-fondo.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  });

  resetButton.addEventListener("click", resetTool);

  $("quote-builder").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const quantity = Math.max(Number(data.get("quantity")) || 2, 2);
    const product = String(data.get("product"));
    const isSweater = product.startsWith("Suéter");
    const sku = isSweater ? "EC-PR-SWT-001" : "EC-PR-MUG-SUB-001";
    const baseEstimate = product.startsWith("Suéter")
      ? `B/.${(quantity * 14).toFixed(2)} (${quantity} × B/.14.00 por unidad)`
      : "Pendiente de confirmar tarifa de taza";
    const summary = [
      "Hola, quiero preparar una cotización de Express Creativa.",
      `SKU: ${sku}`,
      `Producto: ${product}`,
      `Unidad de venta: ${isSweater ? "suéter" : "taza"}`,
      `Cantidad: ${quantity}`,
      `Talla: ${data.get("size")}`,
      `Color: ${data.get("color")}`,
      `Técnica preferida: ${data.get("technique")}`,
      `Ubicación del diseño: ${data.get("placement")}`,
      `Estimado base informativo: ${baseEstimate}`,
      `Fecha objetivo: ${data.get("deadline") || "Por definir"}`,
      `Notas: ${data.get("notes") || "Sin notas adicionales"}`,
      "",
      "Entiendo que esta solicitud no es una compra y no confirma disponibilidad, precio final ni fecha de entrega.",
    ].join("\n");
    $("quote-summary").value = summary;
    $("quote-result").hidden = false;
    $("open-whatsapp").href =
      `https://wa.me/50766043511?text=${encodeURIComponent(summary)}`;
  });

  $("copy-summary").addEventListener("click", async () => {
    const summary = $("quote-summary");
    try {
      await navigator.clipboard.writeText(summary.value);
      setStatus("Resumen copiado.", "success");
    } catch {
      summary.select();
      document.execCommand("copy");
      setStatus("Resumen copiado.", "success");
    }
  });

  updateLabels();
  resetTool();
})();
