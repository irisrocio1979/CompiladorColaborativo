/%console.log('¡Frontend conectado!');%/

/*
document.getElementById('testBackend').addEventListener('click', () => {
    fetch('http://localhost:3000/')
        .then(response => response.text())
        .then(data => {
            document.getElementById('response').textContent = data;
        })
        .catch(error => console.error('Error:', error));
});
*/
document.addEventListener('DOMContentLoaded', () => {

    const infoContainer = document.getElementById('infoContainer');
    const userMenu = document.getElementById('userMenu');
    const logoutButton = document.getElementById('logoutButton');

    // Alternar visibilidad del menú al hacer clic en el contenedor .info
    infoContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el clic se propague a otros elementos
        const isHidden = userMenu.hidden;
        document.querySelectorAll('.dropdownPerfil').forEach(menu => menu.hidden = true); // Oculta otros menús si los hay
        userMenu.hidden = !isHidden; // Alterna visibilidad del menú actual
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userSession'); // Elimina la sesión del almacenamiento local
        alert('Has cerrado sesión.');
        window.location.hash = "login"; // Redirige a la página de inicio de sesión
        location.reload(); // Recarga la página
    });

    // Ocultar el menú al hacer clic fuera de él
    document.addEventListener('click', () => {
        userMenu.hidden = true;
    });

    // Función para mostrar una sección y ocultar las demás
    const mostrarSeccion = (id) => {
        console.log("Mostrando sección:", id); // Verifica qué sección intenta mostrarse
        const secciones = document.querySelectorAll(".section");
        secciones.forEach((seccion) => {
            console.log("Evaluando sección:", seccion.id);
            if (seccion.id === id) {
                seccion.style.display = "block"; // Mostrar la sección deseada
            } else {
                seccion.style.display = "none"; // Ocultar las demás
            }
        });
    };

    const actualizarInfoUsuario = () => {
        const userSession = localStorage.getItem("userSession");

        if (!userSession) {
            console.warn("No hay datos de sesión en localStorage.");
            return;
        }

        try {
            const parsedSession = JSON.parse(userSession); // Analiza el JSON almacenado
            console.log("Datos de sesión extraídos:", parsedSession);

            const user = parsedSession.user; // Extrae la información del usuario
            if (!user || !user.nombre) {
                console.error("El usuario no tiene datos válidos:", user);
                return;
            }

            console.log("Nombre de usuario extraído:", user.nombre);

            // Actualiza la imagen de perfil
            const imgElement = document.querySelector(".info img");
            if (imgElement) {
                imgElement.src = user.profileImage || "default.jpeg";
                imgElement.alt = user.name || "Usuario";
            }

            // Actualiza el texto del nombre de usuario
            const usernameElement = document.querySelector(".info span");
            if (usernameElement) {
                usernameElement.textContent = `@${user.nombre}`;
                console.log("Nombre de usuario actualizado en el DOM:", usernameElement.textContent);
            } else {
                console.warn("No se encontró el elemento <span> para actualizar el nombre de usuario.");
            }

        } catch (error) {
            console.error("Error al procesar los datos de la sesión:", error);
        }
    };


    // Cambiar la visibilidad según la URL
    let isNavigating = false;

    const manejarNavegacion = () => {
        if (isNavigating) return; // Evita dobles ejecuciones
        isNavigating = true;

        const hash = window.location.hash.slice(1);
        console.log("Cambiando a sección:", hash);
        
        if (!hash || hash === "inicio") {
            mostrarSeccion("inicio");
        } else if (hash === "registro") {
            mostrarSeccion("registro");
        } else if (hash === "login") {
            mostrarSeccion("login");
        } else if (hash === "compilador") {
            verificarSesionYMostrar("compilador");
        } else {
            mostrarSeccion("inicio");
        }

        isNavigating = false;
    };


    // Verificar si el usuario tiene sesión activa antes de mostrar el compilador
    const verificarSesionYMostrar = (id) => {
        const userSession = localStorage.getItem('userSession'); // Recuperar la sesión desde el almacenamiento local

        if (userSession) {
            try {
                const sessionData = JSON.parse(userSession);
                if (sessionData.loggedIn) {
                    console.log("Sesión activa, mostrando sección:", id);
                    actualizarInfoUsuario(); 
                    //window.location.hash = id;
                    mostrarSeccion(id);
                    //mostrarSeccion("compilador");
                    return;
                }
            } catch (error) {
                console.error("Error al analizar los datos de la sesión:", error);
            }
        }

        if (data.loggedIn) {
            localStorage.setItem('userSession', JSON.stringify(data.user));
            actualizarInfoUsuario(); 
            mostrarSeccion(id);
        }


        // Si no hay sesión válida, verificar con el servidor
        fetch("http://localhost:3000/api/usuarios/verify-session", {
            method: 'GET',
            credentials: 'include', // Para enviar cookies de sesión
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Datos de sesión desde el servidor:", data);
                if (data.loggedIn) {
                    // Guardar la sesión en el almacenamiento local
                    localStorage.setItem('userSession', JSON.stringify(data));
                    mostrarSeccion(id);
                } else {
                    alert("Por favor, inicia sesión primero.");
                    window.location.hash = "login";
                    mostrarSeccion("login");
                }
            })
            .catch((error) => {
                console.error("Error al verificar la sesión:", error);
                mostrarSeccion("inicio");
            });
    };


    // Escuchar cambios en la URL
    window.addEventListener("hashchange", () => {
        console.log("Cambio detectado en el hash:", window.location.hash);
        manejarNavegacion();
    });


    actualizarInfoUsuario();
    // Cargar la sección inicial
    manejarNavegacion();

    // Manejar eventos de formularios
    const formRegister = document.getElementById('formRegister');
    const formLogin = document.getElementById('formLogin');

    // Manejar Registro
    formRegister.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar recarga de la página
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:3000/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: username, correo: email, contraseña: password }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Registro exitoso, ahora inicia sesión.");//alert('Registro exitoso: ' + data.message);
                window.location.hash = "login";
            } else {
                alert(data.error || "Error en el registro.");//alert('Error en el registro: ' + data.message);
            }
        })
        .catch((error) => console.error('Error:', error));
    });

    // Manejar Inicio de Sesión
    formLogin.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const emailElement = document.getElementById('loginEmail');
        const passwordElement = document.getElementById('loginPassword');
        
        if (emailElement && passwordElement) {
            const email = emailElement.value;
            const password = passwordElement.value;
            console.log('Datos enviados al backend:', { correo: email, contraseña: password });

            fetch('http://localhost:3000/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, contraseña: password }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('Inicio de sesión exitoso:', data.message);
                    localStorage.setItem('userSession', JSON.stringify({ loggedIn: true, user: data.usuario }));
                    actualizarInfoUsuario(); 
                    alert('Inicio de sesión exitoso: ' + data.message);
                    window.location.hash = "compilador";
                    console.log("Navegando al hash:", window.location.hash);
                    //manejarNavegacion();
                    //mostrarSeccion("compilador");
                    location.reload();

                } else {
                    console.log('Error al iniciar sesión:', data.message);
                    alert(data.error || "Error al iniciar sesión.");
                }
            })
            .catch((error) => console.error('Error:', error));
        } else {
            console.error('Los campos de correo o contraseña no se encontraron.');
        }
    });

});


