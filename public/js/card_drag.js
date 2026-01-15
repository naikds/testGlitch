
import { arrangeImages, preDataSave } from './arrange.js';
import {setBoardInfo } from './photon_src.js';

export function setCardDrag() {
  const handCardWidth = 0.7;
  const container = document.getElementById('container');

  // ユーティリティ: absolute で left/top を offsetParent 基準で計算
  function setAbsPos(el, clientX, clientY) {
    // offsetParent が存在する前提（なければ body など）
    const parent = el.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    const left = clientX - el.offsetWidth / 2 - parentRect.left + window.scrollX;
    const top = clientY - el.offsetHeight / 2 - parentRect.top + window.scrollY;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  // デリゲーションでイベント登録数を削減
  document.addEventListener('pointerdown', (e) => {
    const draggable = e.target.closest('.draggable');
    if (!draggable) return;

    preDataSave();

    // 開始データセット
    draggable.dataset.touchId = e.pointerId;
    draggable.dataset.moto = draggable.offsetParent?.id || '';
    draggable.dataset.handIndex = Array.from(draggable.parentNode.children).indexOf(draggable);

    // まず container に移して absolute で動かす（元コードに合わせる）
    container.appendChild(draggable);
    draggable.style.position = 'absolute';
    draggable.style.zIndex = '1000';

    // 初期位置設定：offsetParent が container に変わるので container 基準で置く
    setAbsPos(draggable, e.clientX, e.clientY);

    // 背面ヒットのため、ドラッグ中要素だけ pointer-events を無効化
    draggable.style.pointerEvents = 'none';

    e.preventDefault();
    draggable.setPointerCapture(e.pointerId);
  }, { passive: false });

  document.addEventListener('pointermove', (e) => {
    const target = e.target.closest('.draggable');
    if (!target) return;
    if (target.dataset.touchId != e.pointerId) return;

    // offsetParent 基準のまま left/top を更新
    setAbsPos(target, e.clientX, e.clientY);
    e.preventDefault();
  }, { passive: false });

  function finishDrag(e, canceled = false) {
    const target = e.target.closest('.draggable');
    if (!target) return;

    // 一旦元の親に戻す（元コードの流れ）
    const motoId = target.dataset.moto;
    const motoParent = motoId ? document.getElementById(motoId) : null;
    if (motoParent) {
      motoParent.appendChild(target);
    }

    if (!canceled && target.dataset.touchId == e.pointerId) {
      const noPoints = document.querySelectorAll('.nonMousePointer');
      noPoints.forEach(p=>{p.classList.remove('nonMousePointer');})
      
      // ドラッグ中要素は pointer-events: none なので背面の要素を拾える
      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      const dropzone = dropTarget ? dropTarget.closest('.dropzone') : null;

      noPoints.forEach(p=>{p.classList.add('nonMousePointer');})
      if (dropzone) {
        // ドロップ先に配置（元コード準拠）
        dropzone.appendChild(target);
        if (dropzone.classList.contains('deck')) {
          dropzone.prepend(target);
        }

        if (dropzone.classList.contains('hand')) {
          // 元コードの挙動を踏襲した挿入位置ロジック
          const offsetX = target.offsetLeft - dropzone.offsetLeft + dropzone.scrollLeft;
          let index = Math.floor(offsetX / (target.offsetWidth * handCardWidth)) + 2;
          // 右に動かしたときの off-by-one 補正
          if (Number(target.dataset.handIndex) < index) {
            index = index - 1;
          }
          if (index < dropzone.children.length) {
            dropzone.insertBefore(target, dropzone.children[index]);
          }
        }
      }
    }

    // スタイル後片付け（元コード準拠＋追加）
    target.style.left = '';
    target.style.top = '';
    target.style.position = '';
    target.style.zIndex = '';
    target.style.pointerEvents = ''; // 解除

    // Pointer Capture 解放
    try { target.releasePointerCapture(Number(target.dataset.touchId)); } catch (_) {}

    // dataset 解放
    delete target.dataset.touchId;
    delete target.dataset.moto;
    delete target.dataset.handIndex;

    // 後処理
    arrangeImages();
    setBoardInfo();
  }

  document.addEventListener('pointerup', (e) => {
    finishDrag(e, false);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('pointercancel', (e) => {
    finishDrag(e, true);
    e.preventDefault();
  }, { passive: false });
}
``
