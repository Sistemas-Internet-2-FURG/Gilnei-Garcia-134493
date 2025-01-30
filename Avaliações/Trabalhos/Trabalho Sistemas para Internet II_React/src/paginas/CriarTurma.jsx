import React, { useState, useEffect } from 'react';
import styles from './CriarTurma.module.css';

function CriarTurma() {
    const [nomeTurma, setNomeTurma] = useState('');
    const [idCurso, setIdCurso] = useState('');
    const [cursos, setCursos] = useState([]);
    const [mensagem, setMensagem] = useState('');
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = '/login.html';
            return;
        }
        const verificarAdmin = async () => {
            try {
                const adminCheckResponse = await fetch('http://127.0.0.1:5000/is_admin', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const adminData = await adminCheckResponse.json();
                if (!adminData.is_admin) {
                    alert('Acesso restrito a administradores.');
                    window.location.href = '/pagina_inicial';
                    return;
                }
            } catch (error) {
                console.error('Erro ao verificar admin:', error);
                alert('Erro ao verificar permissões. Por favor, tente novamente.');
                window.location.href = '/pagina_inicial';
            }
        };
        verificarAdmin();
        const carregarCursos = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/listar_cursos');
                if (!response.ok) {
                    throw new Error('Erro ao carregar os cursos.');
                }
                const data = await response.json();
                setCursos(data);
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
                setMensagem('Erro ao carregar cursos.');
            }
        };
        carregarCursos();
    }, []);
    const criarTurma = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!nomeTurma || !idCurso) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:5000/criar_turma', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome_turma: nomeTurma, curso_id: idCurso })
            });
            const data = await response.json();
            if (data.success) {
                alert('Turma criada com sucesso.');
            } else {
                alert('Ocorreu um erro ao tentar criar a turma.');
            }
        } catch (error) {
            console.error('Erro ao tentar criar a turma:', error);
            setMensagem('Erro ao tentar se comunicar com a API.');
        }
    };
    return (
        <div className={styles.container}>
            <h1>Criar Turma</h1>
            <form onSubmit={criarTurma}>
                <label htmlFor="nome_turma">Nome da Turma:</label>
                <input 
                    type="text" 
                    id="nome_turma" 
                    value={nomeTurma} 
                    onChange={(e) => setNomeTurma(e.target.value)} 
                    required 
                />
                <label htmlFor="curso_id">Curso:</label>
                <select 
                    id="curso_id" 
                    value={idCurso} 
                    onChange={(e) => setIdCurso(e.target.value)} 
                    required
                >
                    <option value="">Selecione um curso</option>
                    {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>{curso.nome_curso}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary w-100">Criar Turma</button>
            </form>
            {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
            <a href="/admin_painel">Voltar ao Painel do Administrador</a>
        </div>
    );
}

export default CriarTurma;