
## Steps to Run the application
___

+ Step-1 : Clone the repo and run **npm install**.

+ Step-2 : Create .secret file and paste your private key.(account must have some fund for contract deployment).

+ Step-3 : Compile and deploy the code **npx hardhat compile**, **npx hardhat run ./script/deploy.js --network mumbai**.

+ Step-4 : Run the application vai **npm run dev**.

___

#### Please follow following step to complete testing(Resell/Royalty) :
___


+ Step-1 :  connect with metamask(mumbai). create two or three users account on metamask.. all account must have some test Matic tokens.

+ Step-2 :  hit create-nft tab and set Royality(1-19%) >> two transaction will initiate. first will createToken(mint) and second for putting item into marketplace.
+ Step-3 :  now switch account for buying NFT then purchase NFT... once purchase successfully it will display on purchased NFT (please check the price which was received by NFT creator).
+ Step-4 :  resell Nft( increase the price) >  two tx will initiate first-one for Approval and second for putting item again on Marketplace..
+ Step-5 :  Switch to Home tab you can see resale NFT over there..
+ Step-6 :  now you can repeat step-3,4,5 again with different user account
