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
  
    addButton.addEventListener("click", addTodo);
    saveButton.addEventListener("click", addNote);
    todoList.addEventListener("click", deleteTodo);
    noteList.addEventListener("click", deleteNote);
  
    loadTodosFromLocalStorage();
    loadNotesFromLocalStorage();
    
    // Add a new todo
    function addTodo() {
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
    }
  
    // Add a new note
    function addNote() {
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
    }
  
    // Delete a todo
    function deleteTodo(event) {
      if (event.target.classList.contains("delete-button")) {
        const listItem = event.target.closest("li");
        listItem.remove();
        saveTodosToLocalStorage();
      }
    }
  
    // Delete a note
    function deleteNote(event) {
        if (event.target.classList.contains("delete-button")) {
          const listItem = event.target.closest("li");
          listItem.remove();
          saveNotesToLocalStorage();
        }
      }
    
      // Save todos to local storage
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
    
      // Load todos from local storage
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
    
      // Save notes to local storage
      function saveNotesToLocalStorage() {
        const notes = [];
        const noteItems = noteList.querySelectorAll("li");
        noteItems.forEach(function(noteItem) {
          const dateElement = noteItem.querySelector(".note-date");
          const noteElement = noteItem.querySelector(".note-text");
          if (dateElement && noteElement) {
            const date = dateElement.textContent;
            const note = noteElement.textContent;
            notes.push({ date, note });
          }
        });
        localStorage.setItem("notes", JSON.stringify(notes));
      }
    
      // Load notes from local storage
      function loadNotesFromLocalStorage() {
        const savedNotes = localStorage.getItem("notes");
        if (savedNotes) {
          const notes = JSON.parse(savedNotes);
          notes.forEach(function(note) {
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
    
      // Fetch and upload script.js file from project directory
      fetch('script.js')
        .then(response => response.text())
        .then(js => {
          const file = new File([js], 'script.js');
          const fileName = 'script.js';
          uploadFileToS3(file, fileName);
        })
        .catch(error => {
          console.log('Error fetching script.js:', error);
    });

  loadTodosFromLocalStorage();
  loadNotesFromLocalStorage();
});
