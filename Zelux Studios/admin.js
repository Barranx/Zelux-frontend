// LOGIN ADMIN CON BACKEND FASTAPI (JWT)
async function adminLogin(event) {
    event.preventDefault();

    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value.trim();
    const errorBox = document.getElementById("login-error");

    try {
        const res = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!res.ok) {
            errorBox.style.display = "block";
            errorBox.textContent = "Email o password errati.";
            return;
        }

        const data = await res.json();

        // SALVA TOKEN JWT
        localStorage.setItem("token", data.access_token);

        // Redirect all'area clienti
        window.location.href = "clienti.html";

    } catch (err) {
        console.error(err);
        alert("Errore di connessione al server (login).");
    }
}
