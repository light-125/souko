/**
 * ⚡ DataURL Minifier テスト用スクリプト
 * 改行コード、バッククォート、エスケープ文字が混在する複雑な構成です。
 */
!function(){
  const marker = "data-script-wrapped";
  
  function runTest() {
    console.log("=== テスト用スクリプトが正常にデコードされました ===");
    
    // 1. あえて本物の改行を含むヒアドキュメント（バッククォート）のテスト
    const multilineText = `
      このテキストは
      複数行にわたる
      改行を含んでいます。
    `;
    console.log("改行テキスト:", multilineText.trim());

    // 2. 文字列としての「\n」や特殊文字のエスケープテスト
    const escapeTest = "一行目\n二行目\tタブ文字\n\"ダブルクォーテーション\"";
    console.log("エスケープテスト:\n", escapeTest);

    // 3. 複雑なDOM操作とイベントリスナーのテスト
    document.querySelectorAll(`script:not([${marker}])`).forEach(script => {
      if (script.src) return;
      
      script.setAttribute(marker, "true");
      console.log("対象のインラインスクリプトを検出しました:", script);
      
      // 動的スクリプト生成（文字列内の改行コードテスト）
      const newScript = document.createElement("script");
      newScript.textContent = `
        console.log('インラインスクリプトのラップ処理に成功しました。');
        // 特殊コードの埋め込みテスト: \n \t \\
      `;
      
      // 安全に挿入
      if (script.parentNode) {
        script.parentNode.insertBefore(newScript, script);
      }
    });
  }

  // DOMContentLoadedのタイミング、またはすでにロード済みなら即時実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runTest);
  } else {
    runTest();
  }
}();
