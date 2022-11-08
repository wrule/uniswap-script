import { ethers } from 'ethers';
import { Address } from 'cluster';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { ERC20 } from './contracts/erc20';
import IERC20ABI from './contracts/erc20/abi.json';
import fs from 'fs';

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

async function get_erc20_info(erc20: ERC20) {
  const [symbol, name, decimals] = await Promise.all([erc20.symbol(), erc20.name(), erc20.decimals()]);
  return { symbol, name, decimals };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://optimism-mainnet.infura.io/v3/${secret.prj_id}`);
  const signer = provider.getSigner();
  const poolAddress = '0x85C31FFA3706d1cce9d525a00f1C7D4A2911754c';
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
  console.log('获取池信息');
  const [immutables, state] = await Promise.all([getPoolImmutables(poolContract), getPoolState(poolContract)]);
  console.log('信息已获取');
  const erc20_0 = new ERC20((immutables as any).token0, IERC20ABI, provider, signer);
  const erc20_1 = new ERC20((immutables as any).token1, IERC20ABI, provider, signer);

  const [erc20_0_info, erc20_1_info] = await Promise.all([get_erc20_info(erc20_0), get_erc20_info(erc20_1)]);
  const token_a = new Token(3, (immutables as any).token0, erc20_0_info.decimals, erc20_0_info.symbol, erc20_0_info.name);
  const token_b = new Token(3, (immutables as any).token1, erc20_1_info.decimals, erc20_1_info.symbol, erc20_1_info.name);
  const poolExample = new Pool(
    token_a,
    token_b,
    immutables.fee,
    state.sqrtPriceX96.toString(),
    state.liquidity.toString(),
    state.tick,
  );
  console.log(poolExample.token0.symbol, poolExample.token1.symbol);
  console.log(poolExample.token0Price.toFixed());
  console.log(poolExample.token1Price.toFixed());
}

main();
