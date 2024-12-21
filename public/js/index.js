import {setCardDrag} from './card_drag.js';
import {setDeckLoad} from './deckLoad.js';
import {setMenuBtn} from './menuBtn.js';
import {setModal} from './modal.js';
import {setOther} from './other.js';
import {setField} from './setField.js';

//初期読み込みstart
document.addEventListener('DOMContentLoaded', (event) => {
  setField();
  setCardDrag();
  setDeckLoad();
  setModal();
  setOther();
  setMenuBtn();
});


let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
