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

function sanitizeHtml(text) {
  if (text === null || text === undefined) return '';
  const tempHtml = document.createElement('div');
  tempHtml.textContent = text;
  return tempHtml.innerHTML;
}

// Éléments DOM
const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const departInput = document.getElementById("departInput");
const arriveInput = document.getElementById("arriveInput");
const datedInput = document.getElementById("datedInput");
const dureeInput = document.getElementById("dureeInput");
const voitureInput = document.getElementById("voitureInput");
const fumeurInput = document.getElementById("fumeurInput");
const annimauxInput = document.getElementById("annimauxInput");
const dateiInput = document.getElementById("dateiInput");
const marqueInput = document.getElementById("marqueInput");
const modeleInput = document.getElementById("modeleInput");
const couleurvInput = document.getElementById("couleurvInput");
const imagevInput = document.getElementById("imagevInput");
const placesInput = document.getElementById("placesInput");
const prixInput = document.getElementById("prixInput");
const passagersInput = document.getElementById("passagersInput");
const btntrajetajtInput = document.getElementById("btntrajetajtmodal");
const btnpdemarertrajet = document.getElementById("btnpdemarertrajet");
const btntrajetsuppInput = document.getElementById("btntrajetsupp");
const ajttrajetform = document.getElementById("ajtfromtrajet");
const supptrajetform = document.getElementById("suppfromtrajet");
const btnvehiculeajtInput = document.getElementById("btnvehiculeajtmodal");
const btnvehiculesuppInput = document.getElementById("btnvehiculesupp");
const ajtvehiculeform = document.getElementById("ajtfromvehicule");
const suppvehiculeform = document.getElementById("suppfromvehicule");
const btntrajetfini = document.getElementById("btntrajetfini");

// Initialisation des écouteurs d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Chargement initial des données
    getInfosservice();
    getInfosvehicule();
    getInfoscredits();
    
    // Écouteurs pour les trajets
    if (btntrajetajtInput) {
        btntrajetajtInput.addEventListener("click", ajttrajet);
    }
    
    if (btntrajetsuppInput) {
        btntrajetsuppInput.addEventListener("click", function() {
            const trajetId = document.getElementById("trajetIdInput").value;
            if (trajetId) {
                supptrajet(parseInt(trajetId));
            } else {
                console.error("ID du trajet manquant");
            }
        });
    }
    
    if (btnpdemarertrajet) {
        btnpdemarertrajet.addEventListener("click", function() {
            const trajetId = document.getElementById("trajetIdInput").value;
            if (trajetId) {
                demarer(parseInt(trajetId));
            } else {
                console.error("ID du trajet manquant");
            }
        });
    }
    
    // Écouteurs pour les véhicules
    if (btnvehiculeajtInput) {
        btnvehiculeajtInput.addEventListener("click", ajtvehicule);
    }
    
    if (btnvehiculesuppInput) {
        btnvehiculesuppInput.addEventListener("click", function() {
            const voitureId = document.getElementById("voitureIdInput").value;
            if (voitureId) {
                suppvehicule(parseInt(voitureId));
            } else {
                console.error("ID du véhicule manquant");
            }
        });
    }
    
    if (btntrajetfini) {
        btntrajetfini.addEventListener("click", function() {
            const trajetEnCoursId = document.getElementById("trajetEnCoursIdInput").value;
            if (trajetEnCoursId) {
                trajetterminer(parseInt(trajetEnCoursId));
            } else {
                console.error("ID du trajet en cours manquant");
            }
        });
    }
});

// ========== GESTION DES TRAJETS ==========

