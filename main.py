from flask import Flask, render_template, request, redirect, jsonify, make_response
from flask import request

import random
import jsons
from shoe import Shoe
from game_config import Config
from hand import Hand, Dealer, hand_print
from player import Player

app = Flask(__name__)

config = None
shoe = None
player = None
bet_amt = 0
player_hand = None
dealer = None

def round_examine(player_hand, dealer_hand, insure_asked: bool = True) -> bool:
	def res_return(end, output, bet_mult):
		return {
		'round_ended': end,
		'output': output,
		'bet_mult': bet_mult
		}

	end = False
	output = None
	bet_mult = None

	if dealer_hand.get_faceup_card().is_ace():
		if insure_asked:
			if dealer_hand.blackjack_check():
				end = True
				bet_mult = 1
				output = 'push' if player_hand.blackjack_check() else 'lose'
				return res_return(end, output, bet_mult)
			elif player_hand.blackjack_check():
				end = True
				bet_mult = 1.5
				output = 'win'
				return res_return(end, output, bet_mult)
		else:
			return res_return(end, output, bet_mult)

	if len(player_hand.child)==0: # Casual Hand
		if player_hand.blackjack_check():
			end = True
			if dealer_hand.blackjack_check():
				bet_mult = 1
				output = 'push'
			else:
				bet_mult = 1.5
				output = 'win'
			return res_return(end, output, bet_mult)
		elif player_hand.busted_check():
			end = True
			bet_mult = 1
			output = 'lose'
			return res_return(end, output, bet_mult)
		elif 'stand' in player_hand.decision or 'x2' in player_hand.decision or player_hand.get_max_score() == 21:
			if dealer_hand.blackjack_check():
				output = 'lose'
				bet_mult = 1
				end = True
				return res_return(end, output, bet_mult)

			p_score = player_hand.get_max_score()
			d_score = dealer_hand.get_max_score()
			d_score = 0 if d_score == 22 else d_score

			output = 'win' if p_score > d_score else 'push' if p_score == d_score else 'lose'
			end = True
			bet_mult = 2 if 'x2' in player_hand.decision else 1

			return res_return(end, output, bet_mult)

	else: # Splitting Hand
		hand1, hand2 = player_hand.child
		if (hand1.freeze or hand1.get_max_score()==21) and (hand2.freeze or hand2.get_max_score()==21):
			end = True
			if dealer_hand.get_max_score() >= 17:
				bet_mult = 1
				output = []

				d_score = dealer_hand.get_max_score()
				d_score = 0 if d_score == 22 else d_score
				h1_score = hand1.get_max_score()
				h2_score = hand2.get_max_score()

				for score in [h1_score, h2_score]:
					output.append('win' if score > d_score else 'push' if score == d_score else 'lose')

				return res_return(end, output, bet_mult)


	return res_return(end, output, bet_mult)

def bankroll_update(player, round_examine, bet_amt):
	if round_examine.get('round_ended'):
		output = round_examine.get('output')
		ratio = round_examine.get('bet_mult')
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

	global config, shoe, player
	config = Config() #Define Game configuration/rules
	shoe = Shoe(deck_quant = config.n_deck)

	# card_quant = len(shoe.shoe)

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
		global bet_amt
		bet_amt= request.get_json()

		hands_deal = shoe.deal_card()

		global player_hand, dealer
		dealer = Dealer(hands_deal[-1])
		player_hand = Hand(hands_deal[0])
		player_hand.Betting = bet_amt

		output = round_examine(player_hand, dealer, insure_asked=False)

		print('bet amt: %s' %bet_amt)
		print ({
			'dealer': dealer.get_hand(),
			'player': player_hand.get_hand(),
			})

		print('Round Examine: %s' %output)

		bankroll_update(player, output, bet_amt)

		data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand,
		'Betting': bet_amt
		}))

		data_res.update(output)

		res = make_response(jsonify(data_res), 200)

		return res


@app.route("/hit", methods=["GET"])
def hit():
	output=round_examine(player_hand, dealer)
	end = output.get('round_ended')
	if not end:
		player_hand.hit(shoe)

		print('---> Hitting: %s' %player_hand.get_hand())

		if player_hand.get_max_score() == 21:
			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)
		output = round_examine(player_hand, dealer)

	bankroll_update(player, output, bet_amt)

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand
		}))

	data_res.update(output)

	res = make_response(jsonify(data_res), 200)
	return res


@app.route("/stand", methods=["GET"])
def stand():
	output=round_examine(player_hand, dealer)
	end = output.get('round_ended')
	if not end:
		player_hand.stand()

		print('---> Standing')

		while dealer.get_max_score() < 17: #Dealer takes action
			dealer.hit(shoe)

		output = round_examine(player_hand, dealer)
	bankroll_update(player, output, bet_amt)

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		}))

	data_res.update(output)

	res = make_response(jsonify(data_res), 200)
	return res


@app.route("/double", methods=["GET"])
def double():
	output=round_examine(player_hand, dealer)
	end = output.get('round_ended')
	if not end:
		player_hand.x2(shoe)

		print('---> Doubling: %s' %player_hand.get_hand())

		if not player_hand.busted_check():
			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)

		print('Dealer: %s' %dealer.get_hand())
		output = round_examine(player_hand, dealer)
	bankroll_update(player, output, bet_amt)

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand
		}))

	data_res.update(output)

	res = make_response(jsonify(data_res), 200)
	return res

@app.route("/split", methods=["GET"])
def split():
	output=round_examine(player_hand, dealer)
	end = output.get('round_ended')
	if not end:
		hand1, hand2 = player_hand.split(shoe)

		print('---> Splitting: %s' %[v.get_hand() for v in player_hand.child])

		output = round_examine(player_hand, dealer)
		end = output.get('round_ended')
		if end:
			while dealer.get_max_score() < 17: #Dealer takes action
				dealer.hit(shoe)

			print('Dealer: %s' %dealer.get_hand())
			output = round_examine(player_hand, dealer)

	data_res = jsons.loads(jsons.dumps({
		'player': player,
		'dealer': dealer,
		'player_hand': player_hand
		}))

	data_res.update(output)

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

	output = round_examine(player_hand, dealer)
	bankroll_update(player, output, bet_amt)

	data_res = jsons.loads(jsons.dumps({
		'player': player
		}))

	print('---> Insure: %s' %dealer_bj)
	data_res.update(output)

	res = make_response(jsonify(data_res), 200)
	return res

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)