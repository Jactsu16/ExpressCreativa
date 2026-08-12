(() => {
  "use strict";

  const responsiveStyles = document.createElement("link");
  responsiveStyles.rel = "stylesheet";
  responsiveStyles.href = "responsive-menu.css";
  document.head.append(responsiveStyles);

  const primaryMenuLinks = [
    ["Inicio", "index.html"],
    ["Servicios", "servicios.html"],
    ["Digital", "digital.html"],
    ["Branding", "branding.html"],
    ["Studio", "studio.html"],
    ["Print", "print.html"],
    ["Media", "media.html"],
    ["Events", "events.html"],
    ["Contacto", "contacto.html"],
  ];

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

  const createMenu = () => {
    const existingButton = document.getElementById("mobile-menu-btn");
    const existingPanel = document.getElementById("mobile-menu");
    if (existingButton && existingPanel) {
      bindMenu(existingButton, existingPanel);
      return;
    }

    const header = document.querySelector("header");
    if (!header) return;
    const mount = header.querySelector(".family-nav, .lab-nav, .legal-nav")
      || header.querySelector(":scope > div")
      || header;
    const source = header.querySelector(".family-links, .lab-links, nav.hidden, nav[class*='md:flex'], nav[class*='lg:flex']");
    if (source) source.classList.add("ec-menu-source");

    const button = document.createElement("button");
    button.type = "button";
    button.id = "ec-mobile-menu-btn";
    button.setAttribute("aria-controls", "ec-mobile-menu");

    const panel = document.createElement("nav");
    panel.id = "ec-mobile-menu";
    panel.setAttribute("aria-label", "Navegación móvil");

    const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    primaryMenuLinks.forEach(([label, href]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (href.toLowerCase() === currentFile) link.setAttribute("aria-current", "page");
      panel.append(link);
    });

    mount.append(button);
    header.append(panel);
    bindMenu(button, panel);
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
    document.querySelectorAll('a[target="_blank"]').forEach(secureExternalLink);
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      input.setAttribute("autocomplete", "off");
    });
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
    createMenu();
  };

  document.addEventListener("DOMContentLoaded", secureDocument, { once: true });

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[target="_blank"]');
    if (link) secureExternalLink(link);
  }, true);
})();
