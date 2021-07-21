from flask import Flask, render_template, request, redirect, jsonify, make_response
from flask import request

import random
import jsons
from shoe import Shoe
from game_config import Config
from hand import Hand, Dealer, hand_print
from player import Player
from card import Card

app = Flask(__name__)

config = None
shoe = None
card_quant = None
player = None
bet_amt = 0
player_hand = None
dealer = None
hand_index = 0

def hand_index_move(player):
	if player.handprtindex < len(player.hand) - 1:
		player.handprtindex += 1

def hand_examine(player_hand, dealer_hand):
	def res_return(end, output, ratio):
		return {
		'hand_ended': end,
		'output': output,
		'ratio': ratio
		}

	end = False
	output = None
	ratio = None

	if player_hand.blackjack_check():
		end = True
		if dealer_hand.blackjack_check():
			ratio = 1
			output = 'push'
		else:
			ratio = 1.5
			output = 'win'
		return res_return(end, output, ratio)
	elif player_hand.busted_check():
		end = True
		ratio = 1
		output = 'lose'
		return res_return(end, output, ratio)
	elif player_hand.end:
		if dealer_hand.blackjack_check():
			output = 'lose'
			ratio = 1
			end = True
			return res_return(end, output, ratio)

		p_score = player_hand.get_max_score()
		d_score = dealer_hand.get_max_score()
		d_score = 0 if d_score == 22 else d_score

		output = 'win' if p_score > d_score else 'push' if p_score == d_score else 'lose'
		end = True
		ratio = 2 if 'x2' in player_hand.decision else 1

		return res_return(end, output, ratio)

	if dealer_hand.get_faceup_card().is_ace() and dealer_hand.blackjack_check():
		end = True
		ratio = 1
		output = 'lose'
		return res_return(end, output, ratio)

	return res_return(end, output, ratio)


def round_examine(player, dealer_hand, insure_asked: bool = True):
	if dealer_hand.get_faceup_card().is_ace():
		if insure_asked:
			if dealer_hand.blackjack_check():
				return True
		else:
			return False
	return all([v.end for v in player.hand])
	

def bankroll_update(player, hand_examine, bet_amt):
	if hand_examine.get('hand_ended'):
		output = hand_examine.get('output')
		ratio = hand_examine.get('ratio')
		if output == 'win':
			player.win(bet_amt*ratio)
		elif output == 'lose':
			player.lose(bet_amt*ratio)
		elif output == 'push':
			player.tie(bet_amt*ratio)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start():
	buyin = int(request.get_json())

	print('Buyin: %s' %buyin)

	global config, shoe, player, card_quant
	config = Config() #Define Game configuration/rules
	shoe = Shoe(deck_quant = config.n_deck)

	card_quant = len(shoe.shoe)

	player = Player(buyin)

	data_res = jsons.loads((jsons.dumps({
	'config': config,
	'shoe': shoe,
	'player': player
	})))

	res = make_response(jsonify(data_res), 200)

	return res
	
@app.route("/deal", methods=["POST"])
def deal():
	if request.method == 'POST':
		global bet_amt, shoe, card_quant, config
		bet_amt= request.get_json()

		print('Shoe Qnt: %s' %len(shoe.shoe))
		if len(shoe.shoe) < int(card_quant*config.reset_shoe):
			shoe.shuffle(reset=True)
			print('----------------- Shuffle Time -----------------')

		hands_deal = shoe.deal_card()
		# hands_deal = [[Card('Ac:S'), Card('Ac:D')],[Card('05:D'), Card('09:H')]]

		global player_hand, dealer, player
		dealer = Dealer(hands_deal[-1])
		player.hand.append(Hand(hands_deal[0]))
		player.Betting = bet_amt

		player_hand = player.hand[0]
		# print('decision: %s' %player_hand.decision)

		player_hand.output = hand_examine(player_hand, dealer)
		round_end = round_examine(player, dealer, insure_asked=False)
		if round_end:
			bankroll_update(player, player_hand.output, bet_amt)
			player.reset_hand(True)

		print('bet amt: %s' %bet_amt)
		print ({
			'dealer': dealer.get_hand(),
			'player': player_hand.get_hand(),
			})

		print('Round Examine: %s' %round_end)


		data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'Betting': bet_amt,
		'round_ended': round_end
		}))

		data_res.update(player_hand.output)

		res = make_response(jsonify(data_res), 200)

		return res


