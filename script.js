// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentUser = null;
let sportsData = [];
let currentFilter = 'all';
let currentSort = 'default';

// ========== ДАННЫЕ ВИДОВ СПОРТА ==========
const sports = [
    {
        id: 1,
        name: 'Футбол',
        category: 'team',
        type: 'Олимпийский',
        description: 'Командный вид спорта, в котором команда из 11 игроков стремится забить мяч в ворота соперника. Самый популярный вид спорта в мире.',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 95,
        players: 11,
        duration: '90 мин'
    },
    {
        id: 2,
        name: 'Баскетбол',
        category: 'team',
        type: 'Олимпийский',
        description: 'Динамичная игра с мячом, где две команды соревнуются в точности бросков в корзину. Развивает координацию, скорость и тактическое мышление.',
        image: 'https://images.unsplash.com/photo-1544919982-b61976a0d7ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 85,
        players: 5,
        duration: '48 мин'
    },
    {
        id: 3,
        name: 'Бокс',
        category: 'individual',
        type: 'Олимпийский',
        description: 'Контактный вид спорта, единоборство, в котором спортсмены наносят удары кулаками в специальных перчатках. Развивает силу, скорость и характер.',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 75,
        players: 2,
        duration: '12 раундов'
    },
    {
        id: 4,
        name: 'Теннис',
        category: 'individual',
        type: 'Олимпийский',
        description: 'Игра с мячом и ракетками на корте с сеткой. Может быть одиночной или парной.',
        image: 'https://images.unsplash.com/photo-1595435934247-5d33b7f92c70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 70,
        players: 2,
        duration: '2-5 часов'
    },
    {
        id: 5,
        name: 'Плавание',
        category: 'individual',
        type: 'Олимпийский',
        description: 'Вид спорта, заключающийся в преодолении вплавь за наименьшее время различных дистанций.',
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 80,
        players: 1,
        duration: 'Зависит от дистанции'
    },
    {
        id: 6,
        name: 'Волейбол',
        category: 'team',
        type: 'Олимпийский',
        description: 'Командная игра с мячом на разделенной сеткой площадке. Цель — направить мяч на сторону соперника.',
        image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 65,
        players: 6,
        duration: '3-5 сетов'
    },
    {
        id: 7,
        name: 'Легкая атлетика',
        category: 'individual',
        type: 'Олимпийский',
        description: 'Совокупность видов спорта, включающая бег, ходьбу, прыжки и метания.',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd8facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 60,
        players: 1,
        duration: 'Различное'
    },
    {
        id: 8,
        name: 'Хоккей',
        category: 'team',
        type: 'Олимпийский',
        description: 'Командная спортивная игра на льду, цель — забить шайбу в ворота соперника.',
        image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        popularity: 55,
        players: 6,
        duration: '60 мин'
    }
];

