/**
 * Constantes globais do projeto.
 * 
 * Centraliza todas as configurações fixas do CLI,
 * como URLs do repositório e diretórios válidos do Shopify.
 */

/** Repositório de origem no GitHub (owner/repo) */
export const GITHUB_REPO = process.env.GITHUB_REPO;

/** URL base da API do GitHub para conteúdo do repositório */
export const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

/** URL base para download via tiged */
export const TIGED_BASE = `github:${GITHUB_REPO}`;

/**
 * Diretórios padrão da estrutura de um tema Shopify.
 * Usados para mapear os arquivos do repositório remoto
 * para as pastas corretas no tema local.
 */
export const SHOPIFY_DIRS = [
    'assets',
    'blocks',
    'config',
    'layout',
    'locales',
    'sections',
    'snippets',
    'templates',
];

/** Pastas raiz do repositório remoto */
export const REMOTE_PATHS = {
    KITS: 'kits',
    COMPONENTS: 'components',
};

/** Nome do CLI exibido nos logs */
export const CLI_NAME = 'vtor';
