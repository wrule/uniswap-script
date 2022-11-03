
import { Pool } from '@uniswap/v3-sdk'
import { ethers } from 'ethers';

const secret = require('./.secret.json');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://optimism-mainnet.infura.io/v3/${secret.prj_id}`);
  console.log('你好，世界');
}

main();
