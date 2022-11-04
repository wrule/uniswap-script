import { ethers } from 'ethers';
import { Address } from 'cluster';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

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

async function getPoolState(poolContract: any): Promise<State> {
  const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()]);
  return {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${secret.prj_id}`);
  const poolAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8';
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
  const [immutables, state] = await Promise.all([getPoolImmutables(poolContract), getPoolState(poolContract)]);
  const USDC = new Token(3, (immutables as any).token0, 6, 'USDC', 'USD Coin');
  const WETH = new Token(3, (immutables as any).token1, 18, 'WETH', 'Wrapped Ether');
  const poolExample = new Pool(
    USDC,
    WETH,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick,
  );
  console.log(poolExample);
}

main();
