import { BigNumber, ethers } from 'ethers';
import { Contract } from '../';
import { ERC20 } from '../erc20';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import IERC20ABI from '../erc20/abi.json';

export
interface Immutables {
  factory: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
  maxLiquidityPerTick: ethers.BigNumber;
}

export
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

export
interface ERC20_Meta {
  symbol: string;
  name: string;
  decimals: number;
}

type ContractConstructorParameters = ConstructorParameters<typeof Contract>;

export
class UniswapV3Pool
extends Contract {
  public constructor(...parameters: ContractConstructorParameters) {
    super(...parameters);
  }

  private immutables!: Immutables;
  private state!: State;
  private token0!: Token;
  private token1!: Token;

  public get Immutables() {
    return this.immutables;
  }

  public get State() {
    return this.state;
  }

  public get ERC20_Token0() {
    return new ERC20(this.immutables.token0, IERC20ABI, this.provider, this.signer);
  }

  public get ERC20_Token1() {
    return new ERC20(this.immutables.token1, IERC20ABI, this.provider, this.signer);
  }

  public get Pool() {
    return new Pool(
      this.token0,
      this.token1,
      this.immutables.fee,
      this.state.sqrtPriceX96.toString(),
      this.state.liquidity.toString(),
      this.state.tick,
    );
  }

  public async UpdateImmutables() {
    const [
      factory,
      token0,
      token1,
      fee,
      tickSpacing,
      maxLiquidityPerTick,
    ] = await Promise.all([
      this.cprovider.factory(),
      this.cprovider.token0(),
      this.cprovider.token1(),
      this.cprovider.fee(),
      this.cprovider.tickSpacing(),
      this.cprovider.maxLiquidityPerTick(),
    ]);
    this.immutables = {
      factory,
      token0,
      token1,
      fee,
      tickSpacing,
      maxLiquidityPerTick,
    };
  }

  public async UpdateState() {
    const [liquidity, slot] = await Promise.all([
      this.cprovider.liquidity(),
      this.cprovider.slot0(),
    ]);
    this.state = {
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

  public async UpdateToken0() {
    const meta = await this.GetERC20Info(this.ERC20_Token0);
    this.token0 = new Token(
      3,
      this.immutables.token0,
      meta.decimals,
      meta.symbol,
      meta.name,
    );
  }

  public async UpdateToken1() {
    const meta = await this.GetERC20Info(this.ERC20_Token1);
    this.token1 = new Token(
      3,
      this.immutables.token1,
      meta.decimals,
      meta.symbol,
      meta.name,
    );
  }

  public async GetERC20Info(erc20: ERC20): Promise<ERC20_Meta> {
    const [
      symbol,
      name,
      decimals,
    ] = await Promise.all([
      erc20.symbol(),
      erc20.name(),
      erc20.decimals(),
    ]);
    return { symbol, name, decimals };
  }

  public async Update() {
    await Promise.all([
      this.UpdateImmutables(),
      this.UpdateState(),
    ]);
    await Promise.all([
      this.UpdateToken0(),
      this.UpdateToken1(),
    ]);
  }
}
