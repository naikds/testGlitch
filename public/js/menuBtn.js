import {arrangeImages,preDataSave,handScSave} from './arrange.js';
import {sendCardInfo,sendDamage,sendplayerInfo,joinRoom,createRoom,sendCardModal,reConnect} from './photon_src.js';
import {setDeckLoad} from './deckLoad.js';
import {showModalCardIds} from './modal.js';

export function setMenuBtn(){
    //ボタンのメニュー設定
    const menuBtns = document.querySelectorAll('.menuBtn');
    menuBtns.forEach(menuBtn => {
        //メニューボタンを取得
        const contextMenu = document.getElementById(menuBtn.getAttribute('data-menu'));

        //メニューの位置を調整

        //メニューを表示する
        menuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
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
                    if(item.classList.contains('menuBtnMenu')){
                      btnAct(item, e.target.id);
                    }else if(item.classList.contains('submenu-item')){
                    }
                    else{
                      document.querySelectorAll('.submenu').forEach(sub =>{sub.style.display = 'none';});
                    }
                }
            });
        });

        //メニューで選ばれた項目の処理を実行する
        menuBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            preDataSave();
            const touchY = e.changedTouches[0].clientY;
            const touchX = e.changedTouches[0].clientX;
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (touchY >= rect.top && touchY <= rect.bottom && touchX >= rect.left && touchX <= rect.right) {
                    btnAct(item, e.target.id);
                }
            });
            document.querySelectorAll('.submenu').forEach(sub =>{sub.style.display = 'none';});
            contextMenu.style.display = 'none';
        });
    })
}

//メニューボタン処理
function btnAct(item, btnid) {
  fieldUpAct(item,btnid);
  fieldNoUpAct(item,btnid);
  photonAct(item,btnid);
}

//カード位置を更新する系
function fieldUpAct(item, btnid){
  const actionNm = item.getAttribute('data-action');  
  const deck = document.getElementById('deck'); 
  const hand = document.getElementById('hand');
  const side = document.getElementById('side');
  const sideCount = side.querySelectorAll('.card').length; //サイドの枚数
    switch (actionNm) {
        //カードを1枚引く
        case 'draw':
            moveCard('deck', 'hand', 1, true, false);
           handScSave(hand.scrollWidth);
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
            shufflDeck();
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
            document.getElementById('damageSel' + btnid.slice(-1)).value = '0';
            break;
        //ベンチをデッキに戻す
        case 'bench_deck':
            moveAllCard('bench' + btnid.slice(-1), 'deck', false);
            shufflDeck();
            document.getElementById('damageSel' + btnid.slice(-1)).value = '0';
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
            document.getElementById('damageSel_battle').value = '0';
            break;
        //バトル場をデッキに戻す
        case 'battle_deck':
            moveAllCard('battle', 'deck', false);
            shufflDeck();
            document.getElementById('damageSel_battle').value = '0';
            break;
        //とりかえチケットを使う
        case 'side_torikae':
            moveAllCard('side', 'deck', false);
            moveCard('deck', 'side', sideCount, true, false);
            break;
        //リーリエの決心を使う
        case 'ri-rie':
            //手札を山に戻す→シャッフル→サイド枚数が6枚なら8ドロー、そうでないなら6ドロー。このカードつっっっよ
            moveAllCard('hand','deck',false);
            shufflDeck();
            if(sideCount===6){
                moveCard('deck', 'hand', 8, true, false);
            } else {
                moveCard('deck', 'hand', 6, true, false);
            }
            break;
        //ナンジャモを使う
        case 'na-njamo':
            //手札をシャッフルして山下に→サイドの枚数だけドローだけど手札シャッフルめんどいからそのまま山下おくる
            moveAllCard('hand', 'deck', false);
            moveCard('deck', 'hand', sideCount, true, false);
            break;
        //博士の研究を使う
        case 'ha-kase':
            //手札をトラッシュして山札から7枚引く
            moveAllCard('hand','trash',false);
            moveCard('deck', 'hand', 7, true, false);
            break;
        default:
          return;
    }
    arrangeImages();
    sendCardInfo();
    sendDamage();
}

