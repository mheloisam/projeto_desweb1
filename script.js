let simulados = [];
let simuladoAtual = null;
let quizAtual = [];
let quizIndex = 0;
let acertos = 0;
let totalFeitos = 0;
let melhorNota = null;
let somaNotas = 0;
let nomeUsuario = 'Estudante';
let emailUsuario = '';
let historico = [];

// Navegação entre TELAS (screens)
function irTela(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// Navegação dentro do APP (app-screens)
function irApp(id) {
  document.querySelectorAll('.app-screen').forEach(function (s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');

  // Atualiza item ativo no sidebar
  document.querySelectorAll('.nav-item').forEach(function (n) {
    n.classList.remove('active');
  });
  const navMap = {
    'screen-painel':    'nav-simulados',
    'screen-historico': 'nav-historico',
    'screen-perfil':    'nav-perfil',
  };
  if (navMap[id]) {
    const el = document.getElementById(navMap[id]);
    if (el) el.classList.add('active');
  }
}

// Login
document.getElementById('btn-login').addEventListener('click', function () {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  let ok = true;

  document.getElementById('err-email').style.display = 'none';
  document.getElementById('err-senha').style.display = 'none';

  if (!email.includes('@') || !email.includes('.')) {
    document.getElementById('err-email').style.display = 'block';
    ok = false;
  }
  if (senha.length < 6) {
    document.getElementById('err-senha').style.display = 'block';
    ok = false;
  }

  if (ok) {
    emailUsuario = email;
    nomeUsuario = email.split('@')[0];
    entrarNoApp();
  }
});

document.getElementById('link-cadastro').addEventListener('click', function (e) {
  e.preventDefault();
  irTela('screen-cadastro');
});


// Cadastro
document.getElementById('btn-cadastro').addEventListener('click', function () {
  const nome = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim();
  const senha = document.getElementById('cad-senha').value;

  document.getElementById('err-cad-senha').style.display = 'none';

  if (senha.length < 6) {
    document.getElementById('err-cad-senha').style.display = 'block';
    return;
  }

  nomeUsuario = nome || 'Estudante';
  emailUsuario = email;
  entrarNoApp();
});

document.getElementById('link-login').addEventListener('click', function (e) {
  e.preventDefault();
  irTela('screen-login');
});


function entrarNoApp() {
  // Atualiza sidebar
  document.getElementById('sidebar-nome').textContent = nomeUsuario;
  document.getElementById('sidebar-email').textContent = emailUsuario || '—';
  document.getElementById('sidebar-avatar').textContent = nomeUsuario.charAt(0).toUpperCase();

  // Atualiza perfil
  document.getElementById('perfil-nome').textContent = nomeUsuario;
  document.getElementById('perfil-email').textContent = emailUsuario || '—';
  document.getElementById('perfil-avatar').textContent = nomeUsuario.charAt(0).toUpperCase();

  atualizarStats();
  renderSimulados();
  irTela('screen-app');
  irApp('screen-painel');
}

// Sair
document.getElementById('btn-sair').addEventListener('click', function () {
  document.getElementById('modal-confirmar-sair').style.display = 'flex';
});

document.getElementById('btn-cancelar-sair').addEventListener('click', function () {
  document.getElementById('modal-confirmar-sair').style.display = 'none';
});

document.getElementById('btn-confirmar-sair').addEventListener('click', function () {
  document.getElementById('modal-confirmar-sair').style.display = 'none';
  irTela('screen-login');
});


// Nav Sidebar
document.getElementById('nav-simulados').addEventListener('click', function () {
  renderSimulados();
  irApp('screen-painel');
});

document.getElementById('nav-historico').addEventListener('click', function () {
  renderHistorico();
  irApp('screen-historico');
});

document.getElementById('nav-perfil').addEventListener('click', function () {
  atualizarPerfil();
  irApp('screen-perfil');
});


// Botão voltar (dentro do simulado)
document.getElementById('btn-voltar-painel').addEventListener('click', function () {
  renderSimulados();
  irApp('screen-painel');
});

// Botão voltar do navegador
window.addEventListener('popstate', function (e) {
  const tela = document.querySelector('.app-screen.active');
  if (tela && tela.id === 'screen-simulado') {
    renderSimulados();
    irApp('screen-painel');
  }
});

// Modal: Novo simulado
document.getElementById('btn-novo-simulado').addEventListener('click', function () {
  document.getElementById('novo-sim-titulo').value = '';
  document.getElementById('novo-sim-materia').value = '';
  document.getElementById('err-novo-sim').style.display = 'none';
  document.getElementById('modal-novo-simulado').style.display = 'flex';
});

document.getElementById('btn-cancelar-sim').addEventListener('click', function () {
  document.getElementById('modal-novo-simulado').style.display = 'none';
});

document.getElementById('modal-novo-simulado').addEventListener('click', function (e) {
  if (e.target === this) this.style.display = 'none';
});

document.getElementById('btn-confirmar-sim').addEventListener('click', function () {
  const titulo = document.getElementById('novo-sim-titulo').value.trim();
  const materia = document.getElementById('novo-sim-materia').value.trim() || 'Geral';
  const errEl = document.getElementById('err-novo-sim');

  if (!titulo) {
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  simulados.push({ titulo: titulo, materia: materia, questoes: [] });
  document.getElementById('modal-novo-simulado').style.display = 'none';
  atualizarStats();
  renderSimulados();
});

function renderSimulados() {
  const lista = document.getElementById('lista-simulados');

  if (!simulados.length) {
    lista.innerHTML = '<p class="empty">Nenhum simulado criado ainda. Clique em "+ Novo simulado" para começar.</p>';
    return;
  }

  lista.innerHTML = '<div class="simulados-grid">' +
    simulados.map(function (sim, i) {
      const nq = sim.questoes.length;
      return '<div class="simulado-card" data-index="' + i + '">' +
        '<h3>' + sim.titulo + '</h3>' +
        '<p class="sim-materia">' + sim.materia + '</p>' +
        '<div class="simulado-card-footer">' +
          '<span class="badge badge-purple">' + nq + ' ' + (nq === 1 ? 'questão' : 'questões') + '</span>' +
          '<button class="btn-remover-sim" data-index="' + i + '">remover</button>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  lista.querySelectorAll('.simulado-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-remover-sim')) return;
      abrirSimulado(parseInt(card.dataset.index));
    });
  });

  lista.querySelectorAll('.btn-remover-sim').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      simulados.splice(parseInt(btn.dataset.index), 1);
      atualizarStats();
      renderSimulados();
    });
  });
}

