// Gallery functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeGallery();
});

function initializeGallery() {
  // Filter functionality
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");
  const loadMoreBtn = document.getElementById("load-more-btn");

  // Set up filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");

      // Update active button
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.classList.add("text-gray-700", "bg-gray-100");
        btn.classList.remove("custom-bg-primary", "text-white");
      });

      this.classList.add("active");
      this.classList.remove("text-gray-700", "bg-gray-100");
      this.classList.add("custom-bg-primary", "text-white");

      // Filter projects
      filterProjects(filter);
    });
  });

  // Initialize active filter button styling
  const activeBtn = document.querySelector(".filter-btn.active");
  if (activeBtn) {
    activeBtn.classList.add("custom-bg-primary", "text-white");
    activeBtn.classList.remove("text-gray-700", "bg-gray-100");
  }

  // Set up non-active buttons
  filterButtons.forEach((btn) => {
    if (!btn.classList.contains("active")) {
      btn.classList.add("text-gray-700", "bg-gray-100");
    }
  });

  // Load more functionality
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      loadMoreProjects();
    });
  }

  // Initialize scroll animations for gallery items
  observeGalleryItems();
}

function filterProjects(category) {
  const projectItems = document.querySelectorAll(".project-item");

  projectItems.forEach((item, index) => {
    const itemCategory = item.getAttribute("data-category");

    if (category === "all" || itemCategory === category) {
      // Show item with animation
      item.style.display = "block";
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100);
    } else {
      // Hide item
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      setTimeout(() => {
        item.style.display = "none";
      }, 300);
    }
  });
}

function loadMoreProjects() {
  const loadMoreBtn = document.getElementById("load-more-btn");
  const projectsGrid = document.getElementById("projects-grid");

  // Show loading state
  loadMoreBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i>Cargando...';
  loadMoreBtn.disabled = true;

  // Simulate loading delay
  setTimeout(() => {
    // Add more projects (this would normally come from an API)
    const newProjects = createAdditionalProjects();
    newProjects.forEach((project) => {
      projectsGrid.appendChild(project);
    });

    // Reset button
    loadMoreBtn.innerHTML =
      '<i class="fas fa-plus mr-2"></i>Cargar Más Proyectos';
    loadMoreBtn.disabled = false;

    // Show success message
    showToast("Se han cargado más proyectos", "success");

    // Re-observe new items
    observeGalleryItems();
  }, 1500);
}

function createAdditionalProjects() {
  const additionalProjects = [
    {
      category: "web",
      title: "Portal Educativo",
      description:
        "Plataforma de aprendizaje online con sistema de cursos y certificaciones.",
      image:
        "https://via.placeholder.com/400x300/0656C7/ffffff?text=Portal+Educativo",
      year: "2024",
      tags: ["Vue.js", "Laravel", "MySQL"],
      type: "Desarrollo Web",
      bgColor: "custom-bg-primary",
    },
    {
      category: "branding",
      title: "Hotel Boutique",
      description:
        "Identidad visual completa para hotel de lujo con enfoque en sostenibilidad.",
      image:
        "https://via.placeholder.com/400x300/C4A451/ffffff?text=Hotel+Boutique",
      year: "2024",
      tags: ["Branding", "Packaging", "Señalética"],
      type: "Branding",
      bgColor: "custom-bg-gold",
    },
    {
      category: "marketing",
      title: "Campaña Fitness",
      description:
        "Estrategia digital 360° para cadena de gimnasios con enfoque en redes sociales.",
      image:
        "https://via.placeholder.com/400x300/008060/ffffff?text=Campaña+Fitness",
      year: "2024",
      tags: ["Instagram", "TikTok", "Influencers"],
      type: "Marketing",
      bgColor: "custom-bg-green",
    },
  ];

  return additionalProjects.map((project) => createProjectElement(project));
}

