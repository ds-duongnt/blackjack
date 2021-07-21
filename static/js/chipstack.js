// AmountFormat
var formatter = new Intl.NumberFormat('en-US', 
{
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
}
);

// ChipStackHTML
function ChipStackHTML(amt)
{
	var html_output = '';
	if (amt!=0) {
		html_output += '<div class = "chipshadow" style = "top: -3px ; left: -3px"></div>'
		var t = 0; // CSS top variable
		var amt_proc = amt;
		var chip_list = [100000, 25000, 5000, 1000, 500, 100, 25, 5];
		for (var i = 0; i < chip_list.length; i++)
		{
			chip_use = chip_list[i];
			_floor = Math.floor(amt_proc/chip_use);

			for (var j = 0; j < _floor; j++)
			{
				html_output += '<div class = "chip_' + chip_use + '" style = "top: ' + t + 'px"></div>';
				t -= 5;
				amt_proc -= chip_use;
			}
		}

		html_amtlabel = '<div class = "chip-label"><span>' + formatter.format(amt) + '</span></div>';
		html_output += html_amtlabel;
	}

	return html_output;
};

// #Chipstack Block
function ChipStack(stack, slider, left, top)
{
	this.Amount = 0;
	this.Stack = stack;
	this.Slider = slider;
	this.Left = left;
	this.Top = top;

	// SetStack
	this.SetStack = function(amt)
	{
		this.Amount = amt;
		this.Stack.innerHTML = ChipStackHTML(amt);
	}

	// DecreaseAmount
	this.Decrease = function(amt)
	{
		this.Amount -= amt;
		this.Stack.innerHTML = ChipStackHTML(this.Amount);
	}

	// IncreaseAmount
	this.Increase = function(amt)
	{
		this.Amount += amt;
		this.Stack.innerHTML = ChipStackHTML(this.Amount);
	}

	// LOSE
	this.lose = function(delay)
	{
		var that = this;
		setTimeout(function() {
			var bet = that.Amount;
			var stack = that.Stack;
			var slider = that.Slider;
			var x = that.Left;
			var y = that.Top;
			var speed = 250;

			slider.MoveTo(x, y);
			slider.innerHTML = stack.innerHTML;
			stack.innerHTML = '';

			slider.Slide(x, y, 450, -45, 100, speed, 0);

			setTimeout(function()
			{
				slider.innerHTML = '';
			},
			250);
		},
		delay)
		
		return delay + 250;
	}

	// WIN
	this.win = function(amt, delay)
	{
		var that = this;
		setTimeout(function() {
			var bet = that.Amount;
			var stack = that.Stack;
			var slider = that.Slider
			var x = that.Left;
			var y = that.Top;
			var speed = 250;

			slider.MoveTo(450, -45); // Dealer Pos
			slider.innerHTML = ChipStackHTML(amt);

			slider.Slide(450, -45, x + 60 , y, 100, speed, 0);

			slider.Slide(x + 60, y, x, y, 100, speed, 500);

			setTimeout(function()
			{
				stack.innerHTML = '';
				slider.innerHTML = ChipStackHTML(amt+bet);
			},
			750)

			// delay += 250;

			slider.Slide(x, y, Player.Bankroll.Left, Player.Bankroll.Top, 100, speed, 750);

			setTimeout(function()
			{
				slider.innerHTML = '';
				Player.Bankroll.Increase(bet+amt);
				console.log('win stack -- done --');

			},
			1000)
		},
		delay)

		return delay + 1000;
	}

	// PUSH
	this.push = function(delay)
	{
		var that = this;
		setTimeout(function() {
			var bet = that.Amount;
			var stack = that.Stack;
			var slider = that.Slider
			var x = that.Left;
			var y = that.Top;
			var speed = 250;

			slider.MoveTo(x,y);
			slider.innerHTML = stack.innerHTML;
			stack.innerHTML = '';

			slider.Slide(x,y, Player.Bankroll.Left, Player.Bankroll.Top, 100, speed, 0);

			setTimeout(function()
			{
				slider.innerHTML = '';
				Player.Bankroll.Increase(bet);
			},
			250)
		},
		delay)
		
		return delay + 250;
	}
}