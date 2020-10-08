# My Governance Example

This is a demo project for embark framework.

## Getting Started

0. clone repository and move into folder
    ```bash
    git clone git@github.com:3esmit/my-governance-example.git
    cd my-governance-example
    ```

1. install node 10.17.0, recommended using nvm https://github.com/creationix/nvm
    ```bash
    nvm install 10.17.0
    nvm alias default 10.17.0
    ```
2. install go-ethereum (geth)
    ```bash
    sudo add-apt-repository -y ppa:ethereum/ethereum
    sudo apt-get update
    sudo apt-get install geth -y
    ```
3. install a. `ipfs` or b. `swarm` and initialize it.  
    - IPFS:
        ```bash 
        sudo snap install ipfs
        ipfs init
        ```
    - SWARM:
        ```bash 
        #TODO
        ```
4. run unit test
    ```bash 
    npx embark test
    ```
5. run development environment
    ```bash 
    npx embark run
    ```

## Deploy

### Ropsten
To deploy to ropsten you must provide the environment variable `ETH_DEPLOY_ADDRESS`:
```bash
$ export ETH_DEPLOY_ADDRESS="0x<your-address>"
```
This account must appear in the accounts list (`npm run list-accs-ropsten`), and it must be encrypted with the password written in the file `config/ropsten/.password`. 

If you don't have an address, use `npm run new-acc-ropsten` to create a new account, copy the address outputed in the terminal and go to a [faucet](https://faucet.dimensions.network/) to get some ropsten test ether. This keys will be saved in `~/keys/ropsten/`.

To customize the behavior, look into `config/ropsten/.env`, `script/ethereum.sh` and `package.json`. 

See your address in a block explorer: `https://ropsten.etherscan.io/address/0x<your-address>`

## Upload

### IPFS

To upload to a descentralized storage run `npm run upload-ropsten`. 

The manual command to upload the build folder is `ipfs add -r dist/`

To access the uploaded dapp in localhost, run ipfs service:
```
ipfs daemon
```

### Swarm

TODO

The manual command to upload the build folder is `swarm --defaultpath dist/index.html --recursive up dist/`

## Publish to ENS

Setup ENS domain (go to https://app.ens.domains/)

## Scripts

Runs dapp on development network (ganache):  
`npx embark test`

Runs unit tests on development network (ganache):  
`npx embark run`

Creates a new account for ropsten:  
`npm run new-acc-ropsten`

Lists ropsten accounts:  
`npm run list-accs-ropsten`

Starts an ETH node for ropsten:  
`npm run eth-ropsten`

Waits until ropsten network is synced:  
`npm run wait-ropsten`

Starts ropsten node, waits network sync, deploy contracts and start webserver:  
`npm run run-ropsten`

Builds ropsten, waits network sync, deploy contracts and upload to ipfs:  
`npm run upload-ropsten`