// Fonction getToken universelle
function getToken() {
    const cookieToken = getCookie("X-Auth-TOKEN");
    if (cookieToken) {
        return cookieToken;
    }
  
    const localStorageToken = localStorage.getItem("X-Auth-TOKEN");
    if (localStorageToken) {
        return localStorageToken;
    }
  
    console.error("Aucun token d'authentification trouvé.");
    return null;
}

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

function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}

// TOUS LES ÉLÉMENTS DOM RÉINTÉGRÉS
const departInput = document.getElementById("departInput");
const arriveInput = document.getElementById("arriveInput");
const datedInput = document.getElementById("datedInput");
const dureeInput = document.getElementById("dureeInput");
const placesInput = document.getElementById("placesInput");
const prixInput = document.getElementById("prixInput");
const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const voitureInput = document.getElementById("voitureInput");
const fumeurInput = document.getElementById("fumeurInput");
const annimauxInput = document.getElementById("annimauxInput");
const marqueInput = document.getElementById("marqueInput");
const modeleInput = document.getElementById("modeleInput");
const couleurvInput = document.getElementById("couleurvInput");
const imagevInput = document.getElementById("imagevInput");
const passagersInput = document.getElementById("passagersInput");
const avisInput = document.getElementById("avisInput");
const btndetails = document.getElementById("details-btn");
const Recherchertrajet = document.getElementById("Recherchertrajet");
const trajetsImages = document.getElementById("alltrajetImages");

// Événements
Recherchertrajet.addEventListener("click", fetchTrajets);
btndetails.addEventListener("click", checkCredentials2); // 🔥 RÉINTÉGRÉ

// Fonction principale pour récupérer les trajets
function fetchTrajets() {
    const depart = departInput.value.trim();
    const arrive = arriveInput.value.trim();
    const date = datedInput.value;

    if (!depart || !arrive || !date) {
        alert("Veuillez remplir tous les champs !");
        return;
    }

    const apiUrl = `http://127.0.0.1:8000/api/trajets/`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des trajets");
            }
            return response.json();
        })
        .then(trajets => {
            // Filtrer les trajets côté client
            const trajetsFiltres = trajets.filter(trajet => {
                const trajetDate = new Date(trajet.date).toISOString().split('T')[0];
                const searchDate = new Date(date).toISOString().split('T')[0];
                
                return trajet.depart?.toLowerCase().includes(depart.toLowerCase()) &&
                       trajet.arrive?.toLowerCase().includes(arrive.toLowerCase()) &&
                       trajetDate === searchDate;
            });
            
            displayTrajets(trajetsFiltres);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
            alert("Erreur lors de la recherche des trajets");
        });
}

