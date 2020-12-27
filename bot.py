import random
from copy import deepcopy

from shoe import Shoe
from game_config import Config, Blackjack
from hand import Hand, Dealer
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

class Bot(Player):
	def __init__(self, bankroll):
		super().__init__(bankroll)
		self.balance = bankroll

	def play(self, faceup_card, hand, question):
		return strategy(faceup_card, hand, question)

bot = Bot(bankroll = 1000000)
config = Config() # Define your configuration game here. Check game_config.py for reference

blackjack = Blackjack(config = config, player = [bot], shoe = Shoe(deck_quant = 8))

game = blackjack.run()

dealer_hand = game.dealer
bot_hand = [game.players[0]]
hands_complete = []
hand_count = 0
_count = 0

while len(bot_hand) != 0:
	hand_in_play = deepcopy(bot_hand[0])
	hand_delete = False
	
	quest = game.question(hand_in_play, _count)
	if hand_count != 0:
		quest = 'Hand {} --- {}'.format(hand_count, quest)

	print('Dealer: {}'.format(dealer_hand.get_hand()))
	print('Bot Hand: {}'.format(hand_in_play.get_hand()))
	print('Quest: {}'.format(quest))
	while quest != None:
		action = bot.play(faceup_card = game.dealer.get_faceup_card(), hand = hand_in_play, question = quest)
		_count += 1
		print(action)

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
			bot_hand += [hand_1, hand_2]
			hand_delete = True
			break

		quest = game.question(hand_in_play, _count)
		if quest != None:
			print('Quest: {}'.format(quest))

	bot_hand.pop(0)
	if hand_delete == False:
		hands_complete.append(hand_in_play)

	hand_count += 1
	# sleep(10)

# This is a github test 







