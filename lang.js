const texts = {
    pl: {
        title: "Sudoku",
        newGame: "Nowa gra",
        hint: "Podpowiedź",
        erase: "Usuń",
        easy: "Łatwy",
        medium: "Średni",
        hard: "Trudny",
        won: "Gratulacje! Rozwiązałaś Sudoku!",
        langToggle: "PL / DE"
    },
    de: {
        title: "Sudoku",
        newGame: "Neues Spiel",
        hint: "Tipp",
        erase: "Löschen",
        easy: "Einfach",
        medium: "Mittel",
        hard: "Schwer",
        won: "Herzlichen Glückwunsch! Du hast das Sudoku gelöst!",
        langToggle: "DE / PL"
    }
};

let currentLang = 'pl';

function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    // Update texts
    // Using simple mapping based on IDs
    const elements = {
        'title': texts[lang].title,
        'btnNewGame': texts[lang].newGame,
        'btnHint': texts[lang].hint,
        'btnErase': texts[lang].erase,
        'btnEasy': texts[lang].easy,
        'btnMedium': texts[lang].medium,
        'btnHard': texts[lang].hard,
        'langToggle': texts[lang].langToggle
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = elements[id];
        }
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'pl' ? 'de' : 'pl';
    setLanguage(newLang);
    localStorage.setItem('sudokuLang', newLang);
}

// Init lang
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('sudokuLang') || 'pl';
    setLanguage(savedLang);
    
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);
});
