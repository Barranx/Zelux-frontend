/* ============================================
   ZELUX CLIENT DASHBOARD – VERSIONE MIGLIORATA
============================================ */

const API_BASE = "http://127.0.0.1:8000";

/* ===========================
   TOKEN & LOGIN CHECK
=========================== */
function getToken() {
    return localStorage.getItem("token");
}

function decodeToken() {
    try {
        const token = getToken();
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

function ensureLogged() {
    const payload = decodeToken();
    if (!payload) {
        window.location.href = "login.html";
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}
ensureLogged();

/* ===========================
   NAVIGAZIONE
=========================== */
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("client-nav");
    const contentArea = document.getElementById("content-area");
    const pageTitle = document.getElementById("page-title");

    // Nome utente dinamico
    const payload = decodeToken();
    if (payload?.full_name) {
        document.getElementById("user-name").textContent = payload.full_name;
    }

    function setActive(link) {
        nav.querySelectorAll("a").forEach(a => a.classList.remove("active"));
        link.classList.add("active");
    }

    async function loadPage(page) {
        switch (page) {
            case "profile":
                pageTitle.textContent = "Profilo";
                await renderProfile(contentArea);
                break;

            case "products":
                pageTitle.textContent = "Prodotti";
                await renderProducts(contentArea);
                break;

            case "cart":
                pageTitle.textContent = "Carrello";
                renderCart(contentArea);
                break;

            case "orders":
                pageTitle.textContent = "I miei ordini";
                await renderOrders(contentArea);
                break;

            case "payments":
                pageTitle.textContent = "Pagamenti";
                renderPaymentsInfo(contentArea);
                break;

            case "ticket":
                pageTitle.textContent = "Ticket di supporto";
                renderTicketForm(contentArea);
                break;

            case "quotes":
                pageTitle.textContent = "Preventivi";
                renderQuotesForm(contentArea);
                break;
        }
    }

    nav.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-page]");
        if (!link) return;
        const page = link.dataset.page;

        setActive(link);
        loadPage(page);
    });

    // Prima pagina caricata
    loadPage("profile");
});

/* ===========================
   PROFILO
=========================== */
async function renderProfile(container) {
    const payload = decodeToken();

    container.innerHTML = `
        <h2 class="section-title">Dati Account</h2>

        <div class="profile-row">
            <span class="profile-label">ID Utente:</span>
            <span>${payload?.sub || "-"}</span>
        </div>

        <div class="profile-row">
            <span class="profile-label">Nome completo:</span>
            <span>${payload?.full_name || "-"}</span>
        </div>

        <div class="profile-row">
            <span class="profile-label">Email:</span>
            <span>${payload?.email || "-"}</span>
        </div>
    `;
}

/* ===========================
   CARRELLO (LocalStorage)
=========================== */
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* ===========================
   PRODOTTI
=========================== */
async function renderProducts(container) {
    container.innerHTML = `<p>Caricamento prodotti...</p>`;

    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error("Errore caricamento");

        const products = await res.json();

        if (products.length === 0) {
            container.innerHTML = `<p>Nessun prodotto disponibile.</p>`;
            return;
        }

        let html = `
            <h2 class="section-title">Catalogo prodotti</h2>
            <div class="products-grid">
        `;

        products.forEach(p => {
            html += `
                <div class="product-card">
                    <div class="product-name">${p.nome}</div>
                    <div class="product-desc">${p.descrizione || "Servizio professionale Zelux"}</div>
                    <div class="product-price">${p.prezzo.toFixed(2)} €</div>

                    <button class="btn-gold"
                        onclick="addToCart(${p.id}, '${p.nome.replace(/'/g, "\\'")}', ${p.prezzo})">
                        Aggiungi al carrello
                    </button>
                </div>
            `;
        });

        html += "</div>";
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `<p style="color:red;">Errore di rete.</p>`;
    }
}

window.addToCart = function (id, nome, prezzo) {
    let cart = getCart();

    const found = cart.find(item => item.product_id === id);

    if (found) found.quantita++;
    else cart.push({ product_id: id, nome, prezzo, quantita: 1 });

    saveCart(cart);
    alert("Prodotto aggiunto al carrello!");
};

