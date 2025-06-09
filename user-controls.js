// auth-guard.js - V8 com Lógica de UI Explícita

const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

window.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');

    // Função para mostrar a tela de boas-vindas
    const showWelcomeScreen = () => {
        if (welcomeScreen) welcomeScreen.style.display = 'block';
        if (protectedContent) protectedContent.style.display = 'none';
    };

    // Função para mostrar o conteúdo protegido
    const showProtectedContent = () => {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (protectedContent) protectedContent.style.display = 'block';
        document.dispatchEvent(new CustomEvent('authReady'));
    };

    // Esconde tudo por defeito para evitar o "flash" de conteúdo
    if (protectedContent) protectedContent.style.display = 'none';
    // Mostra a tela de boas-vindas por defeito, se existir na página
    if (welcomeScreen) {
        showWelcomeScreen();
    }
    
    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
        window.Clerk.load().then(() => {
            const signInButton = document.getElementById('sign-in-button');
            if (signInButton) {
                signInButton.onclick = () => window.Clerk.openSignIn();
            }

            window.Clerk.addListener(({ session }) => {
                if (session) {
                    showProtectedContent();
                } else {
                    showWelcomeScreen();
                }
            });

            // Verificação inicial
            if (window.Clerk.session) {
                showProtectedContent();
            } else {
                const isIndexPage = window.location.pathname === '/index.html' || window.location.pathname === '/';
                if (!isIndexPage) {
                    // Para qualquer página que não seja a principal, força o login
                    window.Clerk.openSignIn();
                } else {
                    // Na página principal, mostra a tela de boas-vindas
                    showWelcomeScreen();
                }
            }
        });
    };
    document.head.appendChild(script);
});
