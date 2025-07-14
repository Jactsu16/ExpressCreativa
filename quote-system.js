// Quote System JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initializeQuoteSystem();
});

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
  const formData = new FormData(e.target);
  const data = {};
  
  // Process regular fields
  for (let [key, value] of formData.entries()) {
    if (key === "services") {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
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
  e.target.reset();
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
  const now = new Date();
  let responseDate;
  
  switch (urgency) {
    case 'urgente':
      responseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      return {
        text: '24 horas',
        date: responseDate.toLocaleString('es-ES'),
        hours: 24
      };
    case 'normal':
      responseDate = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours
      return {
        text: '72 horas',
        date: responseDate.toLocaleString('es-ES'),
        hours: 72
      };
    case 'planificacion':
      responseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      return {
        text: '1 semana',
        date: responseDate.toLocaleString('es-ES'),
        hours: 168
      };
    default:
      responseDate = new Date(now.getTime() + 72 * 60 * 60 * 1000);
      return {
        text: '72 horas',
        date: responseDate.toLocaleString('es-ES'),
        hours: 72
      };
  }
}

function showQuoteConfirmation(ticket, data) {
  const confirmationDiv = document.getElementById('quote-confirmation');
  const detailsDiv = document.getElementById('quote-details');
  
  // Build details HTML
  const servicesText = data.services ? data.services.join(', ') : 'No especificado';
  
  detailsDiv.innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-bold text-gray-800 mb-4">Información del Ticket</h4>
        <div class="space-y-2 text-sm">
          <p><strong>Número de Ticket:</strong> ${ticket.number}</p>
          <p><strong>Fecha de Solicitud:</strong> ${ticket.date}</p>
          <p><strong>Tiempo de Respuesta:</strong> ${ticket.responseTime.text}</p>
          <p><strong>Respuesta Estimada:</strong> ${ticket.responseTime.date}</p>
        </div>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 mb-4">Resumen de Solicitud</h4>
        <div class="space-y-2 text-sm">
          <p><strong>Cliente:</strong> ${data['client-name']}</p>
          <p><strong>Contacto:</strong> ${data['client-contact']}</p>
          <p><strong>Tipo:</strong> ${formatClientType(data['client-type'])}</p>
          <p><strong>Categoría:</strong> ${formatServiceCategory(data['service-category'])}</p>
        </div>
      </div>
    </div>
    <div class="mt-6">
      <h4 class="font-bold text-gray-800 mb-2">Servicios Solicitados</h4>
      <p class="text-sm text-gray-600">${servicesText}</p>
    </div>
    ${data['additional-details'] ? `
    <div class="mt-4">
      <h4 class="font-bold text-gray-800 mb-2">Detalles Adicionales</h4>
      <p class="text-sm text-gray-600">${data['additional-details']}</p>
    </div>
    ` : ''}
  `;
  
  // Show confirmation
  confirmationDiv.classList.remove('hidden');
  confirmationDiv.scrollIntoView({ behavior: 'smooth' });
  
  // Show success toast
  showToast('¡Cotización enviada exitosamente!', 'success');
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
        window.open(`https://wa.me/50766043511?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      }
    }, 2000);
  }
  
  // Always prepare email option
  const emailLink = `mailto:expresscreativa.pa@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Store for potential use
  window.lastQuoteEmailLink = emailLink;
  window.lastQuoteWhatsAppLink = `https://wa.me/50766043511?text=${encodeURIComponent(whatsappMessage)}`;
  
  // Log for development (remove in production)
  console.log('Quote data prepared:', { ticket, data, emailLink });
}

function buildEmailBody(ticket, data) {
  const servicesText = data.services ? data.services.join(', ') : 'No especificado';
  
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
  const servicesText = data.services ? data.services.join(', ') : 'No especificado';
  
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
    'gran-evento': 'Gran Evento'
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
    'urgente': 'Urgente (24h)',
    'normal': 'Normal (72h)',
    'planificacion': 'Planificación (1 semana)'
  };
  return urgencies[urgency] || urgency;
}

// Add functionality to send quote via email/WhatsApp from confirmation
document.addEventListener('click', function(e) {
  if (e.target.closest('a[href*="wa.me"]') && window.lastQuoteWhatsAppLink) {
    e.preventDefault();
    window.open(window.lastQuoteWhatsAppLink, '_blank');
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