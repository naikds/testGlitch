// イメージの配置を調整する関数
export function arrangeImages() {
    //余計なスタイルは削除
    const allcard = document.querySelectorAll('.card');
    allcard.forEach(card => {
        card.style.left = '';
        card.style.top = '';
    })
  //とりあえずバグ対応
  bagReset()

    //手札
    arrangeHand();

    //バトル場・ベンチ
    arrangeBattleP1();
    arrangeBattleP2();

    //フリー
    arrangeFree();

    //スタジアム
    arrangeStudium();
  
}

//手札の配置を調整
function arrangeHand() {
    const hand = document.querySelector('.hand');
    let images = hand.querySelectorAll('.card');
    const handW = hand.clientWidth;
    const handCardWidth = 0.7;

    images.forEach((img, index) => {
        const overlap = img.clientWidth * handCardWidth; // 重なり具合（ピクセル単位）
        const xOffset = overlap * index;
        img.style.left = `${xOffset}px`;
    });
}

//p1のバトル場・ベンチの配置を調整
function arrangeBattleP1(){

    //バトル・ベンチ
    const cardSeter = document.querySelectorAll('.battle, .bench')
    const seterCardWidth = 0.3;

    cardSeter.forEach(seter => {
        let images = seter.querySelectorAll('.card');
        let gdsIndex = 0;
        let eneIndex = 0;
        images.forEach((img, index) => {
            img.style.top = '';
            img.style.left = '';
            const gdsoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
            const gdsxOffset = gdsoverlap * gdsIndex;

            const eneoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
            const enexOffset = eneoverlap * eneIndex;
            const eneyOffset = img.clientHeight / 2 - img.clientWidth / 2;

            if (img.classList.contains('pke')) {
                seter.querySelector('.b_pke').appendChild(img);
            } else if (img.classList.contains('too')) {
                img.style.left = `${gdsxOffset}px`;
                gdsIndex = gdsIndex + 1;
                seter.querySelector('.b_too').appendChild(img);
            } else if (img.classList.contains('ene')) {
                img.style.top = `${enexOffset - eneyOffset}px`;
                eneIndex = eneIndex + 1;
                seter.querySelector('.b_ene').appendChild(img);
            } else {
                document.getElementById(img.dataset.moto).appendChild(img);
                arrangeImages();
            }
        })
    })
}

//p2のバトル場・ベンチの配置を調整
function arrangeBattleP2(){
    //バトル・ベンチ
    const cardSeter = document.querySelectorAll('.p2_battle, .p2_bench')
    const seterCardWidth = 0.3;

    cardSeter.forEach(seter => {
        let images = seter.querySelectorAll('.p2_card');
        let gdsIndex = 0;
        let eneIndex = 0;
        images.forEach((img, index) => {
            img.style.top = '';
            img.style.left = '';
            const gdsoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
            const gdsxOffset = gdsoverlap * gdsIndex;

            const eneoverlap = img.clientWidth * seterCardWidth; // 重なり具合（ピクセル単位）
            const enexOffset = eneoverlap * eneIndex;
            const eneyOffset = img.clientHeight / 2 - img.clientWidth / 2;
            if (img.classList.contains('pke')) {
                seter.querySelector('.p2_b_pke').appendChild(img);
            } else if (img.classList.contains('too')) {
                img.style.left = `${gdsxOffset}px`;
                gdsIndex = gdsIndex + 1;
                seter.querySelector('.p2_b_too').appendChild(img);
            } else if (img.classList.contains('ene')) {
                img.style.top = `${enexOffset - eneyOffset}px`;
                eneIndex = eneIndex + 1;
                seter.querySelector('.p2_b_ene').appendChild(img);
            }
        })
    })
}

//フリーの配置を調整
function arrangeFree(){
    //フリー
    const free = document.querySelectorAll('.free')

    free.forEach(f => {
        let images = f.querySelectorAll('.card, .p2_card');
        images.forEach((img, index) => {
            img.style.top = '';
            img.style.left = '';
            const overlapx = img.clientWidth * 0.6; // 重なり具合（ピクセル単位）
            const overlapy = img.clientHeight * 0.3; // 重なり具合（ピクセル単位）
            const xOffset = overlapx * (index % 3);
            const yOffset = overlapy * Math.floor(index / 3);
            img.style.left = `${xOffset}px`;
            img.style.top = `${yOffset}px`
        })
    });
}

//スタジアムの配置を調整
function arrangeStudium(){
    //スタジアム
    const stadium = document.querySelectorAll('.stadium');
    stadium.forEach(s =>{
          let images = s.querySelectorAll('.card, .p2_card');
    images.forEach((img, index) => {
        img.style.top = '';
        img.style.left = '';
        const staoverlap = img.clientWidth * 0.7; // 重なり具合（ピクセル単位）
        const staxOffset = staoverlap * index;
        if(img.classList.contains('sta')){
            img.style.left = `${staxOffset}px`;
        }else{
            document.getElementById(img.dataset.moto).appendChild(img);
            arrangeImages();
        }
    });
  });
}


//変なところにいるカードを元の位置に戻す
function bagReset(){
    const container = document.getElementById('container');
    const images = container.querySelectorAll('.container > .card');
  
  images.forEach(img => {
    const par = document.getElementById(img.dataset.moto);
    par.appendChild(img);
  })
  
}