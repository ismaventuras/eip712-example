# EIP712-Example

An example implementation of [EIP712](https://eips.ethereum.org/EIPS/eip-712) using hardhat.

## What is EIP712?

EIP712 is an Ethereum Improvement Proposal that describes a standard way to sign typed data using the Ethereum blockchain. It is an extension of the Ethereum Improvement Proposal 191 [EIP-191](https://eips.ethereum.org/EIPS/eip-191) , which specifies how to sign messages with a hash.

The goal of EIP712 is to provide a standardized way for dApps (decentralized applications) to request a user's signature on a structured piece of data, such as a transaction or a message. This allows the user to verify that they are signing exactly what they intend to, and also provides a way for dApps to prove that a signature was obtained from a particular user. But you can also use EIP712 to sign pieces of data, give that signed data to another person and validate that you signed that data using onchain methods.

EIP712 defines a JSON schema for specifying the structure of the data to be signed, and a standard way of encoding this data into a byte array for hashing and signing. The resulting signature can then be used to verify the authenticity and integrity of the data.

One of the key benefits of EIP712 is that it makes it easier for users to interact with dApps securely, as they can verify exactly what they are signing. It also enables developers to build more secure and trustless applications, as they can prove that a particular signature was obtained from a specific user.

tl;dr This EIP aims to improve the usability of off-chain message signing for use on-chain.