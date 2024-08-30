from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, func, delete
from werkzeug.security import generate_password_hash, check_password_hash
import time

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///meubanco2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_password'

db = SQLAlchemy(app)

aluno_e_turma = db.Table('aluno_e_turma', db.Column('alunos', db.Integer, db.ForeignKey('alunos.id'), primary_key=True),
                         db.Column('turmas', db.Integer, db.ForeignKey('turma.id'), primary_key=True))
@app.before_request
def enforce_foreign_keys():
    db.session.execute(text('PRAGMA foreign_keys = ON'))
class alunos(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    matricula = db.Column(db.String(40), unique=True, nullable=False)
    senha_hash = db.Column(db.String(120), nullable=False)
    turmas = db.relationship('turma', secondary=aluno_e_turma, back_populates='alunos')
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'), nullable=False)
    curso = db.relationship('curso', backref='estudantes')
    administrador = db.Column(db.Boolean, default=False)
    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

class turma(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_turma = db.Column(db.String(80), nullable=False)
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'), nullable=False)
    alunos = db.relationship('alunos', secondary=aluno_e_turma, back_populates='turmas')

class curso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_curso = db.Column(db.String(80), unique=True, nullable=False)
    turmas = db.relationship('turma', backref='curso', lazy=True)


@app.route('/')
def login():
    if 'aluno_id' in session:
        aluno = db.session.get(alunos, session['aluno_id'])
        if aluno.administrador != 1:
            return redirect(url_for('pagina_inicial'))
        else:
            return redirect(url_for('admin_page'))
    return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def fazer_login():
    if request.method == 'POST':
        matricula = request.form['matricula']
        senha = request.form['senha']
        usuario = alunos.query.filter_by(matricula=matricula).first()
        if usuario and usuario.verificar_senha(senha):
            session['aluno_id'] = usuario.id
            if usuario.administrador:
                return redirect(url_for('admin_page'))
            return redirect(url_for('listar_alunos'))
        else:
            flash('Matrícula ou senha incorretos.', 'erro')
    return render_template('login.html')


@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        nome = request.form['nome']
        matricula = request.form['matricula']
        senha = request.form['senha']
        senha_hash = generate_password_hash(senha)
        id_curso = request.form['curso_id']
        novo_aluno = alunos(nome=nome, matricula=matricula, senha_hash=senha_hash, curso_id=id_curso)
        try:
            db.session.add(novo_aluno)
            db.session.commit()
            flash('Cadastro realizado com sucesso! Faça login.', 'sucesso')
            return redirect(url_for('login'))
        except:
            flash('Erro ao cadastrar o usuário. Matrícula já existe.', 'erro')

    cursos = curso.query.all()
    return render_template('cadastro.html', cursos=cursos)


@app.route('/logout')
def logout():
    session.pop('aluno_id', None)
    flash('Você saiu da conta.', 'sucesso')
    return redirect(url_for('login'))

@app.route('/listar_alunos')
def listar_alunos():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    if aluno.administrador != 1:
        return redirect(url_for('pagina_inicial'))
    alunos_list = alunos.query.all()
    return render_template('lista_de_alunos.html', alunos_list=alunos_list)

@app.route('/listar_turmas')
def listar_turmas():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    if aluno.administrador != 1:
        return redirect(url_for('pagina_inicial'))
    turmas = turma.query.all()
    return render_template('lista_de_turmas.html', turmas=turmas)

@app.route('/inscrever', methods=['GET', 'POST'])
def inscrever():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    if request.method == 'POST':
        aluno = db.session.get(alunos, session['aluno_id'])
        turma_id = request.form['turma_id']
        turmas = db.session.get(turma, turma_id)
        if turmas is None:
            flash('Turma não encontrada.', 'error')
            return redirect(url_for('pagina_inicial'))
        if turmas.curso_id != aluno.curso_id:
            flash('Você não pode se matricular em uma turma de outro curso.', 'error')
            return redirect(url_for('inscrever'))
        if turmas in aluno.turmas:
            flash('Você já está matriculado nesta turma.', 'error')
            return redirect(url_for('inscrever'))
        if turmas not in aluno.turmas:
            aluno.turmas.append(turmas)
            db.session.commit()
            return redirect(url_for('pagina_inicial'))
    turmas = turma.query.all()
    return render_template('inscrever-se.html', turmas=turmas)

@app.route('/pagina_inicial')
def pagina_inicial():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    curso = aluno.curso
    nome_curso = curso.nome_curso
    turmas = aluno.turmas
    return render_template('pagina_inicial.html', aluno=aluno, nome_curso=nome_curso, turmas=turmas)

@app.route('/admin_page')
def admin_page():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    if not aluno.administrador:
        return redirect(url_for('pagina_inicial'))
    return render_template('admin_painel.html')

@app.route('/criar_turma', methods=['GET', 'POST'])
def criar_turma():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    if not aluno.administrador:
        return redirect(url_for('pagina_inicial'))
    cursos = curso.query.all()
    if request.method == 'POST':
        nome_turma = request.form['nome_turma']
        curso_id = request.form['curso_id']
        nova_turma = turma(nome_turma=nome_turma, curso_id=curso_id)
        try:
            db.session.add(nova_turma)
            db.session.commit()
            return redirect(url_for('admin_page'))
        except:
            return "Houve um erro ao adicionar a turma."
    return render_template('criar_turma.html', cursos=cursos)

@app.route('/criar_curso', methods=['GET', 'POST'])
def criar_curso():
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    if not aluno.administrador:
        return redirect(url_for('pagina_inicial'))
    if request.method == 'POST':
        id = request.form['id do curso']
        nome_curso = request.form['nome_curso']
        novo_curso = curso(id=id, nome_curso=nome_curso)
        try:
            db.session.add(novo_curso)
            db.session.commit()
            return redirect(url_for('admin_page'))
        except:
            return "Houve um erro ao adicionar o curso."
    return render_template('criar_curso.html')

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar_aluno(id):
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno_admin = alunos.query.get_or_404(session['aluno_id'])
    if not aluno_admin.administrador:
        return redirect(url_for('pagina_inicial'))
    aluno = alunos.query.get_or_404(id)
    if request.method == 'POST':
        aluno.nome = request.form['nome']
        aluno.matricula = request.form['matricula']
        aluno.curso_id = request.form['curso_id']
        aluno.turmas.clear()
        try:
            db.session.commit()
            return redirect('/')
        except:
            return "Houve um erro ao atualizar o aluno."
    cursos = curso.query.all()
    return render_template('editar.html', aluno=aluno, cursos=cursos)

@app.route('/deletar/<int:id>')
def deletar_aluno(id):
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = alunos.query.get_or_404(id)
    if not aluno.administrador:
        return redirect(url_for('pagina_inicial'))
    aluno.turmas.clear()
    try:
        db.session.delete(aluno)
        db.session.commit()
        return redirect('/')
    except:
        return "Houve um erro ao deletar o usuário."

@app.route('/deletar_turma/<int:id>')
def deletar_turma(id):
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno_admin = alunos.query.get_or_404(session['aluno_id'])
    if not aluno_admin.administrador:
        return redirect(url_for('pagina_inicial'))
    turma_id = turma.query.get_or_404(id)
    aluno = db.session.query(func.count(aluno_e_turma.c.alunos)).filter(aluno_e_turma.c.turmas == id).scalar()
    if aluno>0:
        flash('Você não pode deletar uma turma que tenha alunos!', 'error')
        return redirect(url_for('listar_turmas'))
    try:
        db.session.delete(turma_id)
        db.session.commit()
        return redirect('/')
    except:
        return "Houve um erro ao deletar a turma"

@app.route('/sair_turma/<int:id>')
def sair_turma(id):
    if 'aluno_id' not in session:
        return redirect(url_for('login'))
    aluno = db.session.get(alunos, session['aluno_id'])
    turma_valida = db.session.get(turma, id)
    if turma_valida is None:
        return redirect(url_for('pagina_inicial'))
    if turma_valida not in aluno.turmas:
        return redirect(url_for('pagina_inicial'))
    turma_id = turma.query.get_or_404(id)
    id_turma = turma_id.id
    delete_turma = delete(aluno_e_turma).where(aluno_e_turma.c.turmas == id_turma)
    try:
        db.session.execute(delete_turma)
        db.session.commit()
        return redirect('/')
    except:
        return "Houve um erro ao deletar a turma"

if __name__ == "__main__":
    with app.app_context():
        enforce_foreign_keys()
        db.create_all()
    app.run(debug=True)
