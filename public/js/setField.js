
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
    for (let i = 1; i <= 8; i++) {
        const clone = bench.content.cloneNode(true);
        clone.querySelector('.bench').id = `bench${i}`;
        clone.querySelector('.bench').style.left = `${(i - 1) * 20}%`;
        clone.querySelector('.b_pke').id = `b_pke${i}`;
        clone.querySelector('.b_too').id = `b_too${i}`;
        clone.querySelector('.b_ene').id = `b_ene${i}`;
        benchbox.appendChild(clone);
    }
    const p2_benchbox = document.getElementById('p2_benchbox');
    const p2_bench = document.getElementById('p2_bench');
    for (let i = 1; i <= 8; i++) {
        const clone = p2_bench.content.cloneNode(true);
        clone.querySelector('.p2_bench').id = `p2_bench${i}`;
        clone.querySelector('.p2_bench').style.left = `${(i - 1) * 20}%`;
        clone.querySelector('.p2_b_pke').id = `p2_b_pke${i}`;
        clone.querySelector('.p2_b_too').id = `p2_b_too${i}`;
        clone.querySelector('.p2_b_ene').id = `p2_b_ene${i}`;
        p2_benchbox.appendChild(clone);
    }

    //ベンチ情報を追加
    const mainCont = document.getElementById('container');
    const benchInfo = document.getElementById('benchInfo');
    for (let i = 1; i <= 8; i++) {
        const clone = benchInfo.content.cloneNode(true);
        clone.querySelector('.benchInfo').id = `benchInfo${i}`;
        clone.querySelector('.benchInfo').style.left = `${(i - 1) * 20}%`;
        //clone.querySelector('.menu').id = `benchInfo_menu${i}`;
        benchbox.appendChild(clone);
    }

    //ダメカンを追加
    const damageSel = document.getElementById('damageSel');

    for (let i = 1; i <= 8; i++) {
        const clone = damageSel.content.cloneNode(true);
        const selector = clone.querySelector('.damageSel');
        for (let j = 0; j < 400; j += 10) {
            const optionDamage = document.createElement('option');
            optionDamage.value = `${j}`;
            optionDamage.textContent = `${j}`;
            selector.appendChild(optionDamage);
        }
        selector.id = `damageSel${i}`;
        selector.style.left = `${2 + (i - 1) * 20}%`;
        benchbox.appendChild(clone);
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
     
    //p2ダメカンを追加
    const p2_damageSel = document.getElementById('p2_damageSel');

    for (let i = 1; i <= 8; i++) {
        const clone = p2_damageSel.content.cloneNode(true);
        const selector = clone.querySelector('.p2_damageSel');
        selector.id = `p2_damageSel${i}`;
        selector.style.left = `${2 + (i - 1) * 20}%`;
        p2_benchbox.appendChild(clone);
    }
  
  //menuBtnの配置を調整
  document.querySelectorAll('.menu').forEach(menu => {
    const menuPr = document.getElementById(menu.dataset.pr);
    const menuLf = menu.dataset.lf;
    const menuLfmg = menu.dataset.lfmg;
    const menuTop = menu.dataset.top;
    const menuTopmg = menu.dataset.topmg;
    
    menu.style.display = 'block';
    
    if(menuLf == 'l'){
      menu.style.left = `${menuPr.offsetLeft + menuPr.offsetWidth * Number(menuLfmg)}px`
    }else{
      menu.style.left = `${menuPr.offsetLeft - menu.offsetWidth * Number(menuLfmg)}px`
    }
    menu.style.left = `${menu.style.left / window.innerWidth}%`
    
    if(menuTop == 't'){
      menu.style.top = `${menuPr.offsetTop * Number(menuTopmg)}px`
    }else{
      menu.style.top = `${menuPr.offsetTop - menu.offsetHeight * Number(menuTopmg)}px`
    }
    menu.style.top = `${menu.style.top / window.innerHeight}%`
    
    menu.style.display = 'none';
  });
  
}
