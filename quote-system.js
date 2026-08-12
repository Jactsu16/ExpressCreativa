// Quote System JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initializeQuoteSystem();
});

const SERVICE_REFERENCES = {
  consultoria: { sku: "EC-AG-CNS-001", label: "Consultoría Digital" },
  "transmision-vivo": { sku: "EC-STU-STR-001", label: "Transmisión en Vivo" },
  "gestion-evento": { sku: "EC-EVT-GES-001", label: "Gestión de Evento" },
  "desarrollo-web": { sku: "EC-DIG-WEB-001", label: "Desarrollo Web" },
  branding: { sku: "EC-BRA-IDN-001", label: "Branding" },
  "marketing-digital": { sku: "EC-MED-MKT-001", label: "Marketing Digital" },
};

const QUOTE_FIELD_LIMITS = Object.freeze({
  "client-name": 120,
  "client-contact": 254,
  "additional-details": 2000,
});

function cleanQuoteValue(key, value) {
  const normalized = String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  return normalized.slice(0, QUOTE_FIELD_LIMITS[key] || 160);
}

function escapeQuoteHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function formatRequestedServices(services) {
  if (!services || services.length === 0) return "No especificado";
  return services.map((value) => {
    const reference = SERVICE_REFERENCES[value];
    return reference
      ? `[SKU: ${reference.sku}] ${reference.label} · cantidad/unidad por definir`
      : value;
  }).join(", ");
}

function initializeQuoteSystem() {
  const quoteForm = document.getElementById("quote-request-form");
  if (quoteForm) {
    quoteForm.addEventListener("submit", handleQuoteSubmission);
  }
}

function handleQuoteSubmission(e) {
  e.preventDefault();

  // Show terms and conditions first
  showTermsAndConditions(e.target);
}

function showTermsAndConditions(form) {
  const termsModal = document.getElementById('terms-modal');
  const acceptBtn = document.getElementById('accept-terms');
  const declineBtn = document.getElementById('decline-terms');
  const closeBtn = document.getElementById('close-terms');
  
  if (termsModal) {
    termsModal.classList.remove('hidden');
    
    // Handle accept
    acceptBtn.onclick = function() {
      termsModal.classList.add('hidden');
      processQuoteSubmission(form);
    };
    
    // Handle decline
    declineBtn.onclick = function() {
      termsModal.classList.add('hidden');
      showToast('Debe aceptar los términos y condiciones para continuar', 'warning');
    };
    
    // Handle close
    closeBtn.onclick = function() {
      termsModal.classList.add('hidden');
    };
  } else {
    // Fallback if modal doesn't exist
    processQuoteSubmission(form);
  }
}

function processQuoteSubmission(form) {
  // Get form data
  const formData = new FormData(form);
  const data = {};
  
  // Process regular fields
  for (let [key, value] of formData.entries()) {
    if (key === "services") {
      if (!data[key]) data[key] = [];
      if (SERVICE_REFERENCES[value] && !data[key].includes(value)) data[key].push(value);
    } else {
      data[key] = cleanQuoteValue(key, value);
    }
  }

  // Validation
  if (!validateQuoteForm(data)) {
    return;
  }

  // Generate ticket
  const ticket = generateTicket(data);
  
  // Show confirmation
  showQuoteConfirmation(ticket, data);
  
  // Send data via email/WhatsApp
  sendQuoteData(ticket, data);
  
  // Reset form
  form.reset();
}

function validateQuoteForm(data) {
  const required = ['client-name', 'client-contact', 'client-type', 'urgency-level', 'service-category'];
  
  for (let field of required) {
    if (!data[field] || data[field].trim() === '') {
      showToast(`Por favor completa el campo: ${getFieldLabel(field)}`, 'error');
      return false;
    }
  }

  // Validate at least one service is selected
  if (!data.services || data.services.length === 0) {
    showToast('Por favor selecciona al menos un servicio', 'error');
    return false;
  }

  // Validate contact format
  if (!validateContact(data['client-contact'])) {
    showToast('Por favor ingresa un email o teléfono válido', 'error');
    return false;
  }

  return true;
}

function validateContact(contact) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
  
  return emailRegex.test(contact) || phoneRegex.test(contact);
}

