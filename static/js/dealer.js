var Dealer =
{
	OffsetLeft: 24,
    OffsetTop: 0,
	Left: 0,
	Top: 0,
	Maxscore:null,
	Handcard: [],
	
	Reset: function ()
	{
		Dealer.Left = 0;
		Dealer.Top = 0;
		Dealer.Maxscore = null,
		Dealer.Handcard = []

	},

	UpdateScore: function()
	{
		var handcard = Dealer.Handcard;
		for (i=0; i < handcard.length; i++) {
			if (i == 0) { var score_base = [...handcard[i].score];}
			else {
				var new_base = [];
				var score_list = [...handcard[i].score];
				for (j=0; j < score_list.length; j++) {
					new_score = IncrementArray(score_base, score_list[j]);
					for (s=0; s < new_score.length; s++) {
						new_base.push(new_score[s]);
					}
				}
				score_base = [...new Set(new_base)];
				score_base = score_base.filter(x => x<=21);
			}
		}

		(score_base.length != 0) ? Dealer.Maxscore = Math.max(...score_base) : Dealer.Maxscore = 'Bust';

		if (Dealer.Handcard.length == 2 && Dealer.Maxscore == 21) {
			Dealer.Maxscore = 'Blackjack';
		}
		// Dealer.Maxscore = Math.max.apply(null, score_base);

		Obj.DealerScoreLabel.style.display = 'block';
    	Obj.DealerScoreLabel.innerHTML = "<span>" + Dealer.Maxscore + "</span>";
	}	
}

