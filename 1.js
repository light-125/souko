(function() {
  const PROCESSED_KEY = 'data-script-wrapped';
  function convertScripts() {
  const scripts = document.querySelectorAll(`script:not([${PROCESSED_KEY}])`);
    scripts.forEach(script => {
      // 外部スクリプト(srcあり)や、すでに非同期属性があるものは対象外にする




        
      if (script.src || script.defer || script.async) return;

      const code = script.textContent.trim();
      if (!code) return;

      // すでにDOMContentLoadedの記述がある場合は二重処理を防ぐためスキップ
      if (code.includes('DOMContentLoaded')) return;

      // 元のスクリプト要素に処理済みマークをつけて無効化
      script.setAttribute(PROCESSED_KEY, 'true');

      // 新しいscriptタグを作成
      const newScript = document.createElement('script');
      newScript.setAttribute(PROCESSED_KEY, 'true');

      // 元のコードを IIFE (即時関数) と DOMContentLoaded で包む
      newScript.textContent = `
        document.addEventListener('DOMContentLoaded', function() {
          (function() {
            try {
              ${code}
            } catch (error) {
              console.error('Wrapped Script Error:', error);
            }
          })();
        });
      `;

      // 元のスクリプトの直前に挿入し、元のコードを空にして実行を阻止する
      script.parentNode.insertBefore(newScript, script);
      script.textContent = '';
    });
  }

  // 1. スクリプト読み込み時点で一度実行（それより上にあるスクリプト用）
  convertScripts();

  // 2. HTMLの解析に合わせて動的に追加されるタグを監視してリアルタイムに包む
  const observer = new MutationObserver(() => {
    convertScripts();
  });
  
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
