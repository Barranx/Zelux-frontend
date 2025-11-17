const API_URL = "https://zelux-backend-1.onrender.com";
// =========================
// LOADER – NASCONDILO SEMPRE
// =========================

function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("hide");
    setTimeout(() => loader.style.display = "none", 500);
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    hideLoader();
} else {
    window.addEventListener("load", hideLoader);
}

setTimeout(hideLoader, 3000);


// =========================
// MENU MOBILE
// =========================
function toggleMenu() {
    const mobileNav = document.getElementById("mobileNav");
    if (mobileNav) {
        mobileNav.classList.toggle("active");
    }
}
window.toggleMenu = toggleMenu;


// =========================
// HEADER SCROLL + HERO PARALLAX
// =========================
window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    const heroImage = document.querySelector(".hero-img img");
    const offset = window.scrollY;

    if (header) {
        if (offset > 40) header.classList.add("scrolled");
        else header.classList.remove("scrolled");
    }

    if (heroImage) {
        heroImage.style.transform = `translateY(${offset * 0.12}px)`;
    }
});


// =========================
// MOSTRA LINK ADMIN SE SEI LOGGATO
// =========================
function updateAdminLinksVisibility() {
    const token = localStorage.getItem("token");
    let isAdmin = false;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload.is_admin === true) {
                isAdmin = true;
            }
        } catch (e) {
            console.error("Token non valido", e);
        }
    }

    const adminLink = document.getElementById("adminLink");
    const adminLinkMobile = document.getElementById("adminLinkMobile");

    if (adminLink) adminLink.style.display = isAdmin ? "inline-block" : "none";
    if (adminLinkMobile) adminLinkMobile.style.display = isAdmin ? "block" : "none";
}
document.addEventListener("DOMContentLoaded", updateAdminLinksVisibility);


// =========================
// FORM CONTATTI → BACKEND FASTAPI
// =========================
async function sendContact(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const messaggio = document.getElementById("messaggio").value.trim();

    if (!nome || !email || !messaggio) {
        alert("Compila tutti i campi.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/send-contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome,
                email,
                messaggio
            })
        });

        if (!res.ok) {
            console.error("Errore backend:", await res.text());
            alert("Errore nell'invio al server (contatto).");
            return;
        }

    } catch (err) {
        console.error("Errore di rete verso backend:", err);
        alert("Errore di connessione al server.");
        return;
    }

    window.location.href = "success.html";
}

window.sendContact = sendContact;


// =========================
// 🔐 POPUP ADMIN & DASHBOARD
// =========================

function createPopup(id, title, message, inputId, errorId, onclickFn) {
    if (document.getElementById(id)) return;

    const popup = document.createElement("div");
    popup.id = id;
    popup.innerHTML = `
        <div class="admin-popup-box">
            <h2>${title}</h2>
            <p>${message}</p>
            <input type="password" id="${inputId}" maxlength="8" placeholder="••••••">
            <button onclick="${onclickFn}()">Accedi</button>
            <button class="closeBtn" onclick="closePopup('${id}')">Chiudi</button>
            <p id="${errorId}"></p>
        </div>
    `;
    document.body.appendChild(popup);
}

function closePopup(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
window.closePopup = closePopup; // per sicurezza globale


// --------- ADMIN (SHIFT + A) ----------
function openAdminPinPopup() {
    createPopup(
        "admin-pin-popup",
        "🔐 Accesso Admin",
        "Inserisci il PIN segreto",
        "admin-pin-input",
        "admin-error",
        "validateAdminPin"
    );
}
window.openAdminPinPopup = openAdminPinPopup;

function validateAdminPin() {
    const PIN = "739420";
    const entered = document.getElementById("admin-pin-input").value.trim();

    if (entered === PIN) {
        window.location.href = "admin.html";
    } else {
        const err = document.getElementById("admin-error");
        if (err) err.textContent = "❌ PIN errato";
    }
}
window.validateAdminPin = validateAdminPin;


// --------- DASHBOARD (SHIFT + D) ----------
function openDashboardPinPopup() {
    createPopup(
        "dashboard-pin-popup",
        "📊 Accesso Dashboard",
        "Inserisci il PIN segreto",
        "dashboard-pin-input",
        "dashboard-error",
        "validateDashboardPin"
    );
}
window.openDashboardPinPopup = openDashboardPinPopup;

function validateDashboardPin() {
    const PIN = "739420";
    const entered = document.getElementById("dashboard-pin-input").value.trim();

    if (entered !== PIN) {
        const err = document.getElementById("dashboard-error");
        if (err) err.textContent = "❌ PIN errato";
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        const err = document.getElementById("dashboard-error");
        if (err) err.textContent = "❌ Devi prima effettuare login admin";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.is_admin === true) {
            window.location.href = "dashboard.html";
        } else {
            const err = document.getElementById("dashboard-error");
            if (err) err.textContent = "❌ Non sei admin";
        }
    } catch (error) {
        const err = document.getElementById("dashboard-error");
        if (err) err.textContent = "❌ Token non valido";
    }
}
window.validateDashboardPin = validateDashboardPin;


// =========================
// HOTKEYS GLOBALI
// =========================
document.addEventListener("keydown", function (e) {
    // console.log("KEY:", e.key, "shift:", e.shiftKey); // debug se vuoi

    if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        openAdminPinPopup();
    }

    if (e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        openDashboardPinPopup();
    }
});


