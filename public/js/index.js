import {setCardDrag} from './card_drag.js';
import {setDeckLoad} from './deckLoad.js';
import {setMenuBtn} from './menuBtn.js';
import {setModal} from './modal.js';
import {setOther} from './other.js';
import {setField,setmenuBtn} from './setField.js';
import {reConnect} from './photon_src.js'

//初期読み込みstart
document.addEventListener('DOMContentLoaded', (event) => {
  if(window.innerWidth > window.innerHeight){
    alert(`PCで開いている場合、ブラウザのフルスクリーンをやめ、
    サイズを縦長にしてください`)
  }
  setField();
  setCardDrag();
  setModal();
  setOther();
  setMenuBtn();
  reConnect();
});


let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);


let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    console.log("リサイズ完了！");
    setmenuBtn();
  }, 200);
});
