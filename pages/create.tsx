import React, { FormEvent, useState } from "react";
import Header from "../components/Header";
import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import {
  ChainId,
  NFT,
  NATIVE_TOKENS,
  NATIVE_TOKEN_ADDRESS,
} from "@thirdweb-dev/sdk";
import network from "../utils/network";
import { useRouter } from "next/router";
type Props = {};

function Create({}: Props) {
  const router = useRouter();
  const address = useAddress();
  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT,
    "nft-collection"
  );
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const [selectedNft, setSelectedNft] = useState<NFT>();

  //give the NFT i have from the collections
  const ownedNFTs = useOwnedNFTs(collectionContract, address);
  // let to check if are in a wrong network
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const {
    mutate: createDirectListing,
    isLoading: isLoadindDirect,
    error: errorDirect,
  } = useCreateDirectListing(contract);
  const {
    mutate: createAuctionListing,
    isLoading,
    error,
  } = useCreateAuctionListing(contract);
  //this function get called when the form is submitted,
  // the user has provided : contact address, token id , type of listing , price of NFT
  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!selectedNft) return;

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "directListing") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7, // week
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSuccess(data, variables, context) {
            console.log("Sucess", data, variables, context);
            router.push("/");
          },
          onError(data, variables, context) {
            console.log("Error", data, variables, context);
          },
        }
      );
    }

    if (listingType.value === "auctionListing") {
      createAuctionListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7, // week
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
          reservePricePerToken: 0,
        },
        {
          onSuccess(data, variables, context) {
            console.log("Sucess", data, variables, context);
            router.push("/");
          },
          onError(data, variables, context) {
            console.log("Error", data, variables, context);
          },
        }
      );
    }
  };
  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">
          Select an item you would like to sell
        </h2>

        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNFTs?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
              className={`flex flex-col space-y-5 card min-w-fit
                 border-2 bg-gray-100 ${
                   nft.metadata.id === selectedNft?.metadata?.id
                     ? "border-black"
                     : "border-transparent"
                 }`}
            >
              <MediaRenderer
                className="h-48 rounded-lg"
                src={nft.metadata.image}
              />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10 ">
              <div className="grid grid-cols-2  gap-5">
                <label className="border-r font-light">
                  Direct Listing / Fixed Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-10 w-10 "
                />

                <label className="border-r font-light">Auction</label>
                <input
                  type="radio"
                  name="listingType"
                  value="auctionListing"
                  className="ml-auto h-10 w-10 "
                />

                <label>Price</label>
                <input
                  type="text"
                  name="price"
                  placeholder="0.05"
                  className="bg-gray-100 p-5"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-4 mt-8"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default Create;
