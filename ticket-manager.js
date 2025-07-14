// Ticket Manager - Sistema centralizado de gestión de tickets
class CentralizedTicketManager {
  constructor() {
    this.tickets = this.loadTickets();
    this.yamlFilename = 'expresscreativa_tickets.yml';
    this.initializeEventListeners();
  }

  // Cargar tickets desde localStorage
  loadTickets() {
    try {
      const stored = localStorage.getItem('expresscreativa_all_tickets');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tickets:', error);
      return [];
    }
  }

  // Guardar tickets en localStorage
  saveTickets() {
    try {
      localStorage.setItem('expresscreativa_all_tickets', JSON.stringify(this.tickets));
      return true;
    } catch (error) {
      console.error('Error saving tickets:', error);
      return false;
    }
  }

  // Crear nuevo ticket y agregarlo al archivo central
  createTicket(formData) {
    const ticket = {
      id: this.generateTicketId(),
      number: `EC-${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      status: 'pending',
      priority: this.getPriority(formData['urgency-level']),
      client: {
        name: formData['client-name'],
        contact: formData['client-contact'],
        type: formData['client-type']
      },
      project: {
        urgency: formData['urgency-level'],
        category: formData['service-category'],
        services: formData.services || [],
        details: formData['additional-details'] || ''
      },
      response: {
        expectedTime: this.calculateResponseTime(formData['urgency-level']),
        actualTime: null,
        notes: '',
        assignedTo: null
      },
      created: new Date().toLocaleString('es-ES'),
      updated: new Date().toLocaleString('es-ES')
    };

    // Agregar al inicio de la lista (más recientes primero)
    this.tickets.unshift(ticket);
    
    // Mantener solo los últimos 100 tickets en memoria
    if (this.tickets.length > 100) {
      this.tickets = this.tickets.slice(0, 100);
    }
    
    // Guardar en localStorage
    this.saveTickets();
    
    // Generar archivo YAML centralizado actualizado
    this.generateCentralYAML();
    
    // Mostrar estadísticas
    this.showTicketStats();
    
    return ticket;
  }

  // Generar ID único
  generateTicketId() {
    return 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Obtener prioridad numérica
  getPriority(urgency) {
    const priorities = {
      'urgente': 1,
      'normal': 2,
      'planificacion': 3
    };
    return priorities[urgency] || 2;
  }

  // Calcular tiempo de respuesta
  calculateResponseTime(urgency) {
    const now = new Date();
    let responseDate;
    
    switch (urgency) {
      case 'urgente':
        responseDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return {
          text: '24 horas',
          date: responseDate.toISOString(),
          hours: 24
        };
      case 'normal':
        responseDate = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        return {
          text: '72 horas',
          date: responseDate.toISOString(),
          hours: 72
        };
      case 'planificacion':
        responseDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
          text: '1 semana',
          date: responseDate.toISOString(),
          hours: 168
        };
      default:
        responseDate = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        return {
          text: '72 horas',
          date: responseDate.toISOString(),
          hours: 72
        };
    }
  }

  // Generar archivo YAML centralizado con TODOS los tickets
  generateCentralYAML() {
    const yamlContent = this.generateCentralYAMLContent();
    this.downloadFile(yamlContent, this.yamlFilename, 'text/yaml');
    
    // También generar backup en JSON
    const jsonContent = JSON.stringify({
      metadata: this.getMetadata(),
      tickets: this.tickets
    }, null, 2);
    this.downloadFile(jsonContent, 'expresscreativa_tickets_backup.json', 'application/json');
  }

  // Generar contenido YAML central
  generateCentralYAMLContent() {
    const metadata = this.getMetadata();
    
    let yaml = `# ExpressCreativa - Base de Datos de Tickets
# Archivo centralizado con todos los tickets de cotización
# Última actualización: ${new Date().toLocaleString('es-ES')}

metadata:
  company: "ExpressCreativa"
  system: "Ticket Management System"
  version: "1.0"
  total_tickets: ${this.tickets.length}
  last_updated: "${new Date().toISOString()}"
  generated: "${new Date().toLocaleString('es-ES')}"
  stats:
    pending: ${metadata.stats.pending}
    urgent: ${metadata.stats.urgent}
    normal: ${metadata.stats.normal}
    planning: ${metadata.stats.planning}

# ═══════════════════════════════════════════════════════════════
# TICKETS (Ordenados por fecha - Más recientes primero)
# ═══════════════════════════════════════════════════════════════

tickets:
`;

    // Agregar cada ticket
    this.tickets.forEach((ticket, index) => {
      yaml += `
  # ───────────────────────────────────────────────────────────
  # Ticket ${index + 1}: ${ticket.number}
  # ───────────────────────────────────────────────────────────
  - id: "${ticket.id}"
    number: "${ticket.number}"
    status: "${ticket.status}"
    priority: ${ticket.priority}
    timestamp: ${ticket.timestamp}
    created: "${ticket.created}"
    updated: "${ticket.updated}"
    
    client:
      name: "${ticket.client.name}"
      contact: "${ticket.client.contact}"
      type: "${ticket.client.type}"
    
    project:
      urgency: "${ticket.project.urgency}"
      category: "${ticket.project.category}"
      services:${ticket.project.services.map(service => `\n        - "${service}"`).join('')}
      details: |
${ticket.project.details.split('\n').map(line => `        ${line}`).join('\n')}
    
    response:
      expected_time: "${ticket.response.expectedTime.text}"
      expected_date: "${ticket.response.expectedTime.date}"
      expected_hours: ${ticket.response.expectedTime.hours}
      actual_time: ${ticket.response.actualTime || 'null'}
      assigned_to: ${ticket.response.assignedTo || 'null'}
      notes: "${ticket.response.notes}"
`;
    });

    yaml += `
# ═══════════════════════════════════════════════════════════════
# FIN DEL ARCHIVO
# Total de tickets: ${this.tickets.length}
# ═══════════════════════════════════════════════════════════════
`;

    return yaml;
  }

  // Obtener metadata del sistema
  getMetadata() {
    const stats = {
      pending: this.tickets.filter(t => t.status === 'pending').length,
      urgent: this.tickets.filter(t => t.project.urgency === 'urgente').length,
      normal: this.tickets.filter(t => t.project.urgency === 'normal').length,
      planning: this.tickets.filter(t => t.project.urgency === 'planificacion').length
    };

    return {
      totalTickets: this.tickets.length,
      lastUpdate: new Date().toISOString(),
      stats: stats
    };
  }

  // Mostrar estadísticas en pantalla
  showTicketStats() {
    const metadata = this.getMetadata();
    
    if (typeof showToast !== 'undefined') {
      showToast(`Ticket creado. Total: ${metadata.totalTickets} | Pendientes: ${metadata.stats.pending}`, 'success');
    }
    
    console.log('📊 Estadísticas de Tickets:', metadata);
  }

  // Función para descargar archivos
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Formatear fecha para nombres de archivo
  formatDateForFilename(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  // Exportar todos los tickets
  exportAllTickets() {
    this.generateCentralYAML();
    
    if (typeof showToast !== 'undefined') {
      showToast('Archivo YAML central descargado con todos los tickets', 'success');
    }
  }

  // Limpiar tickets antiguos (mantener solo los últimos N)
  cleanOldTickets(keepLast = 50) {
    if (this.tickets.length > keepLast) {
      this.tickets = this.tickets.slice(0, keepLast);
      this.saveTickets();
      
      if (typeof showToast !== 'undefined') {
        showToast(`Limpieza realizada. Mantenidos los últimos ${keepLast} tickets`, 'info');
      }
    }
  }

  // Buscar tickets
  searchTickets(query) {
    const searchTerm = query.toLowerCase();
    return this.tickets.filter(ticket => 
      ticket.number.toLowerCase().includes(searchTerm) ||
      ticket.client.name.toLowerCase().includes(searchTerm) ||
      ticket.client.contact.toLowerCase().includes(searchTerm) ||
      ticket.project.category.toLowerCase().includes(searchTerm)
    );
  }

  // Obtener tickets por estado
  getTicketsByStatus(status) {
    return this.tickets.filter(ticket => ticket.status === status);
  }

  // Obtener tickets por urgencia
  getTicketsByUrgency(urgency) {
    return this.tickets.filter(ticket => ticket.project.urgency === urgency);
  }

  // Inicializar event listeners
  initializeEventListeners() {
    // Agregar botón de exportación si no existe
    this.addExportButton();
  }

  // Agregar botón de exportación
  addExportButton() {
    // Solo agregar si estamos en la página de cotización
    if (document.getElementById('quote-confirmation')) {
      const exportBtn = document.createElement('button');
      exportBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Descargar Todos los Tickets (YAML)';
      exportBtn.className = 'bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-all mt-4';
      exportBtn.onclick = () => this.exportAllTickets();
      
      // Agregar al final de la confirmación
      const confirmation = document.getElementById('quote-confirmation');
      if (confirmation) {
        confirmation.appendChild(exportBtn);
      }
    }
  }
}

// Crear instancia global
window.centralTicketManager = new CentralizedTicketManager();

// Integrar con el sistema existente
if (typeof window.QuoteSystem !== 'undefined') {
  const originalGenerateTicket = window.QuoteSystem.generateTicket;
  
  window.QuoteSystem.generateTicket = function(data) {
    // Crear ticket con el sistema original
    const ticket = originalGenerateTicket(data);
    
    // Agregarlo al sistema centralizado
    window.centralTicketManager.createTicket(data);
    
    return ticket;
  };
}

// Funciones de utilidad globales
window.TicketUtils = {
  exportAllTickets: () => window.centralTicketManager.exportAllTickets(),
  getTicketStats: () => window.centralTicketManager.getMetadata(),
  searchTickets: (query) => window.centralTicketManager.searchTickets(query),
  cleanOldTickets: (keep) => window.centralTicketManager.cleanOldTickets(keep)
};

console.log('✅ Sistema centralizado de tickets inicializado');
console.log('📁 Archivo YAML: expresscreativa_tickets.yml');
console.log('🔧 Funciones disponibles: window.TicketUtils');