function getFieldLabel(field) {
  const labels = {
    'client-name': 'Nombre Completo',
    'client-contact': 'Contacto',
    'client-type': 'Tipo de Cliente',
    'urgency-level': 'Nivel de Urgencia',
    'service-category': 'Categoría del Servicio'
  };
  return labels[field] || field;
}

function generateTicket(data) {
  const timestamp = Date.now();
  const ticketNumber = `EC-${timestamp}`;
  const responseTime = calculateResponseTime(data['urgency-level']);
  
  return {
    number: ticketNumber,
    timestamp: timestamp,
    date: new Date().toLocaleString('es-ES'),
    responseTime: responseTime,
    urgency: data['urgency-level']
  };
}

function calculateResponseTime(urgency) {
  return {
    text: urgency === 'urgente' ? 'Solicitud prioritaria' : 'Plazo por confirmar',
    date: 'Se confirmará por contacto',
    hours: null
  };
}

function showQuoteConfirmation(ticket, data) {
  const confirmationDiv = document.getElementById('quote-confirmation');
  const detailsDiv = document.getElementById('quote-details');
  
  if (!confirmationDiv || !detailsDiv) {
    console.error('Elementos de confirmación no encontrados');
    showToast('Error al mostrar confirmación', 'error');
    return;
  }
  
  // Build details HTML
  const servicesText = formatRequestedServices(data.services);
  
  const safeServicesText = escapeQuoteHtml(servicesText);
  const safeAdditionalDetails = escapeQuoteHtml(data['additional-details']);
  detailsDiv.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-bold text-gray-800 mb-4">Información del Ticket</h4>
        <div class="space-y-2 text-sm">
          <p><strong>Número de Ticket:</strong> ${escapeQuoteHtml(ticket.number)}</p>
          <p><strong>Fecha de Solicitud:</strong> ${escapeQuoteHtml(ticket.date)}</p>
          <p><strong>Tiempo de Respuesta:</strong> ${escapeQuoteHtml(ticket.responseTime.text)}</p>
          <p><strong>Respuesta Estimada:</strong> ${escapeQuoteHtml(ticket.responseTime.date)}</p>
        </div>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 mb-4">Resumen de Solicitud</h4>
        <div class="space-y-2 text-sm">
          <p><strong>Cliente:</strong> ${escapeQuoteHtml(data['client-name'])}</p>
          <p><strong>Contacto:</strong> ${escapeQuoteHtml(data['client-contact'])}</p>
          <p><strong>Tipo:</strong> ${escapeQuoteHtml(formatClientType(data['client-type']))}</p>
          <p><strong>Categoría:</strong> ${escapeQuoteHtml(formatServiceCategory(data['service-category']))}</p>
        </div>
      </div>
    </div>
    <div class="mt-6">
      <h4 class="font-bold text-gray-800 mb-2">Servicios Solicitados</h4>
      <p class="text-sm text-gray-600">${safeServicesText}</p>
    </div>
    ${data['additional-details'] ? `
    <div class="mt-4">
      <h4 class="font-bold text-gray-800 mb-2">Detalles Adicionales</h4>
      <p class="text-sm text-gray-600">${safeAdditionalDetails}</p>
    </div>
    ` : ''}
  `;
  
  // Show confirmation
  confirmationDiv.classList.remove('hidden');
  confirmationDiv.scrollIntoView({ behavior: 'smooth' });
  
  // Show success toast
  showToast('Solicitud preparada. Debes enviarla por WhatsApp o correo.', 'success');
}

function sendQuoteData(ticket, data) {
  // Prepare data for sending
  const emailSubject = `Nueva Cotización - Ticket ${ticket.number}`;
  const emailBody = buildEmailBody(ticket, data);
  const whatsappMessage = buildWhatsAppMessage(ticket, data);
  
  // For urgent cases, try to open WhatsApp
  if (data['urgency-level'] === 'urgente') {
    setTimeout(() => {
      if (confirm('¿Deseas enviar esta cotización por WhatsApp para una respuesta más rápida?')) {
        const whatsappWindow = window.open(`https://wa.me/50766043511?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
        if (whatsappWindow) whatsappWindow.opener = null;
      }
    }, 2000);
  }
  
  // Always prepare email option
  const emailLink = `mailto:expresscreativa.pa@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Store for potential use
  window.lastQuoteEmailLink = emailLink;
  window.lastQuoteWhatsAppLink = `https://wa.me/50766043511?text=${encodeURIComponent(whatsappMessage)}`;
  
}

