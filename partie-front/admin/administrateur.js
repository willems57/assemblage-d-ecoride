
function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}



// ========== CONFIGURATION ET ÉTAT GLOBAL ==========

class AdminDashboard {
    constructor() {
        this.creditsAdmin = 0;
        this.totalFraisCollectes = 0;
        this.historiqueTrajets = [];
        this.charts = {};
        this.derniereActualisation = new Date();
        
        this.CHART_COLORS = {
            primary: 'rgba(54, 162, 235, 0.8)',
            secondary: 'rgba(255, 99, 132, 0.8)',
            success: 'rgba(75, 192, 192, 0.8)',
            warning: 'rgba(255, 159, 64, 0.8)',
            info: 'rgba(153, 102, 255, 0.8)',
            light: 'rgba(201, 203, 207, 0.8)'
        };
    }

    // ========== INITIALISATION ==========

    async init() {
        console.log('🚀 Initialisation du tableau de bord administrateur...');
        
        try {
            await this.chargerHistoriqueComplet();
            this.afficherDashboardAdmin();
            this.initialiserTousLesGraphiques();
            this.afficherStatistiquesDetaillees();
            
            // Surveillance en temps réel
            this.demarrerSurveillance();
            
            console.log('✅ Tableau de bord administrateur initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.afficherErreur('Erreur lors de l\'initialisation du tableau de bord');
        }
    }

    demarrerSurveillance() {
        // Vérification immédiate
        this.verifierNouveauxFrais();
        
        // Surveillance périodique
        setInterval(() => this.verifierNouveauxFrais(), 15000); // Toutes les 15s
        setInterval(() => this.actualiserGraphiques(), 30000); // Toutes les 30s
        setInterval(() => this.actualiserTimestamp(), 60000); // Toutes les minutes
    }

    // ========== SURVEILLANCE DES FRAIS ==========

    async verifierNouveauxFrais() {
        try {
            const response = await this.fetchAPI("/api/account/me");
            
            if (response && response.credits !== undefined) {
                const nouveauxCredits = response.credits;
                
                if (this.creditsAdmin > 0 && nouveauxCredits > this.creditsAdmin) {
                    const fraisRecus = nouveauxCredits - this.creditsAdmin;
                    this.totalFraisCollectes += fraisRecus;
                    
                    await this.enregistrerNouveauxFrais(fraisRecus);
                    this.afficherNotificationFrais(fraisRecus);
                    this.actualiserTousLesGraphiques();
                }
                
                this.creditsAdmin = nouveauxCredits;
                this.derniereActualisation = new Date();
                this.afficherDashboardAdmin();
            }
        } catch (error) {
            console.error("Erreur surveillance frais:", error);
        }
    }

    async fetchAPI(endpoint) {
        try {
            const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
                headers: { 
                    "X-Auth-TOKEN": this.getToken(),
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            return null;
        }
    }

    // ========== GESTION DES GRAPHIQUES ==========

    initialiserTousLesGraphiques() {
        this.initialiserGraphiqueCovoiturage();
        this.initialiserGraphiqueFraisAdmin();
        this.initialiserGraphiqueEvolutionCredits();
        this.initialiserGraphiqueParticipants();
    }

    initialiserGraphiqueCovoiturage() {
        const ctx = document.getElementById('covoiturageChart');
        if (!ctx) return;

        const data = this.genererDonneesCovoiturage();
        
        this.charts.covoiturage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Nombre de trajets',
                    data: data.values,
                    backgroundColor: this.CHART_COLORS.primary,
                    borderColor: this.CHART_COLORS.primary.replace('0.8', '1'),
                    borderWidth: 2,
                    borderRadius: 5,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} trajets`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        });
    }

    initialiserGraphiqueFraisAdmin() {
        const ctx = document.getElementById('fraisAdminChart');
        if (!ctx) return;

        const data = this.genererDonneesFraisAdmin();
        
        this.charts.fraisAdmin = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.CHART_COLORS.success,
                        this.CHART_COLORS.warning,
                        this.CHART_COLORS.info,
                        this.CHART_COLORS.secondary
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed} crédits`
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initialiserGraphiqueEvolutionCredits() {
        const ctx = document.getElementById('creditsEvolutionChart');
        if (!ctx) return;

        const data = this.genererDonneesEvolutionCredits();
        
        this.charts.evolutionCredits = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Crédits administrateur',
                    data: data.values,
                    backgroundColor: this.CHART_COLORS.info.replace('0.8', '0.1'),
                    borderColor: this.CHART_COLORS.info,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: this.CHART_COLORS.info,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    initialiserGraphiqueParticipants() {
        const ctx = document.getElementById('participantsChart');
        if (!ctx) return;

        const data = this.genererDonneesParticipants();
        
        this.charts.participants = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.CHART_COLORS.primary,
                        this.CHART_COLORS.success,
                        this.CHART_COLORS.warning
                    ],
                    borderWidth: 2,
                    hoverOffset: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // ========== GÉNÉRATION DES DONNÉES ==========

    genererDonneesCovoiturage() {
        const historique = this.getStorage('historiqueTrajets') || {};
        
        if (Object.keys(historique).length === 0) {
            // Données d'exemple pour démonstration
            const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            const valeurs = [8, 12, 6, 15, 18, 10, 7];
            return { labels: jours, values: valeurs };
        }
        
        const entries = Object.entries(historique).slice(-7);
        return {
            labels: entries.map(([date]) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })),
            values: entries.map(([, count]) => count)
        };
    }

