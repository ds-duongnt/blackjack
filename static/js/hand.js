function Hand(Handstack, Betstack) {
	this.Output = null;
	this.OffsetLeft = 24;
	this.OffsetTop = -4;
	this.Left = 0;
	this.Top = 0;
	this.Handcard = []; // Card push
	this.Maxscore = null;
	this.split_check = null;

	this.Handstack = Handstack;
	this.Betstack = Betstack;
	
	this.UpdateScore = function() {
		if (this.Handcard.length == 1) {
			this.Maxscore = Math.max(...this.Handcard[0].score);
		}
		else {
			(this.score.length != 0) ? this.Maxscore = Math.max(...this.score) : this.Maxscore = 'Bust';
		}

		if (!this.ischild && !this.freeze && this.Handcard.length == 2 && this.Maxscore == 21) {
			this.Maxscore = 'Blackjack';
		}

		Handstack.children[1].style.display = 'block';
		Handstack.children[1].innerHTML = "<span>" + this.Maxscore + "</span>";
	}
}