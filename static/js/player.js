var Player =
{
	Lastbet: null,
	Insure_output: null,
	Output: null,
	Betting: null,
	Bankroll: null,
	Handstack: [],
	OffsetLeft: 24,
    OffsetTop: -4,
	Left: 0,
	Top: 0,
	Handcard: [],
	Maxscore: null,
	split_check:null,
	Initialize: function()
	{
		Player.Bankroll = new ChipStack(Obj.BankrollStack, Obj.BankrollSlider, 170, 515);

		Player.Handstack[0] = new ChipStack(Obj.HandStack, Obj.HandSlider, 453, 355);

		Player.InsureStack = new ChipStack(Obj.InsureStack, Obj.InsureSlider, 400, 250);
	},

	// Reset
	Reset: function()
	{
		Player.Lastbet = Player.Betting;
		Player.Insure_output = null;
		Player.Betting = null;
		Player.Left = 0;
		Player.Top = 0;
		Player.Handcard = [];
		Player.Maxscore = null;
		Player.split_check = null;

		Obj.PlayerHand[0].innerHTML = "<div id='score-label' class='score-label' style='display: none'></div>";
	},

	UpdateScore: function()
	{

		if (Player.Handcard.length == 1) {
			Player.Maxscore = Math.max(...Player.Handcard[0].score);
		}
		else {
			(Player.score.length != 0) ? Player.Maxscore = Math.max(...Player.score) : Player.Maxscore = 'Bust';
		}

		if (Player.Handcard.length == 2 && Player.Maxscore == 21) {
			Player.Maxscore = 'Blackjack';
		}

		Obj.PlayerScoreLabel[0].style.display = 'block';
    	Obj.PlayerScoreLabel[0].innerHTML = "<span>" + Player.Maxscore + "</span>";
	},

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
			$.extend(Player, Game.player_hand);

			var hitting_card = Player.hand[Player.hand.length-1]
			var delay = Game.DealPlayer(hitting_card, 0, false);

			delay += 250;
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
			$.extend(Dealer, Game.dealer);

			Game.FinishRound();
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
			$.extend(Player, Game.player_hand);
			$.extend(Dealer, Game.dealer);

			var delay = 0
			delay += StackSlide(from_obj = this.Bankroll, 
				to_obj = this.Handstack[0], 
				amt = this.Betting);

			var doubling_card = Player.hand[Player.hand.length-1]
			delay = Game.DealPlayer(doubling_card, delay);

			delay += 250;

			setTimeout(function()
			{
				Game.FinishRound();
			},
			delay);
		}
	},

	Split: function()
	{
		$('.btn-split').popover('enable');
		$('.btn-split').popover('show');
	}

}