    genererDonneesFraisAdmin() {
        const historique = this.getStorage('historiqueFraisAdmin') || {};
        const aujourdhui = new Date().toISOString().split('T')[0];
        
        const hier = new Date();
        hier.setDate(hier.getDate() - 1);
        const hierStr = hier.toISOString().split('T')[0];
        
        const fraisAujourdhui = historique[aujourdhui] || 0;
        const fraisHier = historique[hierStr] || 0;
        const fraisSemaine = Object.values(historique).reduce((a, b) => a + b, 0);
        const fraisMoyens = fraisSemaine / Math.max(Object.keys(historique).length, 1);

        return {
            labels: ['Aujourd\'hui', 'Hier', 'Total Semaine', 'Moyenne/Jour'],
            values: [fraisAujourdhui, fraisHier, fraisSemaine, Math.round(fraisMoyens)]
        };
    }

    genererDonneesEvolutionCredits() {
        const creditData = this.getStorage('dailyAdminCredits') || {};
        const entries = Object.entries(creditData).slice(-15); // 15 derniers jours
        
        if (entries.length === 0) {
            // Données d'exemple
            const labels = [];
            const values = [];
            let solde = 1000;
            
            for (let i = 14; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.getDate() + '/' + (date.getMonth() + 1));
                solde += Math.floor(Math.random() * 30) + 10;
                values.push(solde);
            }
            
            return { labels, values };
        }
        
