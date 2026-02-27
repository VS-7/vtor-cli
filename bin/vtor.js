#!/usr/bin/env node

/**
 * Ponto de entrada do CLI — VTOR CLI
 * 
 * Este arquivo é o entry point registrado no package.json.
 * Sua única responsabilidade é inicializar a aplicação.
 */

import 'dotenv/config';
import { App } from '../src/app.js';

const app = new App();
app.run();
