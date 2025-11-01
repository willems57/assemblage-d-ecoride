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

// Fonction de sécurité pour éviter les injections XSS
function sanitizeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text.toString();
    return tempHtml.innerHTML;
}

// Éléments DOM
const btnrecherche = document.getElementById("Recherchertrajet");
const trajetsImages = document.getElementById("alltrajetImages");

// Événements
if (btnrecherche) {
    btnrecherche.addEventListener("click", fetchTrajets);
}

// Fonction principale pour récupérer les trajets
function fetchTrajets() {
    const departInput = document.getElementById("departInput");
    const arriveInput = document.getElementById("arriveInput");
    const datedInput = document.getElementById("datedInput");

    if (!departInput || !arriveInput || !datedInput) {
        alert("Les champs de recherche sont introuvables !");
        return;
    }

    const depart = departInput.value.trim();
    const arrive = arriveInput.value.trim();
    const date = datedInput.value;

    if (!depart || !arrive || !date) {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    // URL corrigée
    const apiUrl = `http://127.0.0.1:8000/api/trajets`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur serveur : Impossible de récupérer les informations des trajets");
            }
            return response.json();
        })
        .then(trajets => {
            // Filtrage côté client
            const trajetsFiltres = trajets.filter(trajet => {
                if (!trajet.date) return false;
                
                const trajetDate = new Date(trajet.date).toISOString().split('T')[0];
                const searchDate = new Date(date).toISOString().split('T')[0];
                
                return trajet.depart?.toLowerCase().includes(depart.toLowerCase()) &&
                       trajet.arrive?.toLowerCase().includes(arrive.toLowerCase()) &&
                       trajetDate === searchDate;
            });
            
            displayTrajets(trajetsFiltres);
        })
        .catch(error => {
            alert("Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.");
            console.error("Erreur lors de la récupération des trajets :", error);
        });
}

// Fonction pour afficher les trajets
function displayTrajets(trajets) {
    if (!trajetsImages) {
        console.error("L'élément 'alltrajetImages' est introuvable.");
        return;
    }

    if (trajets.length === 0) {
        trajetsImages.innerHTML = `
            <div class="alert alert-info text-center">
                Aucun trajet trouvé pour votre recherche.
            </div>
        `;
        return;
    }

    trajetsImages.innerHTML = trajets.map(trajet => {
        // Sanitization de toutes les données
        const sanitizedId = sanitizeHtml(trajet.id.toString());
        const sanitizedDepart = sanitizeHtml(trajet.depart);
        const sanitizedArrive = sanitizeHtml(trajet.arrive);
        const sanitizedDate = sanitizeHtml(new Date(trajet.date).toLocaleString('fr-FR'));
        const sanitizedPrix = sanitizeHtml(trajet.prix);
        const sanitizedPlaces = sanitizeHtml(trajet.places_restantes);
        const sanitizedPlacesTotal = sanitizeHtml(trajet.places);
        const sanitizedPassagersCount = sanitizeHtml(trajet.passagers.length.toString());
        const sanitizedDuree = sanitizeHtml(Math.floor(trajet.duree / 60) + 'h' + (trajet.duree % 60));

        const isFull = trajet.places_restantes <= 0;
        const buttonClass = isFull ? "btn-secondary" : "btn-primary";
        const buttonText = isFull ? "Complet" : "Réserver";

        return `
            <div class="mb-4">
                <div class="container p-4 bg-light rounded shadow-sm">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h4 class="text-primary">${sanitizedDepart} → ${sanitizedArrive}</h4>
                            <p class="mb-1"><strong>Date:</strong> ${sanitizedDate}</p>
                            <p class="mb-1"><strong>Durée:</strong> ${sanitizedDuree}</p>
                            <p class="mb-1"><strong>Prix:</strong> ${sanitizedPrix}€</p>
                            <p class="mb-1"><strong>Places:</strong> ${sanitizedPlaces}/${sanitizedPlacesTotal} disponibles</p>
                            <p class="mb-1"><strong>Passagers inscrits:</strong> ${sanitizedPassagersCount}</p>
                        </div>
                        <div class="col-md-4 text-end">
                            <button 
                                type="button" 
                                class="btn ${buttonClass} reserve-btn" 
                                data-trajet-id="${sanitizedId}" 
                                ${isFull ? "disabled" : ""}>
                                ${buttonText}
                            </button>
                            <button 
                                type="button" 
                                class="btn btn-outline-info mt-2 details-btn"
                                data-trajet-id="${sanitizedId}">
                                Détails complets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Ajouter des événements sur les boutons "Réserver"
    document.querySelectorAll(".reserve-btn").forEach(button => {
        button.addEventListener("click", function() {
            const trajetId = this.getAttribute('data-trajet-id');
            createReservation(trajetId);
        });
    });

    // Ajouter des événements sur les boutons "Détails"
    document.querySelectorAll(".details-btn").forEach(button => {
        button.addEventListener("click", function() {
            const trajetId = this.getAttribute('data-trajet-id');
            showTrajetDetails(trajetId);
        });
    });
}

// Fonction pour afficher les détails complets d'un trajet
function showTrajetDetails(trajetId) {
    const apiUrl = `http://127.0.0.1:8000/api/trajets/${trajetId}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des détails du trajet");
            }
            return response.json();
        })
        .then(trajet => {
            displayTrajetModal(trajet);
        })
        .catch(error => {
            console.error("Erreur:", error);
            alert("Erreur lors du chargement des détails du trajet");
        });
}

