import { BigNumber, ethers } from 'ethers';
import { Contract } from '../';

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

type ContractConstructorParameters = ConstructorParameters<typeof Contract>;

export
class UniswapV3Pool
extends Contract {
  public constructor(...parameters: ContractConstructorParameters) {
    super(...parameters);
  }

  private immutables!: Immutables;
  private state!: State;

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

  public async Update() {
    await Promise.all([this.UpdateImmutables(), this.UpdateState()]);
  }
}
