// Variabili per la videocamera
const videoElement = document.getElementById("camera-view");
const startCameraButton = document.getElementById("start-camera");
const stopCameraButton = document.getElementById("stop-camera");
const cameraError = document.getElementById("camera-error");
const videoContainer = document.getElementById("video-container"); // Contenitore per i video salvati

let stream; // Flusso video
let mediaRecorder; // Oggetto per registrare il video
let recordedChunks = []; // Buffer per i chunk video
const maxBufferChunks = 15; // Limite di 15 secondi (chunk da 1 secondo ciascuno)
let isRecording = false; // Stato della registrazione

// Funzione per avviare la videocamera
startCameraButton.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    videoElement.srcObject = stream;
    startCameraButton.style.display = "none";
    stopCameraButton.style.display = "inline-block";
    cameraError.style.display = "none";

    let options;

    // Verifica se il browser supporta MP4 o MP4 Safari
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      options = { mimeType: "video/mp4" };
    } else if (MediaRecorder.isTypeSupported("video/mp4;codecs=h264")) {
      options = { mimeType: "video/mp4;codecs=h264" }; // Safari (Apple)
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options = { mimeType: "video/webm" }; // WebM come fallback
    } else {
      throw new Error("Nessun formato video supportato dal tuo browser.");
    }

    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        // Mantieni solo gli ultimi 15 secondi (se il buffer supera il limite, elimina i più vecchi)
        while (recordedChunks.length > maxBufferChunks) {
          recordedChunks.shift();
        }
      }
    };

    mediaRecorder.start(1000); // Registra in segmenti da 1 secondo
    isRecording = true;
  } catch (error) {
    console.error("Errore nell'accesso alla videocamera:", error);
    cameraError.style.display = "block";
    cameraError.textContent = "Errore: " + error.message;
  }
});

// Funzione per fermare la videocamera
stopCameraButton.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
    stream = null;
    isRecording = false;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }
  startCameraButton.style.display = "inline-block";
  stopCameraButton.style.display = "none";
});

// Funzione per salvare gli ultimi 15 secondi in una cartella visiva
function saveLast15Seconds() {
  if (recordedChunks.length > 0) {
    const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
    const url = URL.createObjectURL(blob);

    // Crea un elemento video e lo aggiunge al contenitore
    const videoItem = document.createElement("video");
    videoItem.src = url;
    videoItem.controls = true;
    videoItem.width = 320;
    videoContainer.appendChild(videoItem);

    // Resetta i chunk solo per la nuova registrazione
    recordedChunks = [];
  } else {
    console.warn("Non ci sono dati da salvare.");
  }
}

// Variabili per il punteggio
const btnPlayer1 = document.querySelector(".btn-player1");
const btnPlayer2 = document.querySelector(".btn-player2");
const resetButton = document.getElementById("reset-points");
const winGame1 = document.getElementById("win-game1");
const winSet1 = document.getElementById("win-set1");
const winGame2 = document.getElementById("win-game2");
const winSet2 = document.getElementById("win-set2");
const scoreDisplayPlayer1 = document.getElementById("score-player1");
const scoreDisplayPlayer2 = document.getElementById("score-player2");

let scorePlayer1 = 0;
let scorePlayer2 = 0;
let advantagePlayer = null; // Tiene traccia del giocatore in vantaggio

const tennisScores = [0, 15, 30, 40];

// Funzione per aggiornare il punteggio
function updateScore(player) {
  if (scorePlayer1 === 3 && scorePlayer2 === 3) {
    // Punteggio 40 - 40
    if (advantagePlayer === null) {
      // Assegna il vantaggio al giocatore corrente
      advantagePlayer = player;
    } else if (advantagePlayer === player) {
      // Il giocatore con il vantaggio vince il game
      incrementGame(player);
      advantagePlayer = null; // Resetta lo stato di vantaggio
    } else {
      // Se l'altro giocatore segna, si torna in parità
      advantagePlayer = null;
    }
  } else {
    // Punteggio normale
    if (player === 1) {
      if (scorePlayer1 < tennisScores.length - 1) {
        scorePlayer1++;
      } else {
        incrementGame(1);
      }
    } else if (player === 2) {
      if (scorePlayer2 < tennisScores.length - 1) {
        scorePlayer2++;
      } else {
        incrementGame(2);
      }
    }
  }

  updateScoreDisplay();
}

