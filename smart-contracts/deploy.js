const HDWalletProvier = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const { interface, bytecode } = require('./compile')
require('dotenv').config()

// Setting up HD Wallet Provider
const provider = new HDWalletProvier(
	process.env.mnemonic,
	process.env.network_endpoint
)
const web3 = new Web3(provider)

// Deploying
const deploy = async () => {
	const accounts = await web3.eth.getAccounts()

	console.log('Attemping to deploy from account ', accounts[0])
	const parsedInterface = JSON.parse(interface)

	const result = await new web3.eth.Contract(parsedInterface)
		.deploy({
			data: bytecode,
		})
		.send({ gas: '500000', from: accounts[0] })

	console.log(interface)
	console.log('Contract deployed to ', result.options.address)
}
deploy()
