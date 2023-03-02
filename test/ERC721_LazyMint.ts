import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers , network} from "hardhat";
import { signTypedData } from "../helpers/EIP712";
import { EIP712Domain, EIP712TypeDefinition } from "../helpers/EIP712.types";



describe("ERC721_LazyMint", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    
    // Contracts are deployed using the first signer/account by default
    const URI = "ipfs://bafkreigkzhpfdzy7ioefvodoetfcr26tf2cazn53lgie3olu5pyvmarpn4"
    const [owner, otherAccount] = await ethers.getSigners();    
    const ERC721_LazyMint = await ethers.getContractFactory("ERC721_LazyMint");
    
    // Create an EIP712 domainSeparator 
    // https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator
    const domainName = "LazyMint"  // the user readable name of signing domain, i.e. the name of the DApp or the protocol.
    const signatureVersion = "1" // the current major version of the signing domain. Signatures from different versions are not compatible.
    const chainId = network.config.chainId as number // the EIP-155 chain id. The user-agent should refuse signing if it does not match the currently active chain.
    // The typeHash is designed to turn into a compile time constant in Solidity. For example:
    // bytes32 constant MAIL_TYPEHASH = keccak256("Mail(address from,address to,string contents)");
    // https://eips.ethereum.org/EIPS/eip-712#rationale-for-typehash
    //const typeHash = "NFTVoucher(uint256 tokenId,string uri)"
    //const argumentTypeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(typeHash)); // convert to byteslike, then hash it 

    // https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
    const types: EIP712TypeDefinition = {
      NFTVoucher: [
          { name: "tokenId", type: "uint256" },
          { name: "uri", type: "string" },
      ]
    }  
    // get an instance of the contract
    const contract = await ERC721_LazyMint.deploy();

    const verifyingContract = contract.address // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.

    const domain:EIP712Domain = {
      name: domainName,
      version: signatureVersion,
      chainId: chainId, 
      verifyingContract: verifyingContract 
    }    
    
    return { contract, owner, otherAccount, domain,types, URI };
  }

  describe("Signing data", function () {

    it("Should mint tokens if the signature is valid", async function () {
      const { contract,domain,types, owner , otherAccount, URI } = await loadFixture(deployFixture);
      const NFTVoucher = {
          tokenId: 0,
          uri:URI,
      }       
      const signature = await signTypedData(domain,types,NFTVoucher, owner);
      const badSignature = await signTypedData(domain,types,NFTVoucher, otherAccount);

      await expect(contract.connect(otherAccount).redeem(NFTVoucher, badSignature)).to.be.revertedWithCustomError(contract, "InvalidSigner")
      await expect(contract.connect(otherAccount).redeem(NFTVoucher, signature)).to.not.be.reverted
      await expect(contract.connect(otherAccount).redeem(NFTVoucher, signature)).to.be.revertedWith('ERC721: token already minted')
    });
   
  });
});
