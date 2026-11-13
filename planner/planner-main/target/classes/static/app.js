const API = '/api/tasks';
const PRIORITY_LABELS = { LOW: 'Низкий', MEDIUM: 'Средний', HIGH: 'Высокий' };

const form = document.getElementById('task-form');
const list = document.getElementById('task-list');
const errorBox = document.getElementById('error');
const counter = document.getElementById('counter');
const empty = document.getElementById('empty');

let currentStatus = 'all';

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
}

async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        let message = 'Ошибка сервера: ' + response.status;
        try {
            const body = await response.json();
            const details = Object.values(body.errors || {}).join('; ');
            message = details || body.message || message;
        } catch (_) { /* тело не JSON */ }
        throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
}

async function loadTasks() {
    try {
        const tasks = await request(`${API}?status=${currentStatus}`);
        render(tasks);
        showError('');
    } catch (e) {
        showError(e.message);
    }
}

function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().slice(0, 10);
    return task.dueDate < today;
}

function render(tasks) {
    list.innerHTML = '';
    empty.hidden = tasks.length > 0;
    const left = tasks.filter(t => !t.completed).length;
    counter.textContent = `Осталось: ${left}`;

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add(task.priority);
        if (task.completed) li.classList.add('done');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => run(() => request(`${API}/${task.id}/toggle`, { method: 'PATCH' })));

        const info = document.createElement('div');
        info.className = 'info';

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = task.title;

        const meta = document.createElement('div');
        meta.className = 'meta';
        const parts = [PRIORITY_LABELS[task.priority]];
        if (task.description) parts.push(task.description);
        meta.textContent = parts.join(' · ');

        if (task.dueDate) {
            const due = document.createElement('span');
            due.textContent = ' · до ' + task.dueDate;
            if (isOverdue(task)) due.className = 'overdue';
            meta.appendChild(due);
        }

        info.append(title, meta);

        const del = document.createElement('button');
        del.className = 'delete';
        del.textContent = '✕';
        del.title = 'Удалить';
        del.addEventListener('click', () => run(() => request(`${API}/${task.id}`, { method: 'DELETE' })));

        li.append(checkbox, info, del);
        list.appendChild(li);
    });
}

async function run(action) {
    try {
        await action();
        await loadTasks();
    } catch (e) {
        showError(e.message);
    }
}

form.addEventListener('submit', event => {
    event.preventDefault();
    run(async () => {
        await request(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: document.getElementById('title').value,
                description: document.getElementById('description').value || null,
                priority: document.getElementById('priority').value,
                dueDate: document.getElementById('dueDate').value || null
            })
        });
        form.reset();
        document.getElementById('priority').value = 'MEDIUM';
    });
});

document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.filter.active').classList.remove('active');
        button.classList.add('active');
        currentStatus = button.dataset.status;
        loadTasks();
    });
});

loadTasks();