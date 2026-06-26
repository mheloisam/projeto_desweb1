# QuizLab

Aplicação web para criação e prática de simulados de múltipla escolha. O próprio usuário monta suas questões, organiza por matéria e realiza o quiz quando quiser, recebendo feedback imediato sobre seu desempenho.

Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento de Sistemas Web I — UFRN/IMD.

---

## Funcionalidades

- Cadastro e autenticação de usuários
- Criação de simulados organizados por título e matéria
- Adição de questões de múltipla escolha com quatro alternativas e nível de dificuldade
- Realização do quiz com questões embaralhadas e feedback visual imediato
- Histórico de quizzes realizados com pontuação e data
- Perfil com estatísticas gerais do usuário

---

## Tecnologias

- **Frontend:** HTML, CSS e JavaScript
- **Backend:** Python com Flask
- **Persistência:** arquivo JSON
- **Fontes:** Nunito e Work Sans (Google Fonts)

---

## Como rodar localmente

**1. Clone o repositório**
```bash
git clone https://github.com/mheloisam/quizlab.git
cd quizlab
```

**2. Crie e ative um ambiente virtual**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**3. Instale as dependências**
```bash
pip install -r requirements.txt
```

**4. Inicie o servidor**
```bash
python app.py
```

**5. Acesse no navegador**
```
http://localhost:5000
```

---

## Estrutura do projeto

```
quizlab/
├── app.py              # servidor Flask e rotas
├── dados.json          # persistência dos dados
├── requirements.txt    # dependências
├── static/
│   ├── style.css       # estilos da aplicação
│   ├── painel.js       # modal de novo simulado
│   ├── simulado.js     # navegação por abas
│   └── quiz.js         # lógica do quiz
└── templates/
    ├── base.html       # template base com sidebar
    ├── login.html
    ├── cadastro.html
    ├── painel.html
    ├── simulado.html
    ├── quiz.html
    ├── resultado.html
    ├── historico.html
    └── perfil.html
```

---

## Autora

Maria Heloísa Monteiro Morais
