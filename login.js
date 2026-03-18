const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  /* Récupération des données du formulaire */
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  /* Création de l'objet USER avec les données du formulaire */
  const user = {
    email: email,
    password: password,
  };

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (response.status === 200) {
      /* si OK , on récupère le JSON renvoyé par l'API (data) */
      const data = await response.json();
      /* on stocke le token dans le localStorage et on redirige vers la page d'accueil*/
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else if (response.status === 401) {
      document.querySelector(".error-message").textContent =
        "Erreur dans l’identifiant ou le mot de passe";
    } else {
      document.querySelector(".error-message").textContent =
        "Une erreur est survenue";
    }
  } catch (error) {
    console.error("Erreur :", error); /* Message pour aider au debug */
    document.querySelector(".error-message").textContent =
      "Impossible de se connecter au serveur";
  }
});
