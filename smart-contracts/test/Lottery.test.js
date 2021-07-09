const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const provider = ganache.provider()
const web3 = new Web3(provider)

const { interface, bytecode } = require('../compile')

let lottery
let accounts

beforeEach(async () => {
	accounts = await web3.eth.getAccounts()

	const parsedInterface = JSON.parse(interface)
	lottery = await new web3.eth.Contract(parsedInterface)
		.deploy({
			data: bytecode,
		})
		.send({ from: accounts[0], gas: '1000000' })
})

describe('Lottery Contract', () => {
	it('Deploys a contract success assertion', () => {
		assert.ok(lottery.options.address)
	})

	it('Allowing one account to bet their money into the Lottery assertion', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'), // Web3 utility tool: Converting Wei into Ether
		})

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		})

		assert(accounts[0], players[0])

		assert.strictEqual(1, players.length)
	})

	it('Entering multiple accounts to bet their money into the Lottery Assertion', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether'),
		})
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether'),
		})
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether'),
		})

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0],
		})

		assert(accounts[0], players[0])
		assert(accounts[1], players[1])
		assert(accounts[2], players[2])
		assert.strictEqual(3, players.length)
	})

	it('Required Minimum Amount of 0.01 Ether to performing the contract assertion', async () => {
		try {
			await lottery.methods.enter().send({
				from: account[0],
				value: '0',
			})
			assert(false)
		} catch (err) {
			assert.ok(err)
		}
	})

	it('Picking winner restriction assertion', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1],
			})
			assert(false)
		} catch (err) {
			assert.ok(err)
		}
	})

	it("Sending the money to the winner and Empty the players's array assertion", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether'),
		})

		const initialBalance = await web3.eth.getBalance(accounts[0])
		await lottery.methods.pickWinner().send({
			from: accounts[0],
		})

		const finalBalance = await web3.eth.getBalance(accounts[0])
		const difference = finalBalance - initialBalance
		assert(difference > web3.utils.toWei('1.8', 'ether'))

		const emptyPlayersArray = await lottery.methods.getPlayers().call()
		assert(emptyPlayersArray.length === 0)
	})
})
