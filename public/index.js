const hand = document.querySelector('.hand');
const deck = document.querySelector('.deck');
const trash = document.querySelector('.trash');
const side = document.querySelector('.side');

//外だしするしかなかった☆
const handCardWidth = 0.7;
const seterCardWidth = 0.2;


//Photonサーバ系
// Photonサーバの設定
const appId = '09ff3dce-fed5-4215-8d3f-76310ae38875'; // 提供されたApp IDを使用
const appVersion = '1.0'; // アプリケーションバージョンを設定
const region = 'us'; // 使用するリージョンを設定（例：'us', 'eu', 'asia' など）

const roomInput = document.getElementById('roomInput');
const result = document.getElementById('photonResult');
const photonButton = document.getElementById('photonButton');

let roomJoinFlg = '0';

const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Wss, appId, appVersion);
// Photonサーバへの接続開始
client.onStateChange = function (state) {
  const stateName = getStateName(state);
  console.log(`Photon state changed to: ${stateName}`);
  result.innerHTML = `サーバ: ${stateName}`;
};

// ルーム参加成功時の処理
client.onJoinRoom = function () {
  console.log(`Joined room: ${client.myRoom().name}`);
  result.innerHTML = `サーバ: ${`Joined room: ${client.myRoom().name}`}`;
  roomJoinFlg = '1';
  sendPhotonMessage(5, "roomJoin");
  sendFirstCardInfo();
};

// ルーム作成成功時の処理
client.onCreatedRoom = function () {
  console.log(`Created room: ${client.myRoom().name}`);
};

// ルームが見つからなかった場合の処理
client.onJoinRoomFailed = function (errorCode, errorMessage) {
  const roomName = // Photonサーバへの接続開始
    console.log(`Room ${roomName} not found. Please create the room.`);
};

// エラー処理
client.onError = function (errorCode, errorMessage) {
  console.error(`Photon error: ${errorCode} - ${errorMessage}`);
};

// 接続を確立
client.connectToRegionMaster(region);

//ルーム参加処理
photonButton.addEventListener('click', function () {
  const roomName = roomInput.value;
  const carddata = document.getElementById('card1').dataset.tag;
  if (roomName && carddata) {
    client.createRoom(roomName, { maxPlayers: 2 });
    client.joinRoom(roomName);
  }
});

//メッセージ送信
function sendPhotonMessage(code, message) {
  if (message && roomJoinFlg === '1') {
    client.raiseEvent(code, message); // イベントコード1でメッセージ送信
  }
}

// メッセージ受信処理
client.onEvent = function (code, content, actorNr) {
  console.log(`Received event: ${code} from ${actorNr} with content: ${content}`);
  if (code === 1) { // コード1はメッセージイベントとします
    result.innerHTML = `Message from ${actorNr}: ${content}`;
  }

  //ルームに人が参加した場合にデッキの内容を送信
  if (code === 5) {
    sendFirstCardInfo();
  }

  if (code === 3) {
    //カードの内容を反映
    setFirstCardInfo(content);
  }
  
  if(code === 7){
    setCardInfo(content);
  }
  
  if(code === 9){
    setDamage(content);
  }
  
  if(code === 11){
    setplayerInfo(content);
  }
  
  if(code === 13){
    setCoin(content);
  }
};

//最初カードの情報を送信（src込み）
function sendFirstCardInfo() {
  const cards = document.querySelectorAll('img.card');
  const srcList = Array.from(cards).map(img => img.id + "@" + img.src + "@" + img.dataset.tag);
  sendPhotonMessage(3, srcList.join(','));
}

function setFirstCardInfo(info) {
  const imgdata = info.split(',');
  imgdata.forEach(data=>{
    const datasrc = data.split('@');
    const p2img = document.getElementById('p2_' + datasrc[0])
    const p2pare=document.getElementById('p2_deck');
    p2img.src = datasrc[1];
    p2img.dataset.tag = datasrc[2];
    p2img.classList.add(datasrc[2]);
    p2pare.appendChild(p2img);
  })
}

//カードの情報を送信(移動したやつだけ)
function sendCardInfo(){
  const cards = document.querySelectorAll('.battle .card, .bench .card, .free .card, .stadium .card');
  const srcList = Array.from(cards).map(img => img.id + "@" + img.offsetParent.id);
  if(srcList.length === 0){
    sendPhotonMessage(7,"clear");
  }else{
  sendPhotonMessage(7, srcList.join(','));
  }
}

