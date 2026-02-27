/**
 * TokenManager — Gerenciamento do token de acesso GitHub.
 * 
 * Armazena e recupera o Personal Access Token (PAT) do GitHub
 * em um arquivo de configuração na home do usuário (~/.vtorrc).
 * O token NUNCA é commitado no repositório do projeto.
 * 
 * Princípio: Responsabilidade Única (SRP) — apenas gerencia credenciais
 */

import path from 'path';
import os from 'os';
import fs from 'fs-extra';

/** Caminho do arquivo de configuração (~/.vtorrc) */
const CONFIG_PATH = path.join(os.homedir(), '.vtorrc');

export class TokenManager {

    /**
     * @param {import('../utils/logger.js').Logger} logger
     */
    constructor(logger) {
        this.logger = logger;
    }

    /**
     * Lê a configuração salva no disco.
     * @returns {Promise<Object>} Objeto de configuração
     * @private
     */
    async _lerConfig() {
        try {
            if (await fs.pathExists(CONFIG_PATH)) {
                const conteudo = await fs.readFile(CONFIG_PATH, 'utf-8');
                return JSON.parse(conteudo);
            }
        } catch {
            // Se o arquivo estiver corrompido, retorna vazio
            this.logger.aviso('Arquivo de configuração corrompido. Recriando...');
        }
        return {};
    }

    /**
     * Salva a configuração no disco.
     * @param {Object} config - Objeto de configuração
     * @private
     */
    async _salvarConfig(config) {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    }

    /**
     * Salva o token de acesso do GitHub.
     * @param {string} token - Personal Access Token (PAT) do GitHub
     */
    async salvarToken(token) {
        const config = await this._lerConfig();
        config.githubToken = token;
        await this._salvarConfig(config);
        this.logger.sucesso(`Token salvo em: ${CONFIG_PATH}`);
    }

    /**
     * Recupera o token de acesso do GitHub.
     * @returns {Promise<string|null>} Token salvo ou null se não existir
     */
    async obterToken() {
        // 1. Prioridade: variável de ambiente
        if (process.env.GITHUB_TOKEN) {
            return process.env.GITHUB_TOKEN;
        }

        // 2. Fallback: arquivo de configuração
        const config = await this._lerConfig();
        return config.githubToken || null;
    }

    /**
     * Verifica se existe um token configurado.
     * @returns {Promise<boolean>}
     */
    async temToken() {
        const token = await this.obterToken();
        return token !== null && token.length > 0;
    }

    /**
     * Remove o token salvo.
     */
    async removerToken() {
        const config = await this._lerConfig();
        delete config.githubToken;
        await this._salvarConfig(config);
        this.logger.sucesso('Token removido com sucesso.');
    }

    /**
     * Retorna os headers de autenticação para uso nas requisições.
     * Se não houver token, retorna headers sem autenticação.
     * 
     * @returns {Promise<Object>} Headers HTTP com ou sem Authorization
     */
    async obterHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        };

        const token = await this.obterToken();

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }
}