// Funzione per aggiornare il display dei punteggi
function updateScoreDisplay() {
  if (scorePlayer1 === 3 && scorePlayer2 === 3) {
    if (advantagePlayer === 1) {
      scoreDisplayPlayer1.textContent = "Adv";
      scoreDisplayPlayer2.textContent = "40";
    } else if (advantagePlayer === 2) {
      scoreDisplayPlayer1.textContent = "40";
      scoreDisplayPlayer2.textContent = "Adv";
    } else {
      scoreDisplayPlayer1.textContent = "40";
      scoreDisplayPlayer2.textContent = "40";
    }
  } else {
    scoreDisplayPlayer1.textContent = tennisScores[scorePlayer1];
    scoreDisplayPlayer2.textContent = tennisScores[scorePlayer2];
  }
}

// Funzione per incrementare il game
function incrementGame(player) {
  // Incrementa il numero di game vinti per il giocatore
  if (player === 1) {
    winGame1.textContent = parseInt(winGame1.textContent) + 1;
    scorePlayer1 = 0; // Azzeriamo il punteggio
    scorePlayer2 = 0; // Azzeriamo il punteggio
  } else if (player === 2) {
    winGame2.textContent = parseInt(winGame2.textContent) + 1;
    scorePlayer1 = 0; // Azzeriamo il punteggio
    scorePlayer2 = 0; // Azzeriamo il punteggio
  }

  // Verifica se uno dei giocatori ha vinto il set
  checkSetWinner(player);
}

// Funzione per verificare chi ha vinto il set
function checkSetWinner(player) {
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  const maxGames = matchSettings?.gameCount; // Imposta il numero massimo di game per un set
  const maxSets = matchSettings?.setCount; // Imposta il numero massimo di set per vincere la partita

  if (player === 1) {
    const currentGameCount = parseInt(winGame1.textContent, 10);
    if (currentGameCount === maxGames) {
      let currentSetWins = parseInt(winSet1.textContent, 10);
      currentSetWins++;
      winSet1.textContent = currentSetWins;

      // Se il giocatore ha vinto abbastanza set, vince la partita
      if (currentSetWins === maxSets) {
        alert(`${matchSettings.nameP1} ha vinto la partita!`);
        resetAll(); // Resetta tutto per una nuova partita
        window.location.href = "index.html";
      } else {
        resetGameAndPoints(); // Resetta il punteggio e i game per il prossimo set
      }
    }
  } else if (player === 2) {
    const currentGameCount = parseInt(winGame2.textContent, 10);
    if (currentGameCount === maxGames) {
      let currentSetWins = parseInt(winSet2.textContent, 10);
      currentSetWins++;
      winSet2.textContent = currentSetWins;

      // Se il giocatore ha vinto abbastanza set, vince la partita
      if (currentSetWins === maxSets) {
        alert(`${matchSettings.nameP2} ha vinto la partita!`);
        resetAll(); // Resetta tutto per una nuova partita
        window.location.href = "index.html";
      } else {
        resetGameAndPoints(); // Resetta il punteggio e i game per il prossimo set
      }
    }
  }
}

// Funzione per resettare il punteggio
function resetGameAndPoints() {
  scorePlayer1 = 0;
  scorePlayer2 = 0;
  winGame1.textContent = 0;
  winGame2.textContent = 0;
  updateScoreDisplay();
}

// Funzione per resettare tutto (set e game)
function resetAll() {
  scorePlayer1 = 0;
  scorePlayer2 = 0;
  winGame1.textContent = 0;
  winGame2.textContent = 0;
  winSet1.textContent = 0;
  winSet2.textContent = 0;
  updateScoreDisplay();
}

// Ascoltatori eventi per i bottoni dei giocatori
btnPlayer1.addEventListener("click", () => updateScore(1));
btnPlayer2.addEventListener("click", () => updateScore(2));

// Ascoltatore per il reset dei punti
resetButton.addEventListener("click", resetAll);

// Recupera le impostazioni della partita
const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

if (matchSettings) {
  console.log("Impostazioni partita:", matchSettings);
  // Usa questi dati nella logica della partita
  const { nameP1, nameP2, gameCount, setCount } = matchSettings;

  // Puoi aggiornare il display con i nomi
  document.querySelector(".name-player1").textContent = nameP1;
  document.querySelector(".name-player2").textContent = nameP2;
  document.querySelector(".btn-player1").textContent = nameP1;
  document.querySelector(".btn-player2").textContent = nameP2;
  document.querySelector("#score-game").textContent = gameCount;
  document.querySelector("#score-set").textContent = setCount;
}
