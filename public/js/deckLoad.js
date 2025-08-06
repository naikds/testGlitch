
export function setDeckLoad(){
  //デッキコードからデッキを読み込む
  // フォームのデフォルトの送信動作を防止
  event.preventDefault();
  //入力されたデッキコードを読み込み
  const url = document.getElementById('urlInput').value;

  //ローディング用の目隠しをオン
  const loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = 'block';

  //serverへの情報取得開始
  fetch('/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: url })
  })
    .then(response => response.json())
    .then(data => {
      //取得結果の解析
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.body, 'text/html');
      //カードのurl(src),カードの名前（alt）を取得
      const images = doc.querySelectorAll('img');
      //同名カードの枚数
      const imageCnts = Array.from(doc.querySelectorAll('span')).filter(span => span.id.includes('picNumView'))
      //カードの種類(pke,gds,ene,sup,sta,too)
      const cardTags = Array.from(doc.querySelectorAll('a.appendBtn.countBtnBlock')).map(a => a.getAttribute('onclick').split('deck_')[1].substring(0, 3));

      let deckIndex = 0;
      let cnt = 0;
      images.forEach(img => {

        for (let i = 0; i < Number(imageCnts[cnt].innerHTML); i++) {
          deckIndex = deckIndex + 1;
          document.getElementById('card' + deckIndex).src = img.src//カードのurl
          document.getElementById('card' + deckIndex).alt = img.alt;//カードの名前
          document.getElementById('card' + deckIndex).classList.add(cardTags[cnt * 2]);//カードの種類2
        }
        cnt = cnt + 1;
      });
    })
    .catch(error => {
      document.getElementById('result').innerText = 'エラーが発生しました';
      console.error('Error:', error);
    })
    .finally(() => {
      //目隠しを外す
      loadingDiv.style.display = 'none';
    });
}
