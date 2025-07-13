// ExpressCreativa - JavaScript Functions

// Shopping cart
let cart = [];

// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Add scroll animations
  addScrollAnimations();

  // Initialize calculator if on calculator page
  if (document.getElementById("metrics-form")) {
    initializeCalculator();
  }

  // Initialize shopping cart if on services page
  if (document.getElementById("cart-modal")) {
    initializeShoppingCart();
  }

  // Add interactive features
  addInteractiveFeatures();
});

// Calculator functions
function calculateAdMetrics() {
  // Get values from form fields, default to 0 if empty
  const cost = parseFloat(document.getElementById("total-cost").value) || 0;
  const impressions =
    parseFloat(document.getElementById("impressions").value) || 0;
  const clicks = parseFloat(document.getElementById("clicks").value) || 0;
  const conversions =
    parseFloat(document.getElementById("conversions").value) || 0;
  const revenue = parseFloat(document.getElementById("revenue").value) || 0;

  // Basic validations
  if (cost <= 0) {
    showToast(
      "Por favor ingresa el coste total de la campaña (mayor que 0).",
      "error",
    );
    return;
  }
  if (impressions <= 0) {
    showToast(
      "Por favor ingresa el número de impresiones (mayor que 0).",
      "error",
    );
    return;
  }
  if (clicks < 0) {
    showToast("El número de clics no puede ser negativo.", "error");
    return;
  }
  if (conversions < 0) {
    showToast("El número de conversiones no puede ser negativo.", "error");
    return;
  }
  if (revenue < 0) {
    showToast("Los ingresos no pueden ser negativos.", "error");
    return;
  }

  // Calculate metrics with standard formulas
  const cpm = cost / (impressions / 1000); // CPM = investment / (impressions / 1000)
  const cpc = clicks > 0 ? cost / clicks : 0; // CPC = investment / clicks
  const ctr = (clicks / impressions) * 100; // CTR = (clicks / impressions) × 100
  const cpa = conversions > 0 ? cost / conversions : 0; // CPA = investment / number of actions
  const roi = ((revenue - cost) / cost) * 100; // ROI = ((profits − investment) / investment) × 100
  const cr = clicks > 0 ? (conversions / clicks) * 100 : 0; // CR = (conversions / clicks) × 100

  // Determine quality, color and recommendations for each metric
  // Guideline thresholds; adjust according to your industry
  let cpmQuality, cpmColor, cpmRec;
  if (cpm < 5) {
    cpmQuality = "Excelente CPM";
    cpmColor = "#0be881"; // green
    cpmRec =
      "¡Buen coste por mil impresiones! Tus anuncios son muy eficientes en costo.";
  } else if (cpm < 10) {
    cpmQuality = "CPM Aceptable";
    cpmColor = "#feca57"; // yellow
    cpmRec =
      "El CPM está en un rango medio; considera optimizar la audiencia o pujas.";
  } else {
    cpmQuality = "CPM Alto";
    cpmColor = "#ff6b6b"; // red
    cpmRec =
      "El CPM es elevado; revisa tu segmentación y ajuste de puja para reducir el costo.";
  }

  let cpcQuality, cpcColor, cpcRec;
  if (cpc < 1) {
    cpcQuality = "CPC Excelente";
    cpcColor = "#0be881";
    cpcRec =
      "Estás pagando muy poco por clic; continúa optimizando tu calidad de anuncio.";
  } else if (cpc < 2) {
    cpcQuality = "CPC Promedio";
    cpcColor = "#feca57";
    cpcRec =
      "Costo por clic razonable; prueba mejorar la relevancia de tu anuncio.";
  } else {
    cpcQuality = "CPC Elevado";
    cpcColor = "#ff6b6b";
    cpcRec = "El CPC es muy alto; ajusta pujas y mejora tu segmentación.";
  }

  let ctrQuality, ctrColor, ctrRec;
  if (ctr < 1) {
    ctrQuality = "CTR Bajo";
    ctrColor = "#ff6b6b";
    ctrRec =
      "Tu anuncio recibe pocos clics. Revisa el copy y el diseño para hacerlo más atractivo.";
  } else if (ctr < 3) {
    ctrQuality = "CTR Medio";
    ctrColor = "#feca57";
    ctrRec = "CTR aceptable. Experimenta con llamadas a la acción más fuertes.";
  } else {
    ctrQuality = "CTR Alto";
    ctrColor = "#0be881";
    ctrRec = "¡Gran CTR! Tu anuncio está resonando bien con la audiencia.";
  }

  let cpaQuality, cpaColor, cpaRec;
  if (cpa < 10) {
    cpaQuality = "CPA Excelente";
    cpaColor = "#0be881";
    cpaRec =
      "Costo por acción muy bajo; tu campaña está convirtiendo eficientemente.";
  } else if (cpa < 50) {
    cpaQuality = "CPA Medio";
    cpaColor = "#feca57";
    cpaRec =
      "CPA razonable. Ajusta tu página de destino para mejorar conversiones.";
  } else {
    cpaQuality = "CPA Alto";
    cpaColor = "#ff6b6b";
    cpaRec =
      "El CPA es elevado; revisa tu embudo de conversión y calidad del tráfico.";
  }

  let roiQuality, roiColor, roiRec;
  if (roi < 0) {
    roiQuality = "ROI Negativo";
    roiColor = "#ff6b6b";
    roiRec =
      "Estás perdiendo dinero. Revisa la inversión y optimiza la oferta.";
  } else if (roi < 100) {
    roiQuality = "ROI Positivo Moderado";
    roiColor = "#feca57";
    roiRec =
      "Tienes retorno, pero podría mejorar. Incrementa el valor promedio de pedido.";
  } else {
    roiQuality = "ROI Alto";
    roiColor = "#0be881";
    roiRec =
      "¡Excelente rentabilidad! Considera escalar la inversión manteniendo eficiencia.";
  }

  let crQuality, crColor, crRec;
  if (cr < 2) {
    crQuality = "CR Bajo";
    crColor = "#ff6b6b";
    crRec =
      "Tu tasa de conversión es baja; optimiza la experiencia de usuario en la landing.";
  } else if (cr < 5) {
    crQuality = "CR Medio";
    crColor = "#feca57";
    crRec =
      "Casi buen CR. Realiza pruebas A/B en formularios y llamadas a la acción.";
  } else {
    crQuality = "CR Alto";
    crColor = "#0be881";
    crRec =
      "¡Excelente conversión! Tu embudo funciona bien, mantén el óptimo flujo de usuario.";
  }

  // Build report with Tailwind and aesthetic styles
  const resultDiv = document.getElementById("ad-metrics-result");
  resultDiv.style.display = "block";
  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `
    <div class="text-center mb-12">
        <h2 class="text-4xl font-bold custom-primary mb-4">Resultados de tu Campaña</h2>
        <p class="text-xl text-gray-600">Análisis detallado de las métricas calculadas</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${createCard("CPM", "📢", `${cpm.toFixed(2)}`, cpmColor, cpmQuality, cpmRec)}
        ${createCard("CPC", "🖱️", `${cpc.toFixed(2)}`, cpcColor, cpcQuality, cpcRec)}
        ${createCard("CTR", "📊", `${ctr.toFixed(2)}%`, ctrColor, ctrQuality, ctrRec)}
        ${createCard("CPA", "🎯", `${cpa.toFixed(2)}`, cpaColor, cpaQuality, cpaRec)}
        ${createCard("ROI", "💰", `${roi.toFixed(2)}%`, roiColor, roiQuality, roiRec)}
        ${createCard("CR", "🚀", `${cr.toFixed(2)}%`, crColor, crQuality, crRec)}
    </div>
    <div class="mt-8 text-sm text-gray-500 text-center">
        📌 Tip: Evalúa cada métrica a lo largo del tiempo para detectar tendencias y actuar a tiempo.
    </div>
    `;

  // Animate results
  setTimeout(() => {
    const cards = resultDiv.querySelectorAll(".results-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("show");
      }, index * 150);
    });
  }, 100);

  // Scroll to results
  resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });

  // Show success message
  showToast("¡Métricas calculadas exitosamente!", "success");
}

