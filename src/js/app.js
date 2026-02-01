import Modal from 'bootstrap/js/dist/modal';
import Dropdown from 'bootstrap/js/dist/dropdown';
import { createPinCard } from './handlers.js';

// === ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА ===
const DEFAULT_BOARDS = {
    'board1': [],
    'board2': [],
    'board3': []
};

let savedData = JSON.parse(localStorage.getItem('pinterest_data')) || DEFAULT_BOARDS;
let allPins = []; 
let currentBoardFilter = null;

function syncStorage() {
    localStorage.setItem('pinterest_data', JSON.stringify(savedData));
}

const API_URL = 'https://6977b6165b9c0aed1e872f72.mockapi.io/api/images/pins';
let currentPinId = null;

//=== ФУНКЦИИ ЗАГРУЗКИ И ОТРИСОВКИ ===
async function fetchPins() {
    try {
        const response = await fetch(API_URL);
        allPins = await response.json();
        renderPins(allPins);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function renderPins(pinsArray) {
    const grid = document.querySelector('.chess-grid');
    if (!grid) return;
    grid.innerHTML = pinsArray.map(pin => createPinCard(pin)).join('');
}

// === ГЛАВНАЯ ЛОГИКА ===
document.addEventListener('DOMContentLoaded', () => {
    fetchPins();

    const grid = document.querySelector('.chess-grid');
    const boardModalElement = document.getElementById('boardModal');
    let boardModal = boardModalElement ? new Modal(boardModalElement) : null;

    //=== ФИЛЬТРАЦИЯ И СБРОС ===
    const boardDropdownMenu = document.querySelector('.dropdown-menu');
    if (boardDropdownMenu) {
        boardDropdownMenu.addEventListener('click', (e) => {
            const filterItem = e.target.closest('.filter-board');
            const resetItem = e.target.closest('.reset-filter');

            if (filterItem) {
                currentBoardFilter = filterItem.dataset.board;
                const savedIds = savedData[currentBoardFilter].map(id => String(id));
                const filtered = allPins.filter(pin => savedIds.includes(String(pin.id)));
                
                renderPins(filtered);
                document.getElementById('boardDropdown').innerText = filterItem.innerText;
            }

            if (resetItem) {
                currentBoardFilter = null; 
                renderPins(allPins);
                
                savedData = { 'board1': [], 'board2': [], 'board3': [] };
                syncStorage();
                
                document.getElementById('boardDropdown').innerText = 'Выбрать доску';
                alert('Фильтр сброшен, все доски очищены!');
            }
        });
    }

    //=== ПОИСК ПО ХЭШТЕГАМ ===
    const searchInput = document.querySelector('.search-wrapper input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const searchedPins = allPins.filter(pin => 
                pin.tags.some(tag => tag.toLowerCase().includes(query))
            );
            renderPins(searchedPins);
        });
    }

    //==ДЕЛЕГИРОВАНИЕ КЛИКОВ В СЕТКЕ ===
    if (grid) {
        grid.addEventListener('click', (event) => {
            const target = event.target;
            const playBtn = target.closest('.play-btn');

            if (playBtn) {
                const card = playBtn.closest('.pin-card');
                card.querySelector('.pin-overlay').classList.toggle('is-active');
                return;
            }

            if (target.classList.contains('btn-hide')) {
                const pinId = String(target.dataset.id);
                
                if (currentBoardFilter) {
                    savedData[currentBoardFilter] = savedData[currentBoardFilter].filter(id => id !== pinId);
                    syncStorage();
                }
                
                target.closest('.pin-card')?.remove();
            }

            if (target.classList.contains('btn-add')) {
                currentPinId = target.dataset.id;
                if (boardModal) boardModal.show();
            }

            if (target.classList.contains('btn-report')) {
                alert(`Жалоба на пин №${target.dataset.id} отправлена.`);
            }
        });
    }

    //=== ВЫБОР ДОСКИ В МОДАЛКЕ ===
    document.querySelectorAll('.select-board').forEach(button => {
        button.addEventListener('click', (e) => {
            const boardName = e.target.dataset.board;
            if (currentPinId && boardName) {
                const idStr = String(currentPinId);
                
                if (!savedData[boardName].includes(idStr)) {
                    savedData[boardName].push(idStr);
                    syncStorage();
                    alert(`Добавлено в "${e.target.innerText}"`);
                } else {
                    alert('Этот пин уже есть на этой доске!');
                }
                boardModal.hide();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.pin-card')) {
            document.querySelectorAll('.pin-overlay.is-active').forEach(overlay => {
                overlay.classList.remove('is-active');
            });
        }
    });
});