function buildEmailBody(ticket, data) {
  const servicesText = formatRequestedServices(data.services);
  
  return `
Estimado equipo de ExpressCreativa,

Solicito una cotización con los siguientes detalles:

INFORMACIÓN DEL TICKET:
- Número: ${ticket.number}
- Fecha: ${ticket.date}
- Urgencia: ${formatUrgency(data['urgency-level'])}
- Tiempo de respuesta esperado: ${ticket.responseTime.text}

INFORMACIÓN DEL CLIENTE:
- Nombre: ${data['client-name']}
- Contacto: ${data['client-contact']}
- Tipo de cliente: ${formatClientType(data['client-type'])}

SERVICIOS SOLICITADOS:
- Categoría: ${formatServiceCategory(data['service-category'])}
- Servicios: ${servicesText}

${data['additional-details'] ? `DETALLES ADICIONALES:
${data['additional-details']}` : ''}

Quedo atento a su respuesta.

Saludos cordiales,
${data['client-name']}
  `.trim();
}

function buildWhatsAppMessage(ticket, data) {
  const servicesText = formatRequestedServices(data.services);
  
  return `
🎯 *Nueva Cotización - ${ticket.number}*

👤 *Cliente:* ${data['client-name']}
📞 *Contacto:* ${data['client-contact']}
🏢 *Tipo:* ${formatClientType(data['client-type'])}
⚡ *Urgencia:* ${formatUrgency(data['urgency-level'])}

📋 *Servicios:*
${servicesText}

📂 *Categoría:* ${formatServiceCategory(data['service-category'])}

${data['additional-details'] ? `📝 *Detalles:*
${data['additional-details']}` : ''}

🕒 *Respuesta esperada:* ${ticket.responseTime.text}
  `.trim();
}

function formatClientType(type) {
  const types = {
    'microempresa': 'Microempresa (1-10 empleados)',
    'pequena-empresa': 'Pequeña Empresa (11-50 empleados)',
    'mediana-empresa': 'Mediana Empresa (51-250 empleados)',
    'evento-corporativo': 'Evento Corporativo',
    'evento-familiar': 'Evento Familiar',
    'gran-evento': 'Gran Evento',
    'independiente': 'Profesional / Independiente',
    'otro': 'Otro'
  };
  return types[type] || type;
}

function formatServiceCategory(category) {
  const categories = {
    'redes-sociales': 'Redes Sociales',
    'branding': 'Branding',
    'produccion': 'Producción Audiovisual',
    'eventos': 'Eventos',
    'desarrollo-web': 'Desarrollo Web',
    'streaming': 'Streaming',
    'marketing-digital': 'Marketing Digital',
    'consultoria': 'Consultoría'
  };
  return categories[category] || category;
}

function formatUrgency(urgency) {
  const urgencies = {
    'urgente': 'Prioritaria (plazo por confirmar)',
    'normal': 'Normal (plazo por confirmar)',
    'planificacion': 'Planificación (sin urgencia)'
  };
  return urgencies[urgency] || urgency;
}

// Add functionality to send quote via email/WhatsApp from confirmation
document.addEventListener('click', function(e) {
  if (e.target.closest('a[href*="wa.me"]') && window.lastQuoteWhatsAppLink) {
    e.preventDefault();
    const whatsappWindow = window.open(window.lastQuoteWhatsAppLink, '_blank', 'noopener,noreferrer');
    if (whatsappWindow) whatsappWindow.opener = null;
  }
  
  if (e.target.closest('a[href*="mailto"]') && window.lastQuoteEmailLink) {
    e.preventDefault();
    window.location.href = window.lastQuoteEmailLink;
  }
});

// Export functions for potential external use
window.QuoteSystem = {
  generateTicket,
  calculateResponseTime,
  validateContact,
  formatClientType,
  formatServiceCategory,
  formatUrgency
};

// Ensure showToast function is available
if (typeof showToast === 'undefined') {
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = 'display:flex;align-items:center;gap:8px';
    const text = document.createElement('span');
    text.textContent = String(message);
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Cerrar aviso');
    close.style.cssText = 'background:none;border:none;color:white;cursor:pointer;font-size:16px;padding:0;margin-left:8px';
    close.addEventListener('click', () => toast.remove());
    content.append(text, close);
    toast.appendChild(content);

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }
  
  // Make it globally available
  window.showToast = showToast;
}
