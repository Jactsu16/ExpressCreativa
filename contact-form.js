(() => {
  "use strict";

  const form = document.getElementById("contact-request-form");
  const status = document.getElementById("contact-form-status");
  if (!form) return;

  const clean = (value, limit = 2000) => String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const services = data.getAll("services[]").map(clean).filter(Boolean);
    const name = clean(data.get("name"), 120);
    const project = clean(data.get("project"), 120);
    const subject = `Consulta web${project ? ` · ${project}` : ""} · ${name}`;
    const body = [
      "Hola, equipo de Express Creativa:",
      "",
      "Deseo solicitar información. Entiendo que este mensaje no constituye una compra ni confirma una cotización.",
      "",
      `Nombre: ${name}`,
      `Correo de contacto: ${clean(data.get("email"), 254)}`,
      `Teléfono: ${clean(data.get("phone-number"), 30) || "No indicado"}`,
      `Empresa o proyecto: ${project || "No indicado"}`,
      `Tipo de cliente: ${clean(data.get("client-type")) || "No indicado"}`,
      `Servicios de interés: ${services.length ? services.join(", ") : "No indicados"}`,
      `Fecha objetivo: ${clean(data.get("date")) || "Por definir"}`,
      "",
      "Descripción:",
      clean(data.get("message"), 2000),
      "",
      "Comentarios adicionales:",
      clean(data.get("comments"), 1000) || "Sin comentarios adicionales",
    ].join("\n");

    const mailto = `mailto:expresscreativa.pa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (status) {
      status.hidden = false;
      status.textContent = "Se preparó el correo en tu aplicación. Revísalo y pulsa Enviar allí; esta web no transmitió ni almacenó tus datos.";
    }
    window.location.href = mailto;
  });
})();
