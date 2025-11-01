import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "/pages/acceuil.html", [], "/js/auth/acceuil.js"),
    new Route("/signin", "signin", "/auth/signin.html", [], "/js/auth/signin.js"),
    new Route("/signup", "signup", "/auth/signup.html", [], "/js/auth/signup.js"),
    new Route("/contact", "contact", "/pages/contact.html", [], "/js/contact.js"),
    new Route("/administrateur", "administrateur", "/admin/administrateur.html", [], "/admin/administrateur.js"),
    new Route("/trajets", "trajets", "/pages/covoiturage/trajets.html", [], "/pages/covoiturage/trajets.js"),
    new Route("/avis", "Avis", "/pages/avis.html", [], "/js/avis.js"),
    new Route("/signup2", "signupA", "/admin/signup2.html", [], "/admin/signup2.js"),
    new Route("/suspendu", "suspendu", "/admin/suspendu.html", [], "/admin/suspendu.js"),
    new Route("/utilisateurs", "utilisateurs", "/pages/utilisateurs/utilisateurs.html", [], "/pages/utilisateurs/utilisateurs.js"),
    new Route("/abonees", "abonees", "/admin/abonees.html", [], "/admin/abonees.js"),
    new Route("/employers", "employers", "/pages/employers/employers.html", [], "/pages/employers/employers.js"),

];

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Eco Ride";