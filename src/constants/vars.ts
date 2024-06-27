import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

dotenv.config();

export const NODE_WALLET_ADDRESS = process.env.NODE_WALLET_ADDRESS as string;
export const WALLET_FILE = JSON.parse(
    readFileSync(path.join(__dirname, '../../wallet.json')).toString(),
);
export const PORT = process.env.PORT;
export const GET = "GET";
export const POST = "POST";
export const CRON_INTERVAL_MS = Number(process.env.CRON_INTERVAL_MS) || 1000

export const IMPORTANT_HEADERS = [
    'content-type',
    'content-length',
    'date',
    'server',
    'cache-control',
    'etag',
    'last-modified',
    'connection',
    'content-encoding',
    'transfer-encoding',
    'access-control-allow-origin',
    'vary',
    'content-security-policy',
    'x-frame-options',
    'strict-transport-security',
    'x-content-type-options',
    'x-xss-protection',
    'referrer-policy',
    'feature-policy'
];


export const validateEnvironmentVariables = (): void | true => {
    const missingVariables = [];

    if (!NODE_WALLET_ADDRESS) missingVariables.push('NODE_WALLET_ADDRESS');
    if (!WALLET_FILE) missingVariables.push('WALLET_FILE');
    if (!PORT) missingVariables.push('PORT');

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing environment variables: ${missingVariables.join(', ')}`,
        );
    } else {
        return true
    }
};