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
const aud_info = document.getElementById('aud_info');

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
  if(isPlayer()){
    //カード情報をルームプロパティへ登録する
    setCardSrcInfo();
  }else{
    //p1とp2を入れ替えるボタンを表示する
    const p2chbtn = document.getElementById('btnChangePl');
    p2chbtn.style.visibility = '';
    aud_info.dataset.prno = actors.slice(0, 2).map(a => a.actorNr)[0];

    //ルームに登録されているカード情報を取得する
    getCardInfo();
  }
};

// ルーム作成成功時の処理
client.onCreatedRoom = function () {
  console.log(`Created room: ${client.myRoom().name}`);
};

// ルームが見つからなかった場合の処理
client.onJoinRoomFailed = function (errorCode, errorMessage) {
    console.log(`Room not found. Please create the room.`);
};

// エラー処理
client.onError = function (errorCode, errorMessage) {
  console.error(`Photon error: ${errorCode} - ${errorMessage}`);
};

//ルーム取得処理
let roomList;
client.onRoomList = function(rooms){
  const inputXmenu_ul = document.getElementById('inputXmenu_ul');
  inputXmenu_ul.querySelectorAll('[data-action="XroomJoin"]').forEach(child => child.remove());
  const listItem = document.getElementById('inputXmenu_temp');
  if(!rooms){return;}
  roomList = rooms;
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
    inputXmenu_ul.appendChild(clone);
  })
}

client.onMyRoomPropertiesChange = function () {
  //プロパティが更新されたらボード情報を更新
  getBoardInfo();
}


//ルーム作成処理
export function createRoom(roomName){
  const carddata = document.getElementById('card1').alt;
  if((carddata == 'card')){
    result.innerHTML = 'デッキを読み込んで下さい';
    return;
  }
  if (roomName) {
    client.createRoom(roomName, { maxPlayers: 10 });
    client.joinRoom(roomName);
  }
}

//ルーム参加処理
export function joinRoom(roomName){
  const roomPct = roomList.find(r=>r.name == roomName).playerCount;

  //ルーム内の人数が二人未満ならデッキチェック
  if(roomPct < 2){
    const carddata = document.getElementById('card1').alt;
    if((carddata == 'card')){
      result.innerHTML = 'デッキを読み込んで下さい';
      return;
    }
  }
  
  if (roomName) {
    client.connectToRegionMaster(region);
    client.joinRoom(roomName);
  }
}

export function reConnect(){
  client.connectToRegionMaster(region);
}

function computeRoles() {
  const room = client.myRoom();
  if (!room || !room.loadBalancingClient.actors) return { isPlayer: false, playerActorNrs: [] };
  const actors = Object.values(room.loadBalancingClient.actors); // Photon.LoadBalancing.Actorの配列化
  actors.sort((a, b) => a.actorNr - b.actorNr);
  const playerActorNrs = actors.slice(0, 2).map(a => a.actorNr);
  const myNr = client.myActor().actorNr;
  const isPlayer = playerActorNrs.includes(myNr);
  return { isPlayer, playerActorNrs };
}

//カード情報をプロパティに登録
function setCardSrcInfo(){
  const pr_myNr = 'pr_' + String(client.myActor().actorNr);

  const cards = document.querySelectorAll('img.card');

  const srcList = Array.from(cards).map(img => img.id + "@" + img.src + "@" + getTagName(img));
  client.myRoom().setCustomProperties({ [pr_myNr]: srcList.join(',')});
}

function getCardInfo(){
  const playerActorNrs = actors.slice(0, 2).map(a => a.actorNr);
  playerActorNrs.forEach(actno=>{
    //
    if(client.myActor().actorNr == actno) return;
    const _pr = 'pr_' + actno;
    const aud_prno = aud_info.dataset.prno;
    let pare_pre = '';
    if(aud_prno != String(actno)){
      pare = 'p2_'
    }

    const cardInfo = client.myRoom().getCustomProperties()[_pr];
    const imgdata = cardInfo.split(',');

    imgdata.forEach(data=>{
      const datasrc = data.split('@');
      const img = document.getElementById(pare_pre + datasrc[0])
      const pare=document.getElementById(pare_pre + 'deck');
      img.src = datasrc[1];
      img.classList.add(datasrc[2]);
      img.classList.remove('draggable');
      pare.appendChild(img);
    })
  })
}