// Créer un nouveau trajet
function ajttrajet() {
    if (!ajttrajetform) {
        console.error("Formulaire de trajet non trouvé");
        return;
    }


    
    // Récupérer l'ID de l'utilisateur connecté
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    myHeaders.append("Content-Type", "application/json");
    
    const raw = JSON.stringify({
        "conducteur_id": userInfo.id || 1, // Utiliser l'ID de l'utilisateur connecté
        "depart": departInput.value,
        "arrive": arriveInput.value,
        "date": datedInput.value,
        "duree": parseInt(dureeInput.value) || 0,
        "prix": parseInt(prixInput.value) || 0,
        "places": parseInt(placesInput.value) || 4,
        "voiture_id": parseInt(voitureInput.value) || 1,
        "passager_ids": passagersInput.value ? 
            passagersInput.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
    });
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };
    
    fetch("http://127.0.0.1:8000/api/trajets/", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Trajet créé:', result);
            alert('Trajet créé avec succès!');
            getInfosservice(); // Recharger la liste
            ajttrajetform.reset(); // Vider le formulaire
        })
        .catch(error => {
            console.error('Erreur création trajet:', error);
            alert('Erreur lors de la création du trajet');
        });
}

// Supprimer un trajet
function supptrajet(trajetId) {
    if (!trajetId) {
        console.error("ID du trajet manquant");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
    };

    fetch(`http://127.0.0.1:8000/api/trajets/${trajetId}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Trajet supprimé:', result);
            alert('Trajet supprimé avec succès!');
            getInfosservice(); // Recharger la liste
        })
        .catch(error => {
            console.error('Erreur suppression trajet:', error);
            alert('Erreur lors de la suppression du trajet');
        });
}

// Démarrer un trajet (créer un trajet en cours)
function demarer(trajetId) {
    if (!trajetId) {
        console.error("ID du trajet manquant");
        return;
    }

    // Récupérer d'abord les infos du trajet
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());

    fetch(`http://127.0.0.1:8000/api/trajets/${trajetId}`, { headers: myHeaders })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(trajet => {
            // Créer le trajet en cours avec les mêmes données
            const raw = JSON.stringify({
                "conducteur_id": trajet.conducteur_id,
                "depart": trajet.depart,
                "arrive": trajet.arrive,
                "date": trajet.date,
                "duree": trajet.duree,
                "prix": trajet.prix,
                "voiture_id": trajet.voiture_id,
                "passager_ids": trajet.passagers || []
            });
            
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
            };
            
            return fetch("http://127.0.0.1:8000/api/trajets-encours/", requestOptions);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Trajet démarré:', result);
            alert('Trajet démarré avec succès!');
            // Supprimer le trajet original
            supptrajet(trajetId);
            gettrajetencoursInfos(); // Charger les trajets en cours
        })
        .catch(error => {
            console.error('Erreur démarrage trajet:', error);
            alert('Erreur lors du démarrage du trajet');
        });
}

// ========== GESTION DES VÉHICULES ==========

// Ajouter un véhicule
function ajtvehicule() {
    if (!ajtvehiculeform) {
        console.error("Formulaire de véhicule non trouvé");
        return;
    }



    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    myHeaders.append("Content-Type", "application/json");
    
    const raw = JSON.stringify({
        "voiture": voitureInput.value,
        "dateimat": dateiInput.value,
        "fumeur": fumeurInput.value,
        "annimaux": annimauxInput.value,
        "marque": marqueInput.value,
        "place": parseInt(placesInput.value || 5),
        "modele": modeleInput.value,
        "couleur": couleurvInput.value,
        "image": null
    });
    
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    fetch("http://127.0.0.1:8000/api/voitures/", requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Véhicule créé:', result);
            alert('Véhicule créé avec succès!');
            getInfosvehicule(); // Recharger la liste
            ajtvehiculeform.reset(); // Vider le formulaire
        })
        .catch(error => {
            console.error('Erreur création véhicule:', error);
            alert('Erreur lors de la création du véhicule');
        });
}

