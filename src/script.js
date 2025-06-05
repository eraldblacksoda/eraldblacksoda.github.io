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
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className = "edit-input";
  input.style = `
            font-size: 20px;
            background: transparent;
            color: var(--text);
            border: none;
            outline: none;
            font-family: inherit;
            width: 100%;
        `;

  label.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => {
    const newLabel = document.createElement("label");
    newLabel.setAttribute(
      "for",
      container.querySelector("input[type='checkbox']").id,
    );
    newLabel.textContent = input.value || currentText;
    container.replaceChild(newLabel, input);

    // Ricollega listener se ancora in editing
    if (isEditing) {
      newLabel.addEventListener("click", enableInlineEdit);
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      input.blur();
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

function addItem(text, id) {
  const container = document.createElement("div");
  container.className = "item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `item-${id}`;
  checkbox.disabled = isEditing;

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
    "Task1",
    "Task2",
    "Task3",
    "Task4",
    "Task5",
    "Long task Lorem Ipsum",
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
