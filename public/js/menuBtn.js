import {arrangeImages} from './arrange.js';
import {sendCardInfo,sendDamage,sendplayerInfo} from './photon_src.js';

export function setMenuBtn(){
    //ボタンのメニュー設定
    const menuBtns = document.querySelectorAll('.menuBtn');
    menuBtns.forEach(menuBtn => {
        //メニューボタンを取得
        const contextMenu = document.getElementById(menuBtn.getAttribute('data-menu'));

        //メニューの位置を調整
        contextMenu.style.top = `${menuBtn.offsetTop}px`;

        //メニューを表示する
        menuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${menuBtn.offsetLeft - contextMenu.offsetWidth}px`
            if (contextMenu.offsetLeft < 0) {
              contextMenu.style.left = `${menuBtn.offsetLeft + menuBtn.offsetWidth}px`
            }
        });

        //メニューで選ばれた項目の色を変える
        menuBtn.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchY = e.changedTouches[0].clientY;
            const touchX = e.changedTouches[0].clientX;
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                item.style.backgroundColor = '';
                const rect = item.getBoundingClientRect();
                if (touchY >= rect.top && touchY <= rect.bottom && touchX >= rect.left && touchX <= rect.right) {
                    item.style.backgroundColor = '#0078d4';
                }
            });
        });

        //メニューで選ばれた項目の処理を実行する
        menuBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchY = e.changedTouches[0].clientY;
            const touchX = e.changedTouches[0].clientX;
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (touchY >= rect.top && touchY <= rect.bottom && touchX >= rect.left && touchX <= rect.right) {
                    const action = item.getAttribute('data-action');
                    btnAct(action, e.target.id);
                }
            });
            contextMenu.style.display = 'none';
        });
    })
}

//メニューボタン処理
function btnAct(actionNm, btnid) {
  const deck = document.getElementById('deck');
    switch (actionNm) {

        //カードを1枚引く
        case 'draw':
            moveCard('deck', 'hand', 1, true, false);
            break;

        //デッキをシャッフルする
        case 'deck_shufl':
            const items = Array.from(deck.children);
            const shuffledItems = shuffleArray(items);

            deck.innerHTML = '';// コンテナをクリア

            // シャッフルされた要素を再度追加
            shuffledItems.forEach(item => {
                deck.appendChild(item);
            });
            break;

        //デッキの中身をモーダルで表示する
        case 'deck_show':
            showModal('deck');
            break;
        //トラッシュの中身をモーダルで表示する
        case 'trash_show':
            showModal('trash');
            break;
        //サイドの中身をモーダルで表示する
        case 'side_show':
            showModal('side');
            break;
        //サイドを1枚引く
        case 'side_draw1':
            moveCard('side', 'hand', 1, false, false);
            break;
        //サイドを2枚引く
        case 'side_draw2':
            moveCard('side', 'hand', 2, false, false);
            break;
        //初期配置
        case 'reset':
            const cards = document.querySelectorAll('.card');
            const damages = document.querySelectorAll('.damageSel');
            cards.forEach(card => { deck.appendChild(card) });//カードをすべてデッキに戻す
            btnAct('deck_shufl')//シャッフル
            moveCard('deck', 'side', 6, true, false);//サイドを6枚追加
            moveCard('deck', 'hand', 7, true, false);//手札に7枚追加

            damages.forEach(d => { d.value = '0' });//ダメカンをリセット
            arrangeImages();
            sendCardInfo();
            break;
        //ポケモン入れ替え
        case 'irekae':
            const bench = document.getElementById('bench' + btnid.slice(-1));
            const batle = document.getElementById('battle');

            const benchCard = bench.querySelectorAll('.card');
            const batleCard = batle.querySelectorAll('.card');

            benchCard.forEach(card => { batle.appendChild(card) });
            batleCard.forEach(card => { bench.appendChild(card) });

            const damagebench = document.getElementById('damageSel' + btnid.slice(-1));
            const damagebatle = document.getElementById('damageSel_battle');

            const damagebenchV = damagebench.value;
            const damagebatleV = damagebatle.value;

            damagebench.value = damagebatleV;
            damagebatle.value = damagebenchV;
            sendCardInfo();
            sendDamage();
            break;
        //ベンチをトラッシュ
        case 'bench_trash':
            moveAllCard('bench' + btnid.slice(-1), 'trash', false);
            break;
        //手札をトラッシュ
        case 'hand_trash':
            moveAllCard('hand', 'trash', false);
            break;
        //手札を下に戻す
        case 'hand_deck':
            moveAllCard('hand', 'deck', false);
            break;
        //フリーをトラッシュ
        case 'free_trash':
            moveAllCard('free', 'trash', false);
            break;
        //バトル場をトラッシュ
        case 'battle_trash':
            moveAllCard('battle', 'trash', false);
            break;
    }
    arrangeImages();
}

//シャッフル関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//カードを移動させる
function moveCard(moto_id, saki_id, num, moto_first, saki_first) {
    if (num < 1) return;
    const moto = document.getElementById(moto_id);
    const saki = document.getElementById(saki_id);
    //カードがmotoに含まれていない場合抜ける
    if (!(moto.firstElementChild)) return;

    for (let i = 0; i < num; i++) {
        //上or下からカードを取得する
        let card = moto.lastElementChild;
        if (moto_first) {
            card = moto.firstElementChild;
        }
        //上or下へカードを移動させる
        saki.appendChild(card);
        if (saki_first) {
            saki.insertBefore(card, saki.firstChild);
        }
    }
    updp1Info();
}

//カードをすべて移動する
function moveAllCard(motoId, sakiId, saki_first) {
    const moto = document.getElementById(motoId);
    const saki = document.getElementById(sakiId);
    const motoCard = moto.querySelectorAll('.card');
    if (saki_first) {
        motoCard.forEach(card => { saki.insertBefore(card, saki.firstChild); });
    } else {
        motoCard.forEach(card => { saki.appendChild(card) });
    }
    updp1Info();
}

//モーダルで中身を表示する
function showModal(srcId) {
    const modal = document.getElementById('modal');
    const targetContainer = modal.querySelector('.image-container');
    const src = document.getElementById(srcId);
    modal.setAttribute('data-src', srcId);

    const cardCopy = Array.from(src.children).map(child => child.cloneNode(true));

    cardCopy.forEach(img => {
        // 画像の選択イベントを追加
        img.addEventListener('click', (e) => {
            e.target.classList.toggle('selected');
        });
        targetContainer.appendChild(img);
    });
    modal.style.display = "block";
}

//プレイヤーの情報を更新する
function updp1Info() {
    const p1info = document.getElementById('p1Info');
    const hand = document.getElementById('hand');
    const deck = document.getElementById('deck');
    const side = document.getElementById('side');
    p1info.textContent = `自　手札：${hand.children.length}枚　デッキ：${deck.children.length}枚　サイド：${side.children.length}枚`;
    sendplayerInfo();
}