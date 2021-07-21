var Player =
{
	Lastbet: null,
	Insure_output: null,
	InsureStack: null,
	// Output: null,
	Betting: null,
	Bankroll: null,
	// Handstack: [],
	// OffsetLeft: 24,
    // OffsetTop: -4,
	// Left: 0,
	// Top: 0,
	// Handcard: [],
	// Maxscore: null,
	// split_check:null,
	Betstack: null,
	HandPrtIndex: null,
	Hand: [],

	Initialize: function()
	{
		Player.Betstack = new ChipStack(Obj.BetStack[0], Obj.BetSlider[0], 453, 355);
		Player.Bankroll = new ChipStack(Obj.BankrollStack, Obj.BankrollSlider, 110, 500);
		Player.InsureStack = new ChipStack(Obj.InsureStack, Obj.InsureSlider, 400, 250);

		Player.HandPrtIndex = 0;
		Player.Hand[0] = new Hand(Obj.PlayerHand[0], Player.Betstack)

	},
	// Reset
	Reset: function()
	{
		Player.Lastbet = Player.Betting;
		Player.Insure_output = null;
		Player.Betting = null;
		Player.HandPrtIndex = 0;
		Player.Hand = [];
		Player.Hand[0] = new Hand(Obj.PlayerHand[0], Player.Betstack);
	},

	// UpdateScore: function()
	// {

	// 	if (Player.Handcard.length == 1) {
	// 		Player.Maxscore = Math.max(...Player.Handcard[0].score);
	// 	}
	// 	else {
	// 		(Player.score.length != 0) ? Player.Maxscore = Math.max(...Player.score) : Player.Maxscore = 'Bust';
	// 	}

	// 	if (Player.Handcard.length == 2 && Player.Maxscore == 21) {
	// 		Player.Maxscore = 'Blackjack';
	// 	}

	// 	Obj.PlayerScoreLabel[0].style.display = 'block';
 //    	Obj.PlayerScoreLabel[0].innerHTML = "<span>" + Player.Maxscore + "</span>";
	// },

	Insure: async function()
	{
		if (this.Bankroll.Amount < this.Betting/2) {
			$('.btn-insure').popover('enable');
			$('.btn-insure').popover('show');
		}
		else {
			Obj.Button.Insure.Hide();
			// SlideInsuranceAmount
			var res = await getData('/insure', Game);

			var delay = await StackSlide(from_obj = this.Bankroll, 
				to_obj = this.InsureStack, 
				amt = this.Betting/2);

			delay += 250;
			setTimeout(function()
			{

				Player.Insure_output = res.player.Insure_output;
		  		delay += Player.Insure_output == 'win' ? Player.InsureStack.win(Player.Betting,0) : Player.InsureStack.lose(0);

			},
			delay)

			if (Game.round_ended) {
				setTimeout(function()
					{
						Game.FinishRound();
					},
					delay)
			}
		}
	},

	Hit: async function() 
	{
		if (!Game.round_ended) {
			Game.DisableButton();

			var res = await getData('/hit', Game);
			var hand_play = Player.Hand[Player.HandPrtIndex];

			$.extend(Player, Game.player);
			$.extend(Dealer, Game.dealer);
			for (i=0; i<Player.Hand.length; i++) {
				$.extend(Player.Hand[i], Player.hand[i]);
			}

			if (hand_play.hand.length > 2) {
				var hitting_card = hand_play.hand[hand_play.hand.length-1]
				var delay = Game.DealPlayer('fd', facedown = true);

				setTimeout(function() {
					Game.FlipCard(hitting_card, 0, dealer = false);
				},
				delay)

				delay += 250;
			}

			delay += 50;

			setTimeout(function() {
				Player.HandPrtIndex = Player.handprtindex;
				if (Player.HandPrtIndex == 2) {
					Obj.PlayerScoreLabel[1].classList.remove('score-prt');
					Obj.PlayerScoreLabel[2].classList.add('score-prt');
				}
				
			}, 
			delay)

			if (Game.round_ended) {
				setTimeout(function()
				{
					Game.FinishRound();
				},
				delay);
			}
			else {
				setTimeout(function()
				{
					Obj.Button.Stand.Show();
					Obj.Button.Hit.Show();
				},
				delay);
			}
		}
	},

	Stand: async function()
	{
		if (!Game.round_ended) {
			Game.DisableButton();

			var res = await getData('/stand', Game);
			var hand_play = Player.Hand[Player.HandPrtIndex];

			$.extend(Player, Game.player);
			$.extend(Dealer, Game.dealer);

			for (i=0; i<Player.Hand.length; i++) {
				$.extend(Player.Hand[i], Player.hand[i]);
			}

			Player.HandPrtIndex = Player.handprtindex;
			if (Player.HandPrtIndex==2) {
				Obj.PlayerScoreLabel[1].classList.remove('score-prt');
				Obj.PlayerScoreLabel[2].classList.add('score-prt');
			}

			delay = 100;

			if (Game.round_ended) {
				setTimeout(function() {
					Game.FinishRound();
				},
				delay)
			}
			else {
				setTimeout(function() {
					Obj.Button.Stand.Show();
					Obj.Button.Hit.Show();
				},
				delay)
			}
		}
	},

	Double: async function()
	{
		if (Player.Bankroll.Amount < Player.Betting) {
			$('.btn-double').popover('enable');
			$('.btn-double').popover('show');
		}
		else {
			Game.DisableButton();

			var res = await getData('/double', Game);
			var hand_play = Player.Hand[Player.HandPrtIndex];

			$.extend(Player, Game.player);
			$.extend(Dealer, Game.dealer);

			for (i=0; i<Player.Hand.length; i++) {
				$.extend(Player.Hand[i], Player.hand[i]);
			}

			var delay = 0
			if (hand_play.hand.length > 2) {
				delay += StackSlide(from_obj = this.Bankroll, 
					to_obj = this.Betstack, 
					amt = this.Betting);

				setTimeout(function() {
					var doubling_card = hand_play.hand[hand_play.hand.length-1];
					var new_delay = Game.DealPlayer('fd', facedown=true);

					setTimeout(function() {
						Game.FlipCard(doubling_card, 0, dealer = false);
					},
					new_delay)

					new_delay += 250

				},
				delay)

				delay += 250*2;
			}

			setTimeout(function()
			{
				Game.FinishRound();
			},
			delay);
		}
	},

	Split: async function()
	{
		if (Player.Bankroll.Amount < Player.Betting) {
			$('.btn-split').popover('enable');
			$('.btn-split').popover('show');
		}
		else {
			Game.DisableButton();

			var res = await getData('/split', Game);

			$.extend(Player, Game.player);
			$.extend(Dealer, Game.dealer);

			var new_delay = 0;

			if (Player.hand.length > 1) {

				Player.Hand[1] = new Hand(Obj.PlayerHand[1], new ChipStack(Obj.BetStack[1], Obj.BetSlider[1], 279, 355))
				Player.Hand[2] = new Hand(Obj.PlayerHand[2], new ChipStack(Obj.BetStack[2], Obj.BetSlider[2], 624, 355))

				for (i=0; i< Player.hand.length; i++) {
					$.extend(Player.Hand[i], Player.hand[i]);
				}

				var delay = 0;

				// Card Slide
				var parent_hand = Player.Hand[0];
				var hand1 = Player.Hand[1];
				var hand2 = Player.Hand[2];
				Obj.PlayerScoreLabel[0].innerHTML = "";

				delay = parent_hand.Handstack.children[2].ObjSlide(hand1.Handstack, 100, 250, 0);
				console.log('delay hand splitting: ' + delay);
				hand1.Handcard.push(hand1.hand[0]);
				hand1.Left += hand1.OffsetLeft;
				hand1.Top += hand1.OffsetTop;

				Array.from(parent_hand.Handstack.children).slice(-1)[0].ObjSlide(hand2.Handstack, 100, 250, 0);
				hand2.Handcard.push(hand2.hand[0]);
				hand2.Left += hand2.OffsetLeft;
				hand2.Top += hand2.OffsetTop;

				// Betstack Slide
				StackSlide(from_obj = this.Bankroll, 
					to_obj = this.Hand[1].Betstack, 
					amt = this.Betting);

				// Obj.BetStack[0].ObjSlide(Obj.BetStack[2], 100, 250, 0);
				StackSlide(from_obj = this.Betstack,
					to_obj = this.Hand[2].Betstack,
					amt = this.Betting);

				// Update Score
				setTimeout(function() {
					hand1.UpdateScore();
					hand2.UpdateScore();
				},
				delay)

				// // Card Deal
				var i = 0;
				var handprtindex = Player.HandPrtIndex;
				console.log('handprtindex: ' + handprtindex);
				Player.HandPrtIndex = 0;
				console.log('handprtindex: ' + handprtindex);
				function deal_loop() {
					setTimeout(function() {

						var deal_delay = 0;
						Player.HandPrtIndex += 1;
						var hand_play = Player.Hand[Player.HandPrtIndex];
						new_card = hand_play.hand[hand_play.hand.length-1];

						deal_delay = Game.DealPlayer('fd', facedown=true, delay = deal_delay);
						console.log('Deal delay: ' + delay + deal_delay);

						setTimeout(function() {
							Game.FlipCard(new_card, 0, dealer = false);
						},
						deal_delay)

						delay += deal_delay;
						console.log('Flip delay: ' + delay + deal_delay);

						delay += 250;

						i++;
						if (i<Player.hand.slice(1,).length) {
							deal_loop();
						}
					},
					delay)
				}

				deal_loop();

				new_delay = 1250;
			}

			if (Game.round_ended) {
				setTimeout(function()
				{
					Game.FinishRound();
				},
				new_delay);
			}
			else {
				setTimeout(function()
				{	
					Player.HandPrtIndex = Player.handprtindex;
					console.log('Update HandPrtIndex');

					Obj.PlayerScoreLabel[Player.HandPrtIndex].classList.add("score-prt");

					Obj.Button.Stand.Show();
					Obj.Button.Hit.Show();
				},
				new_delay);
			}

		}
	}

}

// var child_extend = 
// {
// 	OffsetLeft: 24,
//     OffsetTop: -4,
// 	Left: 24,
// 	Top: -4,
// 	Handcard: [],
// 	Maxscore: null
// }

