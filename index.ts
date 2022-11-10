import { BigNumber, ethers } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { UniswapV3Pool } from './contracts/uniswap_v3_pool';
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { Route, Trade } from '@uniswap/v3-sdk';
import { CurrencyAmount, TradeType } from '@uniswap/sdk-core';

const secret = require('./.secret.json');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${secret.prj_id}`);
  const signer = provider.getSigner();
  const poolAddress = '0xF79817bD541D686F926aDCd01a950472B8AB890D';
  const pool = new UniswapV3Pool(poolAddress, IUniswapV3PoolABI, provider, signer);
  await pool.Update();

  const quoterContract = new ethers.Contract('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', QuoterABI, provider);
  // 1ETH to USDC
  const amountIn = BigNumber.from(10).pow(pool.Token1.decimals).mul(1);
  const quotedAmountOut: BigNumber = await quoterContract.callStatic.quoteExactInputSingle(
    pool.Immutables.token1,
    pool.Immutables.token0,
    pool.Immutables.fee,
    amountIn.toString(),
    0,
  );

  const swapRoute = new Route([pool.Pool], pool.Token1, pool.Token0);
  const uncheckedTradeExample = await Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(pool.Token1, amountIn.toString()),
    outputAmount: CurrencyAmount.fromRawAmount(pool.Token0, quotedAmountOut.toString()),
    tradeType: TradeType.EXACT_INPUT,
  });
  console.log(quotedAmountOut.div(BigNumber.from(10).pow(pool.Token0.decimals)).toString());
  console.log(uncheckedTradeExample);

  setInterval(async () => {
    await pool.UpdateState();
    console.log(`1${pool.Pool.token0.symbol} = ${pool.Pool.token0Price.toFixed()}${pool.Pool.token1.symbol}`);
    console.log(`1${pool.Pool.token1.symbol} = ${pool.Pool.token1Price.toFixed()}${pool.Pool.token0.symbol}`);
  }, 1000);
}

main();