// Supprimer un véhicule
function suppvehicule(voitureId) {
    if (!voitureId) {
        console.error("ID du véhicule manquant");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
    };

    fetch(`http://127.0.0.1:8000/api/voitures/${voitureId}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Véhicule supprimé:', result);
            alert('Véhicule supprimé avec succès!');
            getInfosvehicule(); // Recharger la liste
        })
        .catch(error => {
            console.error('Erreur suppression véhicule:', error);
            alert('Erreur lors de la suppression du véhicule');
        });
}

// ========== AFFICHAGE DES TRAJETS ==========

function getInfosservice() {
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };

    fetch("http://127.0.0.1:8000/api/trajets/", requestOptions)
        .then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Erreur: ' + response.status);
            }
        })
        .then(trajets => {
            afficherTrajets(trajets);
        })
        .catch(error => {
            console.error("Erreur récupération trajets:", error);
        });
}

function afficherTrajets(trajets) {
    const trajetsImages = document.getElementById("alltrajetImages");
    if (!trajetsImages) return;
    
    if (!trajets || trajets.length === 0) {
        trajetsImages.innerHTML = '<p class="text-center text-white">Aucun trajet disponible</p>';
        return;
    }
    
    const trajetsHTML = trajets.map(trajet => gettrajetImage(trajet)).join('');
    trajetsImages.innerHTML = trajetsHTML;
}

function gettrajetImage(trajet) {
    const sanitizedConducteur = sanitizeHtml(trajet.conducteur_nom);
    const sanitizedDate = sanitizeHtml(trajet.date);
    const sanitizedDepart = sanitizeHtml(trajet.depart);
    const sanitizedArrive = sanitizeHtml(trajet.arrive);
    const sanitizedDuree = sanitizeHtml(trajet.duree);
    const sanitizedPrix = sanitizeHtml(trajet.prix);
    const sanitizedvoiture = sanitizeHtml(trajet.voiture_info || 'Non spécifié');
    const sanitizedpassagers = sanitizeHtml(trajet.passagers_nom || 'Aucun');
    const sanitizedPlaces = sanitizeHtml(trajet.places_restantes || trajet.places);
    
    return `
    <div class="mb-3">
        <div class="container p-4 border rounded bg-light">
           <h4 class="text-center">Conducteur: ${sanitizedConducteur}</h4>   
            <h1 class="text-center">${sanitizedDate}</h1>
            <h2 class="text-center text-primary">${sanitizedDepart} → ${sanitizedArrive}</h2>
            <h3 class="text-center">Durée: ${sanitizedDuree} min</h3>
            <h4 class="text-center text-success">Prix: ${sanitizedPrix} crédits</h4>
            <h5 class="text-center">Voiture: ${sanitizedvoiture}</h5>
            <h5 class="text-center">Passagers: ${sanitizedpassagers}</h5>
            <h5 class="text-center">Places restantes: ${sanitizedPlaces}</h5>
            <div class="text-center mt-3">
                <button type="button" class="btn btn-primary me-2" onclick="btnpdemarertrajet(${trajet.id})">Démarrer</button>
                <button type="button" class="btn btn-danger" onclick="btntrajetsupp(${trajet.id})">Supprimer</button>
            </div>
            <input type="hidden" class="trajet-id" value="${trajet.id}">
        </div>
    </div>`;
}

// ========== AFFICHAGE DES VÉHICULES ==========

function getInfosvehicule() {
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };
    
    fetch("http://127.0.0.1:8000/api/voitures/", requestOptions)
        .then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Erreur: ' + response.status);
            }
        })
        .then(vehicules => {
            afficherVehicules(vehicules);
        })
        .catch(error => {
            console.error("Erreur récupération véhicules:", error);
        });
}

function afficherVehicules(vehicules) {
    const vehiculeImages = document.getElementById("allvehiculeImages");
    if (!vehiculeImages) return;
    
    if (!vehicules || vehicules.length === 0) {
        vehiculeImages.innerHTML = '<p class="text-center text-white">Aucun véhicule disponible</p>';
        return;
    }
    
    const vehiculesHTML = vehicules.map(vehicule => getvehiculeImage(vehicule)).join('');
    vehiculeImages.innerHTML = vehiculesHTML;
}

function getvehiculeImage(vehicule) {
    const sanitizedVoiture = sanitizeHtml(vehicule.voiture);
    const sanitizedMarque = sanitizeHtml(vehicule.marque);
    const sanitizedModele = sanitizeHtml(vehicule.modele);
    const sanitizedCouleur = sanitizeHtml(vehicule.couleur);
    const sanitizedPlaces = sanitizeHtml(vehicule.place);
    const sanitizedFumeur = sanitizeHtml(vehicule.fumeur);
    const sanitizedAnimaux = sanitizeHtml(vehicule.annimaux);
    
    return `
    <div class="mb-3 col-12 col-md-6 col-lg-4">
        <div class="container p-4 border rounded bg-light">
            <h5 class="text-center">${sanitizedMarque} ${sanitizedModele}</h5>
            <p class="text-center"><strong>Plaque:</strong> ${sanitizedVoiture}</p>
            <p class="text-center"><strong>Couleur:</strong> ${sanitizedCouleur}</p>
            <p class="text-center"><strong>Places:</strong> ${sanitizedPlaces}</p>
            <p class="text-center"><strong>Fumeur:</strong> ${sanitizedFumeur}</p>
            <p class="text-center"><strong>Animaux:</strong> ${sanitizedAnimaux}</p>
            <div class="text-center mt-3">
                <button type="button" class="btn btn-danger" onclick="btnvehiculesupp(${vehicule.id})">Supprimer</button>
            </div>
            <input type="hidden" class="vehicule-id" value="${vehicule.id}">
        </div>
    </div>`;
}

// ========== TRAJETS EN COURS ==========

function gettrajetencoursInfos() {
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };

    fetch("http://127.0.0.1:8000/api/trajets-encours/", requestOptions)
        .then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Erreur: ' + response.status);
            }
        })
        .then(trajetsEnCours => {
            afficherTrajetEnCours(trajetsEnCours);
        })
        .catch(error => {
            console.error("Erreur récupération trajets en cours:", error);
        });
}

function afficherTrajetEnCours(trajetsEnCours) {
    const container = document.getElementById("resultContainer");
    if (!container) return;
    
    if (!trajetsEnCours || trajetsEnCours.length === 0) {
        container.innerHTML = '<p class="text-center text-white">Aucun trajet en cours</p>';
        return;
    }

    const trajetsencoursHTML = trajetsEnCours.map(trajetsencours => getdemarertrajetImage(trajetsencours)).join('');
    container.innerHTML = trajetsencoursHTML;
}

function getdemarertrajetImage(trajetsencours) {
    const sanitizedDate = sanitizeHtml(trajetsencours.date);
    const sanitizedDepart = sanitizeHtml(trajetsencours.depart);
    const sanitizedArrive = sanitizeHtml(trajetsencours.arrive);
    const sanitizedDuree = sanitizeHtml(trajetsencours.duree);
    
    return `
    <div class="mb-3">
        <div class="container p-4 border rounded bg-warning">
            <h1 class="text-center">${sanitizedDate}</h1>
            <h2 class="text-center">${sanitizedDepart} → ${sanitizedArrive}</h2>
            <h3 class="text-center">Durée: ${sanitizedDuree} min</h3>
            <div class="text-center mt-3">
                <p class="fw-bold">Voyage en cours</p>
                <button type="button" class="btn btn-success" onclick="btntrajetfini(${trajetsencours.id})">Terminer</button>
            </div>
            <input type="hidden" class="trajet-encours-id" value="${trajetsencours.id}">
        </div>
    </div>`;
}

// Terminer un trajet en cours
function trajetterminer(trajetEnCoursId) {
    if (!trajetEnCoursId) {
        console.error("ID du trajet en cours manquant");
        return;
    }

    // Récupérer d'abord les infos du trajet en cours
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());

    fetch(`http://127.0.0.1:8000/api/trajets-encours/${trajetEnCoursId}`, { headers: myHeaders })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(trajetsencours => {
            // Créer le trajet fini avec les mêmes données
            const raw = JSON.stringify({
                "conducteur_id": trajetsencours.conducteur_id,
                "depart": trajetsencours.depart,
                "arrive": trajetsencours.arrive,
                "date": trajetsencours.date,
                "duree": trajetsencours.duree,
                "voiture_id": trajetsencours.voiture_id,
                "passager_ids": trajetsencours.passagers || []
            });
            
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
            };
            
            return fetch("http://127.0.0.1:8000/api/trajets-finis/", requestOptions);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Trajet terminé:', result);
            alert('Trajet terminé avec succès!');
            
            // Supprimer le trajet en cours
            supptrajetencours(trajetEnCoursId);
            
            gettrajetfiniInfos(); // Charger les trajets finis
        })
        .catch(error => {
            console.error('Erreur fin de trajet:', error);
            alert('Erreur lors de la fin du trajet');
        });
}

