// Fonction getToken universelle
function getToken() {
    const cookieToken = getCookie("X-Auth-TOKEN");
    const localStorageToken = localStorage.getItem("X-Auth-TOKEN");

    if (cookieToken) {
        console.log("Token récupéré depuis les cookies:", cookieToken);
        return cookieToken;
    }
    if (localStorageToken) {
        console.log("Token récupéré depuis le localStorage:", localStorageToken);
        return localStorageToken;
    }

    console.error("Aucun token d'authentification trouvé.");
    alert("Veuillez vous connecter pour continuer.");
    window.location.href = "/signin";
    return null;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
    }
    return null;
}

function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}

// Références des éléments HTML
const inputNom = document.getElementById("NomInput");
const inputPrenom = document.getElementById("PrenomInput");
const inputMail = document.getElementById("EmailInput");
const inputRole = document.getElementById("RoleInput");
const btnSigninA = document.getElementById("btnSigninA");
const resultContainer = document.getElementById("resultContainer");

btnSigninA.addEventListener("click", handleSearch);

function handleSearch() {
    const data = {
        firstName: inputPrenom.value.trim(), // Prénom → firstName
        lastName: inputNom.value.trim(),     // Nom → lastName
        email: inputMail.value.trim(),
        role: inputRole.value.trim(),
    };

    if (!data.lastName && !data.firstName && !data.email && !data.role) {
        alert("Veuillez remplir au moins un champ pour effectuer une recherche.");
        return;
    }

    fetchUsers(data);
}

function fetchUsers(data) {
    const token = getToken();
    if (!token) return;

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    fetch("http://127.0.0.1:8000/api/admin/users/search", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(data),
    })
    .then((response) => {
        if (!response.ok) {
            if (response.status === 401) {
                alert("Vous n'êtes pas autorisé à accéder à cette ressource.");
            }
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return response.json();
    })
    .then((result) => afficherResultats(result))
    .catch((error) => {
        console.error("Erreur :", error);
        alert("Erreur lors de la recherche: " + error.message);
    });
}

function afficherResultats(users) {
    if (!users || !users.length) {
        resultContainer.innerHTML = `<p class="text-white">Aucun utilisateur trouvé.</p>`;
        return;
    }
    resultContainer.innerHTML = users.map((user) => getUserCard(user, true)).join("");
}

function getUserCard(user, withButton = false) {
    const sanitizedNom = sanitizeHtml(user.nom || "Inconnu");
    const sanitizedPrenom = sanitizeHtml(user.prenom || "Inconnu");
    const sanitizedMail = sanitizeHtml(user.email || "Inconnu");
    const sanitizedRole = sanitizeHtml(user.role || "Utilisateur");
    
    // ✅ Échappement JSON pour éviter les problèmes de guillemets
    const safeUserId = user.id;
    const safeRole = JSON.stringify(user.role || "");

    const buttonHtml = withButton ? 
        `<button class="btn btn-primary" onclick="openRoleModal(${safeUserId}, ${safeRole})">
            Modifier les rôles
        </button>` : '';

    return `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${sanitizedNom} ${sanitizedPrenom}</h5>
        <p class="card-text"><strong>Email :</strong> ${sanitizedMail}</p>
        <p class="card-text"><strong>Rôle :</strong> ${sanitizedRole}</p>
        <p class="card-text"><strong>Crédits :</strong> ${user.credits || 0}</p>
        ${buttonHtml}
      </div>
    </div>
  `;
}

// Gestion de la modale
function openRoleModal(userId, currentRole) {
    console.log("Ouverture modale pour user:", userId, "role:", currentRole);
    // À implémenter selon vos besoins
    alert(`Modification du rôle pour l'utilisateur ${userId} (actuel: ${currentRole})`);
}

// Chargement initial
getInfoscredits();

function getInfoscredits() {
    const token = getToken();
    if (!token) return;

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    fetch("http://127.0.0.1:8000/api/admin/users/search", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({})
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            console.error("Impossible de récupérer les informations.");
            throw new Error("Erreur lors de la récupération des informations.");
        }
    })
    .then(result => {
        if (result && result.length > 0) {
            afficher1Resultats(result);
        } else {
            displayaucunabonneesMessage();
        }
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des données :", error);
        resultContainer.innerHTML = `<p class="text-danger">Erreur: ${error.message}</p>`;
    });
}

function afficher1Resultats(users) {
    if (!users || !users.length) {
        resultContainer.innerHTML = `<p class="text-white">Aucun utilisateur trouvé.</p>`;
        return;
    }
    // ✅ Utilise la même fonction sans bouton
    resultContainer.innerHTML = users.map(user => getUserCard(user, false)).join("");
}

function displayaucunabonneesMessage() {
    resultContainer.innerHTML = `
    <div class="mb-3">
      <div class="container p-4 bg-light rounded">
        <h2 class="text-center">Aucun utilisateur trouvé.</h2>
      </div>
    </div>
  `;
}