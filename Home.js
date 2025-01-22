const startMatchButton = document.getElementById("start-match");

startMatchButton.addEventListener("click", () => {
  // Raccogli i dati inseriti dall'utente
  const nameP1 = document.getElementById("nameP1").value.trim().toUpperCase();
  const nameP2 = document.getElementById("nameP2").value.trim().toUpperCase();
  const gameCount = document.getElementById("game").value;
  const setCount = document.getElementById("set").value;

  // Verifica che i campi obbligatori siano compilati
  if (!nameP1 || !nameP2 || !gameCount || !setCount) {
    alert("Per favore, completa tutti i campi obbligatori.");
    return;
  }

  // Salva i dati nel localStorage
  localStorage.setItem(
    "matchSettings",
    JSON.stringify({
      nameP1,
      nameP2,
      gameCount: parseInt(gameCount, 10),
      setCount: parseInt(setCount, 10),
    })
  );

  // Reindirizza alla pagina match.html
  window.location.href = "match.html";
});
