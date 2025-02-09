import { z } from "zod";
import { Agent, createTool } from "@covalenthq/ai-agent-sdk";
import Web3 from "web3";
import "dotenv/config";
import tokenMessengerAbi from "../abi/TokenMessenger.json";
import messageAbi from "../abi/Message.json";
import usdcAbi from "../abi/Usdc.json";
import messageTransmitterAbi from "../abi/MessageTransmitter.json";
interface AttestationResponse {
  status: string;
  attestation?: string;
}

const web3 = new Web3(process.env.ETH_TESTNET_RPC);

// Initialize signers
const ethSigner = web3.eth.accounts.privateKeyToAccount(
  process.env.ETH_PRIVATE_KEY!
);
const avaxSigner = web3.eth.accounts.privateKeyToAccount(
  process.env.AVAX_PRIVATE_KEY!
);
web3.eth.accounts.wallet.add(ethSigner);
web3.eth.accounts.wallet.add(avaxSigner);

const CONTRACT_ADDRESSES = {
  ETH_TOKEN_MESSENGER: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
  USDC_ETH: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  ETH_MESSAGE: "0x80537e4e8bab73d21096baa3a8c813b45ca0b7c9",
  AVAX_MESSAGE_TRANSMITTER: "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79",
};

const waitForTransaction = async (web3: Web3, txHash: string) => {
  let receipt = await web3.eth.getTransactionReceipt(txHash);
  while (receipt != null && receipt.status !== BigInt(1)) {
    receipt = await web3.eth.getTransactionReceipt(txHash);
    await new Promise((r) => setTimeout(r, 4000));
  }
  return receipt;
};

const bridgeTool = createTool({
  id: "usdc-bridge-tool",
  description: "Bridge USDC between Ethereum and Avalanche using Circle's CCTP",
  schema: z.object({
    amount: z.string(),
    recipientAddress: z.string().optional(),
  }),
  execute: async (parameters: unknown) => {
    try {
      const { amount, recipientAddress } = parameters as {
        amount: string;
        recipientAddress?: string;
      };
      const recipient = recipientAddress || process.env.RECIPIENT_ADDRESS!;

      // Initialize contracts
      const contracts = {
        tokenMessenger: new web3.eth.Contract(
          tokenMessengerAbi,
          CONTRACT_ADDRESSES.ETH_TOKEN_MESSENGER,
          { from: ethSigner.address }
        ),
        usdc: new web3.eth.Contract(usdcAbi, CONTRACT_ADDRESSES.USDC_ETH, {
          from: ethSigner.address,
        }),
        message: new web3.eth.Contract(
          messageAbi,
          CONTRACT_ADDRESSES.ETH_MESSAGE,
          { from: ethSigner.address }
        ),
        messageTransmitter: new web3.eth.Contract(
          messageTransmitterAbi,
          CONTRACT_ADDRESSES.AVAX_MESSAGE_TRANSMITTER,
          { from: avaxSigner.address }
        ),
      };

      // Get destination address in bytes32
      const destinationAddressInBytes32 = await contracts.message.methods
        .addressToBytes32(recipient)
        .call();

      const AVAX_DESTINATION_DOMAIN = 1;
      // Step 1: Approve
      const approvetxgas = await contracts.usdc.methods
        .approve(CONTRACT_ADDRESSES.ETH_TOKEN_MESSENGER, amount)
        .estimateGas();
      const approveTx = await contracts.usdc.methods
        .approve(CONTRACT_ADDRESSES.ETH_TOKEN_MESSENGER, amount)
        .send({ gas: approvetxgas.toString() });
      const approveTxReceipt = await waitForTransaction(
        web3,
        approveTx.transactionHash
      );
      console.log("ApproveTxReceipt: ", approveTxReceipt);
      // Step 2: Burn
      const burntxgas = await contracts.tokenMessenger.methods
        .depositForBurn(
          amount,
          AVAX_DESTINATION_DOMAIN,
          destinationAddressInBytes32,
          CONTRACT_ADDRESSES.USDC_ETH
        )
        .estimateGas();
      const burnTx = await contracts.tokenMessenger.methods
        .depositForBurn(
          amount,
          1,
          destinationAddressInBytes32,
          CONTRACT_ADDRESSES.USDC_ETH
        )
        .send({ gas: burntxgas.toString() });
      const burnReceipt = await waitForTransaction(
        web3,
        burnTx.transactionHash
      );
      console.log("BurnTxReceipt: ", burnReceipt);
      // Step 3: Get message bytes
      const transactionReceipt = await web3.eth.getTransactionReceipt(
        burnTx.transactionHash
      );
      const eventTopic = web3.utils.keccak256("MessageSent(bytes)");
      const log = transactionReceipt.logs.find(
        (l) => l.topics && l.topics[0] === eventTopic
      );

      if (!log || !log.data) {
        throw new Error("Failed to find MessageSent event in transaction logs");
      }

      const messageBytes = web3.eth.abi.decodeParameters(
        ["bytes"],
        log.data
      )[0] as string;
      const messageHash = web3.utils.keccak256(messageBytes);

      console.log(`MessageBytes: ${messageBytes}`);
      console.log(`MessageHash: ${messageHash}`);

      // Step 4: Get attestation
      let attestationResponse: AttestationResponse = { status: "pending" };
      while (attestationResponse.status !== "complete") {
        const response = await fetch(
          `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
        );
        attestationResponse = (await response.json()) as AttestationResponse;
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!attestationResponse.attestation) {
        throw new Error("No attestation signature received");
      }

      const attestationSignature = attestationResponse.attestation;
      console.log(`Signature: ${attestationSignature}`);
      // Step 5: Receive on destination
      web3.setProvider(process.env.AVAX_TESTNET_RPC);
      const avaxContract = new web3.eth.Contract(
        messageTransmitterAbi,
        CONTRACT_ADDRESSES.AVAX_MESSAGE_TRANSMITTER,
        { from: avaxSigner.address }
      );
      const receiveTxGas = await avaxContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .estimateGas();
      const receiveTx = await avaxContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .send({ gas: receiveTxGas.toString() });
      const receiveTxReceipt = await waitForTransaction(
        web3,
        receiveTx.transactionHash
      );
      console.log("ReceiveTxReceipt: ", receiveTxReceipt);
      return JSON.stringify({
        status: "success",
        message: "Bridge operation completed successfully",
        sourceHash: burnTx.transactionHash,
        destinationHash: receiveTx.transactionHash,
      });
    } catch (error) {
      return JSON.stringify({
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  },
});

const bridgeAgent = new Agent({
  name: "USDC bridge agent",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini",
    apiKey: process.env.OPEN_AI_API_KEY!,
  },
  description:
    "A specialized agent for bridging USDC between Ethereum and Avalanche using Circle's CCTP",
  instructions: [
    "Process bridge requests immediately without additional confirmation",
    "Accept amount and optional recipient address as parameters",
    "Default to environment-configured recipient if none provided",
    "Monitor and report all transaction stages",
  ],
  tools: { bridgeTool },
});

export { bridgeAgent, bridgeTool };
