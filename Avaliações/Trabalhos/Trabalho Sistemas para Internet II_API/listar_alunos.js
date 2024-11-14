async function listarAlunos() {
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
        const response = await fetch('http://127.0.0.1:5000/listar_alunos', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Status da resposta:", response.status);

        if (!response.ok) {
            throw new Error(`Erro ao buscar alunos. Status: ${response.status}`);
        }

        const alunos = await response.json();
        console.log("Alunos recebidos:", alunos);

        const alunosList = document.getElementById('alunos-list');
        alunosList.innerHTML = '';

        alunos.forEach(aluno => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                ${aluno.id} - ${aluno.nome_aluno} - ${aluno.matricula} - ${aluno.id_curso}
                <div class="actions">
                    <button class="btn" onclick="editarAluno(${aluno.id})">Editar</button>
                    <button class="btn btn-danger" onclick="excluirAluno(${aluno.id})">Excluir</button>
                </div>
            `;
            alunosList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        alert('Não foi possível carregar a lista de alunos.');
        window.location.href = 'pagina_inicial.html';
    }
}
function editarAluno(id) {
    window.location.href = `editar.html?id=${id}`;
}
async function excluirAluno(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
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
                listarAlunos(); // Atualiza a lista após exclusão
            } else {
                alert('Erro ao excluir o aluno.');
            }
        } catch (error) {
            console.error('Erro ao excluir aluno:', error);
            alert('Erro ao excluir o aluno.');
        }
    }
}

// Inicializa a lista de alunos quando a página carrega
document.addEventListener('DOMContentLoaded', listarAlunos);
