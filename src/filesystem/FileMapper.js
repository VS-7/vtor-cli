/**
 * FileMapper — Mapeamento e distribuição de arquivos.
 * 
 * Responsável por identificar a estrutura de arquivos baixados
 * e distribuí-los nas pastas corretas do tema Shopify local,
 * conforme o padrão de diretórios definido no RF02.
 * 
 * Princípio: Responsabilidade Única (SRP) — só mapeia e move
 * Princípio: Inversão de Dependência (DIP) — recebe dependências via construtor
 */

import path from 'path';
import fs from 'fs-extra';
import { SHOPIFY_DIRS } from '../config/constants.js';

export class FileMapper {

    /**
     * @param {import('../utils/logger.js').Logger} logger
     * @param {import('./ConflictResolver.js').ConflictResolver} conflictResolver
     */
    constructor(logger, conflictResolver) {
        this.logger = logger;
        this.conflictResolver = conflictResolver;
    }

    /**
     * Distribui os arquivos de uma pasta temporária para o diretório
     * de trabalho atual, respeitando a estrutura Shopify.
     * 
     * @param {string} pastaOrigem - Caminho da pasta temporária com os arquivos baixados
     * @param {string} pastaDestino - Diretório raiz do tema Shopify local (cwd)
     * @returns {Promise<number>} Número de arquivos copiados
     */
    async distribuir(pastaOrigem, pastaDestino) {
        let totalCopiados = 0;

        // Itera sobre cada diretório padrão do Shopify
        for (const dir of SHOPIFY_DIRS) {
            const origemDir = path.join(pastaOrigem, dir);

            // Verifica se o diretório existe no conteúdo baixado
            if (!await fs.pathExists(origemDir)) {
                continue;
            }

            const destinoDir = path.join(pastaDestino, dir);

            // Garante que o diretório de destino existe
            await fs.ensureDir(destinoDir);

            // Lista os arquivos dentro do diretório
            const arquivos = await this._listarArquivosRecursivo(origemDir);

            for (const arquivoRelativo of arquivos) {
                const arquivoOrigem = path.join(origemDir, arquivoRelativo);
                const arquivoDestino = path.join(destinoDir, arquivoRelativo);

                // Verifica conflito antes de copiar
                const deveCopiar = await this._verificarConflito(arquivoDestino, arquivoRelativo);

                if (deveCopiar) {
                    await fs.ensureDir(path.dirname(arquivoDestino));
                    await fs.copy(arquivoOrigem, arquivoDestino);
                    this.logger.sucesso(`  → ${dir}/${arquivoRelativo}`);
                    totalCopiados++;
                }
            }
        }

        return totalCopiados;
    }

    /**
     * Lista todos os arquivos de um diretório de forma recursiva.
     * Retorna caminhos relativos ao diretório base.
     * 
     * @param {string} diretorio - Caminho absoluto do diretório
     * @param {string} [base=''] - Caminho base para relativizar
     * @returns {Promise<string[]>} Lista de caminhos relativos dos arquivos
     * @private
     */
    async _listarArquivosRecursivo(diretorio, base = '') {
        const itens = await fs.readdir(diretorio, { withFileTypes: true });
        let arquivos = [];

        for (const item of itens) {
            const caminhoRelativo = base ? path.join(base, item.name) : item.name;

            if (item.isDirectory()) {
                // Recursa em subdiretórios
                const subArquivos = await this._listarArquivosRecursivo(
                    path.join(diretorio, item.name),
                    caminhoRelativo
                );
                arquivos = arquivos.concat(subArquivos);
            } else {
                arquivos.push(caminhoRelativo);
            }
        }

        return arquivos;
    }

    /**
     * Verifica se existe conflito e delega ao ConflictResolver.
     * 
     * @param {string} caminhoDestino - Caminho absoluto do arquivo de destino
     * @param {string} nomeArquivo - Nome do arquivo para exibição
     * @returns {Promise<boolean>} true se deve copiar, false se cancelado
     * @private
     */
    async _verificarConflito(caminhoDestino, nomeArquivo) {
        const existe = await fs.pathExists(caminhoDestino);

        if (!existe) {
            return true;
        }

        // Delega ao ConflictResolver (RF04)
        return this.conflictResolver.resolver(nomeArquivo);
    }
}