function mostrarSeccion(seccion) {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('registro').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('compilador').style.display = 'none';

    document.getElementById(seccion).style.display = 'block';
}

document.getElementById('run_button').addEventListener('click', function() {
    const code = editor.getValue();
    fetch('http://localhost:3000/api/run', { // Ajusta el puerto si es necesario
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code }),
    })
    .then(response => response.json())
    .then(data => {
        const preElement = document.createElement("pre");
        if (data.error) {
            preElement.textContent = `Error: ${data.error}`;
            preElement.classList.add('error');
        } else {
            preElement.textContent = data.output;
        }
        results.appendChild(preElement);
    })
    .catch(error => console.error('Error:', error));
});

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('switchThemeButton');

    // Función para alternar el tema
    const toggleTheme = () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Cambiar la clase en el body
        document.body.classList.remove(`${currentTheme}-theme`);
        document.body.classList.add(`${newTheme}-theme`);

        // Guardar el tema en localStorage
        localStorage.setItem('theme', newTheme);

        // Mostrar en consola que el tema ha cambiado con color log
        console.log(
            `%cTema cambiado a: ${newTheme}`,
            `color: ${newTheme === 'light' ? '#007bff' : '#4caf50'}; font-weight: bold; font-size: 14px;`
        );
    };

    // Función para cargar el tema desde localStorage
    const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Por defecto, oscuro
        document.body.classList.add(`${savedTheme}-theme`);

        // Mostrar en consola el tema inicial cargado
        console.log(
            `%cTema inicial cargado: ${savedTheme}`,
            `color: ${savedTheme === 'light' ? '#007bff' : '#4caf50'}; font-weight: bold; font-size: 14px;`
        );
    };

    // Escuchar el clic en el botón
    themeSwitcher.addEventListener('click', toggleTheme);

    // Cargar el tema al inicio
    loadTheme();
});

// Mostrar el formulario para compartir
function mostrarFormularioCompartir() {
    document.getElementById('modalCompartir').style.display = 'block';
}

// Cerrar el modal
function cerrarModal() {
    document.getElementById('modalCompartir').style.display = 'none';
}


document.getElementById('shareButton').addEventListener('click', compartirProyecto);

function compartirProyecto() {
    const projectId = getProjectId(); // Esta función debería obtener el ID del proyecto actual (puedes gestionarlo con un estado en tu aplicación).
    const sharedWithUser = prompt("Introduce el ID del usuario con el que deseas compartir el proyecto:");

    if (!sharedWithUser) {
        alert("Debe ingresar un usuario válido.");
        return;
    }

    fetch('http://localhost:3000/api/proyectos/compartir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, sharedWithUser })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("Proyecto compartido exitosamente.");
        } else {
            alert("Error al compartir el proyecto: " + (data.error || 'Desconocido'));
        }
    })
    .catch(error => console.error('Error al compartir el proyecto:', error));
}

// Función para obtener el ID del proyecto basado en el nombre (u otro parámetro)
const getProjectId = async (nombreProyecto, userId) => {
    try {
        const query = 'SELECT id FROM proyectos WHERE nombre = ? AND creador_id = ?';
        const [rows] = await db.query(query, [nombreProyecto, userId]);

        if (rows.length > 0) {
            return rows[0].id;  // Retorna el ID del proyecto si se encuentra
        } else {
            throw new Error('Proyecto no encontrado o el usuario no es el creador');
        }
    } catch (err) {
        console.error('Error al obtener el ID del proyecto:', err);
        throw new Error('Error al obtener el ID del proyecto');
    }
};
