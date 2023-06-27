document.addEventListener("DOMContentLoaded", function() {
    const todoInput = document.getElementById("todo-input");
    const addButton = document.getElementById("add-button");
    const todoList = document.getElementById("todo-list");
  
    const noteInput = document.getElementById("note-input");
    const saveButton = document.getElementById("save-button");
    const noteList = document.getElementById("note-list");

    // AWS SDK Configuration
  AWS.config.update({
    region: 'us-east-1' 
  });

  const s3 = new AWS.S3();

    addButton.addEventListener("click", function() {
      const todoText = todoInput.value.trim();
      if (todoText !== "") {
        const currentDate = new Date().toLocaleDateString(); // Get current date
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <span class="date">${currentDate}</span>
          <span class="todo">${todoText}</span>
          <input type="checkbox" class="check-button">
          <span class="delete-button">Delete</span>
        `;
        todoList.appendChild(listItem);
        todoInput.value = "";
  
        saveTodosToLocalStorage();
      }
    });
  
    saveButton.addEventListener("click", function() {
        const noteText = noteInput.value.trim();
        if (noteText !== "") {
          const currentDate = new Date().toLocaleDateString(); // Get current date
          const listItem = document.createElement("li");
          listItem.innerHTML = `
            <div class="note-wrapper">
              <span class="note-date">${currentDate}</span>
              <span class="note-text">${noteText}</span>
              <div class="note-buttons">
                <button class="revise-button">Revise</button>
                <button class="delete-button">Delete</button>
              </div>
            </div>
          `;
          noteList.appendChild(listItem);
          noteInput.value = "";
    
          saveNotesToLocalStorage();
        }
      });
  
    // Event listener for deleting tasks
  todoList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-button")) {
      const listItem = event.target.closest("li");
      listItem.remove();
      saveTodosToLocalStorage();
    }
  });

  // Event listener for deleting notes
  noteList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-button")) {
      const listItem = event.target.closest("li");
      listItem.remove();
      saveNotesToLocalStorage();
    }
  });

    function saveTodosToLocalStorage() {
        const todos = [];
        const todoItems = todoList.querySelectorAll("li");
        todoItems.forEach(function(todoItem) {
          const date = todoItem.querySelector(".date").textContent;
          const todo = todoItem.querySelector(".todo").textContent;
          const isChecked = todoItem.querySelector(".check-button").checked;
          todos.push({ date, todo, isChecked });
        });
        localStorage.setItem("todos", JSON.stringify(todos));
      }
      
      function loadTodosFromLocalStorage() {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
          const todos = JSON.parse(savedTodos);
          todos.forEach(function(todo) {
            const listItem = document.createElement("li");
            const checked = todo.isChecked ? "checked" : "";
            listItem.innerHTML = `
              <span class="date">${todo.date}</span>
              <span class="todo">${todo.todo}</span>
              <input type="checkbox" class="check-button" ${checked}>
              <span class="delete-button">Delete</span>
            `;
            todoList.appendChild(listItem);
          });
        }
      }
      
    function saveNotesToLocalStorage() {
      const notes = [];
      const noteItems = noteList.querySelectorAll("li");
      noteItems.forEach(function(noteItem) {
        const date = noteItem.querySelector(".date").textContent;
        const note = noteItem.querySelector(".note").textContent;
        notes.push({ date, note });
      });
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  
    function loadNotesFromLocalStorage() {
        const savedNotes = localStorage.getItem("notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          notes.forEach(function (note) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
              <div class="note-wrapper">
                <span class="note-date">${note.date}</span>
                <span class="note-text">${note.note}</span>
                <div class="note-buttons">
                  <button class="revise-button">Revise</button>
                  <button class="delete-button">Delete</button>
                </div>
              </div>
            `;
            noteList.appendChild(listItem);
          });
        }
      }
      
  
    loadTodosFromLocalStorage();
    loadNotesFromLocalStorage();
  });
  
// Function to upload file to S3 bucket
function uploadFileToS3(file, fileName) {
    const params = {
      Bucket: 'my-todo-list-bucket',
      Key: fileName,
      Body: file,
      ACL: 'public-read'
    };

    s3.upload(params, function(err, data) {
      if (err) {
        console.log('Error uploading file to S3:', err);
      } else {
        console.log('File uploaded to S3 successfully:', data.Location);
      }
    });
  }

  // Fetch and upload index.html file from project directory
  fetch('index.html')
    .then(response => response.text())
    .then(html => {
      const file = new File([html], 'index.html');
      const fileName = 'index.html';
      uploadFileToS3(file, fileName);
    })
    .catch(error => {
      console.log('Error fetching index.html:', error);
    });

  loadTodosFromLocalStorage();
  loadNotesFromLocalStorage();
