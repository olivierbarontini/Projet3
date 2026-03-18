// -------------------------------------------------------------
// 1. FETCH DES WORKS DEPUIS L'API
// -------------------------------------------------------------

async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du fetch :", error);
    return [];
  }
}

// -------------------------------------------------------------
//  DELETE D'UN WORK VIA L'API
// -------------------------------------------------------------
async function deleteWork(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Erreur lors de la suppression :", response.status);
      return;
    }

    // Recharger les works après suppression
    const works = await fetchWorks();

    // Mettre à jour les deux galeries
    displayGallery(works);
    displayModalGallery(works);
  } catch (error) {
    console.error("Erreur réseau lors de la suppression :", error);
  }
}

// -------------------------------------------------------------
// 2. AFFICHAGE DE LA GALERIE
// -------------------------------------------------------------

export function displayGallery(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

// -------------------------------------------------------------
// 3. CRÉATION DES FILTRES
// -------------------------------------------------------------

function createFilters(works) {
  const filtersContainer = document.querySelector(".filters");
  filtersContainer.innerHTML = "";

  // Bouton "Tous"
  const btnAll = document.createElement("button");
  btnAll.textContent = "Tous";
  btnAll.addEventListener("click", () => displayGallery(works));
  filtersContainer.appendChild(btnAll);

  // Catégories uniques
  const categories = [];
  works.forEach((work) => {
    if (!categories.includes(work.category.name)) {
      categories.push(work.category.name);
    }
  });

  // Boutons par catégorie
  categories.forEach((categoryName) => {
    const btn = document.createElement("button");
    btn.textContent = categoryName;

    btn.addEventListener("click", () => {
      const filteredWorks = works.filter(
        (work) => work.category.name === categoryName,
      );
      displayGallery(filteredWorks);
    });

    filtersContainer.appendChild(btn);
  });
}
// -------------------------------------------------------------
// 4. AFFICHAGE DE LA GALERIE DANS LA MODALE
// -------------------------------------------------------------
function displayModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.setAttribute("data-id", work.id);

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // bouton de suppression pour chaque photo
    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("delete-icon");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    deleteBtn.addEventListener("click", () => {
      deleteWork(work.id);
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// -------------------------------------------------------------
// 5. MODE ÉDITION (activation / désactivation + logout)
// -------------------------------------------------------------

function activateEditMode() {
  // --- Création de la barre admin ---
  const adminBar = document.createElement("div");
  adminBar.classList.add("admin-bar");
  adminBar.innerHTML = `<p><i class="fa-solid fa-pen"></i> Mode édition</p>`;
  document.body.prepend(adminBar);

  // --- Transformation du bouton login en logout ---
  const loginLink = document.querySelector(".login-link");
  loginLink.textContent = "logout";
  loginLink.href = "#"; // empêche d'aller sur login.html

  // --- Gestion du clic sur logout ---
  loginLink.addEventListener("click", () => {
    localStorage.removeItem("token"); // suppression du token
    window.location.reload(); // recharge la page en mode normal
  });

  // --- Masquage des filtres + affichage du bouton modifier ---
  document.querySelector(".filters").style.display = "none";
  document.querySelector(".edit-button").style.display = "flex";
}

function deactivateEditMode() {
  const bar = document.querySelector(".admin-bar");
  if (bar) bar.remove();

  const loginLink = document.querySelector(".login-link");
  loginLink.textContent = "login";
  loginLink.href = "login.html";

  document.querySelector(".filters").style.display = "flex";
  document.querySelector(".edit-button").style.display = "none";
}

// --- Vérification du token ---
if (localStorage.getItem("token")) {
  activateEditMode();
} else {
  deactivateEditMode();
}

// -------------------------------------------------------------
// 6. MODALE : ouverture / fermeture / navigation interne
// -------------------------------------------------------------

const modal = document.getElementById("modal");
const modalOverlay = modal.querySelector(".modal-overlay");
const modalClose = modal.querySelector(".modal-close");
const editButton = document.querySelector(".edit-button");

const galleryView = modal.querySelector(".modal-gallery-view");
const formView = modal.querySelector(".modal-form-view");

const addPhotoButton = modal.querySelector(".modal-add-photo");
const backButton = modal.querySelector(".modal-back");

// Par défaut, la flèche NE DOIT PAS apparaître
backButton.style.display = "none";

// -------------------------------------------------------------
// OUVERTURE DE LA MODALE
// -------------------------------------------------------------
async function openModal() {
  modal.classList.add("is-open");

  // Accessibilité : la modale devient active
  modal.removeAttribute("inert");
  modal.setAttribute("aria-hidden", "false");

  // On recharge les travaux pour la galerie interne
  const works = await fetchWorks();
  displayModalGallery(works);

  // On affiche la vue galerie par défaut
  showGalleryView();
}

// Bouton "modifier" pour ouvrir la modale
editButton.addEventListener("click", openModal);

// -------------------------------------------------------------
// FERMETURE DE LA MODALE
// -------------------------------------------------------------
function closeModal() {
  document.activeElement.blur(); // Retire le focus de l'élément actif pour éviter les problèmes d'accessibilité
  modal.classList.remove("is-open");

  // Accessibilité : la modale devient inactive
  modal.setAttribute("inert", "");
  modal.setAttribute("aria-hidden", "true");
}

// Bouton croix
modalClose.addEventListener("click", closeModal);

// -------------------------------------------------------------
// VUE 1 : GALERIE
// -------------------------------------------------------------
function showGalleryView() {
  galleryView.hidden = false;
  formView.hidden = true;

  // La flèche doit disparaître dans la vue galerie
  backButton.style.display = "none";
}

// -------------------------------------------------------------
// VUE 2 : FORMULAIRE D'AJOUT
// -------------------------------------------------------------
function showFormView() {
  galleryView.hidden = true;
  formView.hidden = false;

  // La flèche apparaît uniquement dans cette vue
  backButton.style.display = "block";
}

// -------------------------------------------------------------
// FERMETURE EN CLIQUANT SUR L’OVERLAY
// -------------------------------------------------------------
modalOverlay.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

// -------------------------------------------------------------
// FERMETURE AVEC LA TOUCHE ÉCHAP
// -------------------------------------------------------------
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

// -------------------------------------------------------------
// NAVIGATION INTERNE ENTRE LES 2 VUES
// -------------------------------------------------------------

// Bouton "Ajouter une photo" → ouvre la vue formulaire
addPhotoButton.addEventListener("click", showFormView);

// Bouton flèche retour → revient à la galerie
backButton.addEventListener("click", showGalleryView);

// -------------------------------------------------------------
// 6. INITIALISATION DE LA PAGE
// -------------------------------------------------------------
async function init() {
  const works = await fetchWorks();
  displayGallery(works);
  createFilters(works);
}

init();
