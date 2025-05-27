"use strict";
const notesInput = document.getElementById("notes-input");
const addBtn = document.getElementById("add-btn");
const notesList = document.getElementById("notes-list");
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
const modalOkayBtn = document.querySelector(".modal-okay-btn");
modal.classList.add("hidden");
function openModal() {
    modal.classList.remove("hidden");
    gsap.fromTo(modalContent, {
        opacity: 0,
        scale: 0.8,
    }, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
    });
}
function closeModal() {
    gsap.to(modalContent, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
            modal.classList.add("hidden");
        },
    });
}
let notes = [];
let noteId = 0;
function loadNotesFromStorage() {
    const stored = localStorage.getItem("notes");
    if (stored) {
        notes = JSON.parse(stored);
        if (notes.length > 0) {
            noteId = Math.max(...notes.map((t) => t.id)) + 1;
        }
    }
    notesList.innerHTML = "";
    notes.forEach(renderNotes);
}
function saveNotesToStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
}
addBtn.addEventListener("click", () => {
    const text = notesInput.value.trim();
    if (text === "") {
        openModal();
        return;
    }
    const newNote = {
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
function renderNotes(note) {
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
        }
        else {
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
                openModal();
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
            }
            else if (e.key === "Escape") {
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
                });
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
    });
}
modalOkayBtn.addEventListener("click", closeModal);
loadNotesFromStorage();
