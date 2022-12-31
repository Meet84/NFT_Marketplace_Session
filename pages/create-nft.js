import { useState } from 'react'
import { ethers } from 'ethers'
const ipfsClient = require('ipfs-http-client');
//import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import Image from 'next/image'
const axios = require('axios');
const FormData = require('form-data');

import {
  nftaddress, nftmarketaddress,pinata_apikey,pinata_secretkey
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '', royalty:'' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
     let ipfsMetahash = await pinFileToIPFS(file);
     console.log("ipfsMetahash ",ipfsMetahash);
     const url = `https://gateway.pinata.cloud/ipfs/${ipfsMetahash}`
     setFileUrl(url)
  }

  async function createMarket() {
    const { name, description, price , royalty } = formInput
    if (!name || !description || !price || !royalty || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description,royalty, image: fileUrl
    })
    let jsonData = JSON.parse(data);
    try {
      const metadataHash = await pinJSONToIPFS(jsonData);
      const url = `https://ipfs.io/ipfs/${metadataHash}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      console.log("Metadata url is ",url);
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }


  async function pinJSONToIPFS (JSONBody) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return await axios
      .post(url, JSONBody, {
        headers: {
          pinata_api_key: pinata_apikey,
          pinata_secret_api_key: pinata_secretkey,

        }
      })
      .then(function (response) {
        const jsonhash = response.data.IpfsHash
        return jsonhash
      })
      .catch(function (error) {
        console.error(error)
      return error
      });
  }

 async  function pinFileToIPFS (file) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  //const fileContents = Buffer.from(file);
  const data = new FormData();
  data.append("file", file, {filepath: "anyname"});
  const result = await axios
      .post(url, data, {
          maxContentLength: -1,
          headers: {
              "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
              "pinata_api_key": pinata_apikey,
              "pinata_secret_api_key": pinata_secretkey,
              "path": "somename"
          }
      });
      let ipfsimagehash=result.data.IpfsHash
      return ipfsimagehash;
   }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    console.log("tx is",tx)
    let event = tx.events[0]
    console.log("event is ", event);

    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    console.log("Royality is ", formInput.royalty);
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, formInput.royalty, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
         <input
          placeholder="Royalty should be less then 20%"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, royalty: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <Image loader={() => fileUrl}  src={fileUrl} className="rounded mt-4" width={350} height={350} />
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-blue-500 text-white rounded p-4 shadow-lg">
         Mint NFT & Put on Sale
        </button>
      </div>
    </div>
  )
      }