        return {
            labels: entries.map(([date]) => new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1)),
            values: entries.map(([, credits]) => credits)
        };
    }

    genererDonneesParticipants() {
        const stats = this.getStorage('statistiquesParticipants') || {
            conducteurs: 45,
            passagers: 120,
            total: 165
        };
        
        return {
            labels: ['Conducteurs', 'Passagers'],
            values: [stats.conducteurs, stats.passagers]
        };
    }

    // ========== ACTUALISATION DES GRAPHIQUES ==========

    actualiserTousLesGraphiques() {
        Object.keys(this.charts).forEach(chartName => {
            this.actualiserGraphique(chartName);
        });
        this.afficherStatistiquesDetaillees();
        this.mettreAJourBadgesStats();
    }

    actualiserGraphique(nomGraphique) {
        if (!this.charts[nomGraphique]) return;

        let data;
        switch (nomGraphique) {
            case 'covoiturage':
                data = this.genererDonneesCovoiturage();
                break;
            case 'fraisAdmin':
                data = this.genererDonneesFraisAdmin();
                break;
            case 'evolutionCredits':
                data = this.genererDonneesEvolutionCredits();
                break;
            case 'participants':
                data = this.genererDonneesParticipants();
                break;
        }

        if (data) {
            this.charts[nomGraphique].data.labels = data.labels;
            this.charts[nomGraphique].data.datasets[0].data = data.values;
            this.charts[nomGraphique].update('none');
        }
    }

    actualiserGraphiques() {
        this.actualiserTousLesGraphiques();
    }

    // ========== AFFICHAGE DASHBOARD ==========

    afficherDashboardAdmin() {
        const container = document.getElementById('adminDashboard');
        if (!container) return;

        const aujourdhui = new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const fraisAujourdhui = this.getFraisAujourdhui();
        const stats = this.calculerStatistiquesAvancees();

        container.innerHTML = `
            <div class="row">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-coins fa-2x text-primary"></i>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title text-muted mb-1">Crédits Admin</h5>
                                    <h2 class="text-primary mb-0">${this.creditsAdmin}</h2>
                                    <small class="text-muted">Solde actuel</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-chart-line fa-2x text-success"></i>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title text-muted mb-1">Frais Aujourd'hui</h5>
                                    <h2 class="text-success mb-0">${fraisAujourdhui}</h2>
                                    <small class="text-muted">${aujourdhui}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-wallet fa-2x text-warning"></i>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title text-muted mb-1">Total Frais</h5>
                                    <h2 class="text-warning mb-0">${this.totalFraisCollectes}</h2>
                                    <small class="text-muted">Crédits collectés</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-sync-alt fa-2x text-info"></i>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h5 class="card-title text-muted mb-1">Dernière MAJ</h5>
                                    <h4 class="text-info mb-0">${this.derniereActualisation.toLocaleTimeString('fr-FR')}</h4>
                                    <small class="text-muted">En temps réel</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    afficherStatistiquesDetaillees() {
        const container = document.getElementById('statsContainer');
        if (!container) return;

        const stats = this.calculerStatistiquesAvancees();

        container.innerHTML = `
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-card p-3 border rounded text-center bg-white shadow-sm">
                    <div class="text-primary mb-2">
                        <i class="fas fa-car fa-2x"></i>
                    </div>
                    <h6 class="text-muted mb-1">Trajets aujourd'hui</h6>
                    <h3 class="text-primary mb-0">${stats.trajetsAujourdhui}</h3>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-card p-3 border rounded text-center bg-white shadow-sm">
                    <div class="text-success mb-2">
                        <i class="fas fa-users fa-2x"></i>
                    </div>
                    <h6 class="text-muted mb-1">Participants total</h6>
                    <h3 class="text-success mb-0">${stats.totalParticipants}</h3>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-card p-3 border rounded text-center bg-white shadow-sm">
                    <div class="text-warning mb-2">
                        <i class="fas fa-chart-pie fa-2x"></i>
                    </div>
                    <h6 class="text-muted mb-1">Frais moyens/jour</h6>
                    <h3 class="text-warning mb-0">${stats.fraisMoyens}</h3>
                </div>
            </div>
            <div class="col-md-3 col-6 mb-3">
                <div class="stat-card p-3 border rounded text-center bg-white shadow-sm">
                    <div class="text-info mb-2">
                        <i class="fas fa-trending-up fa-2x"></i>
                    </div>
                    <h6 class="text-muted mb-1">Taux de croissance</h6>
                    <h3 class="text-info mb-0">${stats.tauxCroissance}%</h3>
                </div>
            </div>
        `;
    }

    mettreAJourBadgesStats() {
        const stats = this.calculerStatistiquesAvancees();
        const historiqueFrais = this.getStorage('historiqueFraisAdmin') || {};
        const fraisSemaine = Object.values(historiqueFrais).reduce((a, b) => a + b, 0);
        
        // Mettre à jour les badges
        this.setElementText('statsTrajetsSemaine', stats.trajetsSemaine || 0);
        this.setElementText('statsFraisTotal', this.totalFraisCollectes);
        this.setElementText('statsSoldeActuel', this.creditsAdmin);
        this.setElementText('statsTotalParticipants', stats.totalParticipants);
    }

    // ========== NOTIFICATIONS ==========

    afficherNotificationFrais(montant) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notificationId = 'notif-' + Date.now();
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = 'alert alert-success alert-dismissible fade show shadow-sm';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-coins fa-2x me-3"></i>
                <div class="flex-grow-1">
                    <strong> Nouveaux frais reçus !</strong><br>
                    <span class="fw-bold">+${montant} crédits</span> transférés vers le compte administrateur.
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto-suppression après 7 secondes
        setTimeout(() => {
            const element = document.getElementById(notificationId);
            if (element) {
                element.remove();
            }
        }, 7000);
    }

    afficherErreur(message) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'alert alert-danger alert-dismissible fade show';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Erreur:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);
    }

    // ========== GESTION DES DONNÉES ==========

    async chargerHistoriqueComplet() {
        const historiques = [
            'historiqueFraisAdmin',
            'dailyAdminCredits', 
            'historiqueTrajets',
            'statistiquesParticipants'
        ];
        
        historiques.forEach(key => {
            if (!this.getStorage(key)) {
                this.setStorage(key, {});
            }
        });
        
        // Charger le solde admin actuel
        try {
            const data = await this.fetchAPI("/api/account/me");
            if (data) {
                this.creditsAdmin = data.credits || 0;
                this.totalFraisCollectes = this.calculerTotalFrais();
            }
        } catch (error) {
            console.error("Erreur chargement solde admin:", error);
        }
    }

    async enregistrerNouveauxFrais(montant) {
        const aujourdhui = new Date().toISOString().split('T')[0];
        
        // Historique des frais
        const historiqueFrais = this.getStorage('historiqueFraisAdmin') || {};
        historiqueFrais[aujourdhui] = (historiqueFrais[aujourdhui] || 0) + montant;
        this.setStorage('historiqueFraisAdmin', historiqueFrais);
        
        // Historique des crédits
        const creditData = this.getStorage('dailyAdminCredits') || {};
        creditData[aujourdhui] = (creditData[aujourdhui] || 0) + montant;
        this.setStorage('dailyAdminCredits', creditData);
        
        // Simuler un nouveau trajet pour les statistiques
        this.simulerNouveauTrajet();
    }

    simulerNouveauTrajet() {
        const aujourdhui = new Date().toISOString().split('T')[0];
        const historique = this.getStorage('historiqueTrajets') || {};
        historique[aujourdhui] = (historique[aujourdhui] || 0) + 1;
        this.setStorage('historiqueTrajets', historique);
    }

    // ========== CALCULS ET STATISTIQUES ==========

    calculerStatistiquesAvancees() {
        const historiqueFrais = this.getStorage('historiqueFraisAdmin') || {};
        const fraisAujourdhui = this.getFraisAujourdhui();
        const fraisHier = this.getFraisHier();
        
        const tauxCroissance = fraisHier > 0 ? 
            Math.round(((fraisAujourdhui - fraisHier) / fraisHier) * 100) : 
            (fraisAujourdhui > 0 ? 100 : 0);

        const historiqueTrajets = this.getStorage('historiqueTrajets') || {};
        const trajetsSemaine = Object.values(historiqueTrajets).reduce((a, b) => a + b, 0);

        return {
            trajetsAujourdhui: Math.floor(fraisAujourdhui / 2), // 2 crédits par participant
            trajetsSemaine: trajetsSemaine,
            totalParticipants: 165, // Valeur exemple
            fraisMoyens: Math.round(this.totalFraisCollectes / Math.max(Object.keys(historiqueFrais).length, 1)) || 0,
            tauxCroissance: tauxCroissance
        };
    }

    calculerTotalFrais() {
        const historique = this.getStorage('historiqueFraisAdmin') || {};
        return Object.values(historique).reduce((total, frais) => total + frais, 0);
    }

    getFraisAujourdhui() {
        const aujourdhui = new Date().toISOString().split('T')[0];
        const historique = this.getStorage('historiqueFraisAdmin') || {};
        return historique[aujourdhui] || 0;
    }

    getFraisHier() {
        const hier = new Date();
        hier.setDate(hier.getDate() - 1);
        const hierStr = hier.toISOString().split('T')[0];
        const historique = this.getStorage('historiqueFraisAdmin') || {};
        return historique[hierStr] || 0;
    }

    // ========== UTILITAIRES ==========

    getStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    }

    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Erreur sauvegarde ${key}:`, error);
        }
    }

    setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    actualiserTimestamp() {
        this.derniereActualisation = new Date();
        this.afficherDashboardAdmin();
    }

    getToken() {
        const cookieToken = this.getCookie("X-Auth-TOKEN");
        if (cookieToken) return cookieToken;

        const localStorageToken = localStorage.getItem("X-Auth-TOKEN");
        if (localStorageToken) return localStorageToken;

        console.error("Aucun token d'authentification trouvé.");
        return null;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }
}

// ========== INITIALISATION AU CHARGEMENT ==========

let adminDashboard;

document.addEventListener('DOMContentLoaded', function() {
    adminDashboard = new AdminDashboard();
    adminDashboard.init();
});

// Export pour debug
window.adminDashboard = adminDashboard;