// Supprimer un trajet en cours
function supptrajetencours(trajetEnCoursId) {
    if (!trajetEnCoursId) {
        console.error("ID du trajet en cours manquant");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
    };

    fetch(`http://127.0.0.1:8000/api/trajets-encours/${trajetEnCoursId}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur: ' + response.status);
            }
            return response.json();
        })
        .then(result => {
            console.log('Trajet en cours supprimé:', result);
        })
        .catch(error => {
            console.error('Erreur suppression trajet en cours:', error);
        });
}

// ========== TRAJETS FINIS ==========

function gettrajetfiniInfos() {
    const myHeaders = new Headers();
    myHeaders.append("X-Auth-TOKEN", getToken());
    
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
    };
    
    fetch("http://127.0.0.1:8000/api/trajets-finis/", requestOptions)
        .then(response => {
            if(response.ok){
                return response.json();
            } else {
                throw new Error('Erreur: ' + response.status);
            }
        })
        .then(trajetsFinis => {
            afficherTrajetFini(trajetsFinis);
        })
        .catch(error => {
            console.error("Erreur récupération trajets finis:", error);
        });
}

function afficherTrajetFini(trajetsFinis) {
    const container = document.getElementById("resultContainer");
    if (!container) return;
    
    if (!trajetsFinis || trajetsFinis.length === 0) {
        container.innerHTML = '<p class="text-center text-white">Aucun trajet terminé</p>';
        return;
    }

    const trajetsHTML = trajetsFinis.map(trajetsfinis => getfinitrajetImage(trajetsfinis)).join('');
    container.innerHTML = trajetsHTML;
}

function getfinitrajetImage(trajetsfinis) {
    const sanitizedDate = sanitizeHtml(trajetsfinis.date);
    const sanitizedConducteur = sanitizeHtml(trajetsfinis.conducteur_nom);
    const sanitizedvoiture = sanitizeHtml(trajetsfinis.voiture_info || 'Non spécifié');
    const sanitizedpassagers = sanitizeHtml(trajetsfinis.passagers_nom || 'Aucun');
    const sanitizedDepart = sanitizeHtml(trajetsfinis.depart);
    const sanitizedArrive = sanitizeHtml(trajetsfinis.arrive);
    const sanitizedDuree = sanitizeHtml(trajetsfinis.duree);

    return `
    <div class="mb-3">
        <div class="container p-4 border rounded bg-success text-white">
            <h1 class="text-center">${sanitizedDate}</h1>
            <h4 class="text-center">Conducteur: ${sanitizedConducteur}</h4>   
            <h5 class="text-center">Voiture: ${sanitizedvoiture}</h5>
            <h5 class="text-center">Passagers: ${sanitizedpassagers}</h5>
            <h2 class="text-center">${sanitizedDepart} → ${sanitizedArrive}</h2>
            <h3 class="text-center">Durée: ${sanitizedDuree} min</h3>
            <div class="text-center mt-3">
                <p class="fw-bold">Voyage terminé!</p>
                <div class="d-flex justify-content-center gap-3">
                    <a class="btn btn-info" href="/avis">Donner un avis</a>
                    <a class="btn btn-secondary" href="/contact">SAV</a>
                </div>
            </div>
        </div>
    </div>`;
}





// ========== FONCTION PRINCIPALE MODIFIÉE ==========

btntrajetfini.addEventListener("click", async () => {
    try {
        const trajetEnCoursId = document.getElementById("trajetEnCoursIdInput").value;
        if (!trajetEnCoursId) {
            alert("Aucun trajet en cours sélectionné");
            return;
        }

        // 1. Récupérer les détails du trajet
        const trajetResponse = await fetch(`http://127.0.0.1:8000/api/trajets-encours/${trajetEnCoursId}`, {
            headers: { "X-Auth-TOKEN": getToken() }
        });
        
        if (!trajetResponse.ok) throw new Error("Erreur récupération trajet");
        const trajet = await trajetResponse.json();

        // 2. Préparer la liste de tous les participants (conducteur + passagers)
        const participants = await preparerParticipants(trajet);
        
        // 3. Débiter chaque participant de 2 crédits et transférer vers l'admin
        const resultatsTransfert = await debiterParticipants(participants, trajetEnCoursId);
        
        // 4. Envoyer les messages de confirmation
        await envoyerMessagesFinTrajet(trajet, participants);
        
        // 5. Terminer le trajet normalement
        await finaliserTrajet(trajetEnCoursId, trajet);
        
        alert("Trajet terminé ! 2 crédits ont été débités à chaque participant.");

    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la finalisation du trajet");
    }
});

