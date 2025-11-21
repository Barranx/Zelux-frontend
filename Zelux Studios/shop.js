// =====================================================
//            CONFIG BACKEND API
// =====================================================
const API = "http://127.0.0.1:8000";

// Carrello locale
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

console.log("shop.js caricato ✔️");


// =====================================================
//          AUTENTICAZIONE UTENTE
// =====================================================
window.checkAuth = function () {
    const token = localStorage.getItem("token");
    if (!token) {
        return window.location.href = "login.html";
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            window.logout();
        }
    } catch {
        window.logout();
    }
};

window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    window.location.href = "login.html";
};


// =====================================================
//             GESTIONE CARRELLO
// =====================================================

// salva carrello
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// aggiungi al carrello
window.addToCart = function (id, nome, prezzo) {
    const item = cart.find(x => x.id === id);

    if (item) {
        item.quantita++;
    } else {
        cart.push({
            id,
            nome,
            prezzo,
            quantita: 1
        });
    }

    saveCart();
    window.updateCartUI();
    window.toggleCart();
};

// aggiorna UI carrello
window.updateCartUI = function () {
    const itemsEl = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");

    if (!itemsEl || !totalEl) return;

    itemsEl.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        itemsEl.innerHTML = "<p class='cart-empty'>Il carrello è vuoto</p>";
        totalEl.textContent = "0.00€";
        return;
    }

    cart.forEach(item => {
        total += item.prezzo * item.quantita;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <b>${item.nome}</b><br>
            Quantità: ${item.quantita}<br>
            Totale: ${(item.prezzo * item.quantita).toFixed(2)}€
        `;

        itemsEl.appendChild(div);
    });

    totalEl.textContent = total.toFixed(2) + "€";
};

// apri / chiudi carrello
window.toggleCart = function () {
    document.getElementById("cart-panel").classList.toggle("open");
};


// =====================================================
//       CHECKOUT MANUALE (compatibile con backend)
// =====================================================
window.checkout = async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Devi effettuare il login.");
        return window.location.href = "login.html";
    }

    if (cart.length === 0) {
        alert("Il carrello è vuoto!");
        return;
    }

    // === ITEMS CORRETTI PER IL BACKEND ===
    const items = cart.map(item => ({
        nome: item.nome,
        quantita: item.quantita,
        prezzo: item.prezzo
    }));

    // === TOTALE ===
    const total_amount = items.reduce(
        (tot, x) => tot + (x.prezzo * x.quantita),
        0
    );

    const payload = {
        items: items,
        total_amount: total_amount
    };

    console.log("PAYLOAD INVIATO (CORRETTO):", payload);
    console.log("TOKEN INVIATO:", token);

    try {
        const res = await fetch(`${API}/orders/manual`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("ERRORE BACKEND:", data);
            alert("Errore durante la creazione dell’ordine.");
            return;
        }

        // 🔥 MESSAGGIO CLIENTE AGGIORNATO
        alert(
            "Ordine inviato con successo!\n" +
            "Un amministratore ti contatterà al più presto."
        );

        localStorage.removeItem("cart");
        window.location.href = "client-dashboard.html";

    } catch (err) {
        console.error("Errore:", err);
        alert("Errore di connessione al server.");
    }
};


// =====================================================
//                AVVIO PAGINA
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    window.checkAuth();
    window.updateCartUI();
});