function createCard(title, icon, value, bgColor, quality, recommendation) {
  return `
    <div class="results-card bg-white p-8 rounded-2xl shadow-lg text-center transition-all transform hover:scale-105" style="border-top: 6px solid ${bgColor}">
      <h3 class="text-xl font-bold custom-primary mb-3">${title}</h3>
      <p class="text-gray-600 mb-2">${quality}</p>
      <div class="text-3xl font-bold" style="color: ${bgColor}">${value}</div>
      <p class="mt-4 text-sm text-gray-600 italic">${recommendation}</p>
    </div>
  `;
}

// Initialize calculator
function initializeCalculator() {
  const form = document.getElementById("metrics-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateAdMetrics();
    });
  }
}

// Contact form handling
function initializeContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Simple validation
      if (!data.name || !data.email) {
        showToast(
          "Por favor completa los campos obligatorios (Nombre y Email)",
          "error",
        );
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        showToast("Por favor ingresa un email válido", "error");
        return;
      }

      // Simulate form submission
      showToast(
        "¡Gracias por tu interés! Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.",
        "success",
      );

      // Reset form
      this.reset();
    });
  }
}

// Add smooth animations on scroll
function addScrollAnimations() {
  const cards = document.querySelectorAll(
    ".service-card, .pricing-card, .hover-lift",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  cards.forEach((card) => {
    observer.observe(card);
  });
}

// Add interactive features
function addInteractiveFeatures() {
  // Add hover effects to service cards
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Initialize contact form
  initializeContactForm();
}

// Toast notification system
function showToast(message, type = "info") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fas fa-${getToastIcon(type)}"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Add to page
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }, 5000);
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "check-circle";
    case "error":
      return "exclamation-circle";
    case "warning":
      return "exclamation-triangle";
    default:
      return "info-circle";
  }
}