// ========== FONCTIONS UTILITAIRES ==========

/**
 * Prépare la liste de tous les participants (conducteur + passagers)
 */
async function preparerParticipants(trajet) {
    const participants = [];
    const FRAIS_ADMIN = 2; // 2 crédits par participant

    // Ajouter le conducteur
    if (trajet.conducteur_id) {
        const conducteur = await getUserInfo(trajet.conducteur_id);
        if (conducteur) {
            participants.push({
                id: conducteur.id,
                nom: conducteur.nom || 'Conducteur',
                email: conducteur.email,
                type: 'conducteur',
                montant: FRAIS_ADMIN
            });
        }
    }

    // Ajouter les passagers
    if (trajet.passagers && Array.isArray(trajet.passagers)) {
        for (const passagerId of trajet.passagers) {
            const passager = await getUserInfo(passagerId);
            if (passager) {
                participants.push({
                    id: passager.id,
                    nom: passager.nom || 'Passager',
                    email: passager.email,
                    type: 'passager',
                    montant: FRAIS_ADMIN
                });
            }
        }
    }

    return participants;
}

/**
 * Récupère les informations d'un utilisateur
 */
async function getUserInfo(userId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
            headers: { "X-Auth-TOKEN": getToken() }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error(`Erreur récupération user ${userId}:`, error);
        return null;
    }
}

