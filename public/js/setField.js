
export function setField(){
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

    //ベンチを追加
    const benchbox = document.getElementById('benchbox');
    const bench = document.getElementById('bench');
    for (let i = 1; i <= 5; i++) {
        const clone = bench.content.cloneNode(true);
        clone.querySelector('.bench').id = `bench${i}`;
        clone.querySelector('.b_pke').id = `b_pke${i}`;
        clone.querySelector('.b_too').id = `b_too${i}`;
        clone.querySelector('.b_ene').id = `b_ene${i}`;
        benchbox.appendChild(clone);
    }
    const p2_benchbox = document.getElementById('p2_benchbox');
    const p2_bench = document.getElementById('p2_bench');
    for (let i = 1; i <= 5; i++) {
        const clone = p2_bench.content.cloneNode(true);
        clone.querySelector('.bench').id = `p2_bench${i}`;
        clone.querySelector('.p2_b_pke').id = `p2_b_pke${i}`;
        clone.querySelector('.p2_b_too').id = `p2_b_too${i}`;
        clone.querySelector('.p2_b_ene').id = `p2_b_ene${i}`;
        p2_benchbox.appendChild(clone);
    }

    //ベンチ情報を追加
    const mainCont = document.getElementById('container');
    const benchInfo = document.getElementById('benchInfo');
    for (let i = 1; i <= 5; i++) {
        const clone = benchInfo.content.cloneNode(true);
        clone.querySelector('.benchInfo').id = `benchInfo${i}`;
        clone.querySelector('.benchInfo').style.left = `${4 + (i - 1) * 16.6}%`;
        clone.querySelector('.benchInfo').dataset.menu = `benchInfo_menu${i}`;
        clone.querySelector('.menu').id = `benchInfo_menu${i}`;
        mainCont.appendChild(clone);
    }

    //ダメカンを追加
    const damageSel = document.getElementById('damageSel');

    for (let i = 1; i <= 5; i++) {
        const clone = damageSel.content.cloneNode(true);
        const selector = clone.querySelector('.damageSel');
        for (let j = 0; j < 400; j += 10) {
            const optionDamage = document.createElement('option');
            optionDamage.value = `${j}`;
            optionDamage.textContent = `${j}`;
            selector.appendChild(optionDamage);
        }
        selector.id = `damageSel${i}`;
        selector.style.left = `${4 + (i - 1) * 16.6}%`;
        mainCont.appendChild(clone);
    }
    const clone = damageSel.content.cloneNode(true);
    const selector = clone.querySelector('.damageSel');
    for (let j = 0; j < 400; j += 10) {
      const optionDamage = document.createElement('option');
      optionDamage.value = `${j}`;
      optionDamage.textContent = `${j}`;
      selector.appendChild(optionDamage);
    }
    clone.querySelector('.damageSel').id = `damageSel_battle`;
    clone.querySelector('.damageSel').style.top = `${38}%`;
    clone.querySelector('.damageSel').style.left = `${38}%`;
    mainCont.appendChild(clone);
  
  const testDeck = document.getElementById('testDeck');
  if(false){
    deck.innerHTML = '';
    while(testDeck.firstChild){
      deck.appendChild(testDeck.firstChild);
    }
  }else{
    testDeck.innerHTML = '';
  }
}