// Form validation helpers
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone);
}

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Performance monitoring
function measurePerformance() {
  if ("performance" in window) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        const perfData = performance.getEntriesByType("navigation")[0];
        if (perfData) {
          console.log(
            `Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`,
          );
        }
      }, 0);
    });
  }
}

// Error handling
window.addEventListener("error", function (e) {
  console.error("JavaScript error:", e.error);
  // Could send error reports to analytics here
});

// Shopping Cart Functions
function initializeShoppingCart() {
  // Cart buttons
  const cartBtn = document.getElementById("cart-btn");
  const cartBtnMobile = document.getElementById("cart-btn-mobile");
  const cartModal = document.getElementById("cart-modal");
  const closeCartBtn = document.getElementById("close-cart");

  // Open cart modal
  if (cartBtn) {
    cartBtn.addEventListener("click", function () {
      cartModal.classList.remove("hidden");
      updateCartDisplay();
    });
  }

  if (cartBtnMobile) {
    cartBtnMobile.addEventListener("click", function () {
      cartModal.classList.remove("hidden");
      updateCartDisplay();
    });
  }

  // Close cart modal
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", function () {
      cartModal.classList.add("hidden");
    });
  }

  // Close cart when clicking outside
  if (cartModal) {
    cartModal.addEventListener("click", function (e) {
      if (e.target === cartModal) {
        cartModal.classList.add("hidden");
      }
    });
  }

  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const service = {
        id: this.dataset.id,
        name: this.dataset.name,
        price: parseFloat(this.dataset.price),
        description: this.dataset.description,
        quantity: 1,
      };
      addToCart(service);
    });
  });

  updateCartCount();
}

function addToCart(service) {
  const existingItem = cart.find((item) => item.id === service.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(service);
  }

  updateCartCount();
  showToast(`${service.name} agregado al carrito`, "success");
}

function removeFromCart(serviceId) {
  cart = cart.filter((item) => item.id !== serviceId);
  updateCartCount();
  updateCartDisplay();
}