/* ===========================
   CARRELLO
=========================== */
function renderCart(container) {
    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <h2 class="section-title">Carrello</h2>
            <p class="cart-empty">Il carrello è vuoto.</p>
        `;
        return;
    }

    let total = 0;
    let rows = "";

    cart.forEach((item, i) => {
        const subtot = item.prezzo * item.quantita;
        total += subtot;

        rows += `
            <tr>
                <td>${item.nome}</td>
                <td>${item.quantita}</td>
                <td>${item.prezzo.toFixed(2)}€</td>
                <td>${subtot.toFixed(2)}€</td>
                <td>
                    <button class="btn-gold" onclick="changeQty(${i}, -1)">−</button>
                    <button class="btn-gold" onclick="changeQty(${i}, 1)">+</button>
                    <button class="btn-gold" onclick="removeItem(${i})">✖</button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = `
        <h2 class="section-title">Carrello</h2>
        <table class="table">
            <thead>
                <tr><th>Prodotto</th><th>Qtà</th><th>Prezzo</th><th>Totale</th><th>Azioni</th></tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="cart-total">Totale: <b>${total.toFixed(2)} €</b></div>

        <button class="btn-gold" onclick="startCheckout()" style="margin-top:20px;">
            Procedi al pagamento
        </button>
    `;
}

window.changeQty = function (i, delta) {
    const cart = getCart();

    cart[i].quantita += delta;
    if (cart[i].quantita <= 0) cart.splice(i, 1);

    saveCart(cart);
    renderCart(document.getElementById("content-area"));
};

window.removeItem = function (i) {
    const cart = getCart();
    cart.splice(i, 1);
    saveCart(cart);
    renderCart(document.getElementById("content-area"));
};

/* ===========================
   CHECKOUT – STRIPE
=========================== */
async function startCheckout() {
    const cart = getCart();
    if (!cart.length) return alert("Carrello vuoto.");

    const token = getToken();

    const items = cart.map(c => ({
        product_id: c.product_id,
        quantita: c.quantita
    }));

    try {
        const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ items })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.detail || "Errore pagamento");

        localStorage.removeItem("cart");
        window.location.href = data.checkout_url;

    } catch {
        alert("Errore durante il pagamento");
    }
}

/* ===========================
   ORDINI
=========================== */
async function renderOrders(container) {
    container.innerHTML = `<p>Caricamento ordini...</p>`;

    try {
        const res = await fetch(`${API_BASE}/my/orders`, {
            headers: { "Authorization": "Bearer " + getToken() }
        });

        const data = await res.json();

        if (!data.length) {
            container.innerHTML = `<p>Nessun ordine trovato.</p>`;
            return;
        }

        let rows = "";

        data.forEach(o => {
            rows += `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.totale.toFixed(2)}€</td>
                    <td>${o.stato}</td>
                    <td>${o.payment_status}</td>
                    <td>${new Date(o.created_at).toLocaleString()}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <h2 class="section-title">I miei ordini</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th><th>Totale</th><th>Stato</th><th>Pagamento</th><th>Data</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

    } catch {
        container.innerHTML = `<p style="color:red;">Errore nel caricamento ordini.</p>`;
    }
}

/* ===========================
   PAGAMENTI INFO
=========================== */
function renderPaymentsInfo(container) {
    container.innerHTML = `
        <h2 class="section-title">Pagamenti</h2>
        <p>I pagamenti vengono gestiti tramite Stripe in totale sicurezza.</p>
        <p>Controlla lo stato dei pagamenti in "I miei ordini".</p>
    `;
}

/* ===========================
   TICKET
=========================== */
function renderTicketForm(container) {
    container.innerHTML = `
        <h2 class="section-title">Ticket di supporto</h2>
        <p class="muted">Funzione in arrivo — Usa il form contatti nel sito principale.</p>
    `;
}

/* ===========================
   PREVENTIVI
=========================== */
function renderQuotesForm(container) {
    container.innerHTML = `
        <h2 class="section-title">Preventivi</h2>
        <p class="muted">Gestione preventivi presto disponibile.</p>
    `;
}

/* ===========================
   LOGOUT
=========================== */
function logoutClient() {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    window.location.href = "login.html";
}
window.logoutClient = logoutClient;
