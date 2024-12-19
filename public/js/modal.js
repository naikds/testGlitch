import {arrangeImages} from './arrange.js';
import {sendCardInfo} from './photon_src.js';

export function setModal(){
  // モーダルを開く
  document.querySelectorAll('button[id^="openModal"]').forEach(button => {
    button.addEventListener('click', function () {
      const modalId = this.id.replace('open', '').toLowerCase();
      document.getElementById(modalId).style.display = "block";
    });
  });

  // モーダルを閉じる
  document.querySelectorAll('.close').forEach(span => {
    span.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal');
      document.getElementById(modalId).style.display = "none";
      document.getElementById(modalId).querySelector('.image-container').innerHTML = '';
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
}
