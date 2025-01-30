from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, func, delete
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import jwt
from datetime import datetime, timedelta, timezone
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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

def criar_token(usuario):
    payload = {
        'aluno_id': usuario.id,
        'administrador': usuario.administrador,
        'exp': datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def token_requerido(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token:
            try:
                token = token.split()[1] #Remove o prefixo 'Bearer '
                dados = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                request.aluno_id = dados['aluno_id'] #Atribui o aluno_id no request
                request.administrador = dados['administrador'] #Atribui o valor booleano dizendo se é ou não um administrador
            except jwt.ExpiredSignatureError:
                return jsonify({"success": False, "message": "Token expirado"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"success": False, "message": "Token inválido"}), 401
            return f(*args, **kwargs) #Chama a função decorada
        else:
            return jsonify({"success": False, "message": "Token inexistente"}), 401
    return decorator


@app.route('/login', methods=['POST'])
def fazer_login():
    if request.method == 'POST':
        data = request.json
        matricula = data.get('matricula')
        senha = data.get('senha')
        usuario = alunos.query.filter_by(matricula=matricula).first()
        if usuario and usuario.verificar_senha(senha):
            token = criar_token(usuario)
            return jsonify({"success": True, "token": token, "administrador": usuario.administrador}), 200
        else:
            return jsonify({"success": False, "message": "Matrícula ou senha incorretos"}), 401

@app.route('/cadastro', methods=['POST'])
def cadastro():
    if request.method == 'POST':
        data = request.get_json()
        nome = data.get('nome')
        matricula = data.get('matricula')
        senha = data.get('senha')
        senha_hash = generate_password_hash(senha)
        id_curso = data.get('curso_id')
        novo_aluno = alunos(nome=nome, matricula=matricula, senha_hash=senha_hash, curso_id=id_curso)
        try:
            db.session.add(novo_aluno)
            db.session.commit()
            return jsonify({"success": True, "message": "Cadastro realizado com sucesso! Faça login."})
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": "Erro ao cadastrar o usuário. Matrícula já existe."}), 400
        
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({"success": True, "message": "Você saiu da conta."})

@app.route('/pagina_inicial', methods=['GET'])
@token_requerido
def pagina_inicial():
    aluno_id = request.aluno_id
    aluno = db.session.get(alunos, aluno_id)
    if not aluno:
        return jsonify({"success": False, "message": "Aluno não encontrado."}), 404
    curso = aluno.curso
    nome_curso = curso.nome_curso
    turmas = [{"id": turma.id, "nome_turma": turma.nome_turma} for turma in aluno.turmas]
    return jsonify({
        "success": True,
        "aluno": {
            "nome": aluno.nome,
            "curso": nome_curso,
            "turmas": turmas
        }
    })

@app.route('/inscrever', methods=['GET', 'POST'])
@token_requerido
def inscrever():
    if request.method == 'GET':
        turmas = turma.query.all()
        turmas_json = [{'id': turma.id, 'nome_turma': turma.nome_turma} for turma in turmas]
        return jsonify(turmas_json)
    elif request.method == 'POST':
        data = request.get_json()
        turma_id = data.get('turma_id')
        if not turma_id:
            return jsonify({'message': 'Turma não especificada'}), 400
        aluno_id = request.aluno_id 
        aluno = db.session.get(alunos, aluno_id)
        if not aluno:
            return jsonify({'message': 'Aluno não encontrado'}), 404
        turmas = db.session.get(turma, turma_id)
        if not turmas:
            return jsonify({'message': 'Turma não encontrada'}), 404
        if turmas in aluno.turmas:
            return jsonify({'message': 'Você já está matriculado nesta turma'}), 400
        if turmas.curso_id != aluno.curso_id:
            return jsonify({'message': 'Você não pode se matricular em uma turma de outro curso'}), 400
        aluno.turmas.append(turmas)
        db.session.commit()
        return jsonify({'message': 'Inscrição realizada com sucesso!'}), 200
        
@app.route('/listar_cursos', methods=['GET'])
def listar_cursos():
    cursos = curso.query.all()
    cursos_json = [{'id': curso.id, 'nome_curso': curso.nome_curso} for curso in cursos]
    return jsonify(cursos_json)

@app.route('/sair_turma', methods=['POST'])
@token_requerido
def sair_turma():
    aluno_id = request.aluno_id
    data = request.get_json()
    turma_id = data.get('turma_id')
    if not turma_id:
        return jsonify({'message': 'ID da turma não fornecido'}), 400
    aluno = db.session.get(alunos, aluno_id)
    turmas = db.session.get(turma, turma_id)
    if turmas is None:
        return jsonify({'message': 'Turma não encontrada'}), 404
    if turmas not in aluno.turmas:
        return jsonify({'message': 'Você não está matriculado nesta turma'}), 400
    delete_turma = delete(aluno_e_turma).where(aluno_e_turma.c.alunos == aluno_id).where(aluno_e_turma.c.turmas == turma_id)
    try:
        db.session.execute(delete_turma)
        db.session.commit()
        return jsonify({'message': 'Você saiu da turma com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Houve um erro ao sair da turma', 'error': str(e)}), 500
    
@app.route('/criar_curso', methods=['POST'])
def criar_curso():
    if request.method == 'POST':
        data = request.get_json()
        nome = data.get('nome_curso')
        id_curso = data.get('id_curso')
        novo_curso = curso(id=id_curso, nome_curso=nome)
        try:
            db.session.add(novo_curso)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Curso criado com sucesso!'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": "Erro ao cadastrar o curso. Curso já existe."}), 400

@app.route('/criar_turma', methods=['POST'])
def criar_turma():
    if request.method == 'POST':
        data = request.get_json()
        nome = data.get('nome_turma')
        id_curso = data.get('curso_id')
        print(nome, id_curso)
        nova_turma = turma(nome_turma=nome, curso_id=id_curso)
        try:
            db.session.add(nova_turma)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Turma criada com sucesso!'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "message": "Erro ao cadastrar a turma. Turma já existe."}), 400
        
@app.route('/listar_alunos', methods=['GET'])
def listar_alunos():
    aluno = alunos.query.all()
    aluno_json = [{'id': alunos.id, 'nome_aluno': alunos.nome, 'matricula': alunos.matricula, 'id_curso': alunos.curso_id} for alunos in aluno]
    return jsonify(aluno_json)

@app.route('/deletar_aluno/<int:id>', methods=['DELETE'])
@token_requerido
def deletar_aluno(id):
    aluno_id = request.aluno_id
    administrador = request.administrador
    if not administrador:
        return jsonify({'success': False, 'message': 'Acesso negado. Usuário não é administrador.'}), 403
    aluno = alunos.query.get_or_404(id)
    aluno.turmas.clear()
    try:
        db.session.delete(aluno)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Aluno excluído com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Houve um erro ao deletar o aluno.', 'error': str(e)}), 500
    
@app.route('/editar_aluno/<int:id>', methods=['PUT'])
@token_requerido
def editar_aluno(id):
    administrador = request.administrador
    if not administrador:
        return jsonify({'success': False, 'message': 'Acesso negado. Usuário não é administrador.'}), 403
    aluno = alunos.query.get_or_404(id)
    data = request.get_json()    
    if 'nome' in data:
        aluno.nome = data['nome']
    if 'matricula' in data:
        aluno.matricula = data['matricula']
    if 'curso_id' in data:
        aluno.curso_id = data['curso_id']
    aluno.turmas.clear()
    try:
        db.session.commit()
        return jsonify({'success': True, 'message': 'Aluno atualizado com sucesso.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Houve um erro ao atualizar o aluno.', 'error': str(e)}), 500
    

@app.route('/deletar_turma/<int:id>', methods=['DELETE'])
@token_requerido
def deletar_turma(id):
    aluno_id = request.aluno_id
    administrador = request.administrador    
    if not administrador:
        return jsonify({"message": "Você não tem permissão para excluir turmas."}), 403
    turma_id = turma.query.get_or_404(id)    
    aluno_count = db.session.query(func.count(aluno_e_turma.c.alunos)).filter(aluno_e_turma.c.turmas == id).scalar()
    if aluno_count > 0:
        return jsonify({"message": "Você não pode deletar uma turma que tenha alunos!", "status": "error"}), 400    
    try:
        db.session.delete(turma_id)
        db.session.commit()
        return jsonify({"message": "Turma deletada com sucesso.", "status": "success"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Houve um erro ao deletar a turma: {str(e)}", "status": "error"}), 500
    
@app.route('/listar_turmas', methods=['GET'])
def listar_turmas():
    turma_nome = turma.query.all()
    turmas_json = [{'id': turmas.id, 'nome_turma': turmas.nome_turma} for turmas in turma_nome]
    return jsonify(turmas_json)

@app.route('/admin_painel', methods=['GET'])
@token_requerido
def admin_painel():
    administrador = request.administrador
    if not administrador:
        return jsonify({"message": "Você não tem permissão para acessar esta página."}), 403
    return jsonify({"message": "Login bem sucedido!"}), 200

@app.route('/is_admin', methods=['GET'])
@token_requerido
def is_admin():
    administrador = request.administrador
    if not administrador:
        return jsonify({"message": "Você não tem permissão para acessar esta página."}), 403
    return jsonify({'is_admin': True}), 200
    
if __name__ == "__main__":
    with app.app_context():
        enforce_foreign_keys()
        db.create_all()
    app.run(debug=True)
