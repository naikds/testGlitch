const hand = document.querySelector('.hand');
const deck = document.querySelector('.deck');
const trash = document.querySelector('.trash');



//Photonサーバ系
// Photonサーバの設定
const appId = '09ff3dce-fed5-4215-8d3f-76310ae38875'; // 提供されたApp IDを使用
const appVersion = '1.0'; // アプリケーションバージョンを設定
const region = 'us'; // 使用するリージョンを設定（例：'us', 'eu', 'asia' など）

const roomInput = document.getElementById('roomInput');
const result = document.getElementById('photonResult');
const photonButton = document.getElementById('photonButton');

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
  sendPhotonMessage(5,"roomJoin");
  sendCardInfo(3);
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
photonButton.addEventListener('click', function() {
  const roomName = roomInput.value;
  if(roomName){
    client.createRoom(roomName, { maxPlayers: 2 });
    client.joinRoom(roomName);
  }
});

//メッセージ送信
function sendPhotonMessage(code,message){
      if (message && client.isJoinedToRoom()) {
        client.raiseEvent(code, message); // イベントコード1でメッセージ送信
    } else {
        alert('You are not joined to a room!');
    }
}

// メッセージ受信処理
client.onEvent = function (code, content, actorNr) {
  console.log(`Received event: ${code} from ${actorNr} with content: ${content}`);
  if (code === 1) { // コード1はメッセージイベントとします
    result.innerHTML = `Message from ${actorNr}: ${content}`;
  }
  
  //ルームに人が参加した場合にデッキの内容を送信
  if(code === 5){
    sendCardInfo(3);
  }
  
  if(code === 3){
    //カードの内容を反映
    setCardInfo(content);
  }
};

//カードの情報を送信
function sendCardInfo(code){
  const cards = document.querySelectorAll('img.card');
  const srcList = Array.from(cards).map(img =>img.id + "@"+ img.src + "@" + img.offsetParent.id);
  sendPhotonMessage(code,srcList.join(','));
}

function setCardInfo(info){
  
}

