import React, { useEffect, useState } from 'react'
import web3 from './web3'
import lottery from './lottery'

function App() {
	const [manager, setManager] = useState('')
	const [players, setPlayers] = useState([])
	const [balance, setBalance] = useState('')
	const [amountOfEnterEther, setAmountOfEnterEther] = useState(0)
	const [status_message, setStatusMessage] = useState('')

	async function getManager() {
		const manager = await lottery.methods.manager().call()
		const players = await lottery.methods.getPlayers().call()
		const balance = await web3.eth.getBalance(lottery.options.address)

		setManager(manager)
		setPlayers(players)
		setBalance(balance)
	}

	async function onSubmit(e) {
		e.preventDefault()

		const accounts = await web3.eth.getAccounts()

		setStatusMessage('Waiting on transaction success......')

		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei(amountOfEnterEther, 'ether'),
		})

		setStatusMessage('You have been entered!')
	}

	async function onClick() {
		const accounts = await web3.eth.getAccounts()

		setStatusMessage('Waiting on transaction success......')

		await lottery.methods.pickWinner().send({
			from: accounts[0],
		})

		setStatusMessage('A winner has been picked!')
	}

	useEffect(() => {
		getManager()
	}, [])

	return (
		<div style={{ padding: '50px', textAlign: 'center' }}>
			<div
				style={{
					margin: '0 auto',
					padding: '50px',
					borderRadius: '15px',
					boxShadow: '0 4px 10px 0 #7F5DF0',
					width: '50%',
					transform: 'translate(0px , 50%)',
				}}
			>
				<h1>Lottery Contract</h1>
				{manager === '' && balance !== '' && <p>Loading...</p>}
				{manager !== '' && balance !== '' && (
					<div>
						<p>This contract is managed by {manager}</p>
						<p>
							There are currently {players.length} people entered, competing to
							win {web3.utils.toWei(balance, 'ether')} ether!
						</p>

						<form
							style={{
								textAlign: 'start',
							}}
							onSubmit={onSubmit}
						>
							<h4>Want to try luck?</h4>
							<div>
								<label>Amount of ether to enter</label>
								<input
									value={amountOfEnterEther}
									onChange={(e) => setAmountOfEnterEther(e.target.value)}
								/>
							</div>
							<button>Enter</button>
						</form>

						<hr />

						<h4>Ready to pick the winner?</h4>
						<button onClick={onClick}>Pick a winner!</button>

						<hr />

						<h2>{status_message}</h2>
					</div>
				)}
			</div>
		</div>
	)
}

export default App
