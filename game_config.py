from hand import Hand, Dealer

class Blackjack():
	def __init__(self, config, player: list, shoe):
		self.config = config
		self.player = player
		self.shoe = shoe
		self.logs = []

	def add_player(self, player):
		self.player.append(player)

	def run(self):
		hands = self.shoe.deal_card(player_num = len(self.player))
		return Round_play(dealer_hand = Dealer(hands[-1]), 
			player_hand = [Hand(hand, player = player) for hand, player in zip(hands[:-1], self.player)])

	def log(self, gameplay):
		# names = [v.name for v in self.player]
		# hands = [hand for hand in gameplay.players]

		# self.logs.append({
		# 	'dealer': gameplay.dealer,
		# 	'player': [{
		# 			'name': name,
		# 			'hand': hand,
		# 			} for name, hand in zip(names, hands)
		# 		]
		# 	})
		self.logs.append(gameplay)

class Round_play():
	def __init__(self, dealer_hand, player_hand: list):
		self.dealer = dealer_hand
		self.players = player_hand

	def question(self, player_hand, count: int = 0, insurance_offer: bool = True) -> str:
		if count == 0 and insurance_offer == True and self.dealer.get_faceup_card().card_face == 'Ac':
			return 'Insurance? (Y/N) '
		elif (self.dealer.get_faceup_card().card_face == 'Ac' and self.dealer.blackjack_check()) or \
		player_hand.blackjack_check() or \
		any(v in player_hand.decision for v in ['x2','stand']) or \
		player_hand.get_max_score() >= 21:
			return None 
		else:
			return 'What is your choice? (X2, Hit, Stand or Split) '

	def get_hands(self, player_name: str = None):
		self.hands = []
		for player in self.players:
			hand_process = [player]
			while len(hand_process) != 0:
				hand = hand_process[0]
				if len(hand.child) == 0:
					self.hands.append(hand)
				else:
					hand_process += hand.child
				hand_process.pop(0)

		if player_name:
			return [v for v in self.hands if v.player.name == player_name]

	def dealer_action(self, shoe):
		self.get_hands()
		if all([v.busted_check() for v in self.hands]) or all([v.blackjack_check() for v in self.hands]):
			pass
		else:
			while self.dealer.get_max_score() < 17:
				self.dealer.hit(shoe)

	def process_result(self, hand, bet, log: bool = True, printout: bool = True):
		if hand.blackjack_check():
			if self.dealer.blackjack_check():
				out = hand.player.tie(bet, printout = printout)
			else:
				out = hand.player.win(bet*1.5, printout = printout)
		elif self.dealer.blackjack_check():
			out = hand.player.lose(bet, printout = printout)
		else:
			dealer_score = self.dealer.get_max_score()
			hand_score = hand.get_max_score()
			if hand_score > 21:
				out = hand.player.lose(bet, printout = printout)
			elif (dealer_score > 21) or (dealer_score < hand_score):
				out = hand.player.win(bet, printout = printout)
			elif dealer_score > hand_score:
				out = hand.player.lose(bet, printout = printout)
			elif dealer_score == hand_score:
				out = hand.player.tie(bet, printout = printout)

		hand.result = out

class Config():
	def __init__(self, n_deck: int = 6, reset_shoe: float = 0.3, stand_on: str = 'soft 17', 
		split_rule: str = 'once', doub_aft_spl: bool = False):
		
		self.n_deck = n_deck
		self.reset_shoe = reset_shoe
		self.stand_on = stand_on
		self.split_rule = split_rule
		self.doub_aft_spl = doub_aft_spl





