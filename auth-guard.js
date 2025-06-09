// auth-guard.js - V9 - Lógica de UI e segurança combinadas

const CLERK_PUBLISHABLE_KEY = "pk_test_dm9jYWwtYmlzb24tODkuY2xlcmsuYWNjb3VudHMuZGV2JA";

const setupUserControls = (user) => {
    const placeholder = document.getElementById('user-controls-placeholder');
    if (!placeholder) return;

    const userIdentifier = user.username || user.firstName || 'Utilizador';

    // Estrutura HTML dos botões de controlo
    const buttonsHTML = `
        <span class="text-gray-600 font-medium mr-4 hidden sm:inline">Olá, ${userIdentifier}</span>
        <button id="user-profile-button" class="bg-white text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Meu Perfil
        </button>
        <button id="sign-out-button" class="ml-2 bg-white text-red-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Sair
        </button>
    `;
    placeholder.innerHTML = buttonsHTML;

    // Adiciona a funcionalidade (os cliques) aos botões
    document.getElementById('user-profile-button').onclick = () => window.Clerk.openUserProfile();
    document.getElementById('sign-out-button').onclick = () => window.Clerk.signOut({ redirectUrl: '/' });
};

const showWelcomeScreen = () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');
    if (welcomeScreen) welcomeScreen.style.display = 'block';
    if (protectedContent) protectedContent.style.display = 'none';
};

const showProtectedContent = () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (protectedContent) protectedContent.style.display = 'block';
    // Dispara um evento para outras páginas (como o gerador) saberem que podem carregar o seu conteúdo.
    document.dispatchEvent(new CustomEvent('authReady'));
};

window.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
        window.Clerk.load().then(() => {
            const isIndexPage = !!document.getElementById('welcome-screen');

            // Ouve por qualquer mudança no estado de autenticação
            window.Clerk.addListener(({ session }) => {
                if (session) {
                    setupUserControls(session.user);
                    showProtectedContent();
                } else {
                    if (isIndexPage) {
                        showWelcomeScreen();
                    } else {
                        // Se o logout acontecer noutra página, redireciona para a página principal
                        window.location.href = '/';
                    }
                }
            });

            // Configura o botão de "Entrar" na página principal
            if (isIndexPage) {
                const signInButton = document.getElementById('sign-in-button');
                if (signInButton) {
                    signInButton.onclick = () => window.Clerk.openSignIn();
                }
            }
            
            // Verificação inicial quando a página carrega
            if (window.Clerk.session) {
                setupUserControls(window.Clerk.session.user);
                showProtectedContent();
            } else {
                if (isIndexPage) {
                    showWelcomeScreen();
                } else {
                    window.Clerk.openSignIn();
                }
            }
        });
    };
    
    // Esconde o conteúdo por defeito para evitar "flash"
    const protectedContent = document.getElementById('conteudo-protegido');
    if(protectedContent) protectedContent.style.display = 'none';
    
    document.head.appendChild(script);
});
