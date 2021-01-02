import random
from copy import deepcopy

from shoe import Shoe
from game_config import Config, Blackjack
from hand import Hand, Dealer, hand_print
from player import Player

from time import sleep

def strategy(faceup_card, hand, question: str) -> str:
	if hand.freeze == False:
		if 'insurance' in question.lower():
			return 'n'
		else:
			score = hand.score
			max_score = hand.get_max_score()
			split_check = hand.split_check()

			if max_score in [20]: # Hand 20
				return 'stand'
			elif len(score) > 1: 

				if max_score in [19]: # Soft 19
					return 'x2' if faceup_card.card_face == '6' else 'stand'
				elif max_score in [18]: # Soft 18
					return 'x2' if faceup_card.low_card_check() else 'stand' if faceup_card.card_face in ['07','08'] else 'hit'
				elif max_score in [17]: # Soft 17
					return 'x2' if faceup_card.card_face in ['03','04','05','06'] else 'hit'
				elif max_score in [16,15]: # Soft 16,15
					return 'x2' if faceup_card.card_face in ['04','05','06'] else 'hit'
				elif max_score in [14,13]: # Soft 14,13
					return 'x2' if faceup_card.card_face in ['05','06'] else 'hit'
				else: # Soft 12
					return 'split'

			elif len(score) == 1:	

				if max_score in [19,17]: # Hard 19,17
					return 'stand'
				elif max_score in [18]: # Hard 18
					if split_check:
						if faceup_card.card_face in ['07','10','Ja','Qe','Ki','Ac']:
							return 'stand'
						else:
							return 'split'
					else:
						return 'stand'
				elif max_score in [16]: # Hard 16
					if split_check:
						return 'split'
					else:
						return 'stand' if faceup_card.low_card_check() else 'hit'

				elif max_score in [15,13]: # Hard 15,13
					return 'stand' if faceup_card.low_card_check() else 'hit'

				elif max_score in [14]: # Hard 14
					if split_check:
						if faceup_card.card_face in ['08','09','10','Ja','Qe','Ki','Ac']:
							return 'hit'
						else:
							return 'split'
					else:
						return 'stand' if faceup_card.low_card_check() else 'hit'
				elif max_score in [12]: # Hard 12
					if split_check:
						if faceup_card.card_face in ['07','08','09','10','Ja','Qe','Ki','Ac']:
							return 'hit'
						else:
							return 'split'
					else:
						return 'stand' if faceup_card.card_face in ['04','05','06'] else 'hit'
				
				elif max_score in [11]: # Hard 11
					return 'x2' if hand.action == 0 else 'hit'

				elif max_score in [10]: # Hard 10
					return 'x2' if faceup_card.card_face in ['02','03','04','05','06','07','08','09'] and hand.action == 0 else 'hit'

				elif max_score in [9]: # Hard 9 
					return 'x2' if faceup_card.card_face in ['03','04','05','06'] and hand.action == 0 else 'hit'

				elif max_score in [8]: # Hard 8
					if split_check:
						if faceup_card.card_face in ['05','06']:
							return 'split'
						else:
							return 'hit'
					else:
						return 'hit'

				elif max_score in [7,5]: # Hard 7,5
					return 'hit'

				elif max_score in [6,4]: # Hard 6,4
					if split_check:
						if faceup_card.card_face in ['02','03','04','05','06','07']:
							return 'split'
						else:
							return 'hit'
					else:
						return 'hit'
	else:
		return 'stand'

class Bot(Player):
	def __init__(self, bankroll, name):
		super().__init__(bankroll, name)
		self.balance = bankroll

	def play(self, faceup_card, hand, question):
		return strategy(faceup_card, hand, question)

bet_amount = 1_000
x_bot = Bot(bankroll = 1_000_000, name = 'X')
y_bot = Bot(bankroll = 1_000_000, name = 'Y')
config = Config() # Define your configuration game here. Check game_config.py for reference

blackjack = Blackjack(config = config, player = [x_bot, y_bot], shoe = Shoe(deck_quant = 8))
card_quant = len(blackjack.shoe.shoe) # Total cards in the shoe

for i in range(1_000):
	game = blackjack.run()

	dealer_hand = game.dealer
	bots = game.players

	print('Dealer: [{} ; ? ]'.format(dealer_hand.get_faceup_card()))

	for bot_hand in bots: # Player-scanning Block
		print('----------------------------------------------- \n\
Bot {} Processing ......................................'.format(bot_hand.player.name))
		hand_process = [bot_hand]
		hand_count = 0

		while len(hand_process) != 0: # All-hands loop Block
			hand_in_play = hand_process[0]
			_count = 0

			quest = game.question(hand_in_play, _count)
			if hand_count != 0:
				quest = 'Hand {} --- {}'.format(hand_count,quest)

			
			print('Bot Hand: {}'.format(hand_in_play.get_hand()))
			print('⍰ Quest: {}'.format(quest))
			while quest != None: # Response Block
				# Bot action
				action = hand_in_play.player.play(faceup_card = game.dealer.get_faceup_card(), hand = hand_in_play, question = quest)
				_count += 1
				print('--> {}'.format(action))

				if action == 'x2':
					hand_in_play.x2(blackjack.shoe)
					print(hand_in_play.get_hand())
				elif action == 'hit':
					hand_in_play.hit(blackjack.shoe)
					print(hand_in_play.get_hand())
				elif action == 'stand':
					hand_in_play.stand()
				elif action == 'split':
					hand_1, hand_2 = hand_in_play.split(blackjack.shoe)
					hand_process += [hand_1, hand_2]
					# hand_delete = True
					break

				quest = game.question(hand_in_play, _count)
				if quest != None:
					print('Quest: {}'.format(quest))

			hand_process.pop(0)

			hand_count += 1

	game.dealer_action(blackjack.shoe) 
	print('-----------------------------------------------')
	print(hand_print(dealer_hand, player=False))

	for bot_hand in bots: # Player-scanning Score block
		print('Bot {} ------ Results: '.format(bot_hand.player.name))
		hands = game.get_hands(player_name = bot_hand.player.name)
		for hand in hands:
			print(hand_print(hand))
			game.process_result(hand, bet_amount)

	blackjack.log(game)

	if len(blackjack.shoe.shoe) < int(card_quant*blackjack.config.reset_shoe):
		blackjack.shoe.shuffle(reset=True)
		print('----------------- Shuffle Time -----------------')








