import {arrangeImages} from './arrange.js';

//Photonサーバ系
// Photonサーバの設定
const appId = '09ff3dce-fed5-4215-8d3f-76310ae38875'; // 提供されたApp IDを使用
const appVersion = '1.0'; // アプリケーションバージョンを設定
const region = 'us'; // 使用するリージョンを設定（例：'us', 'eu', 'asia' など）

const roomInput = document.getElementById('roomInput');
const result = document.getElementById('result');
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
  const carddata = document.getElementById('card1').alt;
  if((carddata == 'card')){
    result.innerHTML = 'デッキを読み込んで下さい';
    return;
  }
  if (roomName) {
    client.connectToRegionMaster(region);
    client.createRoom(roomName, { maxPlayers: 2 });
    client.joinRoom(roomName);
  }else{
    result.innerHTML = 'ルーム番号を入力してください';
  }
});

//メッセージ送信
export function sendPhotonMessage(code, message) {
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
export function sendFirstCardInfo() {
  const cards = document.querySelectorAll('img.card');
  
  const srcList = Array.from(cards).map(img => img.id + "@" + img.src + "@" + getTagName(img));
  sendPhotonMessage(3, srcList.join(','));
}

function setFirstCardInfo(info) {
  const imgdata = info.split(',');
  imgdata.forEach(data=>{
    const datasrc = data.split('@');
    const p2img = document.getElementById('p2_' + datasrc[0])
    const p2pare=document.getElementById('p2_deck');
    p2img.src = datasrc[1];
    p2img.classList.add(datasrc[2]);
    p2pare.appendChild(p2img);
  })
}

//カードの情報を送信(移動したやつだけ)
export function sendCardInfo(){
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
export function sendDamage(){
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
export function sendplayerInfo(){
    const hand = document.getElementById('hand');
    const deck = document.getElementById('deck');
    const side = document.getElementById('side');
  sendPhotonMessage(11, `敵　手札：${hand.children.length}枚　デッキ：${deck.children.length}枚　サイド：${side.children.length}枚`);
}

function setplayerInfo(info){
  const p2info = document.getElementById('p2Info');
  p2info.textContent = info;
}

//コイン情報の送信
export function sendCoin(){
  const coin = document.getElementById('coin');
  sendPhotonMessage(13, coin.textContent+','+getComputedStyle(coin).backgroundColor);
}

function setCoin(info){
  const coinData = info.split(',');
  const coin = document.getElementById('coin');
  coin.textContent = coinData[0];
  coin.style.backgroundColor = coinData[1];
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

function getTagName(card){
  if(card.classList.contains('pke')){return 'pke';}
  if(card.classList.contains('too')){return 'too';}
  if(card.classList.contains('ene')){return 'ene';}
  if(card.classList.contains('sup')){return 'sup';}
  if(card.classList.contains('sta')){return 'sta';}
  if(card.classList.contains('gds')){return 'gds';}
  return '';
}