//初期読み込みstart
document.addEventListener('DOMContentLoaded', (event) => {
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.dropzone');
    const menuBtns = document.querySelectorAll('.menuBtn');

    //ドラッグ処理
    draggables.forEach(draggable => {
      //ドラッグ開始
      draggable.addEventListener('touchstart', (e) => {
          const touch = e.targetTouches[0]; 
          e.target.dataset.touchId = touch.identifier; 
          document.getElementById('container').appendChild(e.target);
          e.target.style.position = 'absolute'; 
          e.target.style.left = `${touch.clientX - e.target.offsetWidth / 2 - e.target.offsetParent.offsetLeft + window.scrollX}px`;
          e.target.style.top = `${touch.clientY - e.target.offsetHeight / 2 - e.target.offsetParent.offsetTop + window.scrollY}px`;
          e.target.dataset.moto = e.target.offsetParent.id;
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
          const tg = e.target
          document.getElementById(e.target.dataset.moto).appendChild(e.target);
          if (touch) { 
              tg.style.visibility = 'hidden'; 
              const dropzone = document.elementFromPoint(touch.clientX, touch.clientY).closest('.dropzone'); 
              tg.style.visibility = ''; 
              if (dropzone) { 
                  dropzone.appendChild(e.target);
                  if(dropzone.classList.contains('deck')){
                      dropzone.prepend(e.target);
                  }
              } 
              tg.style.left=''; 
              tg.style.top=''; 
          } 
          e.target.style.position = ''; 
          e.target.zIndex =e.target.dataset.zind;
          delete e.target.dataset.touchId;
          delete e.target.dataset.zind;
        arrangeImages()

      });
    });

    //カードのサイズ変更処理
    const cards = document.querySelectorAll('.card');
    const conr = document.querySelector('.container');
    const cardWidth = conr.clientWidth * 0.12;
    const cardHeight = cardWidth * 1.4;
    cards.forEach(card => {
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
    })

    //ボタンのメニュー設定
    menuBtns.forEach(menuBtn => {
        const contextMenu = document.getElementById(menuBtn.getAttribute('data-menu'));
        contextMenu.style.top = `${menuBtn.offsetTop}px`;

        menuBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${menuBtn.offsetLeft - contextMenu.offsetWidth}px`
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
                    btnAct(action);
                }
            });
            contextMenu.style.display = 'none';
        });
    })

    // モーダルを開く
    document.querySelectorAll('button[id^="openModal"]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.id.replace('open', '').toLowerCase();
            document.getElementById(modalId).style.display = "block";
        });
    });

    // モーダルを閉じる
    document.querySelectorAll('.close').forEach(span => {
        span.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).style.display = "none";
            document.getElementById(modalId).querySelector('.image-container').innerHTML='';
        });
    });

    // 選択した画像を移動する
    document.querySelectorAll('.move').forEach(button => {
        button.addEventListener('click', function() {
            const targetModal = this.getAttribute('data-target');
            const currentModal = this.closest('.modal');
            const srcModal = currentModal.getAttribute('data-src');
            const selectedImages = currentModal.querySelectorAll('.selected');
            const targetArea = document.querySelector(targetModal);
            const srcArea = document.querySelector(srcModal);
            selectedImages.forEach(img => {
                targetArea.appendChild(srcArea.querySelector('#' + img.id));
            });
            currentModal.style.display= "none";
            currentModal.querySelector('.image-container').innerHTML='';
        });
    });
  
    //デッキコードからデッキを読み込む
    document.getElementById('scrapeForm').addEventListener('submit', function(event) {
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
          const imageCnts = Array.from(doc.querySelectorAll('span')).filter(span=>span.id.includes('picNumView'))
          const cardTags = Array.from(doc.querySelectorAll('a.appendBtn.countBtnBlock')).map(a=>a.getAttribute('onclick').split('deck_')[1].substring(0,3));
          const deck = document.getElementById('deck');

          let deckIndex = 0;
          let cnt = 0;
          images.forEach(img => {
            const imgSrc = img.src;
            const baseUri = img.baseURI;
            const pokeUrl = 'https://www.pokemon-card.com/';
            for(let i = 0;i<Number(imageCnts[cnt].innerHTML);i++){
              deckIndex = deckIndex + 1;
              document.getElementById('card' + deckIndex).src = pokeUrl + imgSrc.replace(baseUri,'');
              document.getElementById('card' + deckIndex).alt = img.alt;
              document.getElementById('card' + deckIndex).dataset.tag=cardTags[cnt * 2];

            }
            cnt = cnt +1;
          });
        })
        .catch(error => {
            document.getElementById('result').innerText = 'エラーが発生しました';
            console.error('Error:', error);
        })
      .finally(() => {
          loadingDiv.style.display='none';
        });
    });
  
    //通信用
  
});
//初期読み込みend

//メニューボタン処理
function btnAct(actionNm){
    const modal = document.getElementById('modal');
    const targetContainer = modal.querySelector('.image-container');
    switch(actionNm){
      //カードを1枚引く
      case 'draw':
        if(deck.firstElementChild){
            hand.appendChild(deck.firstElementChild);
        }
        sendPhotonMessage(1,'カードを1枚引いた');
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
        modal.setAttribute('data-src','.deck');

        const deckCopy = Array.from(deck.children).map(child => child.cloneNode(true));

        deckCopy.forEach(img => {
            // 画像の選択イベントを追加
            img.addEventListener('click',(e) => {
                e.target.classList.toggle('selected');
            });
            targetContainer.appendChild(img);
        });
        modal.style.display = "block";
        break;
      //トラッシュの中身をモーダルで表示する
      case 'trash_show':
        modal.setAttribute('data-src','.trash');

        const trashCopy = Array.from(trash.children).map(child => child.cloneNode(true));

        trashCopy.forEach(img => {
            // 画像の選択イベントを追加
            img.addEventListener('click',(e) => {
                e.target.classList.toggle('selected');
            });
            targetContainer.appendChild(img);
        });
        modal.style.display = "block";
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
  const container = document.querySelectorAll('.arrange');
  container.forEach(cont =>{
    const images = cont.querySelectorAll('.card');
    const containerWidth = cont.clientWidth;
    const containerHeight = cont.clientHeight;

    images.forEach((img, index) => {
        const overlap = 20; // 重なり具合（ピクセル単位）
        const xOffset = (containerWidth / images.length) * index - overlap * index;
        const yOffset = (containerHeight / images.length) * index - overlap * index;
        img.style.left = `${xOffset}px`;
        //img.style.top = `${yOffset}px`;
    });
  });
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
