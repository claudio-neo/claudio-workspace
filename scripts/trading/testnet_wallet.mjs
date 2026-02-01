// Minimal testnet4 wallet — generate address, check balance
import * as ecc from 'tiny-secp256k1'
import { ECPairFactory } from 'ecpair'
import * as bitcoin from 'bitcoinjs-lib'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WALLET_PATH = join(__dirname, '..', '.testnet4_wallet.json')

const ECPair = ECPairFactory(ecc)

// Testnet4 network params (same as testnet3 for address format)
const testnet = bitcoin.networks.testnet

function loadOrCreateWallet() {
  if (existsSync(WALLET_PATH)) {
    const data = JSON.parse(readFileSync(WALLET_PATH, 'utf8'))
    console.log('Loaded existing testnet4 wallet')
    return data
  }
  
  // Generate new keypair
  const keyPair = ECPair.makeRandom({ network: testnet })
  const { address } = bitcoin.payments.p2wpkh({ 
    pubkey: Buffer.from(keyPair.publicKey),
    network: testnet 
  })
  
  const wallet = {
    address,
    publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    privateKey: Buffer.from(keyPair.privateKey).toString('hex'),
    network: 'testnet4',
    created: new Date().toISOString()
  }
  
  writeFileSync(WALLET_PATH, JSON.stringify(wallet, null, 2))
  console.log('Created new testnet4 wallet')
  return wallet
}

const wallet = loadOrCreateWallet()
console.log(`Address: ${wallet.address}`)
console.log(`Network: ${wallet.network}`)
console.log(`Created: ${wallet.created}`)
