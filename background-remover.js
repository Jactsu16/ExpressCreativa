(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const upload = $("clean-upload");
  const drop = $("clean-drop");
  const sourceCanvas = $("clean-source");
  const resultCanvas = $("clean-result");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const resultContext = resultCanvas.getContext("2d", { willReadFrequently: true });
  const threshold = $("clean-threshold");
  const softness = $("clean-softness");
  const reset = $("clean-reset");
  const download = $("clean-download");
  const status = $("clean-status");
  const state = { image: null, name: "arte" };
  const MAX_IMAGE_PIXELS = 40_000_000;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function smoothstep(edge0, edge1, value) {
    const x = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
    return x * x * (3 - 2 * x);
  }

  function setStatus(message, type = "waiting") {
    status.textContent = message;
    status.dataset.state = type;
  }

  function process() {
    if (!state.image) return;
    const source = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const output = new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
    const removeDistance = Number(threshold.value) / 100;
    const featherDistance = Number(softness.value) / 100;
    let affected = 0;

    for (let index = 0; index < output.data.length; index += 4) {
      const red = source.data[index];
      const green = source.data[index + 1];
      const blue = source.data[index + 2];
      const originalAlpha = source.data[index + 3] / 255;
      const distance = Math.sqrt((255 - red) ** 2 + (255 - green) ** 2 + (255 - blue) ** 2) / 441.67295593;
      const keep = smoothstep(removeDistance, removeDistance + featherDistance, distance);
      if (keep < 0.999) {
        affected += 1;
        if (keep > 0.01) {
          output.data[index] = clamp(Math.round((red - 255 * (1 - keep)) / keep), 0, 255);
          output.data[index + 1] = clamp(Math.round((green - 255 * (1 - keep)) / keep), 0, 255);
          output.data[index + 2] = clamp(Math.round((blue - 255 * (1 - keep)) / keep), 0, 255);
        }
      }
      output.data[index + 3] = Math.round(originalAlpha * keep * 255);
    }

    resultContext.putImageData(output, 0, 0);
    const percent = ((affected / (source.width * source.height)) * 100).toFixed(1);
    setStatus(`${percent}% de los píxeles fueron ajustados. Revisa que no desaparezcan detalles claros.`, "ok");
  }

  function load(file) {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) {
      setStatus("Usa un PNG, JPG o WebP de hasta 20 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
          setStatus("La imagen es demasiado grande para procesarla con seguridad. Usa un archivo de hasta 40 megapíxeles.", "error");
          return;
        }
        state.image = image;
        state.name = file.name.replace(/\.[^.]+$/, "") || "arte";
        sourceCanvas.width = resultCanvas.width = image.naturalWidth;
        sourceCanvas.height = resultCanvas.height = image.naturalHeight;
        sourceContext.drawImage(image, 0, 0);
        $("clean-empty").hidden = true;
        $("clean-workspace").hidden = false;
        reset.disabled = download.disabled = false;
        process();
      };
      image.onerror = () => setStatus("No pudimos leer esa imagen. Comprueba que el archivo no esté dañado.", "error");
      image.src = reader.result;
    };
    reader.onerror = () => setStatus("No pudimos abrir el archivo seleccionado.", "error");
    reader.readAsDataURL(file);
  }

  upload.addEventListener("change", (event) => load(event.target.files[0]));
  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.add("is-dragging"); }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.remove("is-dragging"); }));
  drop.addEventListener("drop", (event) => load(event.dataTransfer.files[0]));
  threshold.addEventListener("input", () => { $("clean-threshold-value").textContent = `${threshold.value}%`; process(); });
  softness.addEventListener("input", () => { $("clean-softness-value").textContent = `${softness.value}%`; process(); });
  reset.addEventListener("click", () => {
    state.image = null;
    upload.value = "";
    sourceCanvas.width = resultCanvas.width = 1;
    sourceCanvas.height = resultCanvas.height = 1;
    $("clean-empty").hidden = false;
    $("clean-workspace").hidden = true;
    reset.disabled = download.disabled = true;
    setStatus("Carga un archivo para comenzar.");
  });
  download.addEventListener("click", () => {
    resultCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${state.name}-sin-fondo.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  });
})();
