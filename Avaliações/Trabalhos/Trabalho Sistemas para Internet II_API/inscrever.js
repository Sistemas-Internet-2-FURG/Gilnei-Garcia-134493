function redirecionarParaInscricao() {
    window.location.href = 'inscrever-se.html';
}
document.addEventListener('DOMContentLoaded', () => {
    const inscreverButton = document.getElementById('inscrever-button');
    if (inscreverButton) {
        inscreverButton.addEventListener('click', redirecionarParaInscricao);
    }
});
async function carregarTurmas() {
    const selectElement = document.getElementById('turma_id');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para acessar as turmas.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/inscrever', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar as turmas');

        const data = await response.json();
        data.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.nome_turma;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert('Não foi possível carregar as turmas.');
    }
}
async function inscreverNaTurma(event) {
    event.preventDefault();

    const turmaId = document.getElementById('turma_id').value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para se inscrever.');
        return;
    }

    if (!turmaId) {
        alert('Você precisa selecionar uma turma.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/inscrever', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ turma_id: turmaId })
        });

        if (!response.ok) {
            throw new Error('Erro ao realizar inscrição');
        }

        const data = await response.json();
        alert(data.message);

    } catch (error) {
        console.error(error);
        alert('Erro ao realizar inscrição');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('inscrever-se.html')) {
        carregarTurmas();
        const form = document.getElementById('inscricao-form');
        if (form) {
            form.addEventListener('submit', inscreverNaTurma);
        }
    }
});