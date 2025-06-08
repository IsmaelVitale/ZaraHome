// auth-guard.js - V5 com verificação de e-mail segura

const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Aguarda o carregamento completo do DOM para garantir que todos os elementos HTML existam.
window.addEventListener('DOMContentLoaded', () => {

    const protectedContent = document.getElementById('conteudo-protegido');
    const userControls = document.getElementById('user-controls');

    if (!protectedContent) {
        console.error("Elemento crucial com ID 'conteudo-protegido' não encontrado. A aplicação não pode ser iniciada.");
        return;
    }

    // Esconde o conteúdo por defeito para aguardar a verificação de login.
    protectedContent.style.display = 'none';
    if(userControls) userControls.style.display = 'none';


    // Carrega dinamicamente o script principal do Clerk.
    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";

    script.onload = () => {
        // Quando o script do Clerk estiver pronto, inicia a biblioteca.
        window.Clerk.load()
            .then(() => {
                const userProfileButton = document.getElementById('user-profile-button');
                const signOutButton = document.getElementById('sign-out-button');

                // Ouve por mudanças no estado de autenticação (login/logout).
                window.Clerk.addListener(({ session }) => {
                    // ✅ CORREÇÃO: Verifica a existência da sessão e do utilizador
                    if (session && session.user) {
                        const userEmail = session.user.primaryEmailAddress ? session.user.primaryEmailAddress.emailAddress : 'Utilizador sem e-mail primário';
                        console.log("Estado da sessão alterado. Utilizador autenticado:", userEmail);

                        protectedContent.style.display = 'block';
                        if (userControls) userControls.style.display = 'flex';
                        document.dispatchEvent(new CustomEvent('authReady'));
                    } else {
                        // Se não há sessão (utilizador fez logout), esconde o conteúdo e abre o login.
                        protectedContent.style.display = 'none';
                        if (userControls) userControls.style.display = 'none';
                        window.Clerk.openSignIn();
                    }
                });

                // Configura os botões de utilizador, se eles existirem na página.
                if (userProfileButton) {
                    userProfileButton.onclick = () => window.Clerk.openUserProfile();
                }
                if (signOutButton) {
                    signOutButton.onclick = () => window.Clerk.signOut({ redirectUrl: window.location.href });
                }

                // Verificação inicial quando a página carrega.
                // ✅ CORREÇÃO: Verifica a existência da sessão e do utilizador
                if (window.Clerk.session && window.Clerk.session.user) {
                    const userEmail = window.Clerk.session.user.primaryEmailAddress ? window.Clerk.session.user.primaryEmailAddress.emailAddress : 'Utilizador sem e-mail primário';
                    console.log("Sessão ativa encontrada para:", userEmail);

                    protectedContent.style.display = 'block';
                    if (userControls) userControls.style.display = 'flex';
                    document.dispatchEvent(new CustomEvent('authReady'));
                } else {
                    // Se não, abre a janela de login.
                    console.log("Nenhum usuário logado. Abrindo o painel de login.");
                    window.Clerk.openSignIn();
                }
            })
            .catch(error => {
                console.error("Falha ao carregar o Clerk:", error);
            });
    };

    document.head.appendChild(script);
});
