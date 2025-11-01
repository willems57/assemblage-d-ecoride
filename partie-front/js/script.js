
export {getRole, setToken, getToken, isConnected, showAndHideElementsForRoles, RoleCookieName, tokenCookieName, signout, apiUrl, sanitizeHtml, setCookie, getCookie, eraseCookie, getInfosUser, sanitizeAllFields};
const RoleCookieName = ("role");
const tokenCookieName = "accesstoken";
const signoutBtn = document.getElementById("signout-btn");
const apiUrl = "https://127.0.0.1:8000/api/";
/*const myElement = document.getElementById('myElement');
const roleToShow = myElement.dataset.show; */



signoutBtn.addEventListener("click", signout); 


function getRole(){
    return getCookie(RoleCookieName);
}

function signout(){
    eraseCookie(tokenCookieName);
    eraseCookie(RoleCookieName);
    window.location.reload();
}

function setToken(token){
    setCookie(tokenCookieName, token, 7);
}

function getToken(){
    return getCookie(tokenCookieName);
}

function setCookie(name,value,days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }
    
    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }
    
    function eraseCookie(name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    function isConnected(){
        if(getToken() == null || getToken == undefined){
            return false;
        }
        else{
            return true;
        }
    }



    function showAndHideElementsForRoles() {
        const userConnected = isConnected();  // Vérifie si l'utilisateur est connecté
        const role = getRole();  // Récupère le rôle de l'utilisateur
    
        // Sélectionne tous les éléments ayant un attribut data-show
        const allElementsToEdit = document.querySelectorAll('[data-show]');
    
        allElementsToEdit.forEach(element => {
            switch (element.dataset.show) {
                case 'disconnected':
                    // Si l'utilisateur est connecté, cacher cet élément
                    if (userConnected) {
                        element.classList.add("d-none");
                    }
                    break;
                case 'connected':
                    // Si l'utilisateur n'est pas connecté, cacher cet élément
                    if (!userConnected) {
                        element.classList.add("d-none");
                    }
                    break;
                case 'ROLE_SUPER_ADMIN':
                    // Si l'utilisateur n'est pas connecté ou n'a pas le rôle admin, cacher cet élément
                    if (!userConnected || role !== "ROLE_SUPER_ADMIN") {
                        element.classList.add("d-none");
                    }
                    break;
                case 'ROLE_EMPLOYER':
                    // Si l'utilisateur n'est pas connecté ou n'a pas le rôle employer, cacher cet élément
                    if (!userConnected || role !== "ROLE_EMPLOYER") {
                        element.classList.add("d-none");
                    }
                    break;
                case 'ROLE_USER':
                    // Si l'utilisateur n'est pas connecté ou n'a pas le rôle vétérinaire, cacher cet élément
                    if (!userConnected || role !== "ROLE_USER") {
                        element.classList.add("d-none");
                    }
                    break;
            }
        });
    }


function sanitizeHtml(text) {
    const tempHtml = document.createElement('div');
    tempHtml.textContent = text;
    return tempHtml.innerHTML;
}

function getInfosUser(){
        let myHeaders = new Headers();
        myHeaders.append("X-AUTH-TOKEN", getToken());

        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
    
        fetch(apiUrl+"account/me", requestOptions)
        .then(response =>{
            if(response.ok){
                return response.json();
            }
            else{
                console.log("Impossible de récupérer les informations utilisateur");
            }
        })
        .then(result => {
            return result;
        })
        .catch(error =>{
            console.error("erreur lors de la récupération des données utilisateur", error);
        });
    }



// Fonction pour assainir toutes les données
function sanitizeAllFields(data) {
    const sanitizedData = {};
    for (const key in data) {
        sanitizedData[key] = sanitizeHtml(data[key] || "");
    }
    return sanitizedData;
  }