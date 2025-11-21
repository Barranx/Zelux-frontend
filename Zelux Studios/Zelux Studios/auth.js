const API = "http://127.0.0.1:8000";

// ==========================
//   GET USER PROFILE
// ==========================
async function getProfile() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const res = await fetch(`${API}/me`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) return null;

        return await res.json();

    } catch (err) {
        return null;
    }
}



// ==========================
//        LOGIN
// ==========================
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorBox = document.getElementById("login-error");

    errorBox.textContent = "";

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            errorBox.textContent = "Email o password errati";
            return;
        }

        const data = await res.json();

        // 🔥 Salva token
        localStorage.setItem("token", data.access_token);

        // 🔥 Vai allo shop
        window.location.href = "shop.html";

    } catch (err) {
        errorBox.textContent = "Errore di connessione";
    }
}



// ==========================
//      REGISTER
// ==========================
async function registerUser(event) {
    event.preventDefault();

    const full_name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const errorBox = document.getElementById("register-error");

    errorBox.textContent = "";

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, email, password })
        });

        if (!res.ok) {
            errorBox.textContent = "Email già registrata";
            return;
        }

        window.location.href = "login.html";

    } catch (err) {
        errorBox.textContent = "Errore di connessione";
    }
}



// ==========================
//        LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}



// ==========================
// NAVBAR DINAMICA
// ==========================
async function loadNavbar() {
    const navbar = document.getElementById("dynamic-navbar");
    const profile = await getProfile();

    if (!navbar) return;

    if (profile) {
        navbar.innerHTML = `
            <span class="hello-user">👋 Ciao, <b>${profile.full_name}</b></span>
            <button onclick="logout()" class="logout-btn">Logout</button>
        `;
    } else {
        navbar.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Registrati</a>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadNavbar);
