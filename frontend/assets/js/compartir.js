document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalCompartir");
    const emailInput = document.getElementById("emailInput");
    const emailContainer = document.getElementById("email-container");
    const shareButton = document.querySelector("#modalCompartir .btn-share");
    const cancelButton = document.querySelector("#modalCompartir .btn-cancel");
    const closeButton = document.querySelector("#modalCompartir .close-button");

    let emailList = [];

    // Mostrar el modal
    window.mostrarModal = () => {
        modal.style.display = "block";
    };

    // Ocultar el modal
    const closeModal = () => {
        modal.style.display = "none";
        emailList = [];
        emailContainer.querySelectorAll(".email-tag").forEach((tag) => tag.remove());
    };

    // Agregar correo electrónico a la lista
    emailInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const email = e.target.value.trim();
            if (validateEmail(email) && !emailList.includes(email)) {
                emailList.push(email);
                createEmailTag(email);
                e.target.value = "";
            } else {
                alert("Correo inválido o ya agregado.");
            }
        }
    });

    // Validar correos
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Crear etiqueta visual para correos
    const createEmailTag = (email) => {
        const tag = document.createElement("span");
        tag.classList.add("email-tag");
        tag.textContent = email;

        const removeButton = document.createElement("button");
        removeButton.textContent = "x";
        removeButton.addEventListener("click", () => {
            emailList = emailList.filter((e) => e !== email);
            tag.remove();
        });

        tag.appendChild(removeButton);
        emailContainer.insertBefore(tag, emailInput);
    };

    // Botón compartir: enviar al backend
    shareButton.addEventListener("click", () => {
        const proyectoId = localStorage.getItem("proyectoId");
        if (emailList.length > 0) {
            fetch("http://localhost:3000/api/compartir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proyectoId, emails: emailList }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert("Proyecto compartido exitosamente.");
                        closeModal();
                    } else {
                        alert("Error al compartir: " + (data.error || "Intenta nuevamente."));
                    }
                })
                .catch((error) => console.error("Error:", error));
        } else {
            alert("Agrega al menos un correo antes de compartir.");
        }
    });

    // Cancelar o cerrar modal
    cancelButton.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
});

let projectName = document.querySelector("h1[contenteditable]");

// Capturar el nombre del proyecto al hacer clic en "Guardar" o cualquier acción asociada
document.getElementById("saveButton").addEventListener("click", function() {
    const projectTitle = projectName.innerText; // Obtienes el nombre del proyecto
    // Aquí realizarías la petición al backend para guardar el proyecto en la base de datos
    console.log(projectTitle); // Verifica que el nombre del proyecto se capture correctamente
});
