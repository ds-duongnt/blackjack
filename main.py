# import numpy as np
import random
from copy import deepcopy

from shoe import Shoe
from game_config import Config
from hand import Hand, Dealer
from player import Player

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

def balance_print(player, result: str) -> float:
	return 'You {}!!! \n Your balance: {} '.format(result, player.balance)

# Implement the game
def main():
	con = input('Game start? (Y/N) ')
	if con.lower() == 'y':
		shoe = Shoe(deck_quant = 8)
		config = Config() # Define your configuration game here. Check game_config.py for reference

		card_quant = len(shoe.shoe) # Total cards in the shoe

		bankroll = float(input('Money buy-in? '))

		player = Player(bankroll) # sign up Player
		while player.balance > 0:
			bet = float(input('----------------- Betting Time ----------------- '))
			if bet <= player.balance:
			
				hands_deal = shoe.deal_card()
			
				dealer = Dealer(hands_deal[-1])
				faceup_card = dealer.get_faceup_card()
				facedown_card = dealer.get_facedown_card()


				dealer_print = 'Dealer: [{} ; ? ] ({})'.format(
					faceup_card.__str__(), '/'.join([str(v) for v in faceup_card.get_score()])
					)
					
				
				player_hand = Hand(hands_deal[0])
	
				print(dealer_print)
				print(hand_print(player_hand))

				while True: # Round tracking
					# Insurrance processing
					if faceup_card.card_face == 'Ac':
						insurrance = input('Insurance? (Y/N) ')

						if insurrance.lower() == 'y': # Insurrance block
							if dealer.blackjack_check():
								player.win(bet, printout=False)
							else:
								player.lose(bet/2, printout=False)

						if dealer.blackjack_check():
							print('----------------------------------------------------')
							if player_hand.blackjack_check(): # push on the main game
								print(hand_print(dealer, player==False))
								print(hand_print(player_hand))
								player.tie(bet)
							else:
								print(hand_print(dealer, player==False))
								print(hand_print(player_hand))
								player.lose(bet)

							break # End round

					# Blackjack processing
					if player_hand.blackjack_check():
						print('----------------------------------------------------')
						if dealer.blackjack_check():
							print(hand_print(dealer, player==False))
							print(hand_print(player_hand))
							player.tie(bet)
						else:
							print(hand_print(dealer, player==False))
							print(hand_print(player_hand))
							player.win(bet*1.5)

						break # End round

					else: # Player starts making decisions
								
						hands = [player_hand]
						choice_question = 'What is your choice? (X2, Hit, Stand or Split) '
						hands_complete = []

						hand_count = 0
						while len(hands) != 0: # Keep playing for all hands you have
							if hand_count != 0:
								choice_question = 'Hand {} --- What is your choice? (X2, Hit, Stand or Split) '.format(hand_count)
							hand_in_play = deepcopy(hands[0])
							hand_delete = False
							# Player making decisions
							while hand_in_play.get_printable_score() not in ['21','']: # Player stops making decisions if the hand is either Bj, 21 or Busted

								choice = input(choice_question)

								if choice.lower() == 'x2' and hand_in_play.action == 0 and player_hand.action == 0: # Switch to play_in_hand if you allow x2 after splitting
									if bet*2 <= player.balance:
										bet = bet*2
										hand_in_play.add_card(shoe.hit())
										break # End decision block
									else:
										print('Your balance is too low')	
								elif choice.lower() == 'hit':
									hand_in_play.add_card(shoe.hit())
									print(dealer_print)
									print(hand_print(hand_in_play))
								elif choice.lower() == 'stand':
									break # End decision block
								elif choice.lower() == 'split' and player_hand.split_check() == True: # Switch to play_in_hand if you allow to split multiple times
									if player.balance >= bet*2:
										hand_1, hand_2 = player_hand.split(shoe)
										print(hand_print(hand_1, hand_num = 1, bj_check = False))
										print(hand_print(hand_2, hand_num = 2, bj_check = False))
										hands += [hand_1, hand_2]
										hand_delete = True
										break # End decision block
									else:
										print('Your balance is too low')
								else:	
									print('You cannot {}'.format(choice.title()))

							hands.pop(0) # delete the current hand

							if hand_delete == False:
								hands_complete.append(hand_in_play)

							hand_count += 1

							print('----------------------------------------------------')

						# # Handling results after decisions making
						# for hand_played in hands_complete:
						# 	if hand_played.busted_check(): # If you busted, you lose right away
						# 		# print(hand_print(dealer, player==False))
						# 		print(hand_print(hand_played))
								

						if all([v.busted_check() for v in hands_complete]) or dealer.blackjack_check():
							print(hand_print(dealer, player=False))
							player.lose(bet*len(hands_complete))
								
							break # End round

						else:
							while dealer.get_max_score() < 17: # Dealer takes actions
								dealer.add_card(shoe.hit())

							dealer_score = dealer.get_max_score() # Dealer's score
							for hand_played in hands_complete:

								player_score = hand_played.get_max_score()

								print(hand_print(dealer, player==False))
								if player_score > 21:
									print(hand_print(hand_played))
									player.lose(bet)

								elif (dealer_score > 21) or (dealer_score < player_score): 
									
									# print(hand_print(dealer, player==False))
									print(hand_print(hand_played, bj_check = False))
									player.win(bet)
				
								elif dealer_score > player_score:
									
									# print(hand_print(dealer, player==False))
									print(hand_print(hand_played, bj_check = False))
									player.lose(bet)
				
								elif dealer_score == player_score:

									# print(hand_print(dealer, player==False))
									print(hand_print(hand_played, bj_check = False))
									player.tie(bet)

							break # End round

			else:
				print('Betting money exceeds your bankroll')

			if len(shoe.shoe) < int(card_quant*config.reset_shoe):
				shoe.shuffle(reset=True)
				print('----------------- Shuffle Time -----------------')

if __name__ == '__main__':
	main()