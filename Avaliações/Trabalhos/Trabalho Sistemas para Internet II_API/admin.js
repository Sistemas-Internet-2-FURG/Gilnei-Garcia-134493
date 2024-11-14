document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/admin_painel', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }if (response.status === 403) {
            window.location.href = 'pagina_inicial.html';
            return;

        }
        configurarBotoesAdmin();

    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        alert('Erro ao carregar a página.');
        window.location.href = 'pagina_inicial.html';
    }
});

function configurarBotoesAdmin() {
    const addCursoButton = document.getElementById('addCursoButton');
    if (addCursoButton) {
        addCursoButton.addEventListener('click', () => {
            window.location.href = 'criar_curso.html';
        });
    }

    const addTurmaButton = document.getElementById('addTurmaButton');
    if (addTurmaButton) {
        addTurmaButton.addEventListener('click', () => {
            window.location.href = 'criar_turma.html';
        });
    }

    const gerenciarAlunosButton = document.getElementById('gerenciarAlunosButton');
    if (gerenciarAlunosButton) {
        gerenciarAlunosButton.addEventListener('click', () => {
            window.location.href = 'lista_de_alunos.html';
        });
    }

    const deletarTurmaButton = document.getElementById('deletarTurmaButton');
    if (deletarTurmaButton) {
        deletarTurmaButton.addEventListener('click', () => {
            window.location.href = 'lista_de_turmas.html';
        });
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://127.0.0.1:5000/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                } else {
                    alert('Erro ao realizar logout');
                }
            } catch (error) {
                console.error('Erro no logout:', error);
                alert('Erro ao realizar logout');
            }
        });
    }
}