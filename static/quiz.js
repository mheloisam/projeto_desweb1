const quizAtual = questoes.slice().sort(function () {
  return Math.random() - 0.5;
});

let quizIndex = 0;
let acertos = 0;
const total = questoes.length;

function mostrarQuestao() {
  const q = quizAtual[quizIndex];

  document.getElementById('quiz-bar').style.width = (quizIndex / total * 100) + '%';
  document.getElementById('quiz-count').textContent = 'Questão ' + (quizIndex + 1) + ' de ' + total;
  document.getElementById('quiz-pergunta').textContent = q.enunciado;
  document.getElementById('btn-proxima').style.display = 'none';

  const opcoes = document.getElementById('quiz-opcoes');
  opcoes.innerHTML = q.alternativas.map(function (alt, i) {
    return '<button class="option-btn" data-index="' + i + '">' + alt + '</button>';
  }).join('');

  opcoes.querySelectorAll('.option-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      responder(btn, parseInt(btn.dataset.index), q.correta);
    });
  });
}

function responder(btn, escolhida, correta) {
  document.querySelectorAll('.option-btn').forEach(function (b) {
    b.disabled = true;
  });

  if (escolhida === correta) {
    btn.classList.add('correct');
    acertos++;
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn')[correta].classList.add('correct');
  }

  document.getElementById('btn-proxima').style.display = 'block';
}

document.getElementById('btn-proxima').addEventListener('click', function () {
  quizIndex++;
  if (quizIndex < total) {
    mostrarQuestao();
  } else {
    document.getElementById('input-acertos').value = acertos;
    document.getElementById('input-total').value = total;
    document.getElementById('form-resultado').submit();
  }
});

mostrarQuestao();