/**
 * Débite chaque participant et transfère vers l'admin
 */
async function debiterParticipants(participants, trajetId) {
    const ADMIN_ID = 1; // ID du compte administrateur
    const resultats = [];

    for (const participant of participants) {
        try {
            // Transférer 2 crédits du participant vers l'admin
            const success = await transfererCreditsVersAdmin(
                participant.id, 
                participant.montant, 
                ADMIN_ID, 
                trajetId,
                participant.type
            );

            resultats.push({
                participant: participant.nom,
                type: participant.type,
                montant: participant.montant,
                success: success
            });

            console.log(`Transfert ${participant.type} ${participant.nom}: ${success ? '✓' : '✗'}`);

        } catch (error) {
            console.error(`Erreur transfert pour ${participant.nom}:`, error);
            resultats.push({
                participant: participant.nom,
                type: participant.type,
                montant: participant.montant,
                success: false
            });
        }
    }

    return resultats;
}

/**
 * Transfère les crédits d'un participant vers l'admin
 */
async function transfererCreditsVersAdmin(participantId, montant, adminId, trajetId, typeParticipant) {
    const response = await fetch(`http://127.0.0.1:8000/api/users/${participantId}/transfer-credits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-TOKEN': getToken()
        },
        body: JSON.stringify({
            receiver_id: adminId,
            amount: montant,
            trajet_id: trajetId,
            type: 'frais_administration',
            participant_type: typeParticipant,
            description: `Frais administration trajet #${trajetId}`
        })
    });

    if (!response.ok) {
        throw new Error(`Erreur transfert: ${response.status}`);
    }

    return response.json();
}

/**
 * Envoie les messages de fin de trajet avec les détails des frais
 */
