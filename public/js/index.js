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