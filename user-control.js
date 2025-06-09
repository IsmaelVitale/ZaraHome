// Ficheiro: user-controls.js
// Este script é responsável por criar e dar vida aos botões de controlo do utilizador.

const createUserControls = () => {
    // 1. Encontra o local na página onde os botões devem ser inseridos.
    const placeholder = document.getElementById('user-controls-placeholder');
    if (!placeholder) {
        // Se a página não tiver o local para os botões, não faz nada.
        return;
    }

    // 2. Define a estrutura HTML dos botões.
    // Se quiser alterar o estilo, é só aqui que precisa de mexer.
    const buttonsHTML = `
        <button id="user-profile-button" class="bg-white text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Meu Perfil
        </button>
        <button id="sign-out-button" class="ml-2 bg-white text-red-600 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
          Sair
        </button>
    `;

    // 3. Insere os botões na página.
    placeholder.innerHTML = buttonsHTML;

    // 4. Adiciona a funcionalidade (os cliques) aos botões que acabaram de ser criados.
    const userProfileButton = document.getElementById('user-profile-button');
    const signOutButton = document.getElementById('sign-out-button');

    if (userProfileButton) {
        userProfileButton.onclick = () => {
            if (window.Clerk) {
                window.Clerk.openUserProfile();
            }
        };
    }
    if (signOutButton) {
        signOutButton.onclick = () => {
            if (window.Clerk) {
                // Ao sair, redireciona para a página principal para que a tela de "Entrar" apareça.
                window.Clerk.signOut({ redirectUrl: '/' });
            }
        };
    }
};

// Adiciona um "ouvinte" que espera pelo sinal 'authReady' do auth-guard.js.
// Isto garante que os botões só são criados para utilizadores autenticados.
document.addEventListener('authReady', createUserControls, { once: true });