async function envoyerMessagesFinTrajet(trajet, participants) {
    const totalFrais = participants.length * 2;
    
    const content = `
        <div class="alert alert-info">
            <h4> Trajet terminé !</h4>
            <p><strong>Itinéraire:</strong> ${trajet.depart} → ${trajet.arrive}</p>
            <p><strong>Date:</strong> ${trajet.date}</p>
            <p><strong>Frais d'administration:</strong> 2 crédits débités</p>
            <p><strong>Total collecté:</strong> ${totalFrais} crédits (${participants.length} participants)</p>
            <small>Ces frais contribuent au maintien de la plateforme.</small>
        </div>
    `;

    const destinataires = participants.map(p => ({
        name: p.nom,
        email: p.email,
        id: p.id
    }));

    try {
        await fetch("http://127.0.0.1:8000/api/messages/send-message", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-TOKEN': getToken()
            },
            body: JSON.stringify({
                content: content,
                recipients: destinataires,
                subject: `Trajet terminé - Frais d'administration`
            })
        });
    } catch (error) {
        console.error("Erreur envoi messages:", error);
    }
}

/**
 * Finalise le trajet (créer trajet fini + supprimer trajet en cours)
 */
async function finaliserTrajet(trajetEnCoursId, trajet) {
    // Créer le trajet fini
    await fetch("http://127.0.0.1:8000/api/trajets-finis/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Auth-TOKEN": getToken()
        },
        body: JSON.stringify({
            conducteur_id: trajet.conducteur_id,
            depart: trajet.depart,
            arrive: trajet.arrive,
            date: trajet.date,
            duree: trajet.duree,
            voiture_id: trajet.voiture_id,
            passager_ids: trajet.passagers || []
        })
    });

    // Supprimer le trajet en cours
    await fetch(`http://127.0.0.1:8000/api/trajets-encours/${trajetEnCoursId}`, {
        method: "DELETE",
        headers: { "X-Auth-TOKEN": getToken() }
    });

    // Recharger les données
    gettrajetencoursInfos();
    gettrajetfiniInfos();
}







btntrajetfini.addEventListener("click", async () => {
    try {
        // 1. Récupérer les informations du trajet en cours
        const trajetEnCoursId = document.getElementById("trajetEnCoursIdInput").value;
        if (!trajetEnCoursId) {
            alert("Aucun trajet en cours sélectionné");
            return;
        }

        // 2. Récupérer les détails du trajet
        const trajetResponse = await fetch(`http://127.0.0.1:8000/api/trajets-encours/${trajetEnCoursId}`, {
            headers: { "X-Auth-TOKEN": getToken() }
        });
        
        if (!trajetResponse.ok) throw new Error("Erreur récupération trajet");
        const trajet = await trajetResponse.json();

        // 3. Préparer les données pour l'envoi des messages
        const content = `Votre trajet est terminé. Merci d'avoir voyagé avec nous !<br>
            Départ: ${trajet.depart} → Arrivée: ${trajet.arrive}<br>
            Prix: ${trajet.prix} crédits<br>
            <button class="btn btn-danger" onclick="processPayment(${trajet.prix})">Payer ${trajet.prix} crédits</button>`;

        const destinataires = trajet.passagers_nom.map((nom, index) => ({
            name: nom,
            email: trajet.passagers_email ? trajet.passagers_email[index] : `${nom.toLowerCase().replace(' ', '.')}@example.com`,
            id: trajet.passagers[index]
        })).filter(p => p.email && p.email.includes("@"));

        if (destinataires.length === 0) {
            console.warn("Aucun destinataire avec email valide");
        }

        // 4. Envoyer les messages
        const messageResponse = await fetch("http://127.0.0.1:8000/api/messages/send-message", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-TOKEN': getToken()
            },
            body: JSON.stringify({
                content: content,
                recipients: destinataires
            })
        });

        if (!messageResponse.ok) throw new Error("Erreur envoi messages");
        
        const result = await messageResponse.json();
        console.log("Messages envoyés:", result);

        // 5. Effectuer les paiements
        await effectuerPaiement(destinataires, trajet.prix, trajet.conducteur_id);

        alert("Trajet terminé et paiements traités !");

    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la finalisation du trajet");
    }
});


