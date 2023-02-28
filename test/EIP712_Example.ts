import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import type { BytesLike } from "ethers";
import { ethers , network} from "hardhat";
import { signTypedData } from "../helpers/EIP712";
import { EIP712Domain, EIP712TypeDefinition } from "../helpers/EIP712.types";


describe("EIP712_Example", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const domainName = "TicketGenerator" 
    const signatureVersion = "1"
    const typeHash = "Ticket(string eventName,uint256 price)"
    const argumentTypeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(typeHash)); // convert to byteslike, then hash it 
    const types: EIP712TypeDefinition = {
      Ticket: [
          { name: "eventName", type: "string" },
          { name: "price", type: "uint256" },
      ]
    }  

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();    
    const EIP712_Example = await ethers.getContractFactory("EIP712_Example");
    
    
    const contract = await EIP712_Example.deploy(domainName,signatureVersion,argumentTypeHash);

    const domain:EIP712Domain = {
      name: domainName,
      version: signatureVersion,
      chainId: network.config.chainId as number,
      verifyingContract: contract.address
    }    
    
    return { contract, owner, otherAccount, domain,types };
  }

  describe("Signing data", function () {

    it("Should verify that a ticket has been signed by the proper address", async function () {
      const { contract,domain,types, owner  } = await loadFixture(deployFixture);
      const ONE_ETHER = ethers.constants.WeiPerEther
      const ticket = {
        eventName:"EthDenver",
        price: ONE_ETHER,
      }            
      
      const signature = (await signTypedData(domain,types,ticket, owner))?.signature;
      
      expect(await contract.getSigner(ticket.eventName, ticket.price,signature as BytesLike)).to.equal(owner.address);
    });

   
  });


});
