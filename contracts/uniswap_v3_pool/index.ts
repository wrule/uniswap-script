import { BigNumber, ethers } from 'ethers';
import { Contract } from '../';

type ContractConstructorParameters = ConstructorParameters<typeof Contract>;

export
class UniswapV3Pool
extends Contract {
  public constructor(...parameters: ContractConstructorParameters) {
    super(...parameters);
  }

  public async _factory(): Promise<string> {
    return await this.cprovider.factory();
  }

  public async _token0(): Promise<string> {
    return await this.cprovider.token0();
  }

  public async _token1(): Promise<string> {
    return await this.cprovider.token1();
  }

  public async _fee(): Promise<number> {
    return await this.cprovider.fee();
  }

  public async _tickSpacing(): Promise<number> {
    return await this.cprovider.tickSpacing();
  }

  public async _maxLiquidityPerTick(): Promise<BigNumber> {
    return await this.cprovider.maxLiquidityPerTick();
  }

  public async _liquidity(): Promise<BigNumber> {
    return await this.cprovider.liquidity();
  }

  public async _slot0(): Promise<[BigNumber, number, number, number, number, number, boolean]> {
    return await this.cprovider.slot0();
  }
}
