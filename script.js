const { ipcRenderer } = require('electron');

async function saveNotesToStorage() {
  const currentNotes = [];
  document.querySelectorAll(".note").forEach(note => {
    const id = note.dataset.id;
    const shape = [...note.classList].find(cls => cls !== "note");
    const color = note.style.backgroundColor;
    const text = note.querySelector(".note-inner").innerHTML;
    const top = note.style.top;
    const left = note.style.left;

    currentNotes.push({ id, shape, color, text, top, left });
  });

  const storedNotes = await ipcRenderer.invoke("load-notes");

  const mergedNotes = storedNotes.filter(
    stored => !currentNotes.find(current => current.id === stored.id)
  ).concat(currentNotes);

  await ipcRenderer.invoke("save-notes", mergedNotes);
}

async function loadNotesFromStorage() {
  const savedNotes = await ipcRenderer.invoke("load-notes");
  savedNotes.forEach(renderNote);
  localStorage.removeItem("editNoteId"); // Still used for routing edit note
}

function createNote() {
  const noteData = {
    id: `note-${Date.now()}`,
    shape: document.getElementById("shape").value,
    color: document.getElementById("colorPicker").value || "#fffacd",
    text: "Write your note 💌",
    top: "40vh",
    left: "40vw"
  };
  renderNote(noteData);
  saveNotesToStorage();
}

function renderNote(noteData) {
  const { id, shape, color, text, top, left } = noteData;
  const notesContainer = document.getElementById("notesContainer");

  const note = document.createElement("div");
  note.classList.add("note", shape);
  note.style.backgroundColor = color;
  note.style.top = top;
  note.style.left = left;
  note.style.position = "absolute";
  note.dataset.id = id;
  note.style.boxShadow = `0 0 20px ${color}80`;

  const closeBtn = document.createElement("div");
  closeBtn.classList.add("close-btn");
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => {
    note.remove();
    saveNotesToStorage();
  };

  const noteContent = document.createElement("div");
  noteContent.classList.add("note-inner");
  noteContent.contentEditable = true;
  noteContent.innerHTML = text;
  noteContent.addEventListener("input", saveNotesToStorage);

  note.appendChild(closeBtn);
  note.appendChild(noteContent);
  notesContainer.appendChild(note);

  note.classList.add("wiggle");
  setTimeout(() => note.classList.remove("wiggle"), 500);

  makeNoteDraggable(note);
  document.getElementById("highlightBtn").style.display = "inline-block";
}

function makeNoteDraggable(note) {
  let isDragging = false, offsetX, offsetY;

  note.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("note-inner") || e.target.classList.contains("close-btn")) return;

    isDragging = true;
    const rect = note.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    note.style.zIndex = 999;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    note.style.left = `${e.clientX - offsetX}px`;
    note.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      note.style.zIndex = '';
      saveNotesToStorage(); // save new position
    }
  });
}

function highlightText() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  if (!range || selection.isCollapsed) {
    alert("Please select some text to highlight.");
    return;
  }

  const color = document.getElementById("highlightColor").value || "#ffff00";

  const highlightSpan = document.createElement("span");
  highlightSpan.style.backgroundColor = color;
  highlightSpan.appendChild(range.extractContents());
  range.insertNode(highlightSpan);

  selection.removeAllRanges();
  saveNotesToStorage();
}

// Load notes when home page is loaded
window.addEventListener("load", () => {
  if (document.getElementById("notesContainer")) {
    loadNotesFromStorage();
  }
});
