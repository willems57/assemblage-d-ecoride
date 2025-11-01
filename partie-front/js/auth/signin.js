
// Récupération des éléments HTML
const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput");
const btnSignin = document.getElementById("btnSignin");
const signinForm = document.getElementById("signinForm");

// Configuration de l'URL de l'API
const apiUrl = "http://127.0.0.1:8000/api/login";

// Gestionnaire d'événement pour le bouton de connexion
btnSignin.addEventListener("click", checkCredentials);

// Fonction principale pour gérer la connexion
async function checkCredentials(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Récupération des valeurs du formulaire
    const email = mailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validation des champs
    if (!email || !password) {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    // Réinitialisation des erreurs visuelles
    mailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");

    // Configuration des en-têtes et du corps de la requête
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        email: email,
        password: password
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // Gestion de l'état du bouton pendant le traitement
    btnSignin.disabled = true;
    btnSignin.textContent = "Connexion...";

    try {
        // Envoi de la requête à l'API
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || "Échec de l'authentification : Identifiants invalides");
            mailInput.classList.add("is-invalid");
            passwordInput.classList.add("is-invalid");
            throw new Error("Échec de l'authentification");
        }

        // Traitement de la réponse
        const result = await response.json();
        handleSuccessfulLogin(result);

    } catch (error) {
        console.error("Erreur :", error);
        alert("Impossible de se connecter. Veuillez réessayer.");
    } finally {
        // Réinitialisation de l'état du bouton
        btnSignin.disabled = false;
        btnSignin.textContent = "Connexion";
    }
}

// Fonction pour gérer une connexion réussie
function handleSuccessfulLogin(userData) {
    // Stockage du token et des informations utilisateur dans les cookies
    setCookie("accesstoken", userData.apiToken, 7); // Stockage du token pendant 7 jours
    setCookie("role", userData.roles[0], 7); // Stockage du rôle de l'utilisateur

    // Message de succès
    alert("Connexion réussie ! Bienvenue, " + userData.email);

    // Redirection basée sur le rôle
    const redirectUrl = userData.roles.includes("ROLE_ADMIN") ? "/administrateur" : "/dashboard";
    window.location.replace(redirectUrl);
}

// Fonctions utilitaires pour les cookies
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
