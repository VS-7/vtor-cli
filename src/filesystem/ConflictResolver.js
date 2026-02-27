/**
 * ConflictResolver — Tratamento de conflitos de arquivos.
 * 
 * Quando um arquivo de destino já existe, este módulo
 * solicita confirmação do usuário antes de sobrescrever.
 * Implementa o RF04 do PRD.
 * 
 * Princípio: Responsabilidade Única (SRP) — só trata conflitos
 */

import { confirm } from '@inquirer/prompts';

export class ConflictResolver {

    /**
     * @param {import('../utils/logger.js').Logger} logger
     */
    constructor(logger) {
        this.logger = logger;

        /**
         * Cache de decisão do usuário para "aplicar a todos".
         * null = não decidido, true = sobrescrever tudo, false = pular tudo
         * @type {boolean|null}
         */
        this._decisaoGlobal = null;
    }

    /**
     * Pergunta ao usuário se deseja sobrescrever o arquivo existente.
     * 
     * @param {string} nomeArquivo - Nome do arquivo em conflito
     * @returns {Promise<boolean>} true para sobrescrever, false para pular
     */
    async resolver(nomeArquivo) {
        // Se já tem uma decisão global, usa ela
        if (this._decisaoGlobal !== null) {
            if (!this._decisaoGlobal) {
                this.logger.aviso(`  ⏩ Pulando: ${nomeArquivo} (decisão global)`);
            }
            return this._decisaoGlobal;
        }

        this.logger.aviso(`Arquivo já existe: ${nomeArquivo}`);

        const sobrescrever = await confirm({
            message: `Sobrescrever "${nomeArquivo}"?`,
            default: false,
        });

        return sobrescrever;
    }

    /**
     * Define uma decisão global para todos os conflitos restantes.
     * Útil para opção "sobrescrever todos" ou "pular todos".
     * 
     * @param {boolean} decisao - true para sobrescrever, false para pular
     */
    definirDecisaoGlobal(decisao) {
        this._decisaoGlobal = decisao;
    }

    /**
     * Reseta a decisão global (para novo ciclo de instalação).
     */
    resetar() {
        this._decisaoGlobal = null;
    }
}
