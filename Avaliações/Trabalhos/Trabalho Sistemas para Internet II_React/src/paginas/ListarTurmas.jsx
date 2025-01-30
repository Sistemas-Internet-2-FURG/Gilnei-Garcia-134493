import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ListarTurmas.module.css';

function ListaTurmas() {
    const [turmas, setTurmas] = useState([]);
    const [flashMessage, setFlashMessage] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para acessar esta página.');
            navigate('/login');
            return;
        }
        const verificarAdmin = async () => {
            try {
                const adminCheckResponse = await fetch('http://127.0.0.1:5000/is_admin', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const adminData = await adminCheckResponse.json();
                if (!adminData.is_admin) {
                    alert('Acesso restrito a administradores.');
                    navigate('/pagina_inicial');
                    return;
                }
                carregarTurmas(token);
            } catch (error) {
                console.error('Erro ao verificar admin:', error);
                setFlashMessage({ type: 'error', message: 'Erro ao verificar permissões de administrador.' });
            }
        };
        const carregarTurmas = async (token) => {
            try {
                const response = await fetch('http://127.0.0.1:5000/listar_turmas', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const turmasData = await response.json();
                if (turmasData.length === 0) {
                    setFlashMessage({ type: 'info', message: 'Nenhuma turma cadastrada.' });
                } else {
                    setTurmas(turmasData);
                }
            } catch (error) {
                console.error('Erro ao carregar turmas:', error);
                setFlashMessage({ type: 'error', message: 'Erro ao carregar turmas.' });
            }
        };
        verificarAdmin();
    }, [navigate]);
    const deletarTurma = async (id) => {
        const confirmDelete = window.confirm('Tem certeza que deseja excluir esta turma?');
        if (!confirmDelete) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar autenticado para excluir uma turma.');
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:5000/deletar_turma/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Turma excluída com sucesso.');
                setTurmas((prevTurmas) => prevTurmas.filter(turma => turma.id !== id));
            } else {
                alert('Ocorreu um erro ao excluir a turma.');
            }
        } catch (error) {
            alert('Erro ao excluir turma.');
            console.error('Erro ao excluir turma:', error);
        }
    };
    return (
        <div className={styles.container}>
            <h1>Lista de Turmas</h1>
            {flashMessage && (
                <div className={`${styles.flashMessage} ${styles[flashMessage.type]}`}>
                    {flashMessage.message}
                </div>
            )}
            <ul>
                {turmas.length === 0 ? (
                    <li className={styles.info}>Nenhuma turma cadastrada.</li>
                ) : (
                    turmas.map(turma => (
                        <li key={turma.id}>
                            {turma.id} - {turma.nome_turma}
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btn} ${styles.btnDanger}`}
                                    onClick={() => deletarTurma(turma.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
            <a href="/admin_painel" className={styles.backLink}>Voltar ao Painel do Administrador</a>
        </div>
    );
}

export default ListaTurmas;