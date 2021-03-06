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


def hand_print(hand, player: bool = True, hand_num: int = 0, bj_check: bool = True) -> str:
	if hand.score == [21] and len(hand.hand)==2 and bj_check == True:
		score = 'Blackjack'
	elif len(hand.score) == 0:
		score = 'Busted'
	else:
		score = hand.get_printable_score()

	if player and hand_num == 0:
		substr = 'Your Hand'
	elif player and hand_num != 0:
		substr = 'Hand {}'.format(hand_num)
	else:
		substr = 'Dealer'
	return '{}: {} ({})'.format(
					substr, hand.get_hand(), score
					)


class Hand():
	def __init__(self, hand: list, freeze: bool = False, player = None, child: bool = False):
		self.hand = hand
		self.player = player
		self.freeze = freeze
		self.ischild = child

		self.score = hand[0].get_score()
		self.score = cal_score(self.score, hand[-1])

		self.action = 0
		self.decision = []
		self.insurance = False
		self.child = []
		self.spl_check = self.split_check()

		self.end = False
		self.hand_examine()

	def hand_examine(self):
		if (self.get_max_score() == 21) or (self.busted_check()) or ('stand' in self.decision or 'x2' in self.decision or 'split' in self.decision) or (self.freeze):
			self.end = True

	def get_hand(self):
		return [v.__str__() for v in self.hand]

	def child_process(self):
		if len(self.child) != 0:
			self.child.pop(0) if 'split' in self.decision else None

	def hit(self, shoe):
		card = shoe.hit()
		self.hand.append(card)
		self.score = cal_score(self.score, card)
		self.action += 1
		self.decision.append('hit')
		self.hand_examine()

	def x2(self, shoe):
		card = shoe.hit()
		self.hand.append(card)
		self.score = cal_score(self.score, card)
		self.action += 1
		self.decision.append('x2')
		self.hand_examine()

	def stand(self):
		self.action += 1
		self.decision.append('stand')
		self.hand_examine()

	def split_check(self) -> bool:
		if self.action == 0:
			card_1 = self.hand[0]
			card_2 = self.hand[-1]
			return True if card_1.get_score() == card_2.get_score() else False
		else:
			return False

	def split(self, shoe):
		if self.split_check():
			freeze = self.freeze_check()
			hand_1, hand_2 = Hand([self.hand[0], shoe.hit()], freeze = freeze, player = self.player, child = True), \
			Hand([self.hand[-1], shoe.hit()], freeze = freeze, player  = self.player, child = True)	
			self.action += 1
			self.decision.append('split')
			self.child += [hand_1, hand_2]
			self.hand_examine()
			return hand_1, hand_2

	def get_printable_score(self):
		return '/'.join([str(v) for v in self.score])

	# Because of the Ace, this function comes in hand when dealing with soft scores. (busted = 22)
	def get_max_score(self) -> int:
		try:
			out = max(self.score)
		except:
			out = 22
		return out

	def busted_check(self) -> bool:
		return True if self.get_printable_score() == '' else False

	def blackjack_check(self) -> bool:
		return True if not self.ischild and self.action == 0 and len(self.hand) == 2 and self.get_max_score()==21 else False

	def freeze_check(self) -> bool:
		return True if len(self.hand) == 2 and self.hand[0].card_face == 'Ac' and self.hand[-1].card_face == 'Ac' else False

	def take_insurance(self):
		self.insurance = True


class Dealer(Hand):
	def __init__(self, hand: list):
		super().__init__(hand)
		self.insur_offer = self.offer_insurance()

	def get_faceup_card(self):
		return self.hand[0]

	def get_facedown_card(self):
		return self.hand[-1]

	def offer_insurance(self):
		return self.get_faceup_card().is_ace()

# print(Hand([Card('02:H'), Card('05:C')]).split_check)