function setCardInfo(info){
  const cards = document.querySelectorAll('.p2_card');
  cards.forEach(card=>{
    document.getElementById('p2_deck').appendChild(card);
  });
  if(info === 'clear'){return;}
  const imgdata = info.split(',');
  imgdata.forEach(data=>{
    const datasrc = data.split('@');
    const p2img = document.getElementById('p2_' + datasrc[0])
    const p2pare=document.getElementById('p2_' + datasrc[1]);
    p2pare.appendChild(p2img);
  })
  
  arrangeImages();
}

//ダメージ情報の送信
function sendDamage(){
  const damages = document.querySelectorAll('.damageSel');
  const srcList = Array.from(damages).map(damage => damage.id + "@" + damage.value);

  sendPhotonMessage(9, srcList.join(','));
}

function setDamage(info){
  const damageData = info.split(',');
  damageData.forEach(data=>{
    const datasrc = data.split('@');
    const p2damage = document.getElementById('p2_' + datasrc[0]);
    p2damage.textContent = datasrc[1];
  })
}

//プレイヤー情報の送信
function sendplayerInfo(){
  sendPhotonMessage(11, `敵　手札：${hand.children.length}枚　デッキ：${deck.children.length}枚　サイド：${side.children.length}枚`);
}

function setplayerInfo(info){
  const p2info = document.getElementById('p2Info');
  p2info.textContent = info;
}

//コイン情報の送信
function sendCoin(){
  const coin = document.getElementById('coin');
  sendPhotonMessage(13, coin.textContent+','+coin.style.backgroundColor);
}

function setCoin(info){
  const coinData = info.split(',');
  const coin = document.getElementById('coin');
  coin.textContent = coinData[0];
  coin.style.backgroundColor = coinData[1];
}


