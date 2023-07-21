import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyDAEfmfXbOGnzrBgv_08FZNUjzPM_ga1Mk",
    authDomain: "todo-project-19a2a.firebaseapp.com",
    projectId: "todo-project-19a2a",
    storageBucket: "todo-project-19a2a.appspot.com",
    messagingSenderId: "2847894668",
    appId: "1:2847894668:web:4bebc9500b051bb5731fa9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const input = document.getElementById("todoInput");
const ulParent = document.getElementById("ulParent");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const todoCollection = collection(db, "todos");

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
});

const addBtn = document.getElementById('addBtn');
addBtn.addEventListener('click', () => {
    const todoInput = document.getElementById('todoInput');
    const todoValue = todoInput.value.trim();

    if (!todoValue) {
        alert("ENTER TODO VALUE");
        return;
    }

    const data = {
        todo: todoValue
    };

    addTodo(data);
    todoInput.value = '';
});

deleteAllBtn.addEventListener("click", deleteAllTodos);
window.addEventListener("load", getTodos);

async function getTodos() {
    try {
        ulParent.innerHTML = "";
        const querySnapshot = await getDocs(todoCollection);
        querySnapshot.forEach((doc) => {
            const todoValue = doc.data().todo;
            createUI(todoValue, doc.id);
        });
    } catch (error) {
        console.log(error.message, "error");
        alert(error.message);
    }
}

async function addTodo() {
    try {
        if (!input.value) {
            alert("Please enter a todo value.");
            return;
        }
        const data = {
            todo: input.value
        };
        const docRef = await addDoc(todoCollection, data);
        console.log("Document written with ID: ", docRef.id);
        createUI(input.value, docRef.id);
        input.value = "";
        getTodos(); // Refresh the UI after adding a new task
    } catch (error) {
        console.log("Error", error.message);
        alert(error.message);
    }
}

async function editTodo(el, id) {
    try {
        const li = el.target.parentNode.parentNode;
        const textNode = li.querySelector('.card-text'); // Get the exact text node
        const placeHolder = textNode.textContent;
        const editValue = prompt("Edit Todo", placeHolder);
        if (editValue === null || editValue.trim() === "") return;
        console.log(id, "id");
        await updateDoc(doc(db, "todos", id), {
            todo: editValue
        });
        textNode.textContent = editValue; // Update the text node value
    } catch (error) {
        console.log("Error", error.message);
        alert(error.message);
    }
}

async function deleteTodo(e, id) {
    try {
        const li = e.target.parentNode.parentNode.parentNode; // Adjust the target to get the li element
        const deleteBtn = li.querySelector('.btn-danger');
        deleteBtn.removeEventListener('click', (e) => deleteTodo(e, id));
        await deleteDoc(doc(db, "todos", id));
        li.remove();
    } catch (error) {
        console.log("Error", error.message);
        alert(error.message);
    }
}


async function deleteAllTodos() {
    try {
        const querySnapshot = await getDocs(todoCollection);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);
        ulParent.innerHTML = "";
    } catch (error) {
        console.log("Error", error.message);
        alert(error.message);
    }
}


function createUI(todoValue, id) {
    const ulParent = document.getElementById('ulParent');

    // Create the ToDo item card
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const text = document.createElement('p');
    text.className = 'card-text';
    text.innerText = todoValue;

    const actions = document.createElement('div');
    actions.className = 'actions';

    // Create the Edit button and attach the event listener
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-info';
    editBtn.innerText = 'EDIT';
    editBtn.addEventListener('click', (e) => editTodo(e, id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.innerText = 'DELETE';
    deleteBtn.addEventListener('click', (e) => deleteTodo(e, id)); // Pass the id to deleteTodo

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    cardBody.appendChild(text);
    cardBody.appendChild(actions);
    taskCard.appendChild(cardBody);

    // Set the id attribute for the li element
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.id = id; // Set the id attribute to the document ID

    li.appendChild(taskCard);
    ulParent.appendChild(li);
}