// CORRECTION - Fonction processPayment
async function processPayment(passagerId, prix, conducteurId, trajetEnCoursId) {
    try {
        // 1. Débiter le passager
        const debitResponse = await fetch(`http://127.0.0.1:8000/api/users/${passagerId}/transfer-credits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-TOKEN': getToken()
            },
            body: JSON.stringify({
                receiver_id: conducteurId,
                amount: prix,
                trajet_id: trajetEnCoursId 
            })
        });

        if (!debitResponse.ok) {
            throw new Error(`Erreur transfert crédits pour passager ${passagerId}`);
        }

        console.log(`Paiement réussi: ${prix} crédits transférés de ${passagerId} à ${conducteurId}`);
        return true;
    } catch (error) {
        console.error(`Erreur paiement pour passager ${passagerId}:`, error);
        return false;
    }
}

// CORRECTION - Fonction effectuerPaiement
async function effectuerPaiement(passagers, prix, conducteurId, trajetEnCoursId) {
    const results = [];
    
    for (const passager of passagers) {
        const success = await processPayment(passager.id, prix, conducteurId, trajetEnCoursId);
        results.push({
            passager: passager.name,
            success: success
        });
    }
    
    return results;
}



// ========== GESTION DES CRÉDITS ==========

// Récupérer et afficher les crédits de l'utilisateur

getInfoscredits();
function getInfoscredits() {
  let myHeaders = new Headers();
  myHeaders.append("X-Auth-TOKEN", getToken());
  myHeaders.append("Content-Type", "application/json");

  let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
  };

  // Requête fetch pour récupérer les crédits
  fetch("http://127.0.0.1:8000/api/account/me", requestOptions)
      .then(response => {
          if (response.ok) {
              return response.json();
          } else {
              console.error("Impossible de récupérer les informations. Statut:", response.status);
              return null;
          }
      })
      .then(data => {
          if (data) {
              afficherCredits(data);
          }
      })
      .catch(error => {
          console.error("Erreur lors de la récupération des données :", error);
      });
}

// Fonction pour afficher les crédits
function afficherCredits(data) {
  const creditsHTML = getcreditsImage({
      creditsInput: data.credits, // Assurez-vous que "credits" correspond au champ dans vos données
  });

  // Insérer l'HTML généré dans un conteneur
  const container = document.getElementById("creditsContainer"); // Assurez-vous qu'un conteneur existe avec cet ID
  container.innerHTML = creditsHTML;
}

// Fonction pour générer l'HTML pour les crédits
function getcreditsImage(data) {
  const { creditsInput } = data;
  const sanitizedCredits = sanitizeHtml(creditsInput);

  return `
  <div class="mb-3">
      <div class="container p-4">
          <h2 class="text-center text-white">Vos crédits : ${sanitizedCredits}</h2>
      </div>
  </div>`;
}





// ========== FONCTIONS UTILITAIRES ==========

function sanitizeAllFields(data) {
    const sanitizedData = {};
    for (let key in data) {
        sanitizedData[key] = sanitizeHtml(data[key]);
    }
    return sanitizedData;
}

// Fonction pour rafraîchir toutes les données
function refreshAllData() {
    getInfosservice();
    getInfosvehicule();
    getInfoscredits();
    gettrajetencoursInfos();
    gettrajetfiniInfos();
}

// Rafraîchir les données toutes les 30 secondes
setInterval(refreshAllData, 30000);


// Ajout au scope global
window.btnpdemarertrajet = function(trajetId) {
    document.getElementById("trajetIdInput").value = trajetId;
    // Déclencher le clic sur le bouton principal
    document.getElementById("btnpdemarertrajet").click();
};

window.btntrajetsupp = function(trajetId) {
    if (confirm("Voulez-vous vraiment supprimer ce trajet ?")) {
        supptrajet(trajetId);
    }
};

window.btnvehiculesupp = function(voitureId) {
    if (confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
        suppvehicule(voitureId);
    }
};