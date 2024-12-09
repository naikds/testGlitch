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
        if (Math.random() > 0.5) {
            coin.textContent = "裏"
        } else {
            coin.textContent = "表"
        }
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 4; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        coin.style.backgroundColor = color + 'FF';
        sendCoin();
    });
}
