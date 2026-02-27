/**
 * ConfigCommand — Comando "config" do CLI.
 * 
 * Permite ao usuário configurar o token de acesso
 * para repositórios privados do GitHub.
 * 
 * Princípio: Responsabilidade Única (SRP) — só gerencia configuração
 * Princípio: Inversão de Dependência (DIP) — recebe dependências via construtor
 */

import { password, select } from '@inquirer/prompts';

export class ConfigCommand {

    /**
     * @param {import('../utils/logger.js').Logger} logger
     * @param {import('../auth/TokenManager.js').TokenManager} tokenManager
     */
    constructor(logger, tokenManager) {
        this.logger = logger;
        this.tokenManager = tokenManager;
    }

    /**
     * Executa o fluxo de configuração.
     * @returns {Promise<void>}
     */
    async executar() {
        try {
            const temToken = await this.tokenManager.temToken();

            const acao = await select({
                message: '⚙️  O que deseja configurar?',
                choices: [
                    {
                        name: temToken
                            ? '🔑 Atualizar token do GitHub (já configurado ✔)'
                            : '🔑 Configurar token do GitHub (necessário para repos privados)',
                        value: 'token',
                    },
                    {
                        name: '🗑️  Remover token salvo',
                        value: 'remover',
                        disabled: !temToken ? '(nenhum token salvo)' : false,
                    },
                    {
                        name: '📋 Verificar status da configuração',
                        value: 'status',
                    },
                ],
            });

            switch (acao) {
                case 'token':
                    await this._configurarToken();
                    break;
                case 'remover':
                    await this.tokenManager.removerToken();
                    break;
                case 'status':
                    await this._exibirStatus();
                    break;
            }

        } catch (erro) {
            if (erro.name === 'ExitPromptError') {
                this.logger.aviso('Configuração cancelada.');
                return;
            }
            this.logger.erro(`Erro na configuração: ${erro.message}`);
        }
    }

    /**
     * Solicita e salva o token do GitHub.
     * @private
     */
    async _configurarToken() {
        this.logger.info('Para acessar repositórios privados, você precisa de um Personal Access Token (PAT).');
        this.logger.sutil('Crie um em: https://github.com/settings/tokens');
        this.logger.sutil('Permissões necessárias: repo (acesso completo a repos privados)\n');

        const token = await password({
            message: '🔑 Cole seu GitHub Personal Access Token:',
            mask: '•',
            validate: (valor) => {
                if (!valor || valor.trim().length === 0) {
                    return 'O token não pode ser vazio.';
                }
                if (valor.trim().length < 10) {
                    return 'Token parece inválido (muito curto).';
                }
                return true;
            },
        });

        await this.tokenManager.salvarToken(token.trim());
        this.logger.sucesso('Token configurado com sucesso! Agora você pode acessar repositórios privados. 🔓');
    }

    /**
     * Exibe o status atual da configuração.
     * @private
     */
    async _exibirStatus() {
        const temToken = await this.tokenManager.temToken();

        console.log('');
        this.logger.destaque('📊 Status da configuração:');
        console.log('');

        if (temToken) {
            this.logger.sucesso('Token GitHub: Configurado ✔');

            // Indica a origem do token
            if (process.env.GITHUB_TOKEN) {
                this.logger.sutil('Origem: variável de ambiente GITHUB_TOKEN');
            } else {
                this.logger.sutil('Origem: arquivo ~/.vtorrc');
            }
        } else {
            this.logger.aviso('Token GitHub: Não configurado ✖');
            this.logger.sutil('Execute "vtor config" para configurar.');
        }

        console.log('');
    }
}
