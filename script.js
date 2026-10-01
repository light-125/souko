var qNum = 1, maxQ = 15, correct = 0, incorrect = 0, RAM_A, RAM_B, RAM_Ans, RAM_Rem;
var storage = window.localStorage || { getItem: function() { return null; }, setItem: function() {} };

function getNum() {
    var mode = $('input[name="difficulty"]:checked').val();
    var d = mode === 'EASY' ? 1 : mode === 'MEDIUM' ? 2 : mode === 'HARD' ? 3 : Math.floor(Math.random() * 7) + 4;
    var min = d === 1 ? 2 : Math.pow(10, d - 1), max = Math.pow(10, d) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion() {
    do { RAM_A = getNum(); RAM_B = getNum(); } while (RAM_A === RAM_B);
    if (RAM_B > RAM_A) { var t = RAM_A; RAM_A = RAM_B; RAM_B = t; }
    RAM_Ans = Math.floor(RAM_A / RAM_B);
    RAM_Rem = RAM_A % RAM_B;

    $('.question-display').removeClass('animate__animated animate__fadeInLeft animate__shakeX');
    setTimeout(function() {
        $('.question-display').addClass('animate__animated animate__fadeInLeft').text(RAM_A + ' ÷ ' + RAM_B + ' = ? あまり ? ');
    }, 10);
}

function checkAnswer() {
    var k = $('#kotae').val(), a = $('#amari').val();
    if (k === '' || a === '') return swal('おっと！', '両方入力してください。', 'warning');

    if (Number(k) === RAM_Ans && Number(a) === RAM_Rem) {
        correct++;
        nextStep();
    } else {
        incorrect++;
        $('.question-display').removeClass('animate__animated animate__fadeInLeft').addClass('animate__animated animate__shakeX');
        setTimeout(nextStep, 600);
    }
}

function nextStep() {
    $('#kotae, #amari').val('');
    if (qNum >= maxQ) {
        var total = correct + incorrect, rate = total > 0 ? Math.round((correct / total) * 100) : 0;
        var hi = Math.max(correct, Number(storage.getItem('m_hi')) || 0);
        var play = (Number(storage.getItem('m_pl')) || 0) + 1;
        var all = (Number(storage.getItem('m_al')) || 0) + correct;
        storage.setItem('m_hi', hi); storage.setItem('m_pl', play); storage.setItem('m_al', all);

        swal({
            title: '🎉 15問終了！',
            html: '<div style="text-align:left; font-size:1.2rem; line-height:1.8;">・正解数: <b>'+correct+'</b> 問<br>・不正解数: <b>'+incorrect+'</b> 問<br>・正解率: <b>'+rate+'</b> %<br><hr>・過去最高: <b>'+hi+'</b> 問<br>・過去平均: <b>'+(Math.round((all/play)*10)/10)+'</b> 問</div>',
            type: 'success', confirmButtonText: '挑戦する'
        }).then(resetGame);
    } else {
        qNum++;
        $('.count').text(qNum);
        makeQuestion();
        $('#kotae').focus();
    }
}

function resetGame() { qNum = 1; correct = incorrect = 0; $('.count').text(qNum); updateScore(); makeQuestion(); $('#kotae').focus(); }
function updateScore() {
    var pl = Number(storage.getItem('m_pl')) || 0;
    $('#hi-disp').text(storage.getItem('m_hi') || 0);
    $('#avg-disp').text(pl > 0 ? Math.round((Number(storage.getItem('m_al')) / pl) * 10) / 10 : 0);
}

$(document).ready(function() {
    updateScore(); makeQuestion(); $('#kotae').focus();
    $('input[name="difficulty"]').change(resetGame);
    $('#next-btn').click(checkAnswer);
    $('#kotae, #amari').keypress(function(e) { if (e.which === 13) checkAnswer(); });
});