// Fonction pour afficher les trajets (version simplifiée)
function displayTrajets(trajets) {
    if (trajets.length === 0) {
        trajetsImages.innerHTML = `
            <div class="alert alert-info text-center">
                Aucun trajet trouvé pour votre recherche.
            </div>
        `;
        return;
    }

    trajetsImages.innerHTML = trajets.map(trajet => {
        const sanitizedDepart = sanitizeHtml(trajet.depart);
        const sanitizedArrive = sanitizeHtml(trajet.arrive);
        const sanitizedDate = sanitizeHtml(new Date(trajet.date).toLocaleString('fr-FR'));
        const sanitizedPrix = sanitizeHtml(trajet.prix);
        const sanitizedPlacesRestantes = sanitizeHtml(trajet.places_restantes);
        const sanitizedPlaces = sanitizeHtml(trajet.places);
        const sanitizedDuree = sanitizeHtml(Math.floor(trajet.duree / 60) + 'h' + (trajet.duree % 60));

        return `
            <div class="mb-4">
                <div class="container p-4 bg-light rounded shadow-sm">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h4 class="text-primary">${sanitizedDepart} → ${sanitizedArrive}</h4>
                            <p class="mb-1"><strong>Date:</strong> ${sanitizedDate}</p>
                            <p class="mb-1"><strong>Durée:</strong> ${sanitizedDuree}</p>
                            <p class="mb-1"><strong>Prix:</strong> ${sanitizedPrix}€</p>
                            <p class="mb-1"><strong>Places:</strong> ${sanitizedPlacesRestantes}/${sanitizedPlaces} disponibles</p>
                        </div>
                        <div class="col-md-4 text-end">
                            <button type="button" class="btn btn-primary details-btn" data-trajet-id="${trajet.id}">
                                Voir les détails
                            </button>
                            <button type="button" class="btn btn-secondary mt-2" onclick="showDetailsComplete(${trajet.id})">
                                Détails complets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Ajouter les événements aux boutons de détails
    document.querySelectorAll(".details-btn").forEach(button => {
        button.addEventListener("click", function() {
            const trajetId = this.getAttribute('data-trajet-id');
            showTrajetDetails(trajetId);
        });
    });
}

// 🔥 FONCTION checkCredentials2 RÉINTÉGRÉE ET AMÉLIORÉE
function checkCredentials2() {
    getInfosservice();
    
    function getInfosservice() {
        let myHeaders = new Headers();
        myHeaders.append("X-Auth-TOKEN", getToken());
        myHeaders.append("Content-Type", "application/json");
        
        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
    
        fetch("http://127.0.0.1:8000/api/trajets/", requestOptions)
        .then(response => {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error("Impossible de récupérer les informations");
            }
        })
        .then(result => {
            // Utiliser les données récupérées pour afficher les trajets
            displayAllTrajets(result);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données", error);
            alert("Erreur d'authentification ou de connexion");
        });
    }
}

// 🔥 FONCTION POUR AFFICHER TOUS LES TRAJETS (style original)
function displayAllTrajets(trajets) {
    trajetsImages.innerHTML = trajets.map(trajet => {
        return gettrajetImage({
            id: trajet.id,
            depart: trajet.depart,
            arrive: trajet.arrive,
            date: trajet.date,
            duree: trajet.duree,
            prix: trajet.prix,
            places: trajet.places,
            places_restantes: trajet.places_restantes,
            conducteur_id: trajet.conducteur_id,
            voiture_id: trajet.voiture_id,
            passagers: trajet.passagers
        });
    }).join("");
}

// 🔥 FONCTION gettrajetImage RÉINTÉGRÉE ET AMÉLIORÉE
function gettrajetImage(data) {
    const { 
        id, depart, arrive, date, duree, prix, places, places_restantes,
        conducteur_id, voiture_id, passagers 
    } = data;
    
    // Utiliser les valeurs des inputs ou les données de l'API
    const sanitizedNom = sanitizeHtml(inputNom?.value || `Conducteur ${conducteur_id}`);
    const sanitizedPrenom = sanitizeHtml(inputPreNom?.value || "");
    const sanitizedImage = sanitizeHtml(imagevInput?.value || "/default-car.jpg");
    const sanitizedvoiture = sanitizeHtml(voitureInput?.value || `Voiture ${voiture_id}`);
    const sanitizedfumeur = sanitizeHtml(fumeurInput?.value || "Non");
    const sanitizedannimaux = sanitizeHtml(annimauxInput?.value || "Non");
    const sanitizedmarque = sanitizeHtml(marqueInput?.value || "Marque inconnue");
    const sanitizedmodele = sanitizeHtml(modeleInput?.value || "Modèle inconnu");
    const sanitizedcouleurv = sanitizeHtml(couleurvInput?.value || "Couleur inconnue");
    const sanitizedplaces = sanitizeHtml(places_restantes + "/" + places);
    const sanitizedprix = sanitizeHtml(prix + "€");
    const sanitizedpassagers = sanitizeHtml(passagers?.length || 0);
    const sanitizedduree = sanitizeHtml(Math.floor(duree / 60) + 'h' + (duree % 60));
    const sanitizeddated = sanitizeHtml(new Date(date).toLocaleString('fr-FR'));
    const sanitizedarrive = sanitizeHtml(arrive);
    const sanitizeddepart = sanitizeHtml(depart);
    const sanitizedavis = sanitizeHtml(avisInput?.value || "Aucun avis pour le moment");

    return `
    <div class="mb-3">
        <div class="container p-4 bg-light rounded">
            <h1 class="text-center text-dark">${sanitizeddated}</h1>
            <h6 class="text-center text-dark">${sanitizedNom} ${sanitizedPrenom}</h6>
            <h2 class="text-center text-dark">${sanitizeddepart} → ${sanitizedarrive}</h2>
            <h3 class="text-center text-dark">Durée: ${sanitizedduree}</h3>
            <h4 class="text-center text-dark">Prix: ${sanitizedprix}</h4>
            <h5 class="text-center text-dark">Places: ${sanitizedplaces}</h5>
            <p class="text-center text-dark">Passagers: ${sanitizedpassagers}</p>
            
            <div class="mb-3">
                <div class="row row-cols-2 align-items-center">
                    <div class="col">
                        <p><strong>Voiture:</strong> ${sanitizedvoiture}</p>
                        <p><strong>Fumeur:</strong> ${sanitizedfumeur}</p>
                        <p><strong>Animaux:</strong> ${sanitizedannimaux}</p>
                        <p><strong>Marque:</strong> ${sanitizedmarque}</p>
                        <p><strong>Modèle:</strong> ${sanitizedmodele}</p>
                        <p><strong>Couleur:</strong> ${sanitizedcouleurv}</p>
                    </div>
                    <div class="col">
                        <img class="w-100 rounded" src="${sanitizedImage}" alt="Voiture"/>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <p class="text-center"><strong>Avis:</strong> ${sanitizedavis}</p>
            </div>
            
            <div class="text-center mt-3">
                <button type="button" class="btn btn-success" onclick="reserverTrajet(${id})">
                    Réserver ce trajet
                </button>
            </div>
        </div>
    </div>`;
}

// 🔥 FONCTION POUR AFFICHER LES DÉTAILS COMPLETS (Modal)
function showDetailsComplete(trajetId) {
    const apiUrl = `http://127.0.0.1:8000/api/trajets/${trajetId}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des détails");
            }
            return response.json();
        })
        .then(trajet => {
            displayCompleteDetails(trajet);
        })
        .catch(error => {
            console.error("Erreur:", error);
            alert("Erreur lors du chargement des détails");
        });
}

