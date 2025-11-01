// Implémenter le JS de ma page

// Récupération des inputs du formulaire
const inputNom = document.getElementById("NomInput");
const inputPreNom = document.getElementById("PrenomInput");
const inputCredit = document.getElementById("creditsInput");
const inputRole = document.getElementById("RoleInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");

// Ajout d'un event listener sur chaque input pour valider le formulaire
inputNom.addEventListener("keyup", validateForm);
inputPreNom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);

// Function permettant de valider tout le formulaire
function validateForm() {
    const nomok = validateRequired(inputNom);
    const prenomok = validateRequired(inputPreNom);
    const mailok = validateMail(inputMail);
    const passwordok = validatePassword(inputPassword);
    const passwordConfirmok = validateConfirmationPassword(inputPassword, inputValidationPassword);

    if (nomok && prenomok && mailok && passwordok && passwordConfirmok) {
        btnValidation.disabled = false;
    } else {
        btnValidation.disabled = true;
    }
}

// Function permettent de valider si un input est rempli
function validateRequired(input) {
    if (input.value.trim() !== '') {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

// Function permettant de valider si un mail est valide
function validateMail(input) {
    // Définir mon regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mailUser = input.value.trim();

    if (mailUser.match(emailRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

// Function permettant de valider si mot de passe est valide
function validatePassword(input) {
    // Définir mon regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;

    if (passwordUser.match(passwordRegex)) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
        return true;
    } else {
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

// Function permettant de valider la confirmation du mot de passe  
function validateConfirmationPassword(inputPwd, inputConfirmPwd) {
    if (inputPwd.value === inputConfirmPwd.value && inputPwd.value !== '') {
        inputConfirmPwd.classList.add("is-valid");
        inputConfirmPwd.classList.remove("is-invalid");
        return true;
    } else {
        inputConfirmPwd.classList.add("is-invalid");
        inputConfirmPwd.classList.remove("is-valid");
        return false;
    }
}

function InscrireUtilisateur() {
    const dataForm = new FormData(formInscription);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    
    const raw = JSON.stringify({
        email: dataForm.get("Email"),
        password: dataForm.get("Password"),
        nom: dataForm.get("Nom"),        
        prenom: dataForm.get("Prenom"),  
        role_titre: inputRole.value,     
        credits: null                    
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

   
    fetch("http://127.0.0.1:8000/api/registration", requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(err => {
                    throw new Error(err.error || "Erreur lors de l'inscription");
                });
            }
        })
        .then((result) => {
            alert(`Bravo ${dataForm.get("Prenom")}, vous êtes inscrit(e) ! ${result.message || ''}`);
            document.location.href = "/signin";
        })
        .catch((error) => {
            console.error("Erreur :", error);
            alert("Erreur: " + error.message);
        });
}