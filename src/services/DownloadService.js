/**
 * DownloadService — Motor de download de componentes.
 * 
 * Suporta dois modos de download:
 * - Repositórios públicos: usa tiged (rápido, sem .git)
 * - Repositórios privados: usa GitHub API (tarball autenticado)
 * 
 * Princípio: Responsabilidade Única (SRP) — só faz download
 * Princípio: Inversão de Dependência (DIP) — recebe dependências via construtor
 */

import tiged from 'tiged';
import path from 'path';
import fs from 'fs-extra';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { execSync } from 'child_process';
import { TIGED_BASE, GITHUB_REPO } from '../config/constants.js';

export class DownloadService {

    /**
     * @param {import('../utils/logger.js').Logger} logger - Instância do logger
     * @param {import('../auth/TokenManager.js').TokenManager} tokenManager - Gerenciador de tokens
     */
    constructor(logger, tokenManager) {
        this.logger = logger;
        this.tokenManager = tokenManager;
    }

    /**
     * Realiza o download de um subdiretório do repositório.
     * Escolhe automaticamente o método baseado na disponibilidade do token.
     * 
     * @param {string} caminhoRemoto - Subcaminho no repositório (ex: "kits/base")
     * @param {string} destinoLocal - Caminho absoluto para a pasta de destino
     * @returns {Promise<void>}
     */
    async baixar(caminhoRemoto, destinoLocal) {
        const temToken = await this.tokenManager.temToken();

        if (temToken) {
            // Repositório privado: download via GitHub API
            await this._baixarViaAPI(caminhoRemoto, destinoLocal);
        } else {
            // Repositório público: download via tiged (mais rápido)
            await this._baixarViaTiged(caminhoRemoto, destinoLocal);
        }
    }

    /**
     * Download via GitHub API — funciona com repos privados.
     * Baixa o tarball do repositório e extrai apenas o subdiretório desejado.
     * 
     * @param {string} caminhoRemoto - Subcaminho no repositório
     * @param {string} destinoLocal - Pasta de destino
     * @private
     */
    async _baixarViaAPI(caminhoRemoto, destinoLocal) {
        this.logger.info(`Baixando (modo autenticado): ${caminhoRemoto}...`);

        const headers = await this.tokenManager.obterHeaders();
        const tarballUrl = `https://api.github.com/repos/${GITHUB_REPO}/tarball`;

        try {
            const resposta = await fetch(tarballUrl, {
                headers,
                redirect: 'follow',
            });

            if (!resposta.ok) {
                throw new Error(`Erro ao baixar tarball: HTTP ${resposta.status}`);
            }

            // Salva o tarball em arquivo temporário
            const tarballPath = path.join(destinoLocal, '..', `vtor-download-${Date.now()}.tar.gz`);
            const extractDir = path.join(destinoLocal, '..', `vtor-extract-${Date.now()}`);

            await fs.ensureDir(extractDir);

            // Escreve o tarball no disco
            const fileStream = createWriteStream(tarballPath);
            await pipeline(resposta.body, fileStream);

            // Extrai o tarball
            execSync(`tar -xzf "${tarballPath}" -C "${extractDir}"`, { stdio: 'pipe' });

            // O tarball do GitHub cria uma pasta com o nome do repo + hash
            // Precisamos encontrar essa pasta raiz
            const extraidos = await fs.readdir(extractDir);
            const pastaRaiz = path.join(extractDir, extraidos[0]);

            // Copia apenas o subdiretório desejado para o destino
            const pastaDesejada = path.join(pastaRaiz, caminhoRemoto);

            if (!await fs.pathExists(pastaDesejada)) {
                throw new Error(`Caminho "${caminhoRemoto}" não encontrado no repositório.`);
            }

            await fs.copy(pastaDesejada, destinoLocal);

            // Limpa arquivos temporários
            await fs.remove(tarballPath);
            await fs.remove(extractDir);

            this.logger.sucesso(`Download concluído: ${caminhoRemoto}`);

        } catch (erro) {
            this.logger.erro(`Falha no download de "${caminhoRemoto}": ${erro.message}`);
            throw erro;
        }
    }

    /**
     * Download via tiged — funciona apenas com repos públicos.
     * Mais rápido pois baixa diretamente o subdiretório.
     * 
     * @param {string} caminhoRemoto - Subcaminho no repositório
     * @param {string} destinoLocal - Pasta de destino
     * @private
     */
    async _baixarViaTiged(caminhoRemoto, destinoLocal) {
        const origem = `${TIGED_BASE}/${caminhoRemoto}`;

        this.logger.info(`Baixando: ${caminhoRemoto}...`);

        try {
            const emitter = tiged(origem, {
                disableCache: true,
                force: true,
                verbose: false,
            });

            // Escuta eventos do tiged para feedback
            emitter.on('info', (info) => {
                this.logger.sutil(info.message);
            });

            emitter.on('warn', (warning) => {
                this.logger.aviso(warning.message);
            });

            await emitter.clone(destinoLocal);

            this.logger.sucesso(`Download concluído: ${caminhoRemoto}`);
        } catch (erro) {
            this.logger.erro(`Falha no download de "${caminhoRemoto}": ${erro.message}`);
            throw erro;
        }
    }
}
