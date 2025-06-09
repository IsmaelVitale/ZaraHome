// auth-guard.js - Versão Final - Gere segurança e os botões de utilizador

const CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsucmVwb3J0c2luZGl0ZXguc2l0ZSQ";

// Função para criar os botões de perfil e sair
const setupUserControls = (user) => {
    const placeholder = document.getElementById('user-controls-placeholder');
    if (!placeholder) return;

    const userIdentifier = user.username || user.firstName || 'Utilizador';

    placeholder.innerHTML = `
        <span class="text-gray-600 font-medium mr-4 hidden sm:inline">Olá, ${userIdentifier}</span>
        <button id="user-profile-button" class="bg-white text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Meu Perfil
        </button>
        <button id="sign-out-button" class="ml-2 bg-white text-red-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Sair
        </button>
    `;

    document.getElementById('user-profile-button').onclick = () => window.Clerk.openUserProfile();
    document.getElementById('sign-out-button').onclick = () => window.Clerk.signOut({ redirectUrl: '/' });
    placeholder.style.display = 'flex'; // Garante que os botões fiquem visíveis
};

// Função para mostrar a tela de boas-vindas na página principal
const showWelcomeScreen = () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');
    if (welcomeScreen) welcomeScreen.style.display = 'block';
    if (protectedContent) protectedContent.style.display = 'none';
};

// Função para mostrar o conteúdo protegido em qualquer página
const showProtectedContent = () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const protectedContent = document.getElementById('conteudo-protegido');
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (protectedContent) protectedContent.style.display = 'block';
    document.dispatchEvent(new CustomEvent('authReady'));
};

window.addEventListener('DOMContentLoaded', () => {
    const protectedContent = document.getElementById('conteudo-protegido');
    if(protectedContent) protectedContent.style.display = 'none';

    const script = document.createElement('script');
    script.setAttribute('data-clerk-publishable-key', CLERK_PUBLISHABLE_KEY);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";
    
    script.onload = () => {
        window.Clerk.load().then(() => {
            const isIndexPage = !!document.getElementById('welcome-screen');

            window.Clerk.addListener(({ session }) => {
                if (session) {
                    setupUserControls(session.user);
                    showProtectedContent();
                } else {
                    if (isIndexPage) {
                        showWelcomeScreen();
                    } else {
                        window.location.href = '/';
                    }
                }
            });

            if (isIndexPage) {
                const signInButton = document.getElementById('sign-in-button');
                if (signInButton) signInButton.onclick = () => window.Clerk.openSignIn();
            }
            
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
    
    document.head.appendChild(script);
});
