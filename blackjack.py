import numpy as np
import random
class blackjack:
	def __init__(self, deck_quant = 6):
		self.deck_quant = deck_quant

	def game_generate(self):

		def deck_gen(self, value = True):
			if value:
				card_num = list(np.arange(1,11)) + [10] * 3
				card_num = card_num * 4
				return card_num
			else:
				deck = []
				card_num =np.arange(1,14)
				card_type = ['B','T','C','R']
				for v in card_num:
					for _v in card_type:
						deck.append(str(v) + _v)
				return deck

		self.deck = deck_gen(self)*self.deck_quant
		random.shuffle(self.deck)
	
	def deck_shuffle(self):
		random.shuffle(self.deck)
