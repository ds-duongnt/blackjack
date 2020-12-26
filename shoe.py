import random

from card import Card

def deck_gen():
	set_face = ['Ac','02','03','04','05','06','07','08','09','10','Ja','Qe','Ki']
	set_suit = ['C','H','D','S']
	out = []
	for suit in set_suit:
		for value in set_face:
			out.append(Card('{}:{}'.format(
				value,suit)
			))
	return out

class Shoe:
	def __init__(self, deck_quant: int = 6):
		self.deck_quant = deck_quant
		self.deck = deck_gen()
		self.shoe = self.deck * self.deck_quant
		random.shuffle(self.shoe)

	def get_shoe(self):
		return [v.__str__() for v in self.shoe]

	def shuffle(self, reset: bool = True):
		if reset:
			self.shoe = self.deck * self.deck_quant
			random.shuffle(self.shoe)
		else:
			random.shuffle(self.shoe)

	def hit(self):
		card = self.shoe[0]
		self.shoe.pop(0)
		return card

	def deal_card(self, player_num: int = 1):
		total_hand = player_num + 1
		out = [[] for x in range(total_hand)]

		for i in range(2):
			for hand in range(total_hand):
				out[hand].append(self.hit())

		return out



	



