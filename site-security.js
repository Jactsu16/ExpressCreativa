(() => {
  "use strict";

  const ensureStylesheet = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.append(stylesheet);
  };

  ensureStylesheet("responsive-menu.css");

  const primaryMenuLinks = [
    ["Inicio", "index.html", "home"],
    ["Servicios", "servicios.html", "services"],
    ["Digital", "digital.html", "digital"],
    ["Media", "media.html", "media"],
    ["Proyectos", "proyectos.html", "work"],
    ["Calculadora", "calculadora.html", "calculator"],
    ["Contacto", "contacto.html", "contact"],
  ];

  const currentFile = () => (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const sectionForFile = (file) => {
    if (file === "index.html") return "home";
    if (file === "servicios.html") return "services";
    if (file === "print.html" || file.startsWith("disena-") || file === "quitar-fondo.html" || file === "carta-dtf.html") return "print";
    if (file === "digital.html") return "digital";
    if (["media.html", "fotografia.html"].includes(file)) return "media";
    if (file === "calculadora.html") return "calculator";
    if (["proyectos.html", "portafolio.html"].includes(file)) return "work";
    if (["contacto.html", "cotizacion.html"].includes(file)) return "contact";
    return "";
  };

  const installSiteHeader = () => {
    const previousHeader = document.querySelector("header");
    if (!previousHeader) return;
    if (previousHeader.classList.contains("lab-header") || previousHeader.classList.contains("legal-header")) {
      return;
    }

    const activeSection = sectionForFile(currentFile());
    const header = document.createElement("header");
    header.id = "header";
    header.className = "ec-site-header";

    const inner = document.createElement("div");
    inner.className = "ec-site-header-inner";
    inner.innerHTML = `
      <a href="index.html" class="ec-site-brand" aria-label="Express Creativa, ir al inicio">
        <span class="ec-site-brand-mark"><img src="favicon.ico" alt="Logo de Express Creativa" /></span>
        <span class="ec-site-brand-copy">
          <strong>Express Creativa</strong>
          <small>Creative Communications Agency</small>
        </span>
      </a>
      <nav class="ec-site-nav" aria-label="Navegación principal"></nav>
      <button id="mobile-menu-btn" type="button" aria-label="Abrir menú de navegación" aria-controls="mobile-menu" aria-expanded="false"></button>
    `;

    const desktopNav = inner.querySelector(".ec-site-nav");
    const mobilePanel = document.createElement("nav");
    mobilePanel.id = "mobile-menu";
    mobilePanel.setAttribute("aria-label", "Navegación móvil");

    primaryMenuLinks.forEach(([label, href, section]) => {
      [desktopNav, mobilePanel].forEach((navigation) => {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        link.dataset.section = section;
        if (section === activeSection) link.setAttribute("aria-current", "page");
        navigation.append(link);
      });
    });

    header.append(inner, mobilePanel);
    previousHeader.replaceWith(header);
  };

  const setMenuState = (button, panel, open) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    panel.hidden = !open;
    panel.classList.toggle("hidden", !open);
  };

  const bindMenu = (button, panel) => {
    if (button.dataset.menuBound === "true") return;
    button.dataset.menuBound = "true";
    button.classList.add("ec-menu-toggle");
    button.innerHTML = '<span class="ec-menu-icon" aria-hidden="true"><span></span></span>';
    panel.classList.add("ec-mobile-panel");
    setMenuState(button, panel, false);

    button.addEventListener("click", () => {
      setMenuState(button, panel, button.getAttribute("aria-expanded") !== "true");
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(button, panel, false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setMenuState(button, panel, false);
        button.focus();
      }
    });
  };

  const secureExternalLink = (link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.target === "_blank") {
      const rel = new Set((link.rel || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.rel = [...rel].join(" ");
    }
  };

  const secureDocument = () => {
    document.querySelectorAll(".brand-rail").forEach((rail) => rail.remove());
    installSiteHeader();
    document.querySelectorAll('a[target="_blank"]').forEach(secureExternalLink);
    document.querySelectorAll('input[type="file"]').forEach((input) => input.setAttribute("autocomplete", "off"));
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
    const button = document.getElementById("mobile-menu-btn");
    const panel = document.getElementById("mobile-menu");
    if (button && panel) bindMenu(button, panel);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", secureDocument, { once: true });
  } else {
    secureDocument();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[target="_blank"]');
    if (link) secureExternalLink(link);
  }, true);
})();
