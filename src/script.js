const editButton = document.getElementById("edit-button");
const shareButton = document.getElementById("share-button");

const checklist = document.getElementById("checklist");
const form = document.getElementById("add-item-form");
const newItemInput = document.getElementById("new-item");

let isEditing = false;
let itemId = 0;

function toggleEditingMode(state) {
  isEditing = state ?? !isEditing;
  editButton.textContent = isEditing ? "Done" : "Edit";
  editButton.classList.toggle("editing", isEditing);
  form.style.display = isEditing ? "flex" : "none";

  shareButton.classList.toggle("hidden", isEditing);

  document.querySelectorAll(".delete-button").forEach((btn) => {
    btn.style.display = isEditing ? "inline" : "none";
  });

  document
    .querySelectorAll("#checklist input[type='checkbox']")
    .forEach((cb) => {
      cb.disabled = isEditing;
    });

  document.querySelectorAll("#checklist .item label").forEach((label) => {
    if (isEditing) {
      label.addEventListener("click", enableInlineEdit);
    } else {
      label.removeEventListener("click", enableInlineEdit);
    }
  });
}

function enableInlineEdit(e) {
  const label = e.target;
  const container = label.parentElement;

  const currentText = label.textContent;
  const textarea = document.createElement("textarea");
  textarea.className = "edit-input";
  textarea.value = currentText;
  textarea.rows = 1;
  textarea.style.resize = "none";

  label.replaceWith(textarea);
  textarea.style.height = textarea.scrollHeight + "px";

  textarea.focus();

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  textarea.addEventListener("blur", () => {
    const newLabel = document.createElement("label");
    newLabel.setAttribute(
      "for",
      container.querySelector("input[type='checkbox']").id,
    );
    newLabel.textContent = textarea.value || currentText;
    container.replaceChild(newLabel, textarea);
    if (isEditing) {
      newLabel.addEventListener("click", enableInlineEdit);
    }
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textarea.blur();
    }
  });
}

editButton.addEventListener("click", () => toggleEditingMode());

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = newItemInput.value.trim();
  if (!text) return;
  itemId++;
  addItem(text, itemId);
  newItemInput.value = "";
  const offset = 80; // altezza extra che vuoi lasciare visibile
  const rect = form.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  window.scrollTo({
    top: absoluteTop - offset,
    behavior: "smooth",
  });
});

function addItem(text, id, checked = false) {
  const container = document.createElement("div");
  container.className = "item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `item-${id}`;
  checkbox.disabled = isEditing;
  checkbox.checked = checked;

  const label = document.createElement("label");
  label.setAttribute("for", checkbox.id);
  label.textContent = text;

  if (isEditing) {
    label.addEventListener("click", enableInlineEdit);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "X";
  deleteBtn.className = "delete-button";
  deleteBtn.type = "button";
  deleteBtn.style.display = isEditing ? "inline" : "none";
  deleteBtn.onclick = () => container.remove();

  container.appendChild(checkbox);
  container.appendChild(label);
  container.appendChild(deleteBtn);

  checklist.insertBefore(container, form);
}

window.addEventListener("DOMContentLoaded", () => {
  const initialItems = [
    "Clicca sugli elementi per checkarli / uncheckarli",
    "Clicca 'Edit' per editare la lista",
    "Aggiungi elementi alla lista inserendoli sul campo di testo",
    "Premi 'x' per eliminare elementi",
    "Clicca su un elemento della lista (in edit mode) per modificarlo",
    "Clicca 'Done' quando hai finito di editare",
    "Premi su 'Share' per scaricare un .json della tua lista",
    "Ricarica la pagina e droppaci dentro il .json appena scaricato",
  ];
  initialItems.forEach((text) => {
    itemId++;
    addItem(text, itemId);
  });

  checklist.appendChild(form); // assicura che il form resti in fondo
});

document.addEventListener("DOMContentLoaded", () => {
  checklist.addEventListener("dblclick", (e) => {
    if (e.target.tagName === "LABEL") {
      e.preventDefault();
      window.getSelection()?.removeAllRanges(); // rimuove selezione se avviata
    }
  });
});

shareButton.addEventListener("click", () => {
  const data = [];

  document.querySelectorAll("#checklist .item").forEach((item) => {
    const checkbox = item.querySelector("input[type='checkbox']");
    const label = item.querySelector("label");
    if (checkbox && label) {
      data.push({
        text: label.textContent.trim(),
        checked: checkbox.checked,
      });
    }
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "checklist.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

const dropZone = document.getElementById("drop-zone");

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.style.display = "block";
  dropZone.style.background = "rgba(255, 255, 255, 0.05)";
});

document.addEventListener("dragleave", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.style.display = "none";
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.style.display = "none";

  const file = e.dataTransfer.files[0];
  if (!file || !file.name.endsWith(".json")) {
    alert("Devi trascinare un file .json valido.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const raw = event.target.result.trim().replace(/^\uFEFF/, "");
      const form = document.getElementById("add-item-form");

      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("Formato JSON non valido");

      document.querySelectorAll("#checklist .item").forEach((el) => {
        if (el.id !== "add-item-form") el.remove();
      });

      data.forEach((entry) => {
        if (typeof entry.text === "string") {
          itemId++;
          addItem(entry.text, itemId, !!entry.checked);
        }
      });

      checklist.appendChild(form);
    } catch (err) {
      alert("Errore durante il parsing del file JSON.");
      console.error(err);
    }
  };

  reader.readAsText(file);
});
