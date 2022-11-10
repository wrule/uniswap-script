import { BigNumber, ethers } from 'ethers';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { UniswapV3Pool } from './contracts/uniswap_v3_pool';
import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';

const secret = require('./.secret.json');

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${secret.prj_id}`);
  const signer = provider.getSigner();
  const poolAddress = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
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
  console.log(quotedAmountOut.div(BigNumber.from(10).pow(pool.Token0.decimals)).toString());

  // setInterval(async () => {
  //   await pool.UpdateState();
  //   console.log(`1${pool.Pool.token0.symbol} = ${pool.Pool.token0Price.toFixed()}${pool.Pool.token1.symbol}`);
  //   console.log(`1${pool.Pool.token1.symbol} = ${pool.Pool.token1Price.toFixed()}${pool.Pool.token0.symbol}`);
  // }, 1000);
}

main();
