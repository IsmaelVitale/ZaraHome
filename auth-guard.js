// auth-guard.js - Nosso Porteiro de Segurança com Clerk

// Chave publicável da sua aplicação no Clerk.
// ✅ CORREÇÃO: Chave atualizada com o valor que você forneceu.
const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Elemento da página que queremos proteger.
const protectedContent = document.getElementById('conteudo-protegido');

if (!protectedContent) {
    console.error("Elemento com ID 'conteudo-protegido' não encontrado. A segurança não pode ser aplicada.");
} else {
    // Esconde o conteúdo por padrão até o login ser verificado.
    protectedContent.style.display = 'none';
}

// Carrega o script do Clerk a partir do seu CDN.
const script = document.createElement('script');
script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
script.async = true;
script.src = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";

script.onload = () => {
    // Após o script carregar, inicia o Clerk e decide o que fazer.
    window.Clerk.load().then(() => {
        
        // Adiciona um "ouvinte" para saber quando o status do login muda.
        window.Clerk.addListener(({ user }) => {
            if (user) {
                // Se existe um usuário logado, mostra o conteúdo protegido.
                console.log("Usuário autenticado:", user.primaryEmailAddress.emailAddress);
                if (protectedContent) {
                    protectedContent.style.display = 'block';
                }
                
                // Dispara o evento para avisar a página que a autenticação está pronta.
                document.dispatchEvent(new CustomEvent('authReady'));
            }
        });

        // Verifica o estado atual do usuário.
        if (window.Clerk.user) {
            // Se o usuário já estiver logado, mostra o conteúdo.
            console.log("Sessão ativa encontrada para:", window.Clerk.user.primaryEmailAddress.emailAddress);
            if (protectedContent) {
                protectedContent.style.display = 'block';
            }
            document.dispatchEvent(new CustomEvent('authReady'));
        } else {
            // Se não houver ninguém logado, abre a janela de login do Clerk.
            console.log("Nenhum usuário logado. Abrindo o painel de login.");
            window.Clerk.openSignIn();
        }
    });
};

document.head.appendChild(script);
