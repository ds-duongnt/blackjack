class Player():
	def __init__(self, bankroll: float, name: str = None):
		self.bankroll = bankroll
		self.balance = bankroll
		self.name = name

	def win(self, bet_amount:float, printout: bool = True):
		self.balance += bet_amount
		if printout:
			print('You win!!! \n Your balance: {}'.format(self.balance))

	def lose(self, bet_amount:float, printout: bool = True):
		self.balance -= bet_amount
		if printout:
			print('You lose!!! \n Your balance: {}'.format(self.balance))

	def tie(self, bet_amount:float, printout: bool = True):
		if printout:
			print('You push!!! \n Your balance: {}'.format(self.balance))
		