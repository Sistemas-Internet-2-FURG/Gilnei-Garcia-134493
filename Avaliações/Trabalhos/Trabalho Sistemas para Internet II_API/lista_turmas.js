async function carregarTurmas() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
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
            window.location.href = 'pagina_inicial.html';
            return;
        }
        const response = await fetch('http://127.0.0.1:5000/listar_turmas');
        const turmas = await response.json();

        const listaTurmas = document.getElementById('turmas-list');
        listaTurmas.innerHTML = '';

        if (turmas.length === 0) {
            listaTurmas.innerHTML = '<li class="info">Nenhuma turma cadastrada.</li>';
            return;
        }

        turmas.forEach(turma => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${turma.id} - ${turma.nome_turma}
                <div class="actions">
                    <button class="btn btn-danger" onclick="deletarTurma(${turma.id})">Excluir</button>
                </div>
            `;
            listaTurmas.appendChild(listItem);
        });
    } catch (error) {
        mostrarMensagem('Erro ao carregar turmas.', 'error');
        console.error('Erro ao carregar turmas:', error);
    }
}

async function deletarTurma(id) {
    const confirmDelete = confirm('Tem certeza que deseja excluir esta turma?');
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
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Turma excluída com sucesso.');
        } else {
            alert('Ocorreu um erro ao excluir a turma.');
        }
    } catch (error) {
        alert('Erro ao excluir turma.');
        console.error('Erro ao excluir turma:', error);
    }
}
document.addEventListener('DOMContentLoaded', carregarTurmas);