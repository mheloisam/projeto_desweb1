from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os

app = Flask(__name__)
app.secret_key = 'quizlab-secret-key'

DADOS_FILE = 'dados.json'


def ler_dados():
    if not os.path.exists(DADOS_FILE):
        return {'usuarios': [], 'simulados': [], 'historico': []}
    with open(DADOS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def salvar_dados(dados):
    with open(DADOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)


@app.route('/')
def index():
    if 'usuario' in session:
        return redirect(url_for('painel'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        senha = request.form.get('senha', '')

        dados = ler_dados()
        usuario = next(
            (u for u in dados['usuarios'] if u['email'] == email), None)

        if not usuario or usuario['senha'] != senha:
            erro = 'E-mail ou senha incorretos.'
        else:
            session['usuario'] = usuario
            return redirect(url_for('painel'))

    return render_template('login.html', erro=erro)


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    erro = None
    if request.method == 'POST':
        nome = request.form.get('nome', '').strip()
        email = request.form.get('email', '').strip()
        senha = request.form.get('senha', '')

        dados = ler_dados()
        ja_existe = any(u['email'] == email for u in dados['usuarios'])

        if ja_existe:
            erro = 'Este e-mail já está cadastrado.'
        else:
            novo_usuario = {'nome': nome, 'email': email, 'senha': senha}
            dados['usuarios'].append(novo_usuario)
            salvar_dados(dados)
            session['usuario'] = novo_usuario
            return redirect(url_for('painel'))

    return render_template('cadastro.html', erro=erro)


@app.route('/sair')
def sair():
    session.clear()
    return redirect(url_for('login'))


@app.route('/painel')
def painel():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    email = session['usuario']['email']

    meus_simulados = [s for s in dados['simulados']
                      if s['email_usuario'] == email]
    meu_historico = [h for h in dados['historico']
                     if h['email_usuario'] == email]

    total_feitos = len(meu_historico)
    melhor_nota = max((h['pct'] for h in meu_historico), default=None)
    media = round(sum(h['pct'] for h in meu_historico) /
                  total_feitos) if total_feitos else None

    return render_template('painel.html',
                           usuario=session['usuario'],
                           simulados=meus_simulados,
                           total_feitos=total_feitos,
                           melhor_nota=melhor_nota,
                           media=media
                           )


@app.route('/simulado/novo', methods=['POST'])
def novo_simulado():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    titulo = request.form.get('titulo', '').strip()
    materia = request.form.get('materia', '').strip() or 'Geral'

    if titulo:
        dados = ler_dados()
        dados['simulados'].append({
            'id': len(dados['simulados']) + 1,
            'email_usuario': session['usuario']['email'],
            'titulo': titulo,
            'materia': materia,
            'questoes': []
        })
        salvar_dados(dados)

    return redirect(url_for('painel'))


@app.route('/simulado/<int:sim_id>')
def ver_simulado(sim_id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    simulado = next((s for s in dados['simulados'] if s['id'] == sim_id), None)

    if not simulado or simulado['email_usuario'] != session['usuario']['email']:
        return redirect(url_for('painel'))

    return render_template('simulado.html', usuario=session['usuario'], simulado=simulado)


@app.route('/simulado/<int:sim_id>/remover', methods=['POST'])
def remover_simulado(sim_id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    dados['simulados'] = [s for s in dados['simulados'] if s['id'] != sim_id]
    salvar_dados(dados)
    return redirect(url_for('painel'))


@app.route('/simulado/<int:sim_id>/questao/nova', methods=['POST'])
def nova_questao(sim_id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    enunciado = request.form.get('enunciado', '').strip()
    dificuldade = request.form.get('dificuldade', 'Fácil')
    alternativas = [
        request.form.get('alt_0', '').strip(),
        request.form.get('alt_1', '').strip(),
        request.form.get('alt_2', '').strip(),
        request.form.get('alt_3', '').strip(),
    ]
    correta = int(request.form.get('correta', 0))

    dados = ler_dados()
    for s in dados['simulados']:
        if s['id'] == sim_id:
            s['questoes'].append({
                'enunciado': enunciado,
                'dificuldade': dificuldade,
                'alternativas': alternativas,
                'correta': correta
            })
            break
    salvar_dados(dados)
    return redirect(url_for('ver_simulado', sim_id=sim_id))


@app.route('/simulado/<int:sim_id>/questao/<int:q_index>/remover', methods=['POST'])
def remover_questao(sim_id, q_index):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    for s in dados['simulados']:
        if s['id'] == sim_id:
            s['questoes'].pop(q_index)
            break
    salvar_dados(dados)
    return redirect(url_for('ver_simulado', sim_id=sim_id))


@app.route('/simulado/<int:sim_id>/quiz')
def quiz(sim_id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    simulado = next((s for s in dados['simulados'] if s['id'] == sim_id), None)

    if not simulado or not simulado['questoes']:
        return redirect(url_for('ver_simulado', sim_id=sim_id))

    return render_template('quiz.html', usuario=session['usuario'], simulado=simulado)


@app.route('/simulado/<int:sim_id>/resultado', methods=['POST'])
def resultado(sim_id):
    if 'usuario' not in session:
        return redirect(url_for('login'))

    acertos = int(request.form.get('acertos', 0))
    total = int(request.form.get('total', 1))
    pct = round(acertos / total * 100)

    dados = ler_dados()
    simulado = next((s for s in dados['simulados'] if s['id'] == sim_id), None)

    from datetime import datetime
    agora = datetime.now()
    data_str = agora.strftime('%d/%m/%Y às %H:%M')

    dados['historico'].insert(0, {
        'email_usuario': session['usuario']['email'],
        'titulo':  simulado['titulo'] if simulado else 'Simulado',
        'materia': simulado['materia'] if simulado else '—',
        'acertos': acertos,
        'total':   total,
        'pct':     pct,
        'data':    data_str
    })
    salvar_dados(dados)

    return render_template('resultado.html',
                           usuario=session['usuario'],
                           acertos=acertos,
                           total=total,
                           pct=pct,
                           sim_id=sim_id
                           )


@app.route('/historico')
def historico():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    email = session['usuario']['email']
    meu_historico = [h for h in dados['historico']
                     if h['email_usuario'] == email]

    return render_template('historico.html', usuario=session['usuario'], historico=meu_historico)


@app.route('/perfil')
def perfil():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    dados = ler_dados()
    email = session['usuario']['email']
    meus_simulados = [s for s in dados['simulados']
                      if s['email_usuario'] == email]
    meu_historico = [h for h in dados['historico']
                     if h['email_usuario'] == email]

    total_feitos = len(meu_historico)
    melhor_nota = max((h['pct'] for h in meu_historico), default=None)
    media = round(sum(h['pct'] for h in meu_historico) /
                  total_feitos) if total_feitos else None

    return render_template('perfil.html',
                           usuario=session['usuario'],
                           total_simulados=len(meus_simulados),
                           total_feitos=total_feitos,
                           melhor_nota=melhor_nota,
                           media=media
                           )


if __name__ == '__main__':
    app.run(debug=True)
