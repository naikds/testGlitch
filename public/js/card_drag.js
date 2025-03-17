import {arrangeImages,preDataSave} from './arrange.js';
import {sendCardInfo,sendplayerInfo} from './photon_src.js';

export function setCardDrag(){
  const handCardWidth = 0.7;
  
  //ドラッグ処理
  const draggables = document.querySelectorAll('.draggable');
  draggables.forEach(draggable => {
    //ドラッグ開始
    draggable.addEventListener('touchstart', (e) => {
      if(!e.target.classList.contains('draggable')){return;}
      preDataSave();
      const touch = e.targetTouches[0];
      e.target.dataset.touchId = touch.identifier;
      e.target.dataset.moto = e.target.offsetParent.id;
      e.target.dataset.handIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
      document.getElementById('container').appendChild(e.target);
      e.target.style.position = 'absolute';
      e.target.style.left = `${touch.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
      e.target.style.top = `${touch.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
      e.target.style.zIndex = 1000;
      event.preventDefault();
    });

    //ドラッグ中
    draggable.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = Array.from(e.changedTouches).find(t => t.identifier == e.target.dataset.touchId);
      if (touch) {
        e.target.style.left = `${touch.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
        e.target.style.top = `${touch.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
      }
    });

    //ドラッグ終わり
    draggable.addEventListener('touchend', (e) => {
      const touch = Array.from(e.changedTouches).find(t => t.identifier == e.target.dataset.touchId);
      const target = e.target
      document.getElementById(target.dataset.moto).appendChild(target);
      if (touch) {
        draggables.forEach(c => {c.style.visibility = 'hidden';});
        const noPoints = document.querySelectorAll('.nonMousePointer');
        noPoints.forEach(p=>{p.classList.remove('nonMousePointer');})
        const dropzone = document.elementFromPoint(touch.clientX, touch.clientY).closest('.dropzone');
        noPoints.forEach(p=>{p.classList.add('nonMousePointer');})
        draggables.forEach(c => {c.style.visibility = '';})
        if (dropzone) {
          dropzone.appendChild(target);
          if (dropzone.classList.contains('deck')) {
            dropzone.prepend(target);
          }

          if (dropzone.classList.contains('hand')) {
            const offsetX = target.offsetLeft - dropzone.offsetLeft + dropzone.scrollLeft;
            let index = Math.floor(offsetX / (target.offsetWidth * handCardWidth)) + 2;
            if(target.dataset.handIndex < index){
              index = index - 1;
            }
            if (index < dropzone.children.length) {
              dropzone.insertBefore(target, dropzone.children[index]);
            }
          }
        }
        target.style.left = '';
        target.style.top = '';
      }
      target.style.position = '';
      target.style.zIndex = '';
      delete target.dataset.touchId;
      arrangeImages();
      sendCardInfo();
      delete target.dataset.moto;
    });
  });
}