function createProjectElement(project) {
  const article = document.createElement("article");
  article.className =
    "project-item group bg-white rounded-2xl shadow-lg overflow-hidden hover-lift";
  article.setAttribute("data-category", project.category);

  const typeColors = {
    "Desarrollo Web": "bg-blue-100 text-blue-800",
    Streaming: "bg-orange-100 text-orange-800",
    Branding: "bg-yellow-100 text-yellow-800",
    Marketing: "bg-green-100 text-green-800",
  };

  article.innerHTML = `
    <div class="relative overflow-hidden">
      <img
        src="${project.image}"
        alt="Proyecto ${project.title}"
        class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 class="text-lg font-bold mb-1">${project.title}</h3>
        <p class="text-sm">${project.description.substring(0, 50)}...</p>
      </div>
    </div>
    <div class="p-6">
      <div class="flex items-center justify-between mb-3">
        <span class="${typeColors[project.type]} px-3 py-1 rounded-full text-sm font-medium">${project.type}</span>
        <span class="text-gray-500 text-sm">${project.year}</span>
      </div>
      <h3 class="text-xl font-bold custom-primary mb-2">${project.title}</h3>
      <p class="text-gray-600 mb-4">${project.description}</p>
      <div class="flex flex-wrap gap-2 mb-4">
        ${project.tags.map((tag) => `<span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${tag}</span>`).join("")}
      </div>
      <button class="w-full ${project.bgColor} text-white py-2 rounded-xl hover:bg-opacity-90 transition-all">
        Ver Proyecto
      </button>
    </div>
  `;

  return article;
}

function observeGalleryItems() {
  const items = document.querySelectorAll(".project-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  items.forEach((item) => {
    // Set initial state for new items
    if (!item.style.opacity) {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "all 0.6s ease";
    }
    observer.observe(item);
  });
}

// Project modal functionality (for future implementation)
function openProjectModal(projectData) {
  // This would open a modal with full project details
  console.log("Opening project modal for:", projectData);
  showToast("Modal de proyecto próximamente disponible", "info");
}

// Add click handlers to project buttons
document.addEventListener("click", function (e) {
  if (
    e.target.textContent === "Ver Proyecto" ||
    e.target.closest("button")?.textContent === "Ver Proyecto"
  ) {
    e.preventDefault();
    const projectCard = e.target.closest(".project-item");
    const projectTitle = projectCard.querySelector("h3").textContent;
    openProjectModal({ title: projectTitle });
  }
});

// Search functionality (for future implementation)
function initializeSearch() {
  const searchInput = document.getElementById("project-search");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      filterProjectsBySearch(searchTerm);
    });
  }
}

function filterProjectsBySearch(searchTerm) {
  const projectItems = document.querySelectorAll(".project-item");

  projectItems.forEach((item) => {
    const title = item.querySelector("h3").textContent.toLowerCase();
    const description = item.querySelector("p").textContent.toLowerCase();

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// Lazy loading for images
function initializeLazyLoading() {
  const images = document.querySelectorAll("img[loading='lazy']");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src; // Trigger loading
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

// Initialize lazy loading
initializeLazyLoading();

// Keyboard navigation
document.addEventListener("keydown", function (e) {
  // Filter shortcuts
  if (e.altKey) {
    switch (e.key) {
      case "1":
        document.querySelector('[data-filter="all"]').click();
        break;
      case "2":
        document.querySelector('[data-filter="web"]').click();
        break;
      case "3":
        document.querySelector('[data-filter="streaming"]').click();
        break;
      case "4":
        document.querySelector('[data-filter="branding"]').click();
        break;
      case "5":
        document.querySelector('[data-filter="marketing"]').click();
        break;
    }
  }
});

// Analytics tracking (placeholder)
function trackGalleryInteraction(action, category) {
  // This would send data to analytics
  console.log(`Gallery interaction: ${action} - ${category}`);
}

// Social sharing (for future implementation)
function shareProject(projectTitle, projectUrl) {
  if (navigator.share) {
    navigator
      .share({
        title: `${projectTitle} - ExpressCreativa`,
        text: `Mira este increíble proyecto de ExpressCreativa: ${projectTitle}`,
        url: projectUrl,
      })
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing", error));
  } else {
    // Fallback for browsers that don't support native sharing
    showToast("Función de compartir próximamente disponible", "info");
  }
}
