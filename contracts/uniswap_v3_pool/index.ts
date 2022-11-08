import { BigNumber, ethers } from 'ethers';
import { Contract } from '../';

type ContractConstructorParameters = ConstructorParameters<typeof Contract>;

export
class UniswapV3Pool
extends Contract {
  public constructor(...parameters: ContractConstructorParameters) {
    super(...parameters);
  }

  public async factory(): Promise<string> {
    return await this.cprovider.factory();
  }

  public async token0(): Promise<string> {
    return await this.cprovider.token0();
  }

  public async token1(): Promise<string> {
    return await this.cprovider.token1();
  }

  public async fee(): Promise<number> {
    return await this.cprovider.fee();
  }

  public async tickSpacing(): Promise<number> {
    return await this.cprovider.tickSpacing();
  }

  public async maxLiquidityPerTick(): Promise<BigNumber> {
    return await this.cprovider.maxLiquidityPerTick();
  }

  public async liquidity(): Promise<BigNumber> {
    return await this.cprovider.liquidity();
  }

  public async slot0(): Promise<[BigNumber, number, number, number, number, number, boolean]> {
    return await this.cprovider.slot0();
  }
}
