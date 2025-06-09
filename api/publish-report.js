// Ficheiro a ser criado em: /api/publish-report.js
// ✅ CORREÇÃO: Sintaxe alterada para 'module.exports' para máxima compatibilidade.

module.exports = async (request, response) => {
  // 1. Medida de segurança: apenas aceita requisições do tipo POST.
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Método não permitido.' });
  }

  // 2. Lê a chave secreta das "Environment Variables" que configurámos na Vercel.
  const GITHUB_PAT = process.env.GITHUB_PAT;

  if (!GITHUB_PAT) {
    return response.status(500).json({ message: 'Chave de acesso do GitHub não configurada no servidor.' });
  }

  // 3. Extrai os dados que o gerador.html enviou.
  const { GITHUB_USER, GITHUB_REPO, event_type, client_payload } = request.body;

  if (!GITHUB_USER || !GITHUB_REPO || !event_type || !client_payload) {
      return response.status(400).json({ message: 'Payload da requisição incompleto.' });
  }

  const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`;

  try {
    // 4. O nosso servidor seguro faz a chamada para a API do GitHub, usando a chave secreta.
    const githubResponse = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: event_type,
        client_payload: client_payload,
      }),
    });

    // 5. Devolve uma resposta de sucesso ou de erro para o gerador.html.
    if (githubResponse.status === 204) {
      response.status(200).json({ message: 'Automação acionada com sucesso!' });
    } else {
      const errorData = await githubResponse.json();
      response.status(githubResponse.status).json({ message: `Erro do GitHub: ${errorData.message}` });
    }
  } catch (error) {
    console.error('Erro interno do servidor:', error);
    response.status(500).json({ message: `Erro interno do servidor: ${error.message}` });
  }
};