export function setBoardInfo(){
  //カード位置情報
  const cards = document.querySelectorAll('#container .card');
  const cards_srcList = Array.from(cards).map(img => img.id.match(/\d+/)[0] + getCardBoxNm(img.closest('.cardBox').id)).join(',');

  //ダメカン情報
  const damages = document.querySelectorAll('.damageSel');
  const damages_srcList = Array.from(damages).map(damage => damage.id + "@" + damage.value).join(',');

  //プレイヤー情報
  const hand = document.getElementById('hand');
  const deck = document.getElementById('deck');
  const side = document.getElementById('side');
  const plInfo_src = `敵　手札：${hand.children.length}枚　デッキ：${deck.children.length}枚　サイド：${side.children.length}枚`;

  const srcAll = {
    cards:cards_srcList,
    damages:damages_srcList,
    plInfo:plInfo_src
  }

  const bd_myNr = 'bd' +  + String(client.myActor().actorNr);
  client.myRoom().setCustomProperties({ [bd_myNr]: JSON.stringify(srcAll)});
}

function getBoardInfo(){
  const playerActorNrs = actors.slice(0, 2).map(a => a.actorNr);
  playerActorNrs.forEach(actno=>{
    if(client.myActor().actorNr == actno) return;
    const _bd = 'bd_' + actno;
    const aud_prno = aud_info.dataset.prno;
    let pare_pre = '';
    if(aud_prno != String(actno)){
      pare = 'p2_'
    }

    const boardInfo = client.myRoom().getCustomProperties()[_bd];
    setCardInfo(boardInfo.cards,pare_pre);
    setDamage(boardInfo.damages,pare_pre);
    setplayerInfo(boardInfo.plInfo,pare_pre);
  })
}

function isPlayer() {
  return computeRoles().isPlayer;
}

//メッセージ送信
export function sendPhotonMessage(code, message) {
  //プレイヤーのみ送信可
  if (message && isPlayer()) {
    client.raiseEvent(code, message);
  }
}

// メッセージ受信処理
client.onEvent = function (code, content, actorNr) {
  console.log(`Received event: ${code} from ${actorNr} with content: ${content}`);
  if (code === 1) { // コード1はメッセージイベントとします
    result.innerHTML = `Message from ${actorNr}: ${content}`;
  }
  
  if(code === 13){
    setCoin(content);
  }
  
  if(code === 15){
    showCardModal(content);
  }
};

function setCardInfo(info,pltxt){
  const cards = document.querySelectorAll(`.${pltxt}cardBox .${pltxt}card`);
  cards.forEach(card=>{
    document.getElementById(`${pltxt}deck`).appendChild(card);
  });

  const regex= /(\d+)([a-zA-Z])/g;
  const matches = [];
  let match;
  
  while((match = regex.exec(info)) !== null){
    matches.push({num:match[1],let:match[2]});
  }
  matches.forEach(data=>{
    const p2img = document.getElementById(pltxt + 'card' + data.num);
    const p2pare=document.getElementById(pltxt+ getCardBoxNm(data.let));
    p2pare.appendChild(p2img);
  })
  arrangeImages();
}

function setDamage(info,pltxt){
  const damageData = info.split(',');
  damageData.forEach(data=>{
    const datasrc = data.split('@');
    const p2damage = document.getElementById(pltxt+ datasrc[0]);
    if(pltxt=== ''){
      p2damage.value=datasrc[1];
    }else{
      p2damage.textContent = datasrc[1];
    }
  })
}

function setplayerInfo(info,pltxt){
  let _pltxt = (pltxt === '')?'p1':'p2'
  const p2info = document.getElementById(_pltxt+'Info');
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
  if(isPlayer()){
    showModalCardIds(cardIds);
  }
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


const nameToCode = {
  deck: "a",
  hand: "b",
  trash: "c",
  battle: "d",
  free: "e",
  stadium: "f",
  side: "g",
  bench1: "h",
  bench2: "i",
  bench3: "j",
  bench4: "k",
  bench5: "l",
  bench6: "m",
  bench7: "n",
  bench8: "o",
};

const codeToName = Object.fromEntries(
  Object.entries(nameToCode).map(([name, code]) => [code, name])
);

function getCardBoxNm(key) {
  return nameToCode[key] ?? codeToName[key] ?? undefined;
}
