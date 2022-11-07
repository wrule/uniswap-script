import { BigNumber, ethers } from 'ethers';
import { Contract } from '../';

type ContractConstructorParameters = ConstructorParameters<typeof Contract>;

export
class ERC20
extends Contract {
  public constructor(...parameters: ContractConstructorParameters) {
    super(...parameters);
  }

  public async name(): Promise<string> {
    return await this.cprovider.name();
  }

  public async symbol(): Promise<string> {
    return await this.cprovider.symbol();
  }

  public async approve(address: string, amount: BigNumber): Promise<ethers.providers.TransactionResponse> {
    return await this.csigner.approve(address, amount);
  }

  public async balanceOf(address: string): Promise<BigNumber> {
    return await this.cprovider.balanceOf(address);
  }

  public async decimals(): Promise<number> {
    return await this.cprovider.decimals();
  }
}
