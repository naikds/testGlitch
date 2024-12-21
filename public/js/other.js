import {sendDamage,sendCoin} from './photon_src.js';

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
    coin.addEventListener('touchend', (e) => {
        let coinOU = 2;
        if (Math.random() > 0.5) {
          coinOU = 1;
        }
      
        sendCoin(coinOU);
        coinChange(coinOU);
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
