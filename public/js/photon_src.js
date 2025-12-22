import {arrangeImages} from './arrange.js';
import {coinChange} from './other.js';
import {showModalCardIds} from './modal.js';

//Photonサーバ系
// Photonサーバの設定
const appId = '09ff3dce-fed5-4215-8d3f-76310ae38875'; // 提供されたApp IDを使用
const appVersion = '1.0'; // アプリケーションバージョンを設定
const region = 'us'; // 使用するリージョンを設定（例：'us', 'eu', 'asia' など）

const result = document.getElementById('result');
const photonButton = document.getElementById('photonButton');

let roomJoinFlg = '0';

const client = new Photon.LoadBalancing.LoadBalancingClient(Photon.ConnectionProtocol.Wss, appId, appVersion);
client.connectOptions = { 
  keepAliveTimeout: 30000, // WebSocketのkeep-aliveタイムアウト（ミリ秒） 
  disconnectTimeout: 60000 // サーバーが応答しない場合のタイムアウト（ミリ秒）
}
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

//ルーム取得処理
client.onRoomList = function(rooms){
  const inputXmenu_ul = document.getElementById('inputXmenu_ul');
  inputXmenu_ul.querySelectorAll('[data-action="XroomJoin"]').forEach(child => child.remove());
  const listItem = document.getElementById('inputXmenu_temp');
  if(!rooms){return;}
  rooms.forEach(room => {
    const clone = listItem.content.cloneNode(true);
    clone.querySelector('.submenu-item').id = room.name;
    clone.querySelector('.submenu-item').dataset.xnum = room.name;
    clone.querySelector('.submenu-item').textContent = room.name;
    inputXmenu_ul.appendChild(clone);
  })
}
client.onRoomListUpdate = function(rooms){
  const inputXmenu_ul = document.getElementById('inputXmenu_ul');
  inputXmenu_ul.querySelectorAll('[data-action="XroomJoin"]').forEach(child => child.remove());
  const listItem = document.getElementById('inputXmenu_temp');
  if(!rooms){return;}
  rooms.forEach(room => {
    const clone = listItem.content.cloneNode(true);
    clone.querySelector('.submenu-item').id = room.name;
    clone.querySelector('.submenu-item').dataset.xnum = room.name;
    clone.querySelector('.submenu-item').textContent = room.name;
  })
}


//ルーム作成処理
export function createRoom(roomName){
  const carddata = document.getElementById('card1').alt;
  if((carddata == 'card')){
    result.innerHTML = 'デッキを読み込んで下さい';
    return;
  }
  if (roomName) {
    client.createRoom(roomName, { maxPlayers: 2 });
    client.joinRoom(roomName);
  }
}

//ルーム参加処理
export function joinRoom(roomName){
  const carddata = document.getElementById('card1').alt;
  if((carddata == 'card')){
    result.innerHTML = 'デッキを読み込んで下さい';
    return;
  }
  if (roomName) {
    client.connectToRegionMaster(region);
    client.joinRoom(roomName);
  }
}

export function reConnect(){
  client.connectToRegionMaster(region);
}


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
  
  if(code === 15){
    showCardModal(content);
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
    p2img.classList.remove('draggable');
    p2pare.appendChild(p2img);
  })
}

//カードの情報を送信
export function sendCardInfo(){
  const cards = document.querySelectorAll('#container .card');
  const srcList = Array.from(cards).map(img => img.id.match(/\d+/)[0] + getCardBoxNm(img.closest('.cardBox').id));
  
  sendPhotonMessage(7, srcList.join(''));
  
}

function setCardInfo(info){
  const cards = document.querySelectorAll('.p2_cardBox .p2_card');
  cards.forEach(card=>{
    document.getElementById('p2_deck').appendChild(card);
  });
   result.innerHTML = info;
  const regex= /(\d+)([a-zA-Z])/g;
  const matches = [];
  let match;
  
  while((match = regex.exec(info)) !== null){
    matches.push({num:match[1],let:match[2]});
  }
  matches.forEach(data=>{
    const p2img = document.getElementById('p2_card' + data.num);
    const p2pare=document.getElementById('p2_' + getCardBoxNm(data.let));
    p2pare.appendChild(p2img);
  })
  result.innerHTML = "カード受信";
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
export function sendCoin(coinOU){
  sendPhotonMessage(13, coinOU);
}

function setCoin(info){
  coinChange(info);
}

//モーダルで相手に通知する,cardIdsはカンマ区切りのid数字のみ
export function sendCardModal(cardIds){
  sendPhotonMessage(15, cardIds);
}

function showCardModal(cardIds){
  showModalCardIds(cardIds);
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

function getCardBoxNm(id){
  if(id == "deck"){return "a";}
  if(id == "a"){return "deck";}
  
  if(id == "hand"){return "b";}
  if(id == "b"){return "hand";}
  
  if(id == "trash"){return "c";}
  if(id == "c"){return "trash";}
  
  if(id == "battle"){return "d";}
  if(id == "d"){return "battle";}
  
  if(id == "free"){return "e";}
  if(id == "e"){return "free";}
  
  if(id == "stadium"){return "f";}
  if(id == "f"){return "stadium";}
  
  if(id == "side"){return "g";}
  if(id == "g"){return "side";}
  
  if(id == "bench1"){return "h";}
  if(id == "h"){return "bench1";}
  
  if(id == "bench2"){return "i";}
  if(id == "i"){return "bench2";}
  
  if(id == "bench3"){return "j";}
  if(id == "j"){return "bench3";}
  
  if(id == "bench4"){return "k";}
  if(id == "k"){return "bench4";}
  
  if(id == "bench5"){return "l";}
  if(id == "l"){return "bench5";}
  
  if(id == "bench6"){return "m";}
  if(id == "m"){return "bench6";}
  
  if(id == "bench7"){return "n";}
  if(id == "n"){return "bench7";}
  
  if(id == "bench8"){return "o";}
  if(id == "o"){return "bench8";}
  
}
