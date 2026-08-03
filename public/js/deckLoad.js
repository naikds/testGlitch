const LEGEND_STADIUM_MAP = {
  "伝説の溶岩洞": {
    leftImage: "images/yogan1.png",
    rightImage: "images/yogan2.png"
  },
  "伝説の海溝": {
    leftImage: "images/kaiko1.png",
    rightImage: "images/kaiko2.png"
  },
  "伝説の山頂": {
    leftImage: "images/santyo1.png",
    rightImage: "images/santyo2.png"
  }
};

const STORAGE_KEY = 'myApp_savedDeckData';

export function setDeckLoad(event){ // event引数を受け取れるようにしています
  // フォームのデフォルトの送信動作を防止（引数がない場合の安全策も入れておきます）
  if (event) event.preventDefault();
  else if (typeof window.event !== 'undefined') window.event.returnValue = false;

  // 入力されたデッキコードを読み込み
  const url = document.getElementById('urlInput').value;

  // ローディング用の目隠しをオン
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'block';

  // serverへの情報取得開始
  fetch('/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(response => response.json())
    .then(data => {
      // 取得結果の解析
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.body, 'text/html');
      // カードのurl(src),カードの名前（alt）を取得
      const images = doc.querySelectorAll('img');
      // 同名カードの枚数
      const imageCnts = Array.from(doc.querySelectorAll('span')).filter(span => span.id.includes('picNumView'));
      // カードの種類(pke,gds,ene,sup,sta,too)
      const cardTags = Array.from(doc.querySelectorAll('a.appendBtn.countBtnBlock')).map(a => a.getAttribute('onclick').split('deck_')[1].substring(0, 3));

      let deckIndex = 0;
      let cnt = 0;
      
      // ★修正1: ここで保存用の配列（箱）を用意する
      const cardStateList = [];

      images.forEach(img => {
        const legendConfig = LEGEND_STADIUM_MAP[img.alt];
        if(legendConfig){
          for(let i = 0; i < Number(imageCnts[cnt].innerHTML); i+=2){
            // 左側
            deckIndex = deckIndex + 1;
            setAndRecordCard(deckIndex, legendConfig.leftImage, img.alt, 'sta', cardStateList);
            
            // 右側
            deckIndex = deckIndex + 1;
            setAndRecordCard(deckIndex, legendConfig.rightImage, img.alt, 'sta', cardStateList);
          }
        }else{
          for (let i = 0; i < Number(imageCnts[cnt].innerHTML); i++) {
            deckIndex = deckIndex + 1;
            const tag = cardTags[cnt * 2] || '';
            setAndRecordCard(deckIndex, img.src, img.alt, tag, cardStateList);
          }
        }
        cnt = cnt + 1;
      });

      // まとめて保存
      const saveData = {
        url: url,
        cards: cardStateList,
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      } catch (e) {
        console.error("localStorageへの保存に失敗しました", e);
      }
      
    })
    .catch(error => {
      document.getElementById('result').innerText = 'エラーが発生しました';
      console.error('Error:', error);
    })
    .finally(() => {
      // 目隠しを外す
      loadingDiv.style.display = 'none';
    });
}

// ★修正2: 画面への反映とデータ記録を同時に行うヘルパー関数
function setAndRecordCard(index, src, alt, className, stateList) {
  const cardElem = document.getElementById('card' + index);
  if (!cardElem) return;

  cardElem.src = src;
  cardElem.alt = alt;
  if (className) {
    cardElem.classList.add(className);
  }

  // リストに記録
  stateList.push({
    index: index,
    src: src,
    alt: alt,
    className: className
  });
}

// 【復元処理】ページ読み込み時などに呼び出す関数
export function restoreDeckData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    
    // 入力フォームのURLを復元
    const urlInput = document.getElementById('urlInput');
    if (urlInput && data.url) {
      urlInput.value = data.url;
    }

    // 各カードの状態を復元
    if (data.cards && Array.isArray(data.cards)) {
      data.cards.forEach(cardData => {
        const cardElem = document.getElementById('card' + cardData.index);
        if (cardElem) {
          cardElem.src = cardData.src;
          cardElem.alt = cardData.alt;
          if (cardData.className) {
            cardElem.classList.add(cardData.className);
          }
        }
      });
    }
    console.log("前回のデッキ状態を復元しました！");
  } catch (e) {
    console.error("保存データのパースに失敗したため削除します", e);
    localStorage.removeItem(STORAGE_KEY);
  }
}
