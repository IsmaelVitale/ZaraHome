// auth-guard.js - V3 com controlos de utilizador

const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

const protectedContent = document.getElementById('conteudo-protegido');

/**
 * Mostra o conteúdo protegido e configura os botões de utilizador.
 * @param {object} user - O objeto do utilizador do Clerk.
 */
function showContentAndSetupControls(user) {
    if (!protectedContent) {
        console.error("Elemento com ID 'conteudo-protegido' não encontrado.");
        return;
    }

    console.log("Usuário autenticado:", user.primaryEmailAddress.emailAddress);
    protectedContent.style.display = 'block';

    const userProfileButton = document.getElementById('user-profile-button');
    const signOutButton = document.getElementById('sign-out-button');

    if (userProfileButton) {
        userProfileButton.onclick = () => window.Clerk.openUserProfile();
    }
    if (signOutButton) {
        // Redireciona para a mesma página após o logout, o que forçará um novo login.
        signOutButton.onclick = () => window.Clerk.signOut({ redirectUrl: window.location.href });
    }

    // Dispara um evento para que outras partes da página saibam que a autenticação está pronta.
    document.dispatchEvent(new CustomEvent('authReady'));
}

/**
 * Esconde o conteúdo protegido.
 */
function hideContent() {
    if (protectedContent) {
        protectedContent.style.display = 'none';
    }
}

// Carrega o script principal do Clerk.
const script = document.createElement('script');
script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
script.async = true;
script.src = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
script.crossOrigin = "anonymous";

script.onload = () => {
    // Quando o script do Clerk carregar, inicia a biblioteca.
    window.Clerk.load().then(() => {
        
        // Adiciona um "ouvinte" que reage a mudanças no estado de login/logout.
        window.Clerk.addListener(({ user }) => {
            if (user) {
                showContentAndSetupControls(user);
            } else {
                // Se o utilizador fizer logout, o conteúdo é escondido.
                hideContent();
            }
        });

        // Verificação inicial quando a página carrega.
        if (window.Clerk.user) {
            // Se o Clerk já tem uma sessão ativa, mostra o conteúdo.
            showContentAndSetupControls(window.Clerk.user);
        } else {
            // Se não há sessão, abre a janela de login.
            console.log("Nenhum usuário logado. Abrindo o painel de login.");
            window.Clerk.openSignIn();
        }
    });
};

document.head.appendChild(script);
