// =========================================
//              CONFIG
// =========================================
const API = "http://127.0.0.1:8000";
let lastOrderId = null; // Per rilevare nuovi ordini

console.log("dashboard.js caricato ✔️");


// =========================================
//             SUONO NOTIFICA
// =========================================
const notifySound = new Audio("sounds/new-order.mp3"); 
notifySound.volume = 0.6; // volume medio


function playNotification() {
    notifySound.currentTime = 0;
    notifySound.play();
}


// =========================================
//              CHECK ADMIN LOGIN
// =========================================
function checkAdmin() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "login.html");

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.exp < Math.floor(Date.now() / 1000)) {
            logout();
        }
    } catch {
        logout();
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}


// =========================================
//                FETCH ORDINI
// =========================================
async function loadOrders(playSound = false) {
    const container = document.getElementById("orders-container");
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/admin/orders`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = "<p class='error'>Errore nel caricamento ordini.</p>";
            return;
        }

        // 📢 Rilevamento nuovo ordine
        if (data.length > 0) {
            const newestOrderId = data[0].id;

            if (lastOrderId !== null && newestOrderId !== lastOrderId && playSound) {
                console.log("🔔 Nuovo ordine ricevuto!");
                playNotification();
            }

            lastOrderId = newestOrderId;
        }

        // UI
        if (data.length === 0) {
            container.innerHTML = "<p class='no-data'>Nessun ordine presente.</p>";
            return;
        }

        container.innerHTML = "";

        data.forEach(order => {
            const div = document.createElement("div");
            div.className = "order-card glass";

            let itemsHTML = "";
            order.items.forEach(item => {
                itemsHTML += `
                    <div class="order-item">
                        <b>${item.nome_prodotto}</b>  
                        – QTY: ${item.quantita}  
                        – ${item.prezzo_unitario}€
                    </div>
                `;
            });

            div.innerHTML = `
                <h3>Ordine #${order.id}</h3>
                <p><b>Utente:</b> ${order.user_id}</p>
                <p><b>Totale:</b> ${order.totale} €</p>
                <p><b>Data:</b> ${order.created_at}</p>

                <div class="order-items">
                    <h4>Prodotti:</h4>
                    ${itemsHTML}
                </div>
            `;

            container.appendChild(div);
        });

        document.getElementById("stat-orders").textContent = data.length;

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p class='error'>Errore di connessione.</p>";
    }
}


// =========================================
//            FETCH MESSAGGI
// =========================================
async function loadMessages() {
    const container = document.getElementById("messages-container");
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API}/admin/messages`, {
            headers: { "Authorization": "Bearer " + token }
        });

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = "<p class='error'>Errore nel caricamento messaggi.</p>";
            return;
        }

        if (data.length === 0) {
            container.innerHTML = "<p class='no-data'>Nessun messaggio ricevuto.</p>";
            return;
        }

        container.innerHTML = "";

        const todayStr = new Date().toISOString().split("T")[0];
        let todayCounter = 0;

        data.forEach(msg => {
            const msgDate = msg.created_at.split("T")[0];
            if (msgDate === todayStr) todayCounter++;

            const div = document.createElement("div");
            div.className = "message-card glass";

            div.innerHTML = `
                <h3>${msg.nome}</h3>
                <p><b>Email:</b> ${msg.email}</p>
                <p class="msg-content">${msg.contenuto}</p>
                <p class="msg-date">${msg.created_at}</p>
            `;

            container.appendChild(div);
        });

        document.getElementById("stat-total-msg").textContent = data.length;
        document.getElementById("stat-msg-today").textContent = todayCounter;

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p class='error'>Errore di connessione.</p>";
    }
}



// =========================================
//       CONTROLLO AUTOMATICO NUOVI ORDINI
// =========================================
setInterval(() => {
    loadOrders(true); // true = riproduci suono se ci sono nuovi ordini
}, 5000); // ogni 5 secondi


// =========================================
//                AVVIO PAGINA
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    checkAdmin();
    loadOrders(false); // primo caricamento senza suono
    loadMessages();
});
