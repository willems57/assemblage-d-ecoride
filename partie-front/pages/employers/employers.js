// Fonction getToken universelle
function getToken() {
    // Vérifie d'abord si le token est dans les cookies
    const cookieToken = getCookie("X-Auth-TOKEN");
    if (cookieToken) {
        return cookieToken;
    }

    // Vérifie si le token est dans le localStorage
    const localStorageToken = localStorage.getItem("X-Auth-TOKEN");
    if (localStorageToken) {
        return localStorageToken;
    }

    // Si aucun token n'est trouvé, affiche une erreur dans la console
    console.error("Aucun token d'authentification trouvé.");
    return null;
}

// Fonction pour récupérer un cookie spécifique
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}

// Exemple d'utilisation
// const token = getToken();
// if (token) {
//     console.log("Token récupéré:", token);
// } else {
//     console.log("Impossible de récupérer le token.");
// }
function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}

    //import { sanitizeHtml} from "../../js/script";

    const dateavisInput = document.getElementById("dateavisInput");
    const pseudoInput = document.getElementById("pseudoInput");
    const noteInput = document.getElementById("noteInput");
    const commavisInput = document.getElementById("commantaireavisInput");
    const nomInput = document.getElementById("NomInput");
    const btnvoirelesavis = document.getElementById("btnvoirelesavis");
    const btnmessage = document.getElementById("btnmessage");
    const btnenvoyerInput = document.getElementById("btnmessageajt");
    
    // valider avis
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-valider")) {
            const avisId = event.target.getAttribute("data-id");
            validerAvis(avisId);
        }
    });
    
//pour la validation d'avis
function validerAvis(avisId) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
            name: "Avis validé", // Données minimales requises
            commentaire: "Avis validé par l'employé"
        }),
        redirect: "follow"
    };

    // Créer un avis validé
    fetch(`http://127.0.0.1:8000/api/avis/`, requestOptions)
        .then((response) => {
            if (response.ok) {
                // Supprimer l'avis en attente
                return fetch(`http://127.0.0.1:8000/api/avisvalidation/${avisId}`, {
                    method: "DELETE",
                    headers: myHeaders
                });
            }
            throw new Error("Erreur validation");
        })
        .then((response) => {
            if (response.ok) {
                alert("Avis validé avec succès !");
                getInfosAvis();
            }
        })
        .catch((error) => console.error("Erreur :", error));
}

// Récupération des avis en attente
function getInfosAvis() {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:8000/api/avisvalidation/", requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Erreur récupération");
        })
        .then(avis => {
            displayAvis(avis);
        })
        .catch(error => {
            console.error("Erreur :", error);
            displayNoAvisMessage();
        });
}

function displayAvis(avisList) {
    const avisContainer = document.getElementById("allavisImages");
    avisContainer.innerHTML = avisList.map(avis => `
        <div class="mb-3">
            <div class="container p-4 bg-light rounded">
                <h1 class="text-center">${sanitizeHtml(avis.name)}</h1>
                <p class="text-muted">${sanitizeHtml(avis.createdAt)}</p>
                <div class="mt-3">
                    <p><strong>Note:</strong> ${avis.note}/5</p>
                    <p>${sanitizeHtml(avis.commentaire)}</p>
                </div>
                <div class="text-center mt-4">
                    <button type="button" class="btn btn-success btn-valider" data-id="${avis.id}">Valider</button>
                    <button type="button" class="btn btn-danger btn-supprimer" data-id="${avis.id}">Supprimer</button>
                </div>
            </div>
        </div>
    `).join("");
}



// Fonction pour afficher un message si aucun avis n'est disponible
function displayNoAvisMessage() {
    const avisImage = document.getElementById("allavisImages");
    if (!avisImage) {
        console.error("L'élément 'allavisImages' est introuvable.");
        return;
    }
    avisImage.innerHTML = "<p>Aucun avis en attente de validation.</p>";
}


// pour voir les essage
      btnmessage.addEventListener("click", voiremessage);
    
    function voiremessage(){
      
        // Appeler la fonction pour charger et afficher les messages au chargement de la page
getInfosMessages();
// Fonction pour récupérer les messages depuis l'API
function getInfosMessages() {
    let myHeaders = new Headers();

    let requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("http://127.0.0.1:8000/api/contacts/", requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.error("Impossible de récupérer les informations.");
            }
        })
        .then(messages => {
            if (messages) {
                displayMessages(messages); // Appeler la fonction pour afficher les messages
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
        });
}

// Fonction pour afficher les messages
function displayMessages(messages) {
    const avisImage = document.getElementById("allavisImages");
    if (!avisImage) {
        console.error("L'élément 'allavisImages' est introuvable.");
        return;
    }

    if (messages.length === 0) {
        avisImage.innerHTML = "<p>Aucun message disponible.</p>";
        return;
    }

    // Générer le contenu HTML pour chaque message
    avisImage.innerHTML = messages.map(message => {
        return getMessageHTML({
            nomInput: message.nom || "Nom inconnu",
            msgcInput: message.message || "Message non fourni",
            datecInput: message.date || "Date non disponible",
            mailcInput: message.email || "Email non disponible"
        });
    }).join("");
}

// Fonction pour générer le HTML d'un message
function getMessageHTML(data) {
    const { nomInput, msgcInput, datecInput, mailcInput } = data;

    // Utiliser sanitizeHtml pour protéger contre les injections XSS
    const sanitizedName = sanitizeHtml(nomInput);
    const sanitizedMessages = sanitizeHtml(msgcInput);
    const sanitizedDate = sanitizeHtml(datecInput);
    const sanitizedMail = sanitizeHtml(mailcInput);

    return `
        <div class="mb-3">
            <div class="container p-4 bg-light rounded">
                <h1 class="text-center">${sanitizedName}</h1>
                <p class="text-muted">${sanitizedDate}</p>
                <div class="text-center">
                    <h2>${sanitizedMail}</h2>
                </div>
                <div class="mt-3">
                    <p class="text-justify">${sanitizedMessages}</p>
                </div>
                <div class="text-center mt-4">
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#messageModal">
                        Répondre
                    </button>
                </div>
            </div>
        </div>
    `;
}
    }


  


    btnenvoyerInput.addEventListener("click", () => {
        const message = document.getElementById("messageInput"); // Message
        const mailInput = document.getElementById("EmailInput"); // E-mail
    
        // Collecte des données
        const destinataires = mailInput.value.trim();
        const content = message.value.trim();
    
        // Validation des données
        if (!destinataires || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinataires)) {
            console.error("L'adresse e-mail n'est pas valide.");
            return;
        }
    
        if (!content) {
            console.error("Le message est vide.");
            return;
        }
    
        // Fonction pour envoyer les données à l'API
        const sendMessage = async () => {
            const apiUrl = 'http://127.0.0.1:8000/api/send-message';
            const data = {
                content: content,
                email: destinataires
            };
    
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erreur:', errorData.error);
                    return;
                }
    
                const responseData = await response.json();
                console.log('Succès:', responseData.status);
            } catch (error) {
                console.error('Erreur réseau ou serveur:', error);
            }
        };
    
        // Appeler la fonction pour envoyer un message
        sendMessage();
    });
    