// ========== СИСТЕМА РЕГИСТРАЦИИ/АВТОРИЗАЦИИ ==========
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('sportworld_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
        this.init();
    }

    init() {
        // Проверяем, есть ли сохраненная сессия
        if (this.currentUser) {
            this.loginWithToken(this.currentUser.token);
        }
    }

    register(name, email, password) {
        // Проверка существования пользователя
        if (this.users.find(user => user.email === email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        // Создание нового пользователя
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: this.hashPassword(password),
            token: this.generateToken(),
            createdAt: new Date().toISOString(),
            stats: {
                daysActive: 1,
                workoutsCompleted: 0,
                level: 1,
                lastLogin: new Date().toISOString()
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        
        return { success: true, user: newUser };
    }

    login(email, password) {
        const user = this.users.find(u => 
            u.email === email && u.password === this.hashPassword(password)
        );

        if (!user) {
            return { success: false, message: 'Неверный email или пароль' };
        }

        // Обновляем статистику
        user.stats.lastLogin = new Date().toISOString();
        user.stats.daysActive++;
        this.saveUsers();

        this.currentUser = user;
        localStorage.setItem('current_user', JSON.stringify(user));
        
        return { success: true, user };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        return { success: true };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    loginWithToken(token) {
        const user = this.users.find(u => u.token === token);
        if (user) {
            this.currentUser = user;
            return true;
        }
        return false;
    }

    updateUserStats(stats) {
        if (this.currentUser) {
            Object.assign(this.currentUser.stats, stats);
            this.saveUsers();
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
        }
    }

    hashPassword(password) {
        // Простое хеширование для демо-целей
        return btoa(password);
    }

    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    saveUsers() {
        localStorage.setItem('sportworld_users', JSON.stringify(this.users));
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем систему авторизации
    window.authSystem = new AuthSystem();
    
    // Загружаем данные
    sportsData = [...sports];
    
    // Инициализируем компоненты
    initTheme();
    initAuth();
    initSports();
    initControls();
    initModals();
    initEvents();
    
    // Проверяем авторизацию при загрузке
    updateAuthUI();
});

// ========== ТЕМНАЯ ТЕМА ==========
function initTheme() {
    const themeBtn = document.getElementById('themeBtn');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Устанавливаем сохраненную тему
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// ========== АВТОРИЗАЦИЯ ==========
function initAuth() {
    const authToggle = document.getElementById('authToggle');
    const loginSubmit = document.getElementById('loginSubmit');
    const registerSubmit = document.getElementById('registerSubmit');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutProfileBtn = document.getElementById('logoutProfileBtn');

    // Переключение между логином и регистрацией
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Обновляем активную вкладку
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Показываем соответствующую форму
            if (tab === 'login') {
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
            } else {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'block';
            }
        });
    });

    // Вход
    loginSubmit.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!email || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        const result = authSystem.login(email, password);
        
        if (result.success) {
            showNotification('Успешный вход!', 'success');
            updateAuthUI();
            closeModal('authModal');
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Регистрация
    registerSubmit.addEventListener('click', () => {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
        
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        if (!document.getElementById('acceptTerms').checked) {
            showNotification('Примите условия использования', 'error');
            return;
        }
        
        const result = authSystem.register(name, email, password);
        
        if (result.success) {
            showNotification('Регистрация успешна!', 'success');
            updateAuthUI();
            closeModal('authModal');
        } else {
            showNotification(result.message, 'error');
        }
    });

    // Выход
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutProfileBtn) logoutProfileBtn.addEventListener('click', handleLogout);

    // Открытие модального окна авторизации
    authToggle.addEventListener('click', () => {
        if (authSystem.getCurrentUser()) {
            showUserProfile();
        } else {
            openModal('authModal');
        }
    });
}

function handleLogout() {
    authSystem.logout();
    showNotification('Вы успешно вышли', 'success');
    updateAuthUI();
    closeModal('profileModal');
}

function updateAuthUI() {
    const user = authSystem.getCurrentUser();
    const authToggle = document.getElementById('authToggle');
    const authText = document.getElementById('authText');
    const userMenu = document.getElementById('userMenu');
    
    if (user) {
        authText.textContent = user.name;
        userMenu.classList.add('logged-in');
        
        // Обновляем данные в профиле
        document.getElementById('displayName').textContent = user.name;
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('daysActive').textContent = user.stats.daysActive;
        document.getElementById('workoutsCompleted').textContent = user.stats.workoutsCompleted;
        document.getElementById('level').textContent = user.stats.level;
    } else {
        authText.textContent = 'Войти';
        userMenu.classList.remove('logged-in');
    }
}

function showUserProfile() {
    const user = authSystem.getCurrentUser();
    if (user) {
        openModal('profileModal');
    }
}

// ========== ВИДЫ СПОРТА ==========
function initSports() {
    const container = document.getElementById('sportsContainer');
    renderSports(sportsData);
    
    // Кнопка "Показать еще"
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // В реальном приложении здесь была бы загрузка с сервера
            const moreSports = [
                {
                    id: 9,
                    name: 'Гимнастика',
                    category: 'individual',
                    type: 'Олимпийский',
                    description: 'Вид спорта, включающий упражнения на гибкость, ловкость, координацию.',
                    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    popularity: 60,
                    players: 1,
                    duration: '1-2 мин'
                },
                {
                    id: 10,
                    name: 'Борьба',
                    category: 'individual',
                    type: 'Олимпийский',
                    description: 'Единоборство двух спортсменов с использованием различных приемов.',
                    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    popularity: 50,
                    players: 2,
                    duration: '2 периода по 3 мин'
                }
            ];
            
            sportsData.push(...moreSports);
            renderSports(sportsData);
            loadMoreBtn.style.display = 'none';
        });
    }
}

