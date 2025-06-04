// Função chamada pelo Google após o login bem-sucedido
function handleCredentialResponse(response) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = 'Processando login...';

    // O token JWT vem em response.credential
    const idToken = response.credential;

    // Enviar o ID Token para o seu backend para verificação
    fetch('/api/google-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            statusMessage.textContent = `Login bem-sucedido! Bem-vindo, ${data.user.name}.`;
            // Redirecionar o usuário para uma página protegida após o login
            window.location.href = '/dashboard.html'; // Exemplo
        } else {
            statusMessage.textContent = `Falha no login: ${data.message || 'Erro desconhecido'}`;
        }
    })
    .catch(error => {
        console.error('Erro na comunicação com o backend:', error);
        statusMessage.textContent = 'Ocorreu um erro ao tentar fazer login.';
    });
}

// Uma função simples para decodificar o JWT no cliente (apenas para depuração/exibição básica)
// NÃO confie nesta decodificação para segurança; a verificação real deve ser no backend.
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};