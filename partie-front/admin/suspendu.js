// Fonction getToken (copiée depuis abonees.js)
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

// Fonction pour obtenir un cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
    }
    return null;
}

// Récupération des éléments HTML
const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const inputRole = document.getElementById("RoleInput");
const inputMail = document.getElementById("EmailInput");
const inputUserId = document.getElementById("UserIdInput");
const btnValidation = document.getElementById("btn-validation-modification");
const formInscription = document.getElementById("formulaireInscription");

// Ajout des listeners pour valider le formulaire
inputNom.addEventListener("keyup", validateForm);
inputPreNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);

// Valide le formulaire
function validateForm() {
    const nomok = validateRequired(inputNom);
    const prenomok = validateRequired(inputPreNom);
    const mailok = validateMail(inputMail);

    btnValidation.disabled = !(nomok && prenomok && mailok);
}

// Valide un champ requis
function validateRequired(input) {
    if (input.value.trim() !== "") {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

// Valide un email
function validateMail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value.trim();

    if (emailRegex.test(mailUser)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

// Événement sur le bouton "Modifier"
btnValidation.addEventListener("click", suspendreUtilisateur);

// Fonction pour suspendre un utilisateur (mise à zéro des crédits)
function suspendreUtilisateur() {
    const userId = inputUserId.value;

    if (!userId) {
        alert("Aucun utilisateur sélectionné.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${getToken()}`);
    myHeaders.append("Content-Type", "application/json");

    // Utiliser l'endpoint de modification de rôle pour sanctionner
    const raw = JSON.stringify({ 
        role_titre: "ROLE_SUSPENDED",
        reason: "Compte suspendu" 
    });

    fetch(`http://127.0.0.1:8000/api/users/${userId}/role`, {
        method: "PUT",
        headers: myHeaders,
        body: raw,
    })
    .then((response) => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || `Erreur HTTP : ${response.status}`);
            });
        }
        return response.json();
    })
    .then((result) => {
        console.log("Utilisateur suspendu avec succès :", result);
        alert("Utilisateur suspendu - crédits mis à 0.");
        
        // Réinitialiser le formulaire
        formInscription.reset();
        inputUserId.value = "";
        btnValidation.disabled = true;
    })
    .catch((error) => {
        console.error("Erreur :", error);
        alert("Erreur: " + error.message);
    });
}

// Fonction pour pré-remplir le formulaire avec les données d'un utilisateur
function prefillUserForm(userData) {
    if (userData) {
        inputUserId.value = userData.id || "";
        inputNom.value = userData.nom || "";
        inputPreNom.value = userData.prenom || "";
        inputMail.value = userData.email || "";
        
        // Activer le bouton si les données sont valides
        validateForm();
    }
}

// Exemple d'utilisation : récupérer l'utilisateur connecté au chargement
function loadCurrentUser() {
    const token = getToken();
    if (!token) return;

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    fetch("http://127.0.0.1:8000/api/account/me", {
        method: "GET",
        headers: myHeaders,
    })
    .then((response) => {
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        return response.json();
    })
    .then((user) => {
        prefillUserForm(user);
    })
    .catch((error) => console.error("Erreur :", error));
}

// Chargement initial
// loadCurrentUser(); // Décommentez si vous voulez pré-remplir avec l'utilisateur connecté