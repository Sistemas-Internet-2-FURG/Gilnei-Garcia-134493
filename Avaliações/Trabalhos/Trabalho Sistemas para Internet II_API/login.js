const loginFormSubmit = document.getElementById('login-form-submit');
if (loginFormSubmit) {
    loginFormSubmit.addEventListener('submit', async function(event) {
        event.preventDefault();
        const matricula = document.getElementById('matricula').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricula, senha })
            });
            const data = await response.json();
                console.log(data);

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    if (data.administrador){
                        window.location.href = 'admin_painel.html';
                    }else{
                        window.location.href = 'pagina_inicial.html';
                    }
                } else {
                    alert(data.message || "Erro ao fazer login.");
                }            
            }
        catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login.');
        }
    });
};