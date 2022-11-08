import { ethers } from 'ethers';
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

  public async maxLiquidityPerTick(): Promise<number> {
    return await this.cprovider.maxLiquidityPerTick();
  }
}
