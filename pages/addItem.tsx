import React, { FormEvent, useState } from "react";
import Header from "../components/Header";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
type Props = {};

function AddItem({}: Props) {
    const router = useRouter()
    const [preview , setPreview ]= useState<String>();
    const [image , setImage ] = useState<File>();
    const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT,
    "nft-collection"
  );
  const address = useAddress();

  const minNft =  async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!contract || !address) return;
    if(!image){
        alert('Please select an image');
        return;
    }
    const target = e.target as typeof e.target & {
        name: { value : string};
        description : { value : string};
    }
    //metadata information about NFT
    const metadata = {
        name : target.name.value,
        description : target.description.value,
        image : image,
    }

    try {
        const tx = await contract.mintTo(address, metadata);
        const receipt = tx.receipt // the transaction receipt
        const tokenId = tx.id // the id of the NFT ;
        const nft = await tx.data() // (optional) fetch details of minted NFT
        router.push("/");
    } catch (err){
        console.error(err)
    }

  }
  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to the MarketPlace</h1>
        <h2 className="text-xl font-semibold pt-5">Item Details</h2>
        <p className="pb-5">
          By adding an item to the marketplace, you're essentially Minting up an
          NFT of the item into your wallet which we can then list for sale!
        </p>

        <div className="flex flex-col justify-center items-center
         md:flex-row md:space-x-5 pt-5">
          <img
            className="border h-80 w-80 object-contain"
            src={ preview || "https://links.papareact.com/ucj"}
            alt=""
          />

          <form onSubmit ={minNft} className="flex flex-col flex-1 p-2 space-y-2">
            <label className="font-light">Name of Item</label>
            <input
              className="formFields"
              type="text"
              placeholder="Name of item..."
              id="name"
              name="name"
            />

            <label className="font-light">Description</label>
            <input
              className="formFields"
              type="text"
              placeholder="Enter Description..."
              id="description"
              name="description"
            />

            <label className="font-light">Image of the item</label>
            <input  type="file" onChange={e => {
                if(e.target.files?.[0]){
                setPreview(URL.createObjectURL(e.target.files[0]));
                setImage(e.target.files[0]);
                }
            }} />

            <button type="submit"
            className="bg-blue-600 font-bold text-white rounded-full py-4
             px-10 w-56 md:mt-auto mx-auto mt-5 md:ml-auto ">Add/Mint Item</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AddItem;