function renderSports(sports) {
    const container = document.getElementById('sportsContainer');
    container.innerHTML = '';
    
    // Сортируем и фильтруем
    let filteredSports = filterSports(sports);
    filteredSports = sortSports(filteredSports);
    
    filteredSports.forEach(sport => {
        const card = createSportCard(sport);
        container.appendChild(card);
    });
}

function createSportCard(sport) {
    const card = document.createElement('div');
    card.className = 'sport-card';
    card.dataset.id = sport.id;
    card.dataset.category = sport.category;
    
    // Определяем иконку в зависимости от категории
    let icon = 'fas fa-running';
    if (sport.category === 'team') icon = 'fas fa-users';
    if (sport.category === 'individual') icon = 'fas fa-user';
    
    card.innerHTML = `
        <img src="${sport.image}" alt="${sport.name}" class="card-image">
        <div class="card-content">
            <div class="card-header">
                <h3><i class="${icon}"></i> ${sport.name}</h3>
                <span class="card-type ${sport.type === 'Олимпийский' ? 'olympic' : ''}">
                    ${sport.type}
                </span>
            </div>
            <p>${sport.description}</p>
            <div class="card-meta">
                <span><i class="fas fa-chart-line"></i> Популярность: ${sport.popularity}%</span>
                <span><i class="fas fa-users"></i> Игроков: ${sport.players}</span>
                <span><i class="far fa-clock"></i> ${sport.duration}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-small btn-outline favorite-btn" data-id="${sport.id}">
                    <i class="far fa-heart"></i> В избранное
                </button>
                <button class="btn btn-small btn-primary details-btn" data-id="${sport.id}">
                    <i class="fas fa-info-circle"></i> Подробнее
                </button>
            </div>
        </div>
    `;
    
    // Добавляем обработчики событий
    const favoriteBtn = card.querySelector('.favorite-btn');
    const detailsBtn = card.querySelector('.details-btn');
    
    favoriteBtn.addEventListener('click', () => toggleFavorite(sport.id));
    detailsBtn.addEventListener('click', () => showSportDetails(sport));
    
    return card;
}

function toggleFavorite(sportId) {
    const user = authSystem.getCurrentUser();
    
    if (!user) {
        showNotification('Войдите, чтобы добавлять в избранное', 'warning');
        openModal('authModal');
        return;
    }
    
    const btn = document.querySelector(`.favorite-btn[data-id="${sportId}"]`);
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
        showNotification('Добавлено в избранное', 'success');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.innerHTML = '<i class="far fa-heart"></i> В избранное';
        showNotification('Удалено из избранного', 'info');
    }
}

function showSportDetails(sport) {
    alert(`Детальная информация о ${sport.name}:\n\n${sport.description}\n\nПопулярность: ${sport.popularity}%\nКоличество игроков: ${sport.players}\nДлительность: ${sport.duration}`);
}

// ========== УПРАВЛЕНИЕ ФИЛЬТРАМИ И СОРТИРОВКОЙ ==========
function initControls() {
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const filterSelect = document.getElementById('filter');
    const resetBtn = document.getElementById('resetBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exploreBtn = document.getElementById('exploreBtn');

    // Поиск
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = sportsData.filter(sport => 
            sport.name.toLowerCase().includes(query) || 
            sport.description.toLowerCase().includes(query)
        );
        renderSports(filtered);
    });

    // Сортировка
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderSports(sportsData);
    });

    // Фильтр
    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderSports(sportsData);
    });

    // Сброс
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        sortSelect.value = 'default';
        filterSelect.value = 'all';
        currentFilter = 'all';
        currentSort = 'default';
        renderSports(sportsData);
    });

    // Кнопки героя
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            if (authSystem.getCurrentUser()) {
                showNotification('Вы уже с нами!', 'success');
            } else {
                openModal('authModal');
            }
        });
    }

    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.getElementById('sports').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function filterSports(sports) {
    if (currentFilter === 'all') return sports;
    return sports.filter(sport => sport.category === currentFilter);
}

