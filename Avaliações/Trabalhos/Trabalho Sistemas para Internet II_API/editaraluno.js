document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const alunoId = params.get('id');

    if (!alunoId) {
        alert('ID do aluno não fornecido');
        return;
    }
    carregarCursos();
    const form = document.getElementById('form-editar-aluno');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await editarAluno(alunoId);
    });
});
async function carregarCursos() {
    try {
        const response = await fetch('http://127.0.0.1:5000/listar_cursos');
        const cursos = await response.json();

        const selectCurso = document.getElementById('curso_id');
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = curso.nome_curso;
            selectCurso.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}
async function editarAluno(alunoId) {
    const nome = document.getElementById('nome').value;
    const matricula = document.getElementById('matricula').value;
    const cursoId = document.getElementById('curso_id').value;
    const token = localStorage.getItem('token');

    const alunoData = {
        nome: nome,
        matricula: matricula,
        curso_id: cursoId
    };

    try {
        const response = await fetch(`http://127.0.0.1:5000/editar_aluno/${alunoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(alunoData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Aluno editado com sucesso!');
            window.location.href = 'lista_alunos.html';
        } else {
            const mensagemDiv = document.getElementById('mensagem');
            mensagemDiv.textContent = result.message || 'Erro ao editar o aluno';
            mensagemDiv.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Erro ao editar aluno:', error);
        alert('Erro ao editar aluno');
    }
}