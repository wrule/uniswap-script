import { ethers } from 'ethers';
import { Address } from 'cluster';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { ERC20 } from './contracts/erc20';
import IERC20ABI from './contracts/erc20/abi.json';
import fs from 'fs';
import { UniswapV3Pool } from './contracts/uniswap_v3_pool';

const secret = require('./.secret.json');

interface Immutables {
  factory: Address;
  token0: Address;
  token1: Address;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

interface State {
  liquidity: ethers.BigNumber;
  sqrtPriceX96: ethers.BigNumber;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
}

async function getPoolImmutables(poolContract: any): Promise<Immutables> {
  const [
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  ] = await Promise.all([
    poolContract.factory(),
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.tickSpacing(),
    poolContract.maxLiquidityPerTick(),
  ]);
  return {
    factory,
    token0,
    token1,
    fee,
    tickSpacing,
    maxLiquidityPerTick,
  };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://optimism-mainnet.infura.io/v3/${secret.prj_id}`);
  const signer = provider.getSigner();
  const poolAddress = '0x85149247691df622eaF1a8Bd0CaFd40BC45154a9';
  const pool = new UniswapV3Pool(poolAddress, IUniswapV3PoolABI, provider, signer);
  await pool.Update();
  console.log(`1${pool.Pool.token0.symbol} = ${pool.Pool.token0Price.toFixed()}${pool.Pool.token1.symbol}`);
  console.log(`1${pool.Pool.token1.symbol} = ${pool.Pool.token1Price.toFixed()}${pool.Pool.token0.symbol}`);
}

main();
