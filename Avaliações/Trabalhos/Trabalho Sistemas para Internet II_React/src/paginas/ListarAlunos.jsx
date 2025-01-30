import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ListarAlunos.module.css';

const ListarAlunos = () => {
    const [alunos, setAlunos] = useState([]);
    const navigate = useNavigate();
    const listarAlunos = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para acessar esta página.');
            navigate('/login');
            return;
        }
        try {
            const adminCheckResponse = await fetch('http://127.0.0.1:5000/is_admin', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const adminData = await adminCheckResponse.json();

            if (!adminData.is_admin) {
                alert('Acesso restrito a administradores.');
                navigate('/pagina_inicial');
                return;
            }
            const response = await fetch('http://127.0.0.1:5000/listar_alunos', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar alunos. Status: ${response.status}`);
            }
            const alunosData = await response.json();
            setAlunos(alunosData);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            alert('Não foi possível carregar a lista de alunos.');
            navigate('/pagina_inicial');
        }
    };
    const editarAluno = (id) => {
        navigate(`/editar?id=${id}`);
    };
    const excluirAluno = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Você precisa estar autenticado para excluir um aluno.');
                return;
            }
            try {
                const response = await fetch(`http://127.0.0.1:5000/deletar_aluno/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.success) {
                    alert('Aluno excluído com sucesso!');
                    listarAlunos();
                } else {
                    alert('Erro ao excluir o aluno.');
                }
            } catch (error) {
                console.error('Erro ao excluir aluno:', error);
                alert('Erro ao excluir o aluno.');
            }
        }
    };
    useEffect(() => {
        listarAlunos();
    }, []);

    return (
        <div className={styles.container}>
            <h1>Lista de Alunos</h1>
            <ul>
                {alunos.length > 0 ? (
                    alunos.map((aluno) => (
                        <li key={aluno.id}>
                            {aluno.id} - {aluno.nome_aluno} - {aluno.matricula} - {aluno.id_curso}
                            <div className={styles.actions}>
                                <button className={styles.btn} onClick={() => editarAluno(aluno.id)}>Editar</button>
                                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => excluirAluno(aluno.id)}>Excluir</button>
                            </div>
                        </li>
                    ))
                ) : (
                    <li>Nenhum aluno encontrado.</li>
                )}
            </ul>
            <a href="/admin_painel">Voltar ao Painel do Administrador</a>
        </div>
    );
};

export default ListarAlunos;