function sortSports(sports) {
    switch (currentSort) {
        case 'name':
            return [...sports].sort((a, b) => a.name.localeCompare(b.name));
        case 'reverse':
            return [...sports].sort((a, b) => b.name.localeCompare(a.name));
        case 'popular':
            return [...sports].sort((a, b) => b.popularity - a.popularity);
        default:
            return sports;
    }
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function initModals() {
    // Закрытие модальных окон
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Закрытие по клику на фон
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Сброс форм при открытии
        if (modalId === 'authModal') {
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Стили для уведомления (добавляем динамически)
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .notification-success {
                background: #d4edda;
                color: #155724;
                border-left: 4px solid #28a745;
            }
            
            .notification-error {
                background: #f8d7da;
                color: #721c24;
                border-left: 4px solid #dc3545;
            }
            
            .notification-warning {
                background: #fff3cd;
                color: #856404;
                border-left: 4px solid #ffc107;
            }
            
            .notification-info {
                background: #d1ecf1;
                color: #0c5460;
                border-left: 4px solid #17a2b8;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
                color: inherit;
                opacity: 0.7;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Закрытие уведомления
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ========== СОБЫТИЯ ==========
function initEvents() {
    // Регистрация на события
    document.querySelectorAll('.event-card .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventCard = e.target.closest('.event-card');
            const eventTitle = eventCard.querySelector('h4').textContent;
            
            if (authSystem.getCurrentUser()) {
                showNotification(`Вы записаны на "${eventTitle}"!`, 'success');
                btn.textContent = 'Записан';
                btn.disabled = true;
                
                // Обновляем статистику пользователя
                const user = authSystem.getCurrentUser();
                user.stats.workoutsCompleted++;
                authSystem.updateUserStats(user.stats);
                updateAuthUI();
            } else {
                showNotification('Войдите, чтобы записаться на событие', 'warning');
                openModal('authModal');
            }
        });
    });
    
    // Подписка на рассылку
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const input = newsletterForm.querySelector('input');
        const button = newsletterForm.querySelector('button');
        
        button.addEventListener('click', () => {
            if (input.value && input.value.includes('@')) {
                showNotification('Спасибо за подписку!', 'success');
                input.value = '';
            } else {
                showNotification('Введите корректный email', 'error');
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                button.click();
            }
        });
    }
    
    // Сохранение прогресса тренировок
    const dayCards = document.querySelectorAll('.day-card:not(.rest)');
    dayCards.forEach(card => {
        card.addEventListener('click', () => {
            if (authSystem.getCurrentUser()) {
                card.classList.toggle('completed');
                
                if (card.classList.contains('completed')) {
                    const user = authSystem.getCurrentUser();
                    user.stats.workoutsCompleted++;
                    
                    // Повышение уровня каждые 5 тренировок
                    if (user.stats.workoutsCompleted % 5 === 0) {
                        user.stats.level++;
                        showNotification(`Поздравляем! Вы достигли ${user.stats.level} уровня!`, 'success');
                    }
                    
                    authSystem.updateUserStats(user.stats);
                    updateAuthUI();
                    showNotification('Тренировка отмечена как выполненная!', 'success');
                }
            } else {
                showNotification('Войдите, чтобы отслеживать прогресс', 'warning');
                openModal('authModal');
            }
        });
    });
}

// ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ==========

// Сохранение данных в LocalStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения в LocalStorage:', e);
        return false;
    }
}

// Загрузка данных из LocalStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Ошибка загрузки из LocalStorage:', e);
        return null;
    }
}

// Анимация появления элементов при скролле
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Наблюдаем за всеми карточками и секциями
    document.querySelectorAll('.sport-card, .article-card, .feature-card, .day-card').forEach(el => {
        observer.observe(el);
    });
}

// Инициализация анимаций при загрузке
setTimeout(initScrollAnimations, 1000);