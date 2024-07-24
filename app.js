document.addEventListener('DOMContentLoaded', () => {
    const clickSound = document.getElementById('click-sound');
    const listsContainer = document.getElementById('lists-container');
    const addListForm = document.querySelector('.add-list-form');
    const addListInput = document.getElementById('list-name');
    const addListButton = document.getElementById('add-list-btn');

    let lists = JSON.parse(localStorage.getItem('lists')) || [];

    // Load existing lists from localStorage
    lists.forEach(list => {
        renderList(list);
    });

    // Add list button click handler
    addListButton.addEventListener('click', () => {
        const listName = addListInput.value.trim();
        if (listName !== '') {
            const newList = {
                id: `list-${Date.now()}`,
                name: listName,
                todos: []
            };
            lists.push(newList);
            renderList(newList);
            saveLists();
            addListInput.value = '';
            playClickSound();
        }
    });

    function renderList(list) {
        const listElement = document.createElement('div');
        listElement.classList.add('todo-list');
        listElement.setAttribute('id', list.id);

        listElement.innerHTML = `
            <h2>${list.name}
                <button class="delete-list-btn" data-list-id="${list.id}">Delete List</button>
            </h2>
            <ul></ul>
            <div>
                <input type="text" class="task-input" placeholder="Add new task">
                <input type="date" class="due-date-input">
                <select class="priority-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button class="add-task-btn">Add Task</button>
                <button class="clear-all-btn" data-list-id="${list.id}">Clear All Tasks</button>
            </div>
        `;

        listsContainer.appendChild(listElement);

        list.todos.forEach(todo => {
            addTodoToList(list.id, todo.text, todo.completed, todo.dueDate, todo.priority);
        });

        // Add event listeners for buttons
        const addTaskButton = listElement.querySelector('.add-task-btn');
        const taskInput = listElement.querySelector('.task-input');
        const dueDateInput = listElement.querySelector('.due-date-input');
        const prioritySelect = listElement.querySelector('.priority-select');
        const clearAllButton = listElement.querySelector('.clear-all-btn');
        const deleteListButton = listElement.querySelector('.delete-list-btn');

        addTaskButton.addEventListener('click', () => {
            const taskText = taskInput.value.trim();
            const dueDate = dueDateInput.value;
            const priority = prioritySelect.value;
            if (taskText !== '') {
                addTodoToList(list.id, taskText, false, dueDate, priority);
                saveLists();
                taskInput.value = '';
                dueDateInput.value = '';
                playClickSound();
            }
        });

        clearAllButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all tasks?')) {
                clearAllTasks(list.id);
                saveLists();
                playClickSound();
            }
        });

        deleteListButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this list?')) {
                deleteList(list.id);
                saveLists();
                playClickSound();
            }
        });
    }

    function addTodoToList(listId, todoText, completed = false, dueDate = '', priority = 'low') {
        const listElement = document.getElementById(listId);
        const ul = listElement.querySelector('ul');

        const li = document.createElement('li');
        li.className = 'todo-item';
        if (completed) {
            li.classList.add('completed');
        }
        li.innerHTML = `
            <span>${todoText}</span>
            <div class="task-info">
                ${dueDate ? `<span class="due-date">${dueDate}</span>` : ''}
                <span class="priority ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
            </div>
            <div class="actions">
                <button class="complete-btn">Complete</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        ul.appendChild(li);

        const completeButton = li.querySelector('.complete-btn');
        completeButton.addEventListener('click', () => {
            li.classList.toggle('completed');
            toggleTodoStatus(listId, todoText);
            saveLists();
            playClickSound();
        });

        const editButton = li.querySelector('.edit-btn');
        editButton.addEventListener('click', () => {
            const newText = prompt('Enter new text for the task:', todoText);
            if (newText !== null && newText.trim() !== '') {
                li.querySelector('span').textContent = newText.trim();
                updateTodoText(listId, todoText, newText.trim());
                saveLists();
                playClickSound();
            }
        });

        const deleteButton = li.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            li.remove();
            deleteTodoFromList(listId, todoText);
            saveLists();
            playClickSound();
        });
    }

    function toggleTodoStatus(listId, todoText) {
        const list = lists.find(list => list.id === listId);
        const todo = list.todos.find(todo => todo.text === todoText);
        todo.completed = !todo.completed;
    }

    function updateTodoText(listId, oldText, newText) {
        const list = lists.find(list => list.id === listId);
        const todo = list.todos.find(todo => todo.text === oldText);
        todo.text = newText;
    }

    function deleteTodoFromList(listId, todoText) {
        const list = lists.find(list => list.id === listId);
        list.todos = list.todos.filter(todo => todo.text !== todoText);
    }

    function clearAllTasks(listId) {
        const list = lists.find(list => list.id === listId);
        list.todos = [];
        const ul = document.getElementById(listId).querySelector('ul');
        ul.innerHTML = '';
    }

    function deleteList(listId) {
        // Remove the list from the DOM
        const listElement = document.getElementById(listId);
        if (listElement) {
            listElement.remove();
        }

        // Remove the list from the `lists` array
        lists = lists.filter(list => list.id !== listId);
    }

    function saveLists() {
        localStorage.setItem('lists', JSON.stringify(lists));
    }

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }
});
