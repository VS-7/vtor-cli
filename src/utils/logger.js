/**
 * Logger — Responsável pela saída visual no terminal.
 * 
 * Encapsula o uso do picocolors para fornecer
 * métodos semânticos de log (sucesso, erro, info, etc).
 * 
 * Princípio: Responsabilidade Única (SRP)
 */

import pc from 'picocolors';

export class Logger {

    /**
     * Exibe uma mensagem de informação (azul).
     * @param {string} mensagem - Texto a ser exibido
     */
    info(mensagem) {
        console.log(pc.cyan(`ℹ  ${mensagem}`));
    }

    /**
     * Exibe uma mensagem de sucesso (verde).
     * @param {string} mensagem - Texto a ser exibido
     */
    sucesso(mensagem) {
        console.log(pc.green(`✔  ${mensagem}`));
    }

    /**
     * Exibe uma mensagem de aviso (amarelo).
     * @param {string} mensagem - Texto a ser exibido
     */
    aviso(mensagem) {
        console.log(pc.yellow(`⚠  ${mensagem}`));
    }

    /**
     * Exibe uma mensagem de erro (vermelho).
     * @param {string} mensagem - Texto a ser exibido
     */
    erro(mensagem) {
        console.error(pc.red(`✖  ${mensagem}`));
    }

    /**
     * Exibe o banner/header do CLI.
     */
    banner() {
        console.log('');
        console.log(pc.bold(pc.magenta('  ╔══════════════════════════════╗')));
        console.log(pc.bold(pc.magenta('  ║    🚀  VTOR CLI  v1.0.0    ║')));
        console.log(pc.bold(pc.magenta('  ║   Shopify Component Tool    ║')));
        console.log(pc.bold(pc.magenta('  ╚══════════════════════════════╝')));
        console.log('');
    }

    /**
     * Exibe texto em destaque (negrito).
     * @param {string} mensagem - Texto a ser exibido
     */
    destaque(mensagem) {
        console.log(pc.bold(mensagem));
    }

    /**
     * Exibe texto esmaecido (para detalhes secundários).
     * @param {string} mensagem - Texto a ser exibido
     */
    sutil(mensagem) {
        console.log(pc.dim(`   ${mensagem}`));
    }
}