//初期読み込みstart
document.addEventListener('DOMContentLoaded', (event) => {
  //初期処理
  //デッキへカード追加
  const deck = document.getElementById('deck');
  const card = document.getElementById('card');

  for (let i = 1; i <= 60; i++) {
    const clone = card.content.cloneNode(true);
    clone.querySelector('.card').id = `card${i}`;
    deck.appendChild(clone);
  }
  
  const p2_deck = document.getElementById('p2_deck');
  const p2_card = document.getElementById('p2_card');
  for (let i = 1; i <= 60; i++) {
    const clone = p2_card.content.cloneNode(true);
    clone.querySelector('.p2_card').id = `p2_card${i}`;
    p2_deck.appendChild(clone);
  }
  
  //ベンチ情報を追加
  const mainCont = document.getElementById('container');
  const benchInfo = document.getElementById('benchInfo');
  for(let i = 1; i<=5;i++){
    const clone = benchInfo.content.cloneNode(true);
    clone.querySelector('.benchInfo').id = `benchInfo${i}`;
    clone.querySelector('.benchInfo').style.left = `${4+(i-1)*16.6}%`;
    clone.querySelector('.benchInfo').dataset.menu = `benchInfo_menu${i}`;
    clone.querySelector('.menu').id = `benchInfo_menu${i}`;
    mainCont.appendChild(clone);
  }
  
  //ダメカンを追加
  const damageSel = document.getElementById('damageSel');

  for(let i = 1; i<=5;i++){
    const clone = damageSel.content.cloneNode(true);
    clone.querySelector('.damageSel').id = `damageSel${i}`;
    clone.querySelector('.damageSel').style.left = `${4+(i-1)*16.6}%`;
    mainCont.appendChild(clone);
  }
  const clone = damageSel.content.cloneNode(true);
  clone.querySelector('.damageSel').id = `damageSel_battle`;
  clone.querySelector('.damageSel').style.top = `${39}%`;
  clone.querySelector('.damageSel').style.left = `${38}%`;
  mainCont.appendChild(clone);
  
  

  //機能設定
  const draggables = document.querySelectorAll('.draggable');
  const dropzones = document.querySelectorAll('.dropzone');
  const menuBtns = document.querySelectorAll('.menuBtn');
  const damageSels = document.querySelectorAll('.damageSel');

  //ドラッグ処理
  draggables.forEach(draggable => {
    //ドラッグ開始
    draggable.addEventListener('touchstart', (e) => {
      const touch = e.targetTouches[0];
      e.target.dataset.touchId = touch.identifier;
      e.target.dataset.moto = e.target.offsetParent.id;
      document.getElementById('container').appendChild(e.target);
      e.target.style.position = 'absolute';
      e.target.style.left = `${touch.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
      e.target.style.top = `${touch.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
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
        target.style.visibility = 'hidden';
        const dropzone = document.elementFromPoint(touch.clientX, touch.clientY).closest('.dropzone');
        target.style.visibility = '';
        if (dropzone) {
          dropzone.appendChild(target);
          if (dropzone.classList.contains('deck')) {
            dropzone.prepend(target);
          }

          if (dropzone.classList.contains('hand')) {
            const offsetX = target.offsetLeft - dropzone.offsetLeft;
            const index = Math.floor(offsetX / (target.offsetWidth * handCardWidth)) + 1;
            if (index < dropzone.children.length) {
              dropzone.insertBefore(target, dropzone.children[index]);
            }
          }
        }
        target.style.left = '';
        target.style.top = '';
      }
      target.style.position = '';
      target.zIndex = e.target.dataset.zind;
      delete target.dataset.touchId;
      delete target.dataset.zind;
      arrangeImages();
      sendCardInfo();
      delete target.dataset.moto;
    });
  });

  //ボタンのメニュー設定
  menuBtns.forEach(menuBtn => {
    const contextMenu = document.getElementById(menuBtn.getAttribute('data-menu'));
    contextMenu.style.top = `${menuBtn.offsetTop}px`;

    menuBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${menuBtn.offsetLeft - contextMenu.offsetWidth}px`
      if(contextMenu.offsetLeft<0){
      contextMenu.style.left = `${menuBtn.offsetLeft + menuBtn.offsetWidth}px`
      }
    });

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

    menuBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touchY = e.changedTouches[0].clientY;
      const touchX = e.changedTouches[0].clientX;
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (touchY >= rect.top && touchY <= rect.bottom && touchX >= rect.left && touchX <= rect.right) {
          const action = item.getAttribute('data-action');
          btnAct(action,e.target.id);
        }
      });
      contextMenu.style.display = 'none';
    });
  })

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
      const targetArea = document.querySelector(targetModal);
      const srcArea = document.querySelector(srcModal);
      selectedImages.forEach(img => {
        targetArea.appendChild(srcArea.querySelector('#' + img.id));
      });
      currentModal.style.display = "none";
      currentModal.querySelector('.image-container').innerHTML = '';
      arrangeImages();
      sendCardInfo();
    });
  });

  //デッキコードからデッキを読み込む
  document.getElementById('scrapeForm').addEventListener('submit', function (event) {
    event.preventDefault(); // フォームのデフォルトの送信動作を防止
    const url = document.getElementById('urlInput').value;

    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'block';

    fetch('/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url })
    })
      .then(response => response.json())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.body, 'text/html');
        const images = doc.querySelectorAll('img');
        const imageCnts = Array.from(doc.querySelectorAll('span')).filter(span => span.id.includes('picNumView'))
        const cardTags = Array.from(doc.querySelectorAll('a.appendBtn.countBtnBlock')).map(a => a.getAttribute('onclick').split('deck_')[1].substring(0, 3));
        const deck = document.getElementById('deck');

        let deckIndex = 0;
        let cnt = 0;
        images.forEach(img => {
          const imgSrc = img.src;
          const baseUri = 'https://goldenrod-momentous-poppy.glitch.me';
          const pokeUrl = 'https://www.pokemon-card.com/';
          for (let i = 0; i < Number(imageCnts[cnt].innerHTML); i++) {
            deckIndex = deckIndex + 1;
            document.getElementById('card' + deckIndex).src = pokeUrl + imgSrc.replace(baseUri, '');
            document.getElementById('card' + deckIndex).alt = img.alt;
            document.getElementById('card' + deckIndex).dataset.tag = cardTags[cnt * 2];
            document.getElementById('card' + deckIndex).classList.add(cardTags[cnt * 2]);
          }
          cnt = cnt + 1;
        });
      })
      .catch(error => {
        document.getElementById('result').innerText = 'エラーが発生しました';
        console.error('Error:', error);
      })
      .finally(() => {
        loadingDiv.style.display = 'none';
      });
  });

  //ダメカン処理
  damageSels.forEach(damageSel=>{
    damageSel.addEventListener('change',function(){
      sendDamage();
    })
  })
  
  //コイン処理
  const coin = document.getElementById('coin');
  coin.addEventListener('touchend', (e) => {
    if(Math.random() > 0.5){
      coin.textContent = "裏"
    }else{
      coin.textContent = "表"
    }
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i=0;i<4;i++){
      color+=letters[Math.floor(Math.random()*16)];
    }
    
    coin.style.backgroundColor = color+'FF';
    sendCoin();
  });

});
//初期読み込みend

//メニューボタン処理
function btnAct(actionNm,btnid) {
  const modal = document.getElementById('modal');
  const targetContainer = modal.querySelector('.image-container');
  switch (actionNm) {
    //カードを1枚引く
    case 'draw':
      if (deck.firstElementChild) {
        hand.appendChild(deck.firstElementChild);
      }
      break;
    //デッキをシャッフルする
    case 'deck_shufl':
      const items = Array.from(deck.children);
      const shuffledItems = shuffleArray(items);

      // コンテナをクリア
      deck.innerHTML = '';

      // シャッフルされた要素を再度追加
      shuffledItems.forEach(item => {
        deck.appendChild(item);
      });
      break;
    //デッキの中身をモーダルで表示する
    case 'deck_show':
      modal.setAttribute('data-src', '.deck');

      const deckCopy = Array.from(deck.children).map(child => child.cloneNode(true));

      deckCopy.forEach(img => {
        // 画像の選択イベントを追加
        img.addEventListener('click', (e) => {
          e.target.classList.toggle('selected');
        });
        targetContainer.appendChild(img);
      });
      modal.style.display = "block";
      break;
    //トラッシュの中身をモーダルで表示する
    case 'trash_show':
      modal.setAttribute('data-src', '.trash');

      const trashCopy = Array.from(trash.children).map(child => child.cloneNode(true));

      trashCopy.forEach(img => {
        // 画像の選択イベントを追加
        img.addEventListener('click', (e) => {
          e.target.classList.toggle('selected');
        });
        targetContainer.appendChild(img);
      });
      modal.style.display = "block";
      break;
    //サイドの中身をモーダルで表示する
    case 'side_show':
      modal.setAttribute('data-src', '.side');

      const sideCopy = Array.from(side.children).map(child => child.cloneNode(true));

      sideCopy.forEach(img => {
        // 画像の選択イベントを追加
        img.addEventListener('click', (e) => {
          e.target.classList.toggle('selected');
        });
        targetContainer.appendChild(img);
      });
      modal.style.display = "block";
      break;
    //サイドを1枚引く
    case 'side_draw1':
      if (side.firstElementChild) {
        hand.appendChild(side.firstElementChild);
      }
      break;
    //サイドを2枚引く
    case 'side_draw2':
      for(let i=0;i<2;i++){
        if (side.firstElementChild) {
          hand.appendChild(side.firstElementChild);
        }
      }
      break;
    //初期配置
    case 'reset':
      const cards = document.querySelectorAll('.card');
      const damages = document.querySelectorAll('.damageSel');
      cards.forEach(card=>{deck.appendChild(card)});
      btnAct('deck_shufl')
      for(let i=0;i<6;i++){
        side.appendChild(deck.firstElementChild);
      }
      for(let i=0;i<7;i++){
        hand.appendChild(deck.firstElementChild);
      }
      damages.forEach(d=>{d.value='0'});
      arrangeImages();
      sendCardInfo();
      break;
    case 'irekae':
      const bench = document.getElementById('bench' + btnid.slice(-1));
      const batle = document.getElementById('battle');
      
      const benchCard = bench.querySelectorAll('.card');
      const batleCard = batle.querySelectorAll('.card');
      
      benchCard.forEach(card=>{batle.appendChild(card)});
      batleCard.forEach(card=>{bench.appendChild(card)});
      
      const damagebench = document.getElementById('damageSel' + btnid.slice(-1));
      const damagebatle = document.getElementById('damageSel_battle');
      
      const damagebenchV = damagebench.value;
      const damagebatleV = damagebatle.value;
      
      damagebench.value =damagebatleV;
      damagebatle.value =damagebenchV;
      sendCardInfo();
      sendDamage();
      break;
    case 'bench_trash':
      const bencht = document.getElementById('bench' + btnid.slice(-1));
      const benchtCard = bencht.querySelectorAll('.card');
      benchtCard.forEach(card=>{trash.appendChild(card)});
      sendCardInfo();
      break;
    case 'hand_trash':
      const handcard = hand.querySelectorAll('.card');
      handcard.forEach(card=>{trash.appendChild(card)});
      break;
    case 'hand_deck':
      const handtcard = hand.querySelectorAll('.card');
      handtcard.forEach(card=>{deck.appendChild(card)});   
      break;
    case 'free_trash':
      const free = document.getElementById('free');
      const freecard = free.querySelectorAll('.card');
      freecard.forEach(card=>{trash.appendChild(card)});
      sendCardInfo();
      break;
    case 'battle_trash':
      const batlet = document.getElementById('battle');
      const btlcard = batlet.querySelectorAll('.card');
      btlcard.forEach(card=>{trash.appendChild(card)});
      sendCardInfo();
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

// イメージの配置を調整する関数
function arrangeImages() {
  //余計なスタイルは削除
  const allcard = document.querySelectorAll('.card');
  allcard.forEach(card => {
    card.style.left = '';
    card.style.top = '';
  })
  
  //手札
  const hand = document.querySelector('.hand');
  let images = hand.querySelectorAll('.card');
  const handW = hand.clientWidth;

  images.forEach((img, index) => {
    const overlap = img.clientWidth * handCardWidth; // 重なり具合（ピクセル単位）
    const xOffset = overlap * index;
    img.style.left = `${xOffset}px`;
  });

  //バトル・ベンチ
  const cardSeter = document.querySelectorAll('.battle, .bench')

  cardSeter.forEach(seter => {
    images = seter.querySelectorAll('.card');
    let gdsIndex = 0;
    let eneIndex = 0;
    images.forEach((img,index) => {
      const gdsoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
      const gdsxOffset = gdsoverlap * gdsIndex;

      const eneoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
      const enexOffset = eneoverlap * eneIndex;
      const eneyOffset = img.clientHeight / 2 - img.clientWidth / 2;
        switch (img.dataset.tag) {
          case 'pke':
            break;
          case 'too':
            img.style.left = `${gdsxOffset}px`;
            gdsIndex = gdsIndex + 1;
            break;
          case 'ene':
            img.style.top = `${enexOffset - eneyOffset}px`;
            eneIndex = eneIndex + 1;
            break;
          default:
            document.getElementById(img.dataset.moto).appendChild(img);
            arrangeImages();
            break;
        }
    })
    
    images = seter.querySelectorAll('.p2_card');
    gdsIndex = 0;
    eneIndex = 0;
    images.forEach((img,index) => {
      const gdsoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
      const gdsxOffset = gdsoverlap * gdsIndex;

      const eneoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
      const enexOffset = eneoverlap * eneIndex;
      const eneyOffset = img.clientHeight / 2 - img.clientWidth / 2;
        switch (img.dataset.tag) {
          case 'pke':
            img.style.left = '0px';
            break;
          case 'too':
            img.style.left = `${gdsxOffset}px`;
            gdsIndex = gdsIndex + 1;
            break;
          case 'ene':
            img.style.top = `${enexOffset - eneyOffset}px`;
            eneIndex = eneIndex + 1;
            break;
          default:
            break;
        }
    })
  })
  
  //フリー
  const free = document.querySelectorAll('.free')
  
  free.forEach(f=>{
  images = f.querySelectorAll('.card, .p2_card');
  images.forEach((img,index) => {
    const overlapx = img.clientWidth * 0.6; // 重なり具合（ピクセル単位）
    const overlapy = img.clientHeight * 0.3; // 重なり具合（ピクセル単位）
    const xOffset = overlapx * (index % 3);
    const yOffset = overlapy * Math.floor(index / 3);
    img.style.left = `${xOffset}px`;
    img.style.top = `${yOffset}px`
  })
  });
  
  //スタジアム
  const stadium = document.getElementById('stadium');
  images = stadium.querySelectorAll('.card');
  images.forEach((img,index) =>{
    const staoverlap = img.clientWidth * 0.7; // 重なり具合（ピクセル単位）
    const staxOffset = staoverlap * index;
    
      switch (img.dataset.tag) {
        case 'sta':
          img.style.left = `${staxOffset}px`;
          break;
        default:
          document.getElementById(img.dataset.moto).appendChild(img);
          arrangeImages();
          break;
      }
  })
  
  updp1Info();
}

//Photn用の関数
// 状態名を取得する関数
function getStateName(state) {
  const states = Photon.LoadBalancing.LoadBalancingClient.State;
  for (let key in states) {
    if (states[key] === state) {
      return key;
    }
  }
  return "Unknown";
}

//プレイヤーの情報を更新する
function updp1Info(){
  const p1info = document.getElementById('p1Info');
  p1info.textContent = `自　手札：${hand.children.length}枚　デッキ：${deck.children.length}枚　サイド：${side.children.length}枚`;
  sendplayerInfo();
}
