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
      video: { facingMode: "environment" }, // Apertura videocamera posteriore
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
