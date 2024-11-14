document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    await carregarDados();
});
async function carregarDados() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa fazer login.');
        window.location.href = 'login.html';
        return;
    }
    try {
        const response = await fetch('http://127.0.0.1:5000/pagina_inicial', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Bem-vindo, ${data.aluno.nome}`;
        }

        const turmasList = document.getElementById('turmas-list');
        if (turmasList) {
            turmasList.innerHTML = '';
            data.aluno.turmas.forEach(turma => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${turma.nome_turma} - ${data.aluno.curso}
                    <button class="btn btn-danger" onclick="sairTurma(${turma.id})">Sair da Turma</button>
                `;
                turmasList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar os dados do aluno:', error);
        alert('Erro ao carregar os dados.');
    }
}
document.querySelector('.logout-button').addEventListener('click', async function() {
    await fetch('http://127.0.0.1:5000/logout', { method: 'POST' });
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

async function sairTurma(turmaId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para sair da turma.');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/sair_turma', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ turma_id: turmaId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            window.location.reload();
        } else {
            alert(data.message || 'Erro ao sair da turma');
        }
    } catch (error) {
        console.error('Erro ao sair da turma:', error);
        alert('Erro ao tentar sair da turma.');
    }
}