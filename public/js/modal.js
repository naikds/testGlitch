import {arrangeImages} from './arrange.js';
import {sendCardInfo} from './photon_src.js';
import {shufflDeck} from './menuBtn.js';

export function setModal(){

  // モーダルを閉じる
  document.querySelectorAll('.close').forEach(span => {
    span.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal');
      document.getElementById(modalId).style.display = "none";
      document.getElementById(modalId).querySelector('.image-container').innerHTML = '';
      shufflDeck();
    });
  });

  // 選択した画像を移動する
  document.querySelectorAll('.move').forEach(button => {
    button.addEventListener('click', function () {
      const targetModal = this.getAttribute('data-target');
      const currentModal = this.closest('.modal');
      const srcModal = currentModal.getAttribute('data-src');
      const selectedImages = currentModal.querySelectorAll('.selected');
      const targetArea = document.querySelector('.' + targetModal);
      const srcArea = document.querySelector('#' + srcModal);
      selectedImages.forEach(img => {
        targetArea.appendChild(srcArea.querySelector('#' + img.id));
        img.style.display = 'none';
        img.classList.remove('selected');
      });
      arrangeImages();
      sendCardInfo();
    });
  });
  
  //id順に整列する
  document.querySelector(".ajast").addEventListener('click', function () {
    const currentModal = this.closest('.modal');
    const images = Array.from(currentModal.querySelectorAll('.card'));
    images.sort((a,b) => {
      const aidNum = parseInt(a.id.match(/\d+/)[0],10);
      const bidNum = parseInt(b.id.match(/\d+/)[0],10);
      return aidNum - bidNum;
    })
    images.forEach(img => {
      currentModal.querySelector('.image-container').appendChild(img);
    });
  });
}

export function showModalCardIds(cardIds){
    const modal = document.getElementById('modal');
    const targetContainer = modal.querySelector('.image-container');
    let cards = [];
  
    cardIds.split(',').forEach(id =>{
      cards.push(document.getElementById('p2_card' + id));
    })
  
    const cardCopy = Array.from(cards).map(child => child.cloneNode(true));
  
    cardCopy.forEach(img => {
      targetContainer.appendChild(img);
    });
  
  
    //modalのボタンを全て見えなくなるようにする
    modal.querySelectorAll('button').forEach(move=>{
        move.style.display = 'none';
    });
  
    modal.style.display = "block";
}
