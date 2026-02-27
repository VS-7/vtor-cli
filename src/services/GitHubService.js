/**
 * GitHubService — Comunicação com a API do GitHub.
 * 
 * Responsável por listar kits e componentes disponíveis
 * no repositório remoto. Suporta repositórios públicos e privados
 * através do TokenManager para autenticação.
 * 
 * Princípio: Responsabilidade Única (SRP)
 * Princípio: Inversão de Dependência (DIP) — recebe logger e tokenManager via construtor
 */

import { GITHUB_API_BASE, REMOTE_PATHS } from '../config/constants.js';

export class GitHubService {

    /**
     * @param {import('../utils/logger.js').Logger} logger - Instância do logger
     * @param {import('../auth/TokenManager.js').TokenManager} tokenManager - Gerenciador de tokens
     */
    constructor(logger, tokenManager) {
        this.logger = logger;
        this.tokenManager = tokenManager;
    }

    /**
     * Busca o conteúdo de um diretório no repositório GitHub.
     * Usa autenticação se houver token configurado.
     * 
     * @param {string} caminho - Caminho relativo no repositório
     * @returns {Promise<Array>} Lista de itens no diretório
     */
    async listarDiretorio(caminho) {
        const url = `${GITHUB_API_BASE}/${caminho}`;
        const headers = await this.tokenManager.obterHeaders();

        try {
            const resposta = await fetch(url, { headers });

            if (resposta.status === 401 || resposta.status === 403) {
                throw new Error(
                    'Acesso negado. Verifique se o token está correto.\n' +
                    '   Execute "vtor config" para reconfigurar.'
                );
            }

            if (resposta.status === 404) {
                const temToken = await this.tokenManager.temToken();
                const dica = temToken
                    ? 'Verifique se o caminho existe no repositório.'
                    : 'Se o repositório é privado, execute "vtor config" para configurar o token.';
                throw new Error(`Repositório ou caminho não encontrado. ${dica}`);
            }

            if (!resposta.ok) {
                throw new Error(`Erro HTTP ${resposta.status}: ${resposta.statusText}`);
            }

            const dados = await resposta.json();
            return dados;
        } catch (erro) {
            this.logger.erro(`Falha ao acessar o repositório: ${erro.message}`);
            throw erro;
        }
    }

    /**
     * Lista os kits disponíveis no repositório.
     * @returns {Promise<Array<{nome: string, caminho: string}>>} Lista de kits
     */
    async listarKits() {
        this.logger.info('Buscando kits disponíveis...');

        const itens = await this.listarDiretorio(REMOTE_PATHS.KITS);

        return itens
            .filter(item => item.type === 'dir')
            .map(item => ({
                nome: item.name,
                caminho: `${REMOTE_PATHS.KITS}/${item.name}`,
            }));
    }

    /**
     * Lista os componentes individuais disponíveis no repositório.
     * @returns {Promise<Array<{nome: string, caminho: string}>>} Lista de componentes
     */
    async listarComponentes() {
        this.logger.info('Buscando componentes disponíveis...');

        const itens = await this.listarDiretorio(REMOTE_PATHS.COMPONENTS);

        return itens
            .filter(item => item.type === 'dir')
            .map(item => ({
                nome: item.name,
                caminho: `${REMOTE_PATHS.COMPONENTS}/${item.name}`,
            }));
    }
}
