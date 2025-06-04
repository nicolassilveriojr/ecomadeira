require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
    console.error('ERRO: Variável de ambiente GOOGLE_CLIENT_ID não definida. Verifique seu arquivo .env');
    process.exit(1);
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos do frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // Ajuste o caminho se sua estrutura for diferente

// Rota de login do Google
app.post('/api/google-login', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token não fornecido.' });
    }

    try {
        // Verifica a autenticidade do ID Token com o Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, // Certifique-se de que o token é para o seu aplicativo
        });

        const payload = ticket.getPayload();
        const userId = payload['sub']; // ID único do usuário Google
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture']; // URL da foto de perfil

        // --- Aqui é onde você integraria com seu banco de dados ---
        // Exemplo:
        // 1. Verificar se `email` ou `userId` já existe no seu banco de dados.
        // 2. Se não existir, criar um novo registro de usuário.
        // 3. Se existir, atualizar informações se necessário.
        // 4. Criar uma sessão para o usuário (por exemplo, usando cookies ou JWTs internos).
        //    (Para simplificar, não estamos criando uma sessão neste exemplo, apenas validando)

        console.log(`Login com Google bem-sucedido para: ${name} (${email})`);

        res.json({
            success: true,
            message: 'Login bem-sucedido!',
            user: { id: userId, email, name, picture }
        });

    } catch (error) {
        console.error('Erro ao verificar o token Google:', error);
        res.status(401).json({ success: false, message: 'Autenticação Google falhou.' });
    }
});

// Exemplo de uma página protegida (você precisaria de autenticação de sessão aqui)
app.get('/dashboard.html', (req, res) => {
    // Em uma aplicação real, você verificaria se o usuário está autenticado
    // antes de enviar este arquivo.
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Abra http://localhost:${PORT}/index.html no seu navegador`);
});