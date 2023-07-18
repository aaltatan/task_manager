const headerEditBtn = document.querySelector("i[data-header-edit]");
const headerInput = document.querySelector("i[data-header-edit] + input");
const bodyOfSubtasks = document.querySelector("div[data-form] div[data-body]");
const addSubtaskButton = document.querySelector(
  "div[data-form] .header button"
);
const form = document.querySelector("div[data-form]");
const formCloseBtn = document.getElementById("close-form-btn");
const formSaveBtn = document.getElementById("save-form-btn");
const formDeleteBtn = document.getElementById("delete-form-btn");
const addMainTask = document.getElementById("add-task");
let counter = 1;

getLastID();
getMainData();

headerEditBtn.addEventListener("click", () => {
  headerInput.removeAttribute("disabled");
  headerInput.focus();
  headerInput.select();
});
headerInput.addEventListener("blur", () => {
  headerInput.setAttribute("disabled", "");
});

addSubtaskButton.addEventListener("click", () => {
  let row = addSubTask(counter);
  counter++;
  bodyOfSubtasks.appendChild(row);
  let lbl = row.querySelector("label");
  lbl.setAttribute("contentEditable", "true");
  lbl.focus();
  form.scrollTo({
    top: form.scrollHeight,
    behavior: "smooth",
  });
});

document.addEventListener("click", (event) => {
  let element = event.target;
  /** Make the subtasks editable */
  if (element.matches("i[data-subtask-edit]")) {
    let label = element.parentElement.parentElement.querySelector("label");
    label.setAttribute("contentEditable", "true");
    label.focus();
  }
  /** Delete the subtasks */
  if (element.matches("i[data-subtask-delete]")) {
    element.parentElement.parentElement.remove();
    counter--;
  }
});

formCloseBtn.addEventListener("click", () => {
  form.setAttribute("data-form-status", "hide");
  clearForm();
  getLastID();
});

formSaveBtn.addEventListener("click", () => {
  addNewTask(getFormData(form), "api/add-data");
  form.setAttribute("data-form-status", "hide");
  clearForm();
  setTimeout(() => {
    getMainData();
    getLastID();
  }, 200);
});

formDeleteBtn.addEventListener("click", () => {
  deleteTask(+form.getAttribute("data-task"));
  form.setAttribute("data-form-status", "hide");
  clearForm();
  setTimeout(() => {
    getMainData();
    getLastID();
  }, 200);
});

addMainTask.addEventListener("click", () =>
  form.setAttribute("data-form-status", "show")
);

function addSubTask(id, currentValue = "", currentIsChecked = false) {
  let row = createEl(
    "div",
    "",
    ["data-row", ""],
    ["class", "row"],
    ["id", `row-${id}`]
  );
  let inputContainer = createEl("div", "", ["class", "input"]);
  let input = currentIsChecked
    ? createEl(
        "input",
        "",
        ["type", "checkbox"],
        ["checked", ""],
        ["id", `task-${id}`],
        ["class", "chk"]
      )
    : createEl(
        "input",
        "",
        ["type", "checkbox"],
        ["id", `task-${id}`],
        ["class", "chk"]
      );
  let lbl = currentValue
    ? createEl(
        "label",
        currentValue,
        ["data-subtask-lbl", ""],
        ["for", `task-${id}`],
        ["class", "lbl-chk"]
      )
    : createEl(
        "label",
        ".",
        ["data-subtask-lbl", ""],
        ["for", `task-${id}`],
        ["class", "lbl-chk"]
      );
  /** ---------------------------------- */
  lbl.addEventListener("keypress", () => {
    let len = lbl.innerHTML.length;
    if (len > 30) lbl.blur();
  });
  lbl.addEventListener("blur", () => {
    lbl.removeAttribute("contentEditable");
  });
  /** ---------------------------------- */
  inputContainer.appendChild(input);
  inputContainer.appendChild(lbl);
  row.appendChild(inputContainer);
  let btnsContainer = createEl("div", "", ["class", "btns"]);
  let deleteBtn = createEl(
    "i",
    "",
    ["data-subtask-delete", ""],
    ["title", "delete"]
  );
  deleteBtn = addClasses(deleteBtn, "bi", "bi-trash-fill", "sm-btn");
  let editBtn = createEl("i", "", ["data-subtask-edit", ""], ["title", "edit"]);
  editBtn = addClasses(editBtn, "bi", "bi-pencil-fill", "sm-btn");
  btnsContainer.appendChild(deleteBtn);
  btnsContainer.appendChild(editBtn);
  row.appendChild(btnsContainer);
  return row;
}