function updateQuantity(serviceId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(serviceId);
    return;
  }

  const item = cart.find((item) => item.id === serviceId);
  if (item) {
    item.quantity = newQuantity;
    updateCartCount();
    updateCartDisplay();
  }
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  const cartCountMobile = document.getElementById("cart-count-mobile");

  if (cartCount) {
    if (totalItems > 0) {
      cartCount.textContent = totalItems;
      cartCount.classList.remove("hidden");
    } else {
      cartCount.classList.add("hidden");
    }
  }

  if (cartCountMobile) {
    cartCountMobile.textContent = totalItems;
  }
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const cartFooter = document.getElementById("cart-footer");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartFooter || !cartTotal) return;
  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="text-gray-500 text-center py-8">Tu carrito está vacío</p>';
    cartFooter.classList.add("hidden");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="flex justify-between items-start bg-gray-50 p-4 rounded-xl mb-3">
      <div class="flex-1">
        <h4 class="font-medium text-sm mb-1">${item.name}</h4>
        <p class="text-xs text-gray-600 mb-2">${item.description}</p>
        <p class="text-xs font-medium text-gray-800">$${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <div class="flex flex-col items-end space-y-2 ml-4">
        <div class="flex items-center space-x-2">
        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="bg-gray-200 text-gray-700 w-6 h-6 rounded-full text-sm hover:bg-gray-300">-</button>
        <span class="text-sm w-8 text-center">${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="bg-gray-200 text-gray-700 w-6 h-6 rounded-full text-sm hover:bg-gray-300">+</button>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 text-sm ml-2">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("");

  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartFooter.classList.remove("hidden");
}

// Initialize performance monitoring
measurePerformance();

// Keyboard navigation support
document.addEventListener("keydown", function (e) {
  // Close mobile menu on Escape
  if (e.key === "Escape") {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
  }

  // Calculator shortcut (Ctrl + Enter to calculate)
  if (e.ctrlKey && e.key === "Enter") {
    const calculateBtn = document.getElementById("calculate-btn");
    if (calculateBtn) {
      calculateBtn.click();
    }
  }
});

// Print support
function preparePrint() {
  window.print();
}

// Export results (future feature)
function exportResults() {
  showToast("Función de exportación próximamente disponible", "info");
}

// Browser compatibility checks
function checkBrowserSupport() {
  const features = {
    localStorage: typeof Storage !== "undefined",
    fetch: typeof fetch !== "undefined",
    promise: typeof Promise !== "undefined",
  };

  const unsupported = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (unsupported.length > 0) {
    console.warn(
      "Unsupported browser features:",
      unsupported.join(", "),
      "Some functionality may not work properly.",
    );
  }
}

// Initialize browser checks
checkBrowserSupport();

// Checkout functionality
function proceedToCheckout() {
  if (cart.length === 0) {
    showToast("Tu carrito está vacío", "error");
    return;
  }

  // Show terms and conditions first
  showTermsForCheckout();
}

function showTermsForCheckout() {
  const termsModal = document.getElementById('terms-modal');
  const acceptBtn = document.getElementById('accept-terms');
  const declineBtn = document.getElementById('decline-terms');
  const closeBtn = document.getElementById('close-terms');
  
  if (termsModal) {
    termsModal.classList.remove('hidden');
    
    // Handle accept
    acceptBtn.onclick = function() {
      termsModal.classList.add('hidden');
      processCheckout();
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
    processCheckout();
  }
}

function processCheckout() {
  // Generate checkout summary
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsList = cart.map(item => `${item.name} (x${item.quantity}) - B/.${(item.price * item.quantity).toFixed(2)}`).join('\n');
  
  const checkoutMessage = `
🛒 *Solicitud de Servicios - ExpressCreativa*

📋 *Servicios Solicitados:*
${itemsList}

💰 *Total: B/.${total.toFixed(2)}*

✅ *He aceptado los términos y condiciones de ExpressCreativa*
Me interesa contratar estos servicios. ¿Podrían enviarme más información sobre el proceso de contratación y formas de pago?

¡Gracias!
  `.trim();

  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/50766043511?text=${encodeURIComponent(checkoutMessage)}`;
  window.open(whatsappUrl, '_blank');
  
  showToast("Redirigiendo a WhatsApp para completar tu solicitud", "success");
}

// Service Worker registration (for PWA support)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Uncomment when service worker is ready
    // navigator.serviceWorker.register('/sw.js')
    //   .then(function(registration) {
    //     console.log('SW registered: ', registration);
    //   })
    //   .catch(function(registrationError) {
    //     console.log('SW registration failed: ', registrationError);
    //   });
  });
}
