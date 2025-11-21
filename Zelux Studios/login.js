// =====================================================
//                CONFIG API (locale + online)
// =====================================================
const API =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"                         // sviluppo locale
        : "https://zelux-backend-1.onrender.com";         // backend online

console.log("login.js caricato ✔️ API:", API);

window.loginUser = async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Inserisci email e password.");
        return;
    }

    const payload = { email, password };

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Se il server risponde (anche con 401/400) NON entra nel catch
        const data = await res.json();
        console.log("RISPOSTA LOGIN:", res.status, data);

        if (!res.ok) {
            alert(data.detail || "Credenziali non corrette.");
            return;
        }

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("full_name", data.full_name);
        localStorage.setItem("is_admin", data.is_admin);

        alert("Login effettuato con successo!");

        if (data.is_admin) {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "client-dashboard.html";
        }
    } catch (err) {
        console.error("ERRORE DI CONNESSIONE:", err);
        alert("Errore di connessione al server.");
    }
};
