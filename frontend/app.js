// app.js — логика романтического сайта писем 💕

let isAuthenticated = false;
let passwordHash = null;  // Хэш пароля в памяти (безопасно!)

// 🔐 Логин — главный ритуал 💕
async function login() {
    const password = document.getElementById('password').value.trim();
    console.log("password:" + password)

    if (!password) {
        showToast('Введите наше секретное слово 💕', 'error');
        return;
    }

    try {
        // 1. Хэшируем пароль ЛОКАЛЬНО в браузере
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        isAuthenticated = true;

        // 2. Показываем приложение
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');

        // 3. Загружаем письма
        await loadLetters();

        showToast('💕 Добро пожаловать!', 'success');

    } catch (error) {
        console.error('Ошибка хэширования:', error);
        showToast('Ошибка авторизации', 'error');
    }
}

// 📨 Загрузка всех писем с сервера
async function loadLetters() {
    if (!isAuthenticated || !passwordHash) {
        console.warn('Не авторизован');
        return;
    }

    try {
        const response = await fetch('/api/letters', {
            headers: {
                'Authorization': `Bearer ${passwordHash}`
            }
        });

        if (response.status === 401) {
            logout();  // Автоматический выход при неверном хэше
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const letters = await response.json();
        renderLetters(letters);

    } catch (error) {
        console.error('Ошибка загрузки писем:', error);
        showErrorState('Не удалось загрузить письма 😔');
    }
}

// 🖼️ Отрисовка доски писем
function renderLetters(letters) {
    const board = document.getElementById('letters-board');

    if (!letters || letters.length === 0) {
        board.innerHTML = `
            <div class="letter-placeholder col-span-full text-center py-24 text-gray-400 animate-pulse">
                <i class="fas fa-envelope-open-text text-7xl mb-8 opacity-40"></i>
                <p class="text-2xl font-light">Писем пока нет...<br><span class="text-pink-500 font-semibold">Напиши первое! 💕</span></p>
            </div>
        `;
        return;
    }

    board.innerHTML = letters.map(createLetterCard).join('');
}

// 🏷️ Создание карточки письма
function createLetterCard(letter) {
    const unreadBadge = !letter.is_read ? '<div class="unread-badge absolute -top-4 -right-4 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg pulse-unread">!</div>' : '';

    const fromLabel = letter.from_user === 'he' ? '💙 Он' : '💖 Она';
    const date = new Date(letter.created_at).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // вынесен на v2 ${unreadBadge}

    return `
        <div class="letter-card group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:rotate-1 h-80 flex flex-col pt-0">
           
            <!-- Конверт БЕЗ ОТСТУПОВ СВЕРХУ -->
<!--            <div class="envelope flex-shrink-0 h-20">-->
<!--                <div class="flap absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-pink-400 z-10"></div>-->
<!--                <div class="wax-seal absolute bottom-2 right-4 w-14 h-14 bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-full flex items-center justify-center text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">💕</div>-->
<!--                <div class="envelope-body bg-gradient-to-b from-pink-50 to-rose-50 border-4 border-pink-200 rounded-2xl p-4 h-full flex items-center justify-center shadow-inner"></div>-->
<!--            </div>-->
            
            <!-- 🔥 ТЕКСТ ПРЯМО К ВЕРХУ -->
            <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Заголовок БЕЗ отступов -->
                <h3 class="letter-title font-semibold text-lg text-gray-800 line-clamp-1 group-hover:text-pink-600 mt-0 pt-1 px-3">
                    ${escapeHtml(letter.title)}
                </h3>
                
                <!-- Прокручиваемый текст -->
                <div class="letter-preview flex-1 text-gray-600 text-sm leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent pr-2 px-3">
                    ${escapeHtml(letter.content)}
                </div>
            </div>
            
            <!-- Футер -->
            <div class="letter-footer flex justify-between items-center text-xs text-gray-500 px-3 py-2 border-t border-pink-100">
                <span class="from-badge px-2 py-1 bg-gradient-to-r ${letter.from_user === 'He' ? 'from-blue-100 to-cyan-100 text-blue-700' : 'from-pink-100 to-rose-100 text-rose-700'} rounded-full font-medium text-xs">
                    ${fromLabel}
                </span>
                <span class="date font-light">${date}</span>
            </div>
        </div>
    `;
}

// ✉️ Отправка нового письма
async function sendLetter(event) {
    event.preventDefault();

    const title = document.getElementById('letter-title').value.trim();
    const content = document.getElementById('letter-content').value.trim();
    const from = document.getElementById('letter-from').value;

    if (!title || !content) {
        showToast('Заполните заголовок и текст письма 💕', 'error');
        return;
    }

    if (content.length < 5) {
        showToast('Письмо слишком короткое... 💗', 'error');
        return;
    }

    if (!from || typeof from != "string") {
        showToast('Неверно указан отправитель 💗', 'error');
        return;
    }

    let fromUser
    if (from == "Он" || from == "он") {
        fromUser = "he"
    } else if (from == "Она" || from == "она")  {
        fromUser = "she"
    } else {
        showToast('Неверно указан отправитель 💗', 'error');
        return;
    }

    const letter = {
        title: title,
        content: content,
        from_user: fromUser
    };

    try {
        const response = await fetch('/api/letters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${passwordHash}`
            },
            body: JSON.stringify(letter)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Успех!
        document.getElementById('letter-form').reset();
        hideWriteModal();
        loadLetters();
        showToast('💌 Письмо отправлено!', 'success');

    } catch (error) {
        console.error('Ошибка отправки:', error);
        showToast('Ошибка отправки письма 😔', 'error');
    }
}

// 👁️ Открыть письмо (заглушка для v2)
function openLetter(id) {
    showToast(`Тут будет открытие письма #${id} 💕 (v2)`, 'info');
}

// 📱 Показать модалку письма
function showWriteModal() {
    document.getElementById('write-modal').classList.remove('hidden');
    document.getElementById('letter-title').focus();
}

// 📴 Скрыть модалку
function hideWriteModal() {
    document.getElementById('write-modal').classList.add('hidden');
    document.getElementById('letter-form').reset();
}

// 🚪 Выход (очистка памяти)
function logout() {
    isAuthenticated = false;
    passwordHash = null;
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('letters-board').innerHTML = '';
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
    showToast('До новой встречи 💕', 'info');
}

// 🔔 Уведомления (toast)
function showToast(message, type = 'info') {
    // Удаляем старые тосты
    document.querySelectorAll('.toast').forEach(toast => toast.remove());

    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500 shadow-green-200',
        error: 'bg-red-500 shadow-red-200',
        info: 'bg-blue-500 shadow-blue-200'
    };

    toast.className = `toast fixed top-6 right-6 z-50 p-4 pr-8 rounded-2xl text-white text-lg font-medium shadow-2xl transform translate-x-full transition-all duration-300 ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-heart' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-3"></i>
        ${message}
    `;

    document.body.appendChild(toast);

    // Анимация появления
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));

    // Исчезновение через 4 секунды
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ❌ Состояние ошибки
function showErrorState(message) {
    const board = document.getElementById('letters-board');
    board.innerHTML = `
        <div class="col-span-full text-center py-24">
            <i class="fas fa-wifi text-8xl text-red-300 mb-8"></i>
            <p class="text-2xl text-gray-500 font-light">${message}</p>
            <button onclick="loadLetters()" class="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all">
                Попробовать снова
            </button>
        </div>
    `;
}

// 🛡️ Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 🔄 Автообновление каждые 30 секунд
setInterval(function() {
    if (isAuthenticated) {
        loadLetters();
    }
}, 30000);

// ⌨️ Горячие клавиши
document.addEventListener('keydown', function(e) {
    // Escape — закрыть модалку
    if (e.key === 'Escape' && !document.getElementById('write-modal').classList.contains('hidden')) {
        hideWriteModal();
    }

    // Ctrl/Cmd + R — обновить письма
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        loadLetters();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    focusPasswordField();
});

// 🔧 Настройка всех обработчиков событий
function setupEventListeners() {
    // Авторизация
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') login;
    });

    // Header кнопки
    document.getElementById('refresh-btn').addEventListener('click', loadLetters);
    document.getElementById('write-btn').addEventListener('click', showWriteModal);
    document.getElementById('close-modal').addEventListener('click', hideWriteModal);

    // Форма письма
    document.getElementById('letter-form').addEventListener('submit', sendLetter);
}

// 🎯 Фокус на поле пароля при загрузке
function focusPasswordField() {
    document.getElementById('password').focus();
}