function abrirSimulado(index) {
  simuladoAtual = index;
  const sim = simulados[index];

  document.getElementById('simulado-titulo').textContent = sim.titulo;
  document.getElementById('simulado-materia-desc').textContent = sim.materia;

  // Resetar tabs
  document.querySelectorAll('#screen-simulado .tab').forEach(function (t) {
    t.classList.remove('active');
  });
  document.querySelectorAll('#screen-simulado .tab-content').forEach(function (c) {
    c.style.display = 'none';
  });
  document.querySelector('#screen-simulado .tab[data-tab="tab-questoes-sim"]').classList.add('active');
  document.getElementById('tab-questoes-sim').style.display = 'block';

  limparFormQuestao();
  renderQuestoes();

  // Empurra estado no histórico do navegador para o botão voltar funcionar
  history.pushState({ tela: 'simulado' }, '');
  irApp('screen-simulado');
}


// Tabs simulado
document.querySelectorAll('#screen-simulado .tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('#screen-simulado .tab').forEach(function (t) {
      t.classList.remove('active');
    });
    document.querySelectorAll('#screen-simulado .tab-content').forEach(function (c) {
      c.style.display = 'none';
    });
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).style.display = 'block';
  });
});

function renderQuestoes() {
  const lista = document.getElementById('lista-questoes-sim');
  const sim = simulados[simuladoAtual];

  if (!sim.questoes.length) {
    lista.innerHTML = '<p class="empty">Nenhuma questão ainda. Adicione a primeira!</p>';
    return;
  }

  lista.innerHTML = sim.questoes.map(function (q, i) {
    const badgeClass = q.dificuldade === 'Fácil' ? 'badge-green' : (q.dificuldade === 'Difícil' ? 'badge-red' : 'badge-gray');
    return '<div class="question-card">' +
      '<h3>' + (i + 1) + '. ' + q.enunciado + '</h3>' +
      '<div class="question-meta">' +
        '<span class="badge ' + badgeClass + '">' + q.dificuldade + '</span>' +
        '<button class="btn-remover" data-index="' + i + '">remover</button>' +
      '</div>' +
    '</div>';
  }).join('');

  lista.querySelectorAll('.btn-remover').forEach(function (btn) {
    btn.addEventListener('click', function () {
      simulados[simuladoAtual].questoes.splice(parseInt(btn.dataset.index), 1);
      atualizarStats();
      renderQuestoes();
      renderSimulados();
    });
  });
}