function displayCompleteDetails(trajet) {
    const modalHtml = `
        <div class="modal fade" id="completeDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails complets du trajet</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${gettrajetImage(trajet)}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('completeDetailsModal'));
    modal.show();
    
    document.getElementById('completeDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Fonction pour réserver un trajet
function reserverTrajet(trajetId) {
    if (!getToken()) {
        alert("Veuillez vous connecter pour réserver un trajet");
        return;
    }
    
    // Logique de réservation à implémenter
    alert(`Réservation du trajet ${trajetId} - Fonctionnalité à implémenter`);
}

// Fonction pour afficher les détails basiques (version simplifiée)
function showTrajetDetails(trajetId) {
    const apiUrl = `http://127.0.0.1:8000/api/trajets/${trajetId}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(trajet => {
            const modalHtml = `
                <div class="modal fade" id="trajetModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Détails du trajet</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p><strong>Départ:</strong> ${sanitizeHtml(trajet.depart)}</p>
                                <p><strong>Arrivée:</strong> ${sanitizeHtml(trajet.arrive)}</p>
                                <p><strong>Date:</strong> ${sanitizeHtml(new Date(trajet.date).toLocaleString('fr-FR'))}</p>
                                <p><strong>Prix:</strong> ${sanitizeHtml(trajet.prix)}€</p>
                                <p><strong>Places restantes:</strong> ${sanitizeHtml(trajet.places_restantes)}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            const modal = new bootstrap.Modal(document.getElementById('trajetModal'));
            modal.show();
            
            document.getElementById('trajetModal').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        })
        .catch(error => console.error("Erreur:", error));
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger tous les trajets au démarrage (optionnel)
    fetch("http://127.0.0.1:8000/api/trajets/")
        .then(response => response.json())
        .then(trajets => {
            if (trajets.length > 0) {
                displayTrajets(trajets.slice(0, 3)); // Afficher les 3 premiers trajets
            }
        })
        .catch(error => console.error("Erreur:", error));
});