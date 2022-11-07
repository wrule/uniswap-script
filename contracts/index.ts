import { ethers } from 'ethers';

type ContractConstructorParameters = ConstructorParameters<typeof ethers.Contract>;

export
class Contract {
  public constructor(
    public readonly addressOrName: ContractConstructorParameters[0],
    public readonly contractInterface: ContractConstructorParameters[1],
    public readonly provider: ethers.providers.Provider,
    public readonly signer: ethers.Signer,
  ) { }

  public get cprovider() {
    return new ethers.Contract(this.addressOrName, this.contractInterface, this.provider);
  }

  public get csigner() {
    return new ethers.Contract(this.addressOrName, this.contractInterface, this.signer);
  }
}
