// auth-guard.js - Nosso Porteiro de Segurança Central

// ==================================================================
// 1. CONFIGURAÇÃO DA BIBLIOTECA DE AUTENTICAÇÃO DA MICROSOFT (MSAL)
// ==================================================================

// Configuração principal. Os IDs abaixo foram os que você forneceu.
const msalConfig = {
    auth: {
        // ID do Aplicativo (cliente) copiado do Portal do Azure.
        clientId: "a9d1e3cb-a6eb-4f88-b833-eca4ea51f7e4",
        // ID do Diretório (locatário) copiado do Portal do Azure.
        authority: "https://login.microsoftonline.com/f0536299-a18e-4216-aca1-81757293d073",
        // A URL para onde o usuário será enviado após o login.
        // Deve ser exatamente a mesma que você configurou no Azure.
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage", // Usa a sessão do navegador para armazenar o status do login
        storeAuthStateInCookie: false,
    }
};

// Cria uma instância da aplicação cliente da MSAL.
// Precisamos carregar a biblioteca da Microsoft antes de usar isso.
let msalInstance;

// ==================================================================
// 2. LÓGICA DO "PORTEIRO"
// ==================================================================

// Esta é a função principal que protege a página.
function runAuthGuard() {
    const accounts = msalInstance.getAllAccounts();
    const protectedContent = document.getElementById('conteudo-protegido');

    if (!protectedContent) {
        console.error("Elemento com ID 'conteudo-protegido' não encontrado. A segurança não pode ser aplicada.");
        return;
    }

    if (accounts.length === 0) {
        // Ninguém logado. Redireciona para a página de login da Microsoft.
        msalInstance.loginRedirect();
    } else {
        // Usuário já está logado. Mostra o conteúdo da página.
        console.log("Usuário autenticado:", accounts[0].username);
        protectedContent.style.display = 'block';
    }
}

// ==================================================================
// 3. INICIALIZAÇÃO
// ==================================================================

// Função para carregar o script da MSAL dinamicamente.
function loadMsalScript(callback) {
    const script = document.createElement('script');
    script.src = "https://alcdn.msauth.net/browser/2.14.2/js/msal-browser.min.js";
    script.integrity = "sha384-ms2S6DL/LWyjoGstsC1JzrZ1vrEqC49oG9HwFCyAra+fLOy/LAFBOwNOvs4b2nI3";
    script.crossOrigin = "anonymous";
    script.onload = callback; // Quando o script carregar, chama a função de callback
    document.head.appendChild(script);
}

// Inicia o processo quando o script auth-guard.js é carregado.
loadMsalScript(() => {
    // Agora que o script da MSAL carregou, podemos criar a instância.
    msalInstance = new msal.PublicClientApplication(msalConfig);

    // A MSAL precisa processar o redirecionamento quando o usuário volta da página de login.
    msalInstance.handleRedirectPromise()
        .then(() => {
            // Após processar, rodamos nosso porteiro.
            runAuthGuard();
        })
        .catch(error => {
            console.error(error);
        });
});