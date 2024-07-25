const Arweave = require('arweave');
const fs = require('fs').promises;
const { WalletDAO } = require('ardrive-core-js');

const CLI_APP_NAME = '0rbit-Node-CLI';
const CLI_APP_VERSION = '1.0.0';

const arweave = Arweave.init({
    host: '127.0.0.1',
    port: 1984,
    protocol: 'http'
});

const cliWalletDao = new WalletDAO(arweave, CLI_APP_NAME, CLI_APP_VERSION);

async function generateWallet() {
    try {
        const key = await arweave.wallets.generate();
        const address = await arweave.wallets.jwkToAddress(key);
        
        await fs.writeFile('wallet.json', JSON.stringify(key, null, 2));
        
        return { key, address };
    } catch (error) {
        console.error('Error generating wallet:', error);
        throw error;
    }
}

async function generateSeedPhrase() {
    try {
        const seedPhrase = await cliWalletDao.generateSeedPhrase();
        return { seedPhrase };
    } catch (error) {
        console.error('Error generating seed phrase:', error);
        throw error;
    }
}

async function generate() {
    console.log('Generating Wallet...');
    const { key, address } = await generateWallet();
    console.log('\n__________ Wallet Details __________\n');
    console.log('Private Key (JWK):', JSON.stringify(key, null, 2));
    console.log('Public Address:', address);
    
    console.log('\nGenerating Seed Phrase...');
    const { seedPhrase } = await generateSeedPhrase();
    console.log('\n__________ Seed Phrase __________\n');
    console.log(seedPhrase);
    
    console.log('\x1b[31m%s\x1b[0m', "\nWARNING: Don't share this private key or seed phrase with anyone!\n___________________________________");
}

generate();
