        // Calculator functions
    function calculateAdMetrics() {
    // Obtener valores de los campos, si están vacíos toman 0 por defecto
    const cost = parseFloat(document.getElementById('total-cost').value) || 0;
    const impressions = parseFloat(document.getElementById('impressions').value) || 0;
    const clicks = parseFloat(document.getElementById('clicks').value) || 0;
    const conversions = parseFloat(document.getElementById('conversions').value) || 0;
    const revenue = parseFloat(document.getElementById('revenue').value) || 0;

    // Validaciones básicas
    if (cost <= 0) {
      alert('Por favor ingresa el coste total de la campaña (mayor que 0).');
      return;
    }
    if (impressions <= 0) {
      alert('Por favor ingresa el número de impresiones (mayor que 0).');
      return;
    }
    if (clicks < 0) {
      alert('El número de clics no puede ser negativo.');
      return;
    }
    if (conversions < 0) {
      alert('El número de conversiones no puede ser negativo.');
      return;
    }
    if (revenue < 0) {
      alert('Los ingresos no pueden ser negativos.');
      return;
    }

    // Cálculos de las métricas con las fórmulas estándar
    const cpm = cost / (impressions / 1000);                   // CPM = inversión / (impresiones / 1000)
    const cpc = clicks > 0 ? cost / clicks : 0;                // CPC = inversión / clics
    const ctr = (clicks / impressions) * 100;                  // CTR = (clics / impresiones) × 100
    const cpa = conversions > 0 ? cost / conversions : 0;      // CPA = inversión / número de acciones
    const roi = ((revenue - cost) / cost) * 100;                // ROI = ((ganancias − inversión) / inversión) × 100
    const cr = clicks > 0 ? (conversions / clicks) * 100 : 0;  // CR = (conversiones / clics) × 100

    // Determinar calidad, color y recomendaciones para cada métrica
    // Umbrales orientativos; ajústalos según tu industria
    let cpmQuality, cpmColor, cpmRec;
    if (cpm < 5) {
      cpmQuality = 'Excelente CPM';
      cpmColor = '#0be881';  // verde
      cpmRec = '¡Buen coste por mil impresiones! Tus anuncios son muy eficientes en costo.';
    } else if (cpm < 10) {
      cpmQuality = 'CPM Aceptable';
      cpmColor = '#feca57';  // amarillo
      cpmRec = 'El CPM está en un rango medio; considera optimizar la audiencia o pujas.';
    } else {
      cpmQuality = 'CPM Alto';
      cpmColor = '#ff6b6b';  // rojo
      cpmRec = 'El CPM es elevado; revisa tu segmentación y ajuste de puja para reducir el costo.';
    }

    let cpcQuality, cpcColor, cpcRec;
    if (cpc < 1) {
      cpcQuality = 'CPC Excelente';
      cpcColor = '#0be881';
      cpcRec = 'Estás pagando muy poco por clic; continúa optimizando tu calidad de anuncio.';
    } else if (cpc < 2) {
      cpcQuality = 'CPC Promedio';
      cpcColor = '#feca57';
      cpcRec = 'Costo por clic razonable; prueba mejorar la relevancia de tu anuncio.';
    } else {
      cpcQuality = 'CPC Elevado';
      cpcColor = '#ff6b6b';
      cpcRec = 'El CPC es muy alto; ajusta pujas y mejora tu segmentación.';
    }

    let ctrQuality, ctrColor, ctrRec;
    if (ctr < 1) {
      ctrQuality = 'CTR Bajo';
      ctrColor = '#ff6b6b';
      ctrRec = 'Tu anuncio recibe pocos clics. Revisa el copy y el diseño para hacerlo más atractivo.';
    } else if (ctr < 3) {
      ctrQuality = 'CTR Medio';
      ctrColor = '#feca57';
      ctrRec = 'CTR aceptable. Experimenta con llamadas a la acción más fuertes.';
    } else {
      ctrQuality = 'CTR Alto';
      ctrColor = '#0be881';
      ctrRec = '¡Gran CTR! Tu anuncio está resonando bien con la audiencia.';
    }

    let cpaQuality, cpaColor, cpaRec;
    if (cpa < 10) {
      cpaQuality = 'CPA Excelente';
      cpaColor = '#0be881';
      cpaRec = 'Costo por acción muy bajo; tu campaña está convirtiendo eficientemente.';
    } else if (cpa < 50) {
      cpaQuality = 'CPA Medio';
      cpaColor = '#feca57';
      cpaRec = 'CPA razonable. Ajusta tu página de destino para mejorar conversiones.';
    } else {
      cpaQuality = 'CPA Alto';
      cpaColor = '#ff6b6b';
      cpaRec = 'El CPA es elevado; revisa tu embudo de conversión y calidad del tráfico.';
    }

    let roiQuality, roiColor, roiRec;
    if (roi < 0) {
      roiQuality = 'ROI Negativo';
      roiColor = '#ff6b6b';
      roiRec = 'Estás perdiendo dinero. Revisa la inversión y optimiza la oferta.';
    } else if (roi < 100) {
      roiQuality = 'ROI Positivo Moderado';
      roiColor = '#feca57';
      roiRec = 'Tienes retorno, pero podría mejorar. Incrementa el valor promedio de pedido.';
    } else {
      roiQuality = 'ROI Alto';
      roiColor = '#0be881';
      roiRec = '¡Excelente rentabilidad! Considera escalar la inversión manteniendo eficiencia.';
    }

    let crQuality, crColor, crRec;
    if (cr < 2) {
      crQuality = 'CR Bajo';
      crColor = '#ff6b6b';
      crRec = 'Tu tasa de conversión es baja; optimiza la experiencia de usuario en la landing.';
    } else if (cr < 5) {
      crQuality = 'CR Medio';
      crColor = '#feca57';
      crRec = 'Casi buen CR. Realiza pruebas A/B en formularios y llamadas a la acción.';
    } else {
      crQuality = 'CR Alto';
      crColor = '#0be881';
      crRec = '¡Excelente conversión! Tu embudo funciona bien, mantén el óptimo flujo de usuario.';
    }

// Construir informe con Tailwind y estilos estéticos
        const resultDiv = document.getElementById('ad-metrics-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
        <div class="text-center mb-12">
            <h2 class="text-4xl font-bold custom-primary mb-4">Resultados de tu Campaña</h2>
            <p class="text-xl text-gray-600">Análisis detallado de las métricas calculadas</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${createCard('CPM', '📢', `${cpm.toFixed(2)}`, cpmColor, cpmQuality, cpmRec)}
            ${createCard('CPC', '🖱️', `${cpc.toFixed(2)}`, cpcColor, cpcQuality, cpcRec)}
            ${createCard('CTR', '📊', `${ctr.toFixed(2)}%`, ctrColor, ctrQuality, ctrRec)}
            ${createCard('CPA', '🎯', `${cpa.toFixed(2)}`, cpaColor, cpaQuality, cpaRec)}
            ${createCard('ROI', '💰', `${roi.toFixed(2)}%`, roiColor, roiQuality, roiRec)}
            ${createCard('CR', '🚀', `${cr.toFixed(2)}%`, crColor, crQuality, crRec)}
        </div>
        <div class="mt-8 text-sm text-gray-500 text-center">📌 Tip: Evalúa cada métrica a lo largo del tiempo para detectar tendencias y actuar a tiempo.</div>
        `;

        function createCard(title, icon, value, bgColor, quality, recommendation) {
  return `
    <div class="results-card bg-white p-8 rounded-2xl shadow-lg text-center transition-all transform hover:scale-105" style="border-top: 6px solid ${bgColor}">
      <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background-color: ${bgColor}">
        <span class="text-white text-2xl">${icon}</span>
      </div>
      <h3 class="text-xl font-bold custom-primary mb-3">${title}</h3>
      <p class="text-gray-600 mb-2">${quality}</p>
      <div class="text-3xl font-bold" style="color: ${bgColor}">${value}</div>
      <p class="mt-4 text-sm text-gray-600 italic">${recommendation}</p>
    </div>
  `;
}

    }

        
          

        // Contact form handling
        document.getElementById('contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Simple validation
            if (!data.name || !data.email) {
                alert('Por favor completa los campos obligatorios (Nombre y Email)');
                return;
            }
            
            // Simulate form submission
            alert('¡Gracias por tu interés! Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.');
            
            // Reset form
            this.reset();
        });

        // Add smooth animations on scroll
        function addScrollAnimations() {
            const cards = document.querySelectorAll('.service-card, .pricing-card');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            });
            
            cards.forEach(card => {
                observer.observe(card);
            });
        }

        // Initialize animations when page loads
        document.addEventListener('DOMContentLoaded', function() {
            addScrollAnimations();
        });

        // Add some interactive features
        document.addEventListener('DOMContentLoaded', function() {
            // Add hover effects to service cards
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-10px) scale(1.02)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });