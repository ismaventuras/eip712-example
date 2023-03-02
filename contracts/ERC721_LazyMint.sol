//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract ERC721_LazyMint is ERC721URIStorage, EIP712{
    address immutable NFT_SIGNER;
    string private constant SIGNING_DOMAIN = "LazyMint";
    string private constant SIGNATURE_VERSION = "1";
    bytes32 typeHash = keccak256("NFTVoucher(uint256 tokenId,string uri)");

    /// @notice Represents an error reason when the signature for the voucher is invalid.
    error InvalidSigner();

    /// @notice Represents an un-minted NFT, which has not yet been recorded into the blockchain. 
    /// A signed voucher can be redeemed for a real NFT using the redeem function.
    struct NFTVoucher {
        /// @notice The id of the token to be redeemed. Must be unique - if another token with this ID already exists, the redeem function will revert.
        uint256 tokenId;

        /// @notice The metadata URI to associate with this token.
        string uri;
    }

    constructor() 
        ERC721("LazyMint", "lmNFT") 
        EIP712(SIGNING_DOMAIN,SIGNATURE_VERSION)
    {
        NFT_SIGNER = msg.sender;
    }    

    /// @notice Redeems an NFTVoucher for an actual NFT, creating it in the process.
    /// @param voucher A signed NFTVoucher that describes the NFT to be redeemed.
    /// @param signature The signature of the NFTVoucher.
    function redeem(NFTVoucher calldata voucher, bytes memory signature) public{
        // make sure signature is valid and get the address of the signer
        address signer = _verify(voucher, signature);
        if(NFT_SIGNER != signer) revert InvalidSigner();
        
        _mint(msg.sender, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.uri);

    }
    
    /// @notice Returns a hash of the given NFTVoucher, prepared using EIP712 typed data hashing rules.
    /// @param voucher An NFTVoucher to hash.
    function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
        typeHash,
        voucher.tokenId,
        keccak256(bytes(voucher.uri))
        )));
    }
    /// @notice Verifies the signature for a given NFTVoucher, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
    /// @param voucher An NFTVoucher describing an unminted NFT.
    function _verify(NFTVoucher calldata voucher, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, signature);
    }
}