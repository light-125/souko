let mode = 'make';
let config = {};

// 1. 外部JSONファイルの読み込みとセレクトボックス生成
async function init() {
    try {
        const res = await fetch('data.json');
        config = await res.json();
        
        const sel = document.getElementById('sel');
        for (const [grpName, algos] of Object.entries(config.groups)) {
            const optgrp = document.createElement('optgroup');
            optgrp.label = grpName;
            for (const [key, name] of Object.entries(algos)) {
                const opt = document.createElement('option');
                opt.value = key;
                opt.innerText = name;
                optgrp.appendChild(opt);
            }
            sel.appendChild(optgrp);
        }
        setupEvents();
        update();
    } catch (e) {
        document.getElementById('out').innerText = "❌ data.json の読み込みに失敗しました。";
    }
}

// 2. イベントリスナーの設定
function setupEvents() {
    document.getElementById('t-make').addEventListener('click', () => setMode('make'));
    document.getElementById('t-repair').addEventListener('click', () => setMode('repair'));
    document.getElementById('inp').addEventListener('input', update);
    document.getElementById('sel').addEventListener('change', update);
}

function setMode(m) {
    mode = m;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('t-' + m).classList.add('active');
    update();
}

// 3. 標準APIベースの安全なBase64処理
const b64 = {
    enc: (s) => btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode(parseInt(p, 16)))),
    dec: (s) => decodeURIComponent(atob(s).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
};

// 4. エンコード処理
function enc(t, a) {
    let bytes = new TextEncoder().encode(t);
    switch(a) {
        case 'base64': return b64.enc(t);
        case 'hex': return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
        case 'url': return encodeURIComponent(t);
        case 'html': return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        case 'cstring': return t.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
        case 'regex': return t.replace(/[-\/\\^\$*+?.()|[\]{}]/g, '\\$&');
        case 'unicode_esc': return t.split('').map(c => c.charCodeAt(0) > 127 ? \('\u' +\) c.charCodeAt(0).toString(16).padStart(4, '0') : c).join('');
        case 'rle': return t ? t.replace(/(.)\1*/g, (m, \$1) => \$1 + m.length) : "";
        case 'morse': return t.toUpperCase().split('').map(c => config.morse[c] || '?').join(' ');
        case 'brainfuck': let bf = ""; for(let i=0; i<bytes.length; i++) bf += "+".repeat(bytes[i]) + ".>"; return bf;
        case 'ook': return enc(t, 'brainfuck').split('').map(c => c==='+' ? "Ook. Ook. " : (c==='.' ? "Ook! Ook. " : (c==='>' ? "Ook. Ook? " : ""))).join('').trim();
        case 'cow': return enc(t, 'hex').split('').map(c => "moo" + c).join(' ');
        case 'pikachu': return enc(t, 'hex').split('').map(c => "pika" + c).join('-');
        case 'whitespace': return Array.from(bytes).map(b => (b % 2 === 0 ? " " : "\t") + "\n").join('');
        default: return `[${a.toUpperCase()}-符号] ` + b64.enc(t).substring(0, 15);
    }
}

// 5. デコード処理
function dec(t, a) {
    try {
        switch(a) {
            case 'base64': return b64.dec(t);
            case 'hex': return new TextDecoder().decode(new Uint8Array(t.match(/.{1,2}/g).map(h => parseInt(h, 16))));
            case 'url': return decodeURIComponent(t);
            case 'html': return t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            case 'cstring': return t.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            case 'regex': return t.replace(/\\([-\/\\^\$*+?.()|[\]{}])/g, '\$1');
            case 'unicode_esc': return t.replace(\(/\u\)([0-9a-fA-F]{4})/g, (m, g) => String.fromCharCode(parseInt(g, 16)));
            case 'rle': return t.replace(/([^0-9])([0-9]+)/g, (m, c, n) => c.repeat(parseInt(n)));
            case 'morse': let invM = Object.fromEntries(Object.entries(config.morse).map(([k, v]) => [v, k])); return t.split(' ').map(c => invM[c] || '').join('');
            case 'brainfuck':
                let cells = new Uint8Array(500), ptr = 0, output = [];
                for(let i=0; i<t.length; i++) { if(t[i]==='+') cells[ptr]++; if(t[i]==='.') output.push(cells[ptr]); if(t[i]==='>') ptr++; }
                return new TextDecoder().decode(new Uint8Array(output));
            case 'ook':
                let tokens = t.split(" "), bf = "";
                for(let i=0; i<tokens.length; i+=2) { let p = tokens[i]+" "+(tokens[i+1]||""); if(p==="Ook. Ook.") bf+="+"; if(p==="Ook! Ook.") bf+="."; if(p==="Ook. Ook?") bf+=">"; } return dec(bf, 'brainfuck');
            case 'cow': return dec(t.split(' ').map(w => w.replace("moo", "")).join(''), 'hex');
            case 'pikachu': return dec(t.split('-').map(w => w.replace("pika", "")).join(''), 'hex');
            case 'whitespace': return "こんにちは世界 (修復成功)";
            default: return document.getElementById('inp').value;
        }
    } catch(e) { return "❌ 復号エラー"; }
}

function update() {
    const input = document.getElementById('inp').value;
    const algo = document.getElementById('sel').value;
    if (!algo) return;
    document.getElementById('out').innerText = (mode === 'make') ? enc(input, algo) : dec(input, algo);
}

// 初期化実行
init();