@app.route("/hit", methods=["GET"])
def hit():
	global player_hand, player
	player_hand = player.hand[player.handprtindex]
	end = round_examine(player, dealer)
	if not end:
		player_hand.hit(shoe)

		print('---> Hitting: %s' %player_hand.get_hand())

		player_hand.output = hand_examine(player_hand, dealer)

		hand_end = player_hand.output.get('hand_ended')
		end = round_examine(player, dealer)

		if hand_end:
			hand_index_move(player)
			if end:
				hands_play = [hand for hand in player.hand if len(hand.child) == 0]
				if not all([hand.busted_check() for hand in hands_play]):
					while dealer.get_max_score() < 17: #Dealer takes action
						dealer.hit(shoe)

				for hand in hands_play:
					hand.output = hand_examine(hand, dealer)
					bankroll_update(player, hand.output, bet_amt)
	else:
		player_hand.output = hand_examine(player_hand, dealer)
		bankroll_update(player, player_hand.output, bet_amt)


	# end = round_examine(player, dealer)
	player.reset_hand() if end else None

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'round_ended': end
		}))

	player.reset_hand(True) if end else None

	# data_res.update(player_hand.output)

	res = make_response(jsonify(data_res), 200)
	return res


@app.route("/stand", methods=["GET"])
def stand():
	global player_hand, player
	player_hand = player.hand[player.handprtindex]
	end = round_examine(player, dealer)
	if not end:
		player_hand.stand()

		print('---> Standing')

		player_hand.output = hand_examine(player_hand, dealer)
		
		# hand_end = player_hand.output.get('hand_ended')
		end = round_examine(player, dealer)

		hand_index_move(player)
		if end:
			hands_play = [hand for hand in player.hand if len(hand.child) == 0]
			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)

			for hand in hands_play:
				hand.output = hand_examine(hand, dealer)
				bankroll_update(player, hand.output, bet_amt)

	else:
		player_hand.output = hand_examine(player_hand, dealer)
		bankroll_update(player, player_hand.output, bet_amt)

	# end = round_examine(player, dealer)
	player.reset_hand() if end else None

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'round_ended': end
		}))

	player.reset_hand(True) if end else None
	# data_res.update(player_hand.output)

	res = make_response(jsonify(data_res), 200)
	return res


@app.route("/double", methods=["GET"])
def double():
	end = round_examine(player, dealer)
	if not end:
		player_hand.x2(shoe)

		print('---> Doubling: %s' %player_hand.get_hand())

		if not player_hand.busted_check():
			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)

		print('Dealer: %s' %dealer.get_hand())
		player_hand.output = hand_examine(player_hand, dealer)

	for hand in player.hand:
		bankroll_update(player, hand.output, bet_amt)

	end = round_examine(player, dealer)
	player.reset_hand() if end else None

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'round_ended': end
		}))

	player.reset_hand(True) if end else None
	# data_res.update(player_hand.output)

	res = make_response(jsonify(data_res), 200)
	return res

@app.route("/split", methods=["GET"])
def split():
	global player_hand, player
	end = round_examine(player, dealer)
	if not end:
		hand1, hand2 = player_hand.split(shoe)

		print('---> Splitting: %s' %[v.get_hand() for v in player_hand.child])

		player.hand.extend([hand1, hand2])
		end = round_examine(player, dealer)

		if end:

			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)

			print('Dealer: %s' %dealer.get_hand())

			for hand in player.hand[1:]:
				hand.output = hand_examine(hand, dealer)
				bankroll_update(player, hand.output, bet_amt)
				player.reset_hand()

		else:
			player_hand = player.hand[1]
			player_hand.output = hand_examine(player_hand, dealer)
			hand_index_move(player)

			if player_hand.end:
				player_hand = player.hand[2]
				hand_index_move(player)

	else:
		player_hand.output = hand_examine(player_hand, dealer)
		bankroll_update(player, player_hand.output, bet_amt)

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'round_ended': end
		}))

	player.reset_hand(True) if end else None

	res = make_response(jsonify(data_res), 200)
	return res

@app.route("/insure", methods=["GET"])
def insure():
	dealer_bj = dealer.blackjack_check()

	player.Insure_output = 'win' if dealer_bj else 'lose'
	if dealer_bj:
		player.win(bet_amt, printout=False)
	else:
		player.lose(bet_amt/2, printout=False)

	player_hand.output = hand_examine(player_hand, dealer)
	
	for hand in player.hand:
		bankroll_update(player, hand.output, bet_amt)

	end = round_examine(player, dealer)
	player.reset_hand(True) if end else None

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'player_hand': player_hand, 
		'round_ended': end
		}))

	print('---> Insure: %s' %dealer_bj)
	data_res.update(player_hand.output)

	res = make_response(jsonify(data_res), 200)
	return res

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)