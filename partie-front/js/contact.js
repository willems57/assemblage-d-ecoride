
const nomcInput = document.getElementById("NomInput");
const mailcInput = document.getElementById("EmailInput");
const msgcInput = document.getElementById("messagecInput");
const datecInput = document.getElementById("datecInput");
const contactform = document.getElementById("contactfrom");
const btncontactInput = document.getElementById("btncontactajt");

// CORRECTION pour contact.js
btncontactInput.addEventListener("click", contact);

function contact() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "name": nomcInput.value,
        "mail": mailcInput.value,
        "message": msgcInput.value
        // date est automatiquement généré
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    // URL CORRIGÉE
    fetch("http://127.0.0.1:8000/api/contact/", requestOptions)
        .then((response) => {
            if (response.ok) {
                alert("Message envoyé avec succès !");
                contactform.reset();
            } else {
                alert("Erreur lors de l'envoi du message.");
            }
        })
        .catch((error) => console.error(error));
}