async function loadMessages() {

    const container = document.getElementById("messages-container");
    container.innerHTML = `<p class="loading">Caricamento...</p>`;

    const token = localStorage.getItem("token");

    if (!token) {
        container.innerHTML = "<p style='color:red;'>Token mancante.</p>";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/admin/messages", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            container.innerHTML = "<p style='color:red;'>Errore caricamento messaggi.</p>";
            return;
        }

        const data = await res.json();

        // ========================
        //      STATISTICHE
        // ========================
        document.getElementById("stat-total").textContent = data.length;

        let today = new Date().toISOString().slice(0, 10);
        document.getElementById("stat-today").textContent =
            data.filter(m => m.created_at.startsWith(today)).length;

        // Non gestiamo "non letti"
        document.getElementById("stat-unread").textContent = 0;

        // ========================
        //      MESSAGGI
        // ========================
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<p>Nessun messaggio trovato.</p>";
            return;
        }

        // wrapper per layout migliore
        const wrapper = document.createElement("div");
        wrapper.classList.add("messages-wrapper");

        data.forEach(msg => {

            const card = document.createElement("div");
            card.classList.add("message-card");

            card.innerHTML = `
                <div class="msg-name">${msg.nome}</div>
                <div class="msg-email">${msg.email}</div>

                <div class="msg-content">
                    ${msg.contenuto}
                </div>

                <div class="msg-date">📅 ${msg.created_at}</div>
            `;

            wrapper.appendChild(card);
        });

        container.appendChild(wrapper);

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p style='color:red;'>Errore di rete.</p>";
    }
}


// ========================
//      LOGOUT
// ========================
function logout() {
    localStorage.removeItem("token");
    window.location.href = "admin.html";
}

document.addEventListener("DOMContentLoaded", loadMessages);