// Salvar questão
document.getElementById('btn-salvar-questao').addEventListener('click', function () {
  const enunciado = document.getElementById('q-enunciado').value.trim();
  const dificuldade = document.getElementById('q-dificuldade').value;
  const alternativas = [0, 1, 2, 3].map(function (i) {
    return document.getElementById('alt-' + i).value.trim();
  });
  const corretaEl = document.querySelector('input[name="correta"]:checked');
  const errEl = document.getElementById('err-questao');

  if (!enunciado || alternativas.some(function (a) { return !a; }) || !corretaEl) {
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  simulados[simuladoAtual].questoes.push({
    enunciado: enunciado,
    dificuldade: dificuldade,
    alternativas: alternativas,
    correta: parseInt(corretaEl.value)
  });

  limparFormQuestao();
  atualizarStats();
  renderQuestoes();
  renderSimulados();

  document.querySelector('#screen-simulado .tab[data-tab="tab-questoes-sim"]').click();
});

function limparFormQuestao() {
  document.getElementById('q-enunciado').value = '';
  [0, 1, 2, 3].forEach(function (i) {
    document.getElementById('alt-' + i).value = '';
  });
  const checked = document.querySelector('input[name="correta"]:checked');
  if (checked) checked.checked = false;
  document.getElementById('err-questao').style.display = 'none';
}

// Iniciar quiz
document.getElementById('btn-iniciar-quiz').addEventListener('click', function () {
  const sim = simulados[simuladoAtual];

  if (!sim.questoes.length) {
    alert('Adicione pelo menos uma questão antes de iniciar!');
    return;
  }

  quizAtual = sim.questoes.slice().sort(function () { return Math.random() - 0.5; });
  quizIndex = 0;
  acertos = 0;
  mostrarQuestao();
  irTela('screen-quiz');
});

function mostrarQuestao() {
  const q = quizAtual[quizIndex];
  const total = quizAtual.length;

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
  document.querySelectorAll('.option-btn').forEach(function (b) { b.disabled = true; });

  if (escolhida === correta) {
    btn.classList.add('correct');
    acertos++;
  } else {
    btn.classList.add('wrong');
    document.querySelectorAll('.option-btn')[correta].classList.add('correct');
  }

  document.getElementById('btn-proxima').style.display = 'block';
}


// Próxima questão
document.getElementById('btn-proxima').addEventListener('click', function () {
  quizIndex++;
  if (quizIndex < quizAtual.length) {
    mostrarQuestao();
  } else {
    finalizarQuiz();
  }
});


// Sair do quiz
document.getElementById('btn-sair-quiz').addEventListener('click', function () {
  irTela('screen-app');
  irApp('screen-simulado');
});

function finalizarQuiz() {
  totalFeitos++;
  const pct = Math.round(acertos / quizAtual.length * 100);
  if (melhorNota === null || pct > melhorNota) melhorNota = pct;
  somaNotas += pct;

  // Salvar no histórico
  const sim = simulados[simuladoAtual];
  const agora = new Date();
  const dataStr = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  historico.unshift({
    titulo:   sim ? sim.titulo : 'Simulado',
    materia:  sim ? sim.materia : '—',
    acertos:  acertos,
    total:    quizAtual.length,
    pct:      pct,
    data:     dataStr
  });

  atualizarStats();

  // Resultado
  document.getElementById('res-score').textContent = acertos + '/' + quizAtual.length;
  document.getElementById('res-pct').textContent = pct + '%';

  let msg = 'Continue praticando! Você vai melhorar.';
  if (pct >= 80) { msg = 'Excelente! Parabéns pelo desempenho!'; }
  else if (pct >= 50) { msg = 'Bom resultado! Quase lá.'; }

  document.getElementById('res-msg').textContent = msg;
  irTela('screen-resultado');
}


// Resultado: botões
document.getElementById('btn-voltar-resultado').addEventListener('click', function () {
  renderSimulados();
  irTela('screen-app');
  irApp('screen-painel');
});

document.getElementById('btn-historico-resultado').addEventListener('click', function () {
  renderHistorico();
  irTela('screen-app');
  irApp('screen-historico');
});

function renderHistorico() {
  const lista = document.getElementById('lista-historico');

  if (!historico.length) {
    lista.innerHTML = '<p class="empty">Nenhum simulado realizado ainda. Faça seu primeiro quiz!</p>';
    return;
  }

  lista.innerHTML = historico.map(function (h) {
    const badgeClass = h.pct >= 80 ? 'badge-green' : (h.pct >= 50 ? 'badge-purple' : 'badge-red');
    return '<div class="historico-card">' +
      '<div class="historico-info">' +
        '<h3>' + h.titulo + '</h3>' +
        '<p>' + h.materia + ' · ' + h.data + '</p>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
        '<div class="historico-score">' + h.pct + '%<small>' + h.acertos + '/' + h.total + ' acertos</small></div>' +
        '<span class="badge ' + badgeClass + '">' + (h.pct >= 80 ? 'Ótimo' : h.pct >= 50 ? 'Regular' : 'Fraco') + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function atualizarPerfil() {
  const media = totalFeitos > 0 ? Math.round(somaNotas / totalFeitos) + '%' : '—';
  document.getElementById('ps-criados').textContent = simulados.length;
  document.getElementById('ps-feitos').textContent = totalFeitos;
  document.getElementById('ps-melhor').textContent = melhorNota !== null ? melhorNota + '%' : '—';
  document.getElementById('ps-media').textContent = media;
}

function atualizarStats() {
  document.getElementById('stat-simulados-criados').textContent = simulados.length;
  document.getElementById('stat-feitos').textContent = totalFeitos;
  document.getElementById('stat-melhor').textContent = melhorNota !== null ? melhorNota + '%' : '—';
}
