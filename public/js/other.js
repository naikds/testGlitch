import {sendDamage,sendCoin} from './photon_src.js';
import {arrangeImages} from './arrange.js';


let p1DeckCode="";
let p2DeckCode="";

export function setOther(){
    //ダメカン処理
    const damageSels = document.querySelectorAll('.damageSel');
    damageSels.forEach(damageSel => {
        damageSel.addEventListener('change', function () {
            sendDamage();
        })
    })

    //コイン処理
    const coin = document.getElementById('coin');
    coin.addEventListener('pointerup', (e) => {
        let coinOU = 2;
        if (Math.random() > 0.5) {
          coinOU = 1;
        }
      
        sendCoin(coinOU);
        coinChange(coinOU);
    });
  
    //p2入れ替え処理
    const p2change = document.getElementById('btnChangePl');
    p2change.addEventListener('pointerup', (e) => {
      if(p1DeckCode==""){p1DeckCode=document.getElementById('urlInput').value;}
      if(document.getElementById('urlInput').value==p1DeckCode){
        document.getElementById('urlInput').value=p2DeckCode;
      }else{
        document.getElementById('urlInput').value=p1DeckCode;
      }
      
      document.querySelectorAll('.cardBox').forEach(cardBox=>{
        changeCard(cardBox.id);
      })
      
      changeDamage();
      arrangeImages();
      document.getElementById('aud_info').dataset.prNo = (document.getElementById('aud_info').dataset.prNo === '1')?'2':'1';
    });
}

export function coinChange(coinOU){
  const coinO = document.getElementById('coinO');
    coinO.style.display = 'block';
    coinO.classList.add('fade-in-out');

    setTimeout(()=>{
      coinO.classList.remove('fade-in-out');
      if(coinOU === 1){
        coinO.style.display = 'block';
      }else{
        coinO.style.display = 'none';
      }
    },1000);
}

function changeCard(id){
  const p1src = document.getElementById(id);
  const p2src = document.getElementById('p2_' + id);
  
  p1src.querySelectorAll('.card').forEach(card=>{
    p2src.appendChild(card);
  })
  
  p2src.querySelectorAll('.p2_card').forEach(card=>{
    p1src.appendChild(card);
  })
  
  p1src.querySelectorAll('.p2_card').forEach(card=>{
    card.id = card.id.replace('p2_','');
    card.classList.add('card');
    card.classList.add('draggable');
    card.classList.remove('p2_card');
  })
  
  p2src.querySelectorAll('.card').forEach(card=>{
    card.id = 'p2_' + card.id;
    card.classList.add('p2_card');
    card.classList.remove('draggable');
    card.classList.remove('card');
  })
}

function changeDamage(){
  const damages = document.querySelectorAll('.damageSel');
  
  damages.forEach(d=>{
    const dm = d.value;
    const p2d = document.getElementById('p2_' + d.id);
    d.value = p2d.textContent
    p2d.textContent = dm;
  });
}
