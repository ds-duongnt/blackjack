from hand import Hand, Dealer

class Blackjack():
	def __init__(self, config, player: list, shoe):
		self.config = config
		self.player = player
		self.shoe = shoe

	def add_player(self, player):
		self.player.append(player)

	def run(self):
		hands = self.shoe.deal_card(player_num = len(self.player))
		return Round_play(dealer_hand = Dealer(hands[-1]), 
			player_hand = [Hand(v) for v in hands[:-1]], shoe = self.shoe)


class Round_play():
	def __init__(self, dealer_hand, player_hand: list, shoe):
		self.dealer = dealer_hand
		self.players = player_hand
		self.shoe = shoe

	def question(self, player_hand) -> str:
		if self.dealer.get_faceup_card().card_face == 'Ac':
			return 'Insurance? (Y/N) '
		elif self.dealer.blackjack_check() == True or player_hand.blackjack_check() == True or player_hand.get_max_score() == 21:
			return None
		else:
			return 'What is your choice? (X2, Hit, Stand or Split) '


class Config():
	def __init__(self, reset_shoe: float = 0.3, stand_on: str = 'soft 17', 
		split_rule: str = 'once', doub_aft_spl: bool = False):
		
		self.reset_shoe = reset_shoe
		self.stand_on = stand_on
		self.split_rule = split_rule
		self.doub_aft_spl = doub_aft_spl