/**
 * Create an Element Node with its attributes
 * @param {string} el - HTML Tag
 * @param {string} textNode - Text Node
 * @param  {...string} attributes - list of the attributes [[att,val],[att,val]]
 * @returns {HTMLElement}
 */
function createEl(el = "div", textNode = "", ...attributes) {
  let element = document.createElement(el);
  if (attributes.length) {
    for (let attribute of attributes) {
      element.setAttribute(attribute[0], attribute[1]);
    }
  }
  if (textNode !== "") {
    let tn = document.createTextNode(textNode);
    element.appendChild(tn);
  }
  return element;
}

/**
 * add a list of classes to an HTML element
 * @param {HTMLElement} el - the html element
 * @param  {...string} classes - the list of classes to add
 * @returns {HTMLElement}
 */
function addClasses(el, ...classes) {
  el.classList.add(...classes);
  return el;
}

/**
 * Returns an object of form data
 * @param {HTMLElement} parent - the parent element which the date came from
 * @returns {object}
 */
function getFormData(parent) {
  let date = new Date();
  date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let data = new Map();
  data.set("id", parent.getAttribute("data-task"));
  data.set("title", parent.querySelector(".header input").value);
  data.set("creation_date", date);
  data.set("last_update_date", date);
  data.set("is_deleted", false);
  let subtasks = [];
  const rows = document.querySelectorAll("div[data-form] div[data-body] .row");
  rows.forEach((row) => {
    let subtaskMap = new Map();
    subtaskMap.set(
      "id",
      +row.querySelector("input").getAttribute("id").split("-").at(-1)
    );
    subtaskMap.set("title", row.querySelector("label").innerHTML);
    subtaskMap.set("is_checked", row.querySelector("input").checked);
    subtaskMap.set("is_deleted", false);
    subtaskMap = Object.fromEntries(subtaskMap);
    subtasks.push(subtaskMap);
  });
  data.set("subtasks", subtasks);
  return Object.fromEntries(data);
}

function addNewTask(data, apiKey) {
  data = JSON.stringify(data);
  fetch(`${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: data,
  });
}

function clearForm() {
  bodyOfSubtasks.innerHTML = "";
  headerInput.value = "Untitled";
}

function getLastID() {
  fetch("/api/lr")
    .then((response) => response.json())
    .then((data) => {
      form.setAttribute("data-task", data["id"]);
    });
}

function getMainData() {
  fetch("/api/getmaintasks")
    .then((response) => response.json())
    .then((data) => {
      let mainTasks = data["data"];
      const taskContainer = document.querySelector("div[data-taskContainer]");
      taskContainer.querySelectorAll(".p-btn").forEach((el) => el.remove());
      for (let task of mainTasks) {
        let span = createEl(
          "span",
          task[1],
          ["data-main-task-id", task[0]],
          ["class", "p-btn"]
        );
        span.addEventListener("click", () => {
          form.setAttribute("data-form-status", "show");
          form.setAttribute("data-task", task[0]);
          // hasId(task[0]);
          headerInput.value = task[1];
          getSpecificTask(bodyOfSubtasks, task[0]);
        });
        taskContainer.appendChild(span);
      }
    });
}

/**
 *
 * @param {HTMLElement} parent
 */
function getSpecificTask(parent, childId) {
  fetch("/api/gettask", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ id: childId }),
  })
    .then((response) => response.json())
    .then((data) => {
      let counter = 1;
      for (let row of data["data"]) {
        let r = addSubTask(counter++, row[2], row[3]);
        parent.appendChild(r);
      }
    });
}

function deleteTask(id) {
  fetch("/api/delete-data", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ data: id }),
  });
}
