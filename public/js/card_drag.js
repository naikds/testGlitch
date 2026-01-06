import {arrangeImages,preDataSave} from './arrange.js';
export function setCardDrag(){
  const handCardWidth = 0.7;
  
  //ドラッグ処理
  const draggables = document.querySelectorAll('.draggable');
  draggables.forEach(draggable => {
    //ドラッグ開始
    let isDown = false;
    draggable.addEventListener('pointerdown', (e) => {
      if(!e.target.classList.contains('draggable')){return;}
      preDataSave();
      e.target.dataset.touchId = e.pointerId;
      e.target.dataset.moto = e.target.offsetParent.id;
      e.target.dataset.handIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
      document.getElementById('container').appendChild(e.target);
      e.target.style.position = 'absolute';
      e.target.style.left = `${e.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
      e.target.style.top = `${e.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
      e.target.style.zIndex = 1000;
      event.preventDefault();
      isDown = true;
      e.target.setPointerCapture(e.pointerId);
    });

    //ドラッグ中
    draggable.addEventListener('pointermove', (e) => {
      e.preventDefault();
      if (e.target.dataset.touchId == e.pointerId) {
        e.target.style.left = `${e.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
        e.target.style.top = `${e.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
      }
    });

    //ドラッグ終わり
    draggable.addEventListener('pointerup', (e) => {
      const target = e.target
      document.getElementById(target.dataset.moto).appendChild(target);
      if (target.dataset.touchId == e.pointerId) {
        draggables.forEach(c => {c.style.visibility = 'hidden';});
        const noPoints = document.querySelectorAll('.nonMousePointer');
        noPoints.forEach(p=>{p.classList.remove('nonMousePointer');})
        const dropzone = document.elementFromPoint(e.clientX, e.clientY).closest('.dropzone');
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
      delete target.dataset.moto;
    });
  });
}
