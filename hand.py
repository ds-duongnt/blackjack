from card import Card

def cal_score(score_base: list, card) -> list:
	out = []
	for base in score_base:
		scores = card.get_score()
		for score in scores:
			new_score = base + score
			if new_score <= 21:
				out.append(new_score)

	out = [21] if 21 in out else out
	return list(set(out))

class Hand():
	def __init__(self, hand: list):
		self.hand = hand

		self.score = hand[0].get_score()
		self.score = cal_score(self.score, hand[-1])

		self.action = 0
		self.decision = []

	def get_hand(self):
		return [v.__str__() for v in self.hand]

	def add_card(self, card):
		self.hand.append(card)
		self.score = cal_score(self.score, card)
		self.action += 1

	def get_printable_score(self):
		return '/'.join([str(v) for v in self.score])

	def get_max_score(self) -> int:
		try:
			out = max(self.score)
		except:
			out = 22
		return out

	def busted_check(self) -> bool:
		return True if self.get_printable_score() == '' else False

	def blackjack_check(self) -> bool:
		return True if self.action == 0 and len(self.hand) == 2 and self.get_max_score()==21 else False

	def split_check(self) -> bool:
		if len(self.hand) == 2 and self.action == 0:
			card_1 = self.hand[0]
			card_2 = self.hand[-1]
			return True if card_1.get_score() == card_2.get_score() else False
		else:
			return False

	def split(self, shoe):
		if self.split_check():
			hand_1, hand_2 = Hand([self.hand[0], shoe.hit()]), Hand([self.hand[-1], shoe.hit()])
			self.action += 1
			return hand_1, hand_2

class Dealer(Hand):
	def __init__(self, hand: list):
		super().__init__(hand)

	def get_faceup_card(self):
		return self.hand[0]

	def get_facedown_card(self):
		return self.hand[-1]