// Fonction pour afficher un modal avec les détails complets
function displayTrajetModal(trajet) {
    // Sanitization de toutes les données
    const sanitizedId = sanitizeHtml(trajet.id.toString());
    const sanitizedDepart = sanitizeHtml(trajet.depart);
    const sanitizedArrive = sanitizeHtml(trajet.arrive);
    const sanitizedDate = sanitizeHtml(new Date(trajet.date).toLocaleString('fr-FR'));
    const sanitizedPrix = sanitizeHtml(trajet.prix);
    const sanitizedPlaces = sanitizeHtml(trajet.places_restantes);
    const sanitizedPlacesTotal = sanitizeHtml(trajet.places);
    const sanitizedDuree = sanitizeHtml(Math.floor(trajet.duree / 60) + 'h' + (trajet.duree % 60));
    const sanitizedConducteurId = sanitizeHtml(trajet.conducteur_id.toString());
    const sanitizedVoitureId = sanitizeHtml(trajet.voiture_id.toString());
    
    // Sanitization des passagers
    const passagersHtml = trajet.passagers.length > 0 
        ? trajet.passagers.map(passagerId => 
            `<li>Passager ID: ${sanitizeHtml(passagerId.toString())}</li>`
          ).join('')
        : '<li>Aucun passager pour le moment</li>';

    const isFull = trajet.places_restantes <= 0;

    const modalHtml = `
        <div class="modal fade" id="trajetModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails complets du trajet</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary">Informations du trajet</h6>
                                <p><strong>ID:</strong> ${sanitizedId}</p>
                                <p><strong>Départ:</strong> ${sanitizedDepart}</p>
                                <p><strong>Arrivée:</strong> ${sanitizedArrive}</p>
                                <p><strong>Date et heure:</strong> ${sanitizedDate}</p>
                                <p><strong>Durée:</strong> ${sanitizedDuree}</p>
                                <p><strong>Prix:</strong> ${sanitizedPrix}€</p>
                                <p><strong>Places:</strong> ${sanitizedPlaces}/${sanitizedPlacesTotal} disponibles</p>
                                <p><strong>Conducteur ID:</strong> ${sanitizedConducteurId}</p>
                                <p><strong>Voiture ID:</strong> ${sanitizedVoitureId}</p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary">Passagers (${sanitizeHtml(trajet.passagers.length.toString())})</h6>
                                <ul class="list-group">${passagersHtml}</ul>
                                ${isFull ? '<div class="alert alert-warning mt-2">Ce trajet est complet</div>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        ${!isFull ? 
                            `<button type="button" class="btn btn-primary" onclick="createReservation(${sanitizedId})">Réserver ce trajet</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Supprimer tout modal existant
    const existingModal = document.getElementById('trajetModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('trajetModal'));
    modal.show();
    
    // Nettoyage après fermeture du modal
    document.getElementById('trajetModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Fonction pour créer une réservation
async function createReservation(trajetId) {
    try {
        const token = getToken();
        
        if (!token) {
            alert("Veuillez vous connecter pour effectuer une réservation !");
            return;
        }

        // Récupérer l'utilisateur connecté
        const user = await getCurrentUser();
        if (!user) {
            alert("Impossible de récupérer vos informations utilisateur.");
            return;
        }

        // Récupérer d'abord le trajet pour connaître les passagers actuels
        const trajetResponse = await fetch(`http://127.0.0.1:8000/api/trajets/${trajetId}`);
        if (!trajetResponse.ok) {
            throw new Error("Erreur lors de la récupération du trajet");
        }
        
        const trajet = await trajetResponse.json();
        
        // Vérifier qu'il reste des places
        if (trajet.places_restantes <= 0) {
            alert("Désolé, ce trajet est maintenant complet !");
            fetchTrajets(); // Actualiser l'affichage
            return;
        }

        // Vérifier que l'utilisateur n'est pas déjà passager
        if (trajet.passagers.includes(user.id)) {
            alert("Vous êtes déjà inscrit à ce trajet !");
            return;
        }

        // Préparer les données de mise à jour
        const updatedPassagers = [...trajet.passagers, user.id];
        
        const updateData = {
            passager_ids: updatedPassagers
            // Les autres champs restent inchangés
        };

        // Mettre à jour le trajet avec le nouveau passager
        const updateResponse = await fetch(`http://127.0.0.1:8000/api/trajets/${trajetId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-TOKEN": token
            },
            body: JSON.stringify(updateData)
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || "Erreur lors de la réservation");
        }

        const result = await updateResponse.json();
        
        alert("Réservation réussie ! Vous êtes maintenant inscrit à ce trajet.");
        console.log("Réservation confirmée:", result);
        
        // Actualiser l'affichage
        fetchTrajets();
        
    } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        alert("Erreur lors de la réservation : " + error.message);
    }
}

// Fonction pour récupérer l'utilisateur connecté
function getCurrentUser() {
    const token = getToken();
    
    if (!token) {
        return Promise.resolve(null);
    }

    return fetch("http://127.0.0.1:8000/api/account/me", {
        method: "GET",
        headers: {
            "X-Auth-TOKEN": token,
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des informations utilisateur");
        }
        return response.json();
    })
    .then(user => user)
    .catch(error => {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        return null;
    });
}

// Fonction pour charger tous les trajets au démarrage (optionnel)
function loadAllTrajets() {
    const apiUrl = `http://127.0.0.1:8000/api/trajets`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors du chargement des trajets");
            }
            return response.json();
        })
        .then(trajets => {
            // Afficher les 5 premiers trajets ou un message
            if (trajets.length > 0) {
                displayTrajets(trajets.slice(0, 5));
            } else {
                trajetsImages.innerHTML = `
                    <div class="alert alert-info text-center">
                        Aucun trajet disponible pour le moment.
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement initial des trajets:", error);
        });
}

// Chargement initial au démarrage
document.addEventListener('DOMContentLoaded', function() {
    if (trajetsImages) {
        loadAllTrajets();
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur globale:', e.error);
});