//単にメニュー開くだけとか
function fieldNoUpAct(item,btnid){
    const actionNm = item.getAttribute('data-action');  
  const deck = document.getElementById('deck');
  const p2_trash = document.getElementById('p2_trash');
    switch (actionNm) {
        //デッキをシャッフルする
        case 'deck_shufl':
          shufflDeck();
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
        //手札をモーダルで表示する
      case 'hand_show':
          showModal('hand');
          break;
        case 'deck_Xshow':
            //自分のIDを下位メニューに伝える
            const xMenu = document.getElementById('deckXmenu');
            const xMenus = xMenu.querySelectorAll('.menu-item');
            xMenus.forEach(x=>{
              x.dataset.menuNm = 'deck'
            })
        
            //Xmenuを表示
            xMenu.style.display = 'block';
            break;
        case 'Xnum':
            const src = item.dataset.menuNm;
            const num = item.dataset.xnum;
            showModalNum(src,num,true);
            break;
        case 'p2_trashShow':
            let p2_trashcards = [];
            p2_trash.querySelectorAll('.p2_card').forEach(el => {
              p2_trashcards.push(el.id.match(/\d+$/)[0]);
            })
            showModalCardIds(p2_trashcards.join(','));
          break;
        case 'p2Change':
          const p2chbtn = document.getElementById('btnChangePl');
          const inputmenu = document.getElementById('input_menu');
          p2chbtn.style.visibility = '';
          inputmenu.querySelector('[data-action="roomJoin"]').style.display ='none';
          break;
        default:
          return;
    }
}
//Photon系
function photonAct(item,btnid){
    const actionNm = item.getAttribute('data-action');  
  const deck = document.getElementById('deck');
  const hand = document.getElementById('hand');
  const inputmenu = document.getElementById('input_menu');
    switch (actionNm) {
        case 'deckLoad':
            document.getElementById('inputXmenu').style.display = 'block';
            setDeckLoad();
            break;
        case 'roomJoin':
            const inputXMenu = document.getElementById('inputXmenu');
            inputXMenu.style.display = 'block';
            break;
        case 'XroomJoin':
            inputmenu.querySelector('[data-action="p2Change"]').style.display ='none';
            joinRoom(item.dataset.xnum);
            break;
        case 'roomCreate':
            inputmenu.querySelector('[data-action="p2Change"]').style.display ='none';
            const roomCnt = document.getElementById('inputXmenu_ul').childElementCount;
            createRoom(`room${roomCnt}`);
            break;
        case 'deckReLoad':
            const url = 'https://www.pokemon-card.com/deck/deck.html?deckID=' + document.getElementById('urlInput').value;
            window.open(url,'_blank');
            break;
        case 'hand_p2show':
            let handIdnum = [];
            hand.querySelectorAll('.card').forEach(el => {
              handIdnum.push(el.id.match(/\d+$/)[0]);
            })
            sendCardModal(handIdnum.join(','));
            break;
        case 'roomReconect':
            reConnect();
            break;
        default:
          return;
    }
}

export function shufflDeck(){
    const deck = document.getElementById('deck');
    const items = Array.from(deck.children);
    const shuffledItems = shuffleArray(items);

    deck.querySelectorAll(".card").forEach(child=>child.remove());

    // シャッフルされた要素を再度追加
    shuffledItems.forEach(item => {
        deck.appendChild(item);
    });
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
  
    modal.querySelectorAll('button').forEach(b=>{b.style.display = '';});
  
    //modalのボタンを一部以外は見えるようにする
    modal.querySelectorAll('.move').forEach(move=>{
      if(move.dataset.target === srcId){  
        move.style.display = 'none';
      } else{
        move.style.display = ''; 
      }    
    });
  
    modal.style.display = "block";
}

//モーダルで一部だけ中身を表示する
function showModalNum(srcId,num,first) {
    const modal = document.getElementById('modal');
    const targetContainer = modal.querySelector('.image-container');
    const src = document.getElementById(srcId);
    modal.setAttribute('data-src', srcId);

  　
    const cardCopy = Array.from(src.children).map(child => child.cloneNode(true));
    
    if(num > cardCopy.length) num = cardCopy.length;
    for(let i=0;i<num;i++){
      const img = cardCopy[i];
      // 画像の選択イベントを追加
      img.addEventListener('click', (e) => {
          e.target.classList.toggle('selected');
      });
      targetContainer.appendChild(img);
    }
    
    modal.querySelectorAll('button').forEach(b=>{b.style.display = '';});
    //modalのボタンをすべて見えるようにする
    modal.querySelectorAll('.move').forEach(move=>{
        move.style.display = ''; 
    });
  
    modal.style.display = "block";
}

//下位メニューを表示する
function showXmenu(){
  
}


//要素が画面内かどうか調べる
function isElInViewport(el){
  const rect = el.getBoundingClientRect();
  if(rect.bottom >= (window.innerHeight || document.documentElement.clientHeight)){
    return 1;
  }
  if(rect.right >= (window.innerWidth || document.documentElement.clientWidth)){
    return 2;
  }
  
  return 0;
}