import Modal from 'bootstrap/js/dist/modal';
import { handleSubmitForm, createPinCard } from './handlers.js';


const API_URL = 'https://6977b6165b9c0aed1e872f72.mockapi.io/api/images/pins';

//=== ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ ===
async function fetchPins() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        renderPins(data);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

//=== ФУНКЦИЯ ОТРИСОВКИ ===
function renderPins(pinsArray) {
    const grid = document.querySelector('.chess-grid');
    if (!grid) return;

    grid.innerHTML = pinsArray.map(pin => createPinCard(pin)).join('');
}

//=== ОБЩАЯ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
document.addEventListener('DOMContentLoaded', () => {
    fetchPins();

    const form = document.querySelector('#pin-form');
    if (form) {
        form.addEventListener('submit', handleSubmitForm);
    }
});