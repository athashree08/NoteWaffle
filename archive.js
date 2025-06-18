const { ipcRenderer } = require('electron');

async function displayArchivedNotes() {
  const archiveContainer = document.getElementById("archiveContainer");
  const savedNotes = await ipcRenderer.invoke("load-notes");

  archiveContainer.innerHTML = ""; // Clear previous

  savedNotes.forEach((note) => {
    const noteDiv = document.createElement("div");
    noteDiv.className = `note ${note.shape}`;
    noteDiv.style.backgroundColor = note.color;

    const noteContent = document.createElement("div");
    noteContent.className = "note-inner";
    noteContent.textContent = note.text.slice(0, 100); // preview content

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "note-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️ Edit";
    editBtn.onclick = () => {
      localStorage.setItem("editNoteId", note.id);
      window.location.href = "newnote.html";
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌ Delete";
    deleteBtn.onclick = async () => {
      if (confirm("Delete this note?")) {
        const updatedNotes = savedNotes.filter(n => n.id !== note.id);
        await ipcRenderer.invoke("save-notes", updatedNotes);
        displayArchivedNotes();
      }
    };

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    noteDiv.appendChild(noteContent);
    noteDiv.appendChild(actionsDiv);
    archiveContainer.appendChild(noteDiv);
  });
}

window.addEventListener("load", () => {
  if (document.getElementById("archiveContainer")) {
    displayArchivedNotes();
  }
});
