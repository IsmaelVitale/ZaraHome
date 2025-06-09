// auth-guard.js - V6 com Login Iniciado pelo Utilizador

const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

// Aguarda o carregamento do DOM para garantir que os elementos existem.
window.addEventListener('DOMContentLoaded', () => {
    
    // Identifica os diferentes "estados" da página
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');
    const userControls = document.getElementById('user-controls');
    
    // Esconde tudo por defeito para evitar um "flash" de conteúdo
    if(welcomeScreen) welcomeScreen.style.display = 'none';
    if(protectedContent) protectedContent.style.display = 'none';
    if(userControls) userControls.style.display = 'none';

    // Carrega o script do Clerk
    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
        // Quando o script do Clerk carregar, inicia a biblioteca.
        window.Clerk.load().then(() => {
            
            // Função para mostrar o conteúdo protegido e esconder a tela de boas-vindas
            const showProtectedContent = (user) => {
                if(welcomeScreen) welcomeScreen.style.display = 'none';
                if(protectedContent) protectedContent.style.display = 'block';
                if(userControls) userControls.style.display = 'flex';

                const userNameSpan = document.getElementById('user-name');
                if (userNameSpan && user) {
                    const name = user.username || user.firstName;
                    if(name) userNameSpan.textContent = `, ${name}`;
                }
                
                document.dispatchEvent(new CustomEvent('authReady'));
            };

            // Função para mostrar a tela de boas-vindas
            const showWelcomeScreen = () => {
                if(welcomeScreen) welcomeScreen.style.display = 'block';
                if(protectedContent) protectedContent.style.display = 'none';
                if(userControls) userControls.style.display = 'none';
            };

            // Ouve por mudanças no estado do login
            window.Clerk.addListener(({ session }) => {
                if (session) {
                    showProtectedContent(session.user);
                } else {
                    showWelcomeScreen();
                }
            });

            // Configura os botões de utilizador, se existirem
            const userProfileButton = document.getElementById('user-profile-button');
            const signOutButton = document.getElementById('sign-out-button');
            if (userProfileButton) userProfileButton.onclick = () => window.Clerk.openUserProfile();
            if (signOutButton) signOutButton.onclick = () => window.Clerk.signOut({ redirectUrl: window.location.href });

            // Configura o botão principal de "Entrar"
            const signInButton = document.getElementById('sign-in-button');
            if(signInButton) signInButton.onclick = () => window.Clerk.openSignIn();


            // Verificação inicial
            if (window.Clerk.session) {
                showProtectedContent(window.Clerk.session.user);
            } else {
                showWelcomeScreen();
            }
        });
    };

    document.head.appendChild(script);
});
