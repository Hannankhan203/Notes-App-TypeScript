// import gsap from 'gsap';

declare const gsap: any;

interface Note {
  id: number;
  text: string;
  completed: boolean;
}

const notesInput = document.getElementById("notes-input") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const notesList = document.getElementById("notes-list") as HTMLDivElement;

let notes: Note[] = [];
let noteId = 0;

function loadNotesFromStorage(): void {
  const stored = localStorage.getItem("notes");
  if (stored) {
    notes = JSON.parse(stored) as Note[];
    if (notes.length > 0) {
      noteId = Math.max(...notes.map((t) => t.id)) + 1;
    }
  }
  notesList.innerHTML = "";
  notes.forEach(renderNotes);
}

function saveNotesToStorage(): void {
  localStorage.setItem("notes", JSON.stringify(notes));
}

addBtn.addEventListener("click", () => {
  const text = notesInput.value.trim();
  if (text === "") {
    alert("Please enter a note");
    return;
  }

  const newNote: Note = {
    id: noteId++,
    text: text,
    completed: false,
  };

  notes.push(newNote);
  saveNotesToStorage();
  renderNotes(newNote);
  notesInput.value = "";
  notesInput.focus();
});

function renderNotes(note: Note): void {
  const noteDiv = document.createElement("div");
  noteDiv.classList.add("note");
  if (note.completed) {
    noteDiv.classList.add("completed");
  }

  noteDiv.dataset.id = note.id.toString();

  const textSpan = document.createElement("span");
  textSpan.textContent = note.text;
  textSpan.style.flex = "1";
  noteDiv.appendChild(textSpan);

  textSpan.addEventListener("click", () => {
    note.completed = !note.completed;
    if (note.completed) {
      noteDiv.classList.add("completed");
    } else {
      noteDiv.classList.remove("completed");
    }
    saveNotesToStorage();
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");

  editBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = note.text;
    input.style.flex = "1";
    input.classList.add("edit-note");
    noteDiv.replaceChild(input, textSpan);
    input.focus();

    function saveEdit() {
      const newText = input.value.trim();
      if (newText === "") {
        alert("Please enter a note");
        return;
      }
      note.text = newText;
      saveNotesToStorage();
      textSpan.textContent = newText;
      noteDiv.replaceChild(textSpan, input);
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit();
      } else if (e.key === "Escape") {
        noteDiv.replaceChild(textSpan, input);
      }
    });

    input.addEventListener("blur", () => {
      saveEdit();
    });
  });

  noteDiv.append(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notes = notes.filter((t) => t.id !== note.id);
    saveNotesToStorage();

    gsap.to(noteDiv, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      onComplete: () => {
        noteDiv.remove();

        const remainingNotes = document.querySelectorAll(".note");
        gsap.to(remainingNotes, {
          y: 0,
          stagger: 0.01,
          duration: 0.3,
          ease: "power4.out",
        })
      },
    });
  });

  noteDiv.appendChild(deleteBtn);

  gsap.from(noteDiv, {
    opacity: 1,
    y: -20,
    duration: 0.4,
    ease: "power2.out",
  });

  notesList.appendChild(noteDiv);

  gsap.from(noteDiv, {
    opacity: 0,
    y: -20,
    duration: 0.4,
    ease: "power2.out",
  })
}

loadNotesFromStorage();
