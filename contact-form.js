(() => {
  "use strict";

  const form = document.getElementById("contact-request-form");
  const status = document.getElementById("contact-form-status");
  if (!form) return;

  const endpoint = "https://formsubmit.co/ajax/expresscreativa.pa@gmail.com";

  const clean = (value, limit = 2000) => String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit);

  const setStatus = (message) => {
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
  };

  form.setAttribute("action", "https://formsubmit.co/expresscreativa.pa@gmail.com");
  form.setAttribute("method", "POST");
  form.removeAttribute("enctype");

  if (!form.querySelector('input[name="_subject"]')) {
    const subjectInput = document.createElement("input");
    subjectInput.type = "hidden";
    subjectInput.name = "_subject";
    form.prepend(subjectInput);
  }

  if (!form.querySelector('input[name="_template"]')) {
    const templateInput = document.createElement("input");
    templateInput.type = "hidden";
    templateInput.name = "_template";
    templateInput.value = "table";
    form.prepend(templateInput);
  }

  if (!form.querySelector('input[name="_honey"]')) {
    const honey = document.createElement("input");
    honey.type = "text";
    honey.name = "_honey";
    honey.tabIndex = -1;
    honey.autocomplete = "off";
    honey.setAttribute("aria-hidden", "true");
    honey.style.display = "none";
    form.prepend(honey);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const services = data.getAll("services[]").map((value) => clean(value)).filter(Boolean);
    const name = clean(data.get("name"), 120);
    const project = clean(data.get("project"), 120);
    const subject = `Consulta web${project ? ` · ${project}` : ""} · ${name}`;
    const subjectField = form.querySelector('input[name="_subject"]');
    if (subjectField) subjectField.value = subject;

    const payload = {
      _subject: subject,
      _template: "table",
      _honey: clean(data.get("_honey"), 80),
      name,
      email: clean(data.get("email"), 254),
      "phone-number": clean(data.get("phone-number"), 30) || "No indicado",
      project: project || "No indicado",
      "client-type": clean(data.get("client-type")) || "No indicado",
      services: services.length ? services.join(", ") : (clean(data.get("services")) || "No indicados"),
      date: clean(data.get("date")) || "Por definir",
      message: clean(data.get("message"), 2000),
      comments: clean(data.get("comments"), 1000) || "Sin comentarios adicionales",
      disclaimer: "Esta solicitud no constituye una compra ni confirma una cotización.",
    };

    if (submitButton) submitButton.disabled = true;
    setStatus("Enviando tu consulta…");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "No se pudo enviar el formulario.");
      }
      setStatus("Recibimos tu consulta. Te responderemos por correo o WhatsApp. Este mensaje no es una compra ni confirma una cotización.");
      form.reset();
    } catch (error) {
      setStatus("No se pudo enviar desde el navegador. Revisa tu conexión e inténtalo de nuevo; si persiste, escribe a expresscreativa.pa@gmail.com o por WhatsApp.");
      if (submitButton) submitButton.disabled = false;
      return;
    }

    if (submitButton) submitButton.disabled = false;
  });
})();
