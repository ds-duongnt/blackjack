var Obj =
{
  ChipOffset: null,
  Chip: [],
  ChipArrow: [],
  BankrollStack: null,
  HandStack: [],
  Guideline: null,
  Header: null,
  Button: {
    Deal: null,
    Clear: null,
    Stand: null,
    Hit: null,
    Double: null,
    Split: null,
    Insure: null,
    Newhand: null,
    Repeat: null,
    RepeatDeal: null
  },

  DealerHand: null,
  DealerScoreLabel:null,
  PlayerHand: [],
  PlayerScoreLabel: [],

  Initialize: function()
  {
    // Header
    Obj.Header = document.getElementById('header');

    // ChipOffset
    Obj.ChipOffset = document.getElementById('chipoffset');
    // Chip
    Obj.Chip[0] = document.getElementById('chip0');
    Obj.Chip[1] = document.getElementById('chip1');
    Obj.Chip[2] = document.getElementById('chip2');
    Obj.Chip[3] = document.getElementById('chip3');

    // ChipArrow
    Obj.ChipArrow[0] = document.getElementById('arrowL');
    Obj.ChipArrow[1] = document.getElementById('arrowR');

    // Button
    Obj.Button.Deal = document.getElementById('btn-deal');
    Obj.Button.Clear = document.getElementById('btn-clear');
    Obj.Button.Stand = document.getElementById('btn-stand');
    Obj.Button.Hit = document.getElementById('btn-hit');
    Obj.Button.Double = document.getElementById('btn-double');
    Obj.Button.Split = document.getElementById('btn-split');
    Obj.Button.Insure = document.getElementById('btn-insure');
    Obj.Button.Newhand = document.getElementById('btn-newhand');
    Obj.Button.Repeat = document.getElementById('btn-repeat');
    Obj.Button.RepeatDeal = document.getElementById('btn-repeat-deal');

    // BankrollStack
    Obj.BankrollStack = document.getElementById('bankroll-stack');

    // HandStack
    Obj.HandStack = document.getElementById('bet-stack');

    // InsureStack
    Obj.InsureStack = document.getElementById('insure-stack');

    // HandSlider
    Obj.BankrollSlider = document.getElementById('bankroll-slider');
    Obj.HandSlider = document.getElementById('hand-slider');
    Obj.InsureSlider = document.getElementById('insure-slider');

    // Guideline
    Obj.Guideline = document.getElementById('guideline');

    // DealerHand
    Obj.DealerHand = document.getElementById('dealer-hand');
    Obj.DealerScoreLabel = document.getElementById('dealer-score-label');


    // PlayerHand
    Obj.PlayerHand[0] = document.getElementById('player-hand-0');
    Obj.PlayerScoreLabel[0] = document.getElementById('score-label-0');

    Obj.PlayerHand[1] = document.getElementById('player-hand-1');
    Obj.PlayerScoreLabel[1] = document.getElementById('score-label-1');

    Obj.PlayerHand[2] = document.getElementById('player-hand-2');
    Obj.PlayerScoreLabel[2] = document.getElementById('score-label-2');
  }

};

Element.prototype.Hide = function() {
  this.style.display = "none";
};

Element.prototype.Show = function() {
  this.style.display = "block";
};

Element.prototype.ShowIf = function(c) {
  this.style.display = c ? "block" : "none";
};

// SLIDE ANIMATION
Element.prototype.Slide = function(x1, y1, x2, y2, fps, duration, delay)
    {
        var frames  = Math.round(duration * fps / 1000); if (frames < 2) frames = 2;
        var speed   = duration / frames;
        var percent = 89 / 90;
        var decay   = -Math.log(1 / (1 - percent)) / frames;

        delay = delay ? delay : 0;

        var p, t, x, y, func = [], time = [];

        for (t = 0; t <= frames; ++t)
        {
            p = (1 - Math.exp(t * decay)) / percent;
            x = x1 + ((x2 - x1) * p);
            y = y1 + ((y2 - y1) * p);

            func[t] = SetPosVis(this, x, y);
            time[t] = delay + (t * speed);
        }

        SpawnAnimation(func, time);

        return delay + duration;
    };

// MoveTo
Element.prototype.MoveTo = function(x, y)
  {
      this.style.left = x + "px";
      this.style.top  = y + "px";
  };

// CreateCardGame
Element.prototype.CreateCard = function(card_symbol, card_double = false) {
  var div = document.createElement("div");
  div.className = "cardgame card-" + (card_symbol == 'fd' ? 'back' : card_symbol);
  div.className += card_double ? " card-double" : "";
  div.style.left = "800px";
  div.style.top = "-350px";

  this.appendChild(div);
  return div;
}

// DealCard Animation
Element.prototype.AnmtDeal = function(x2, y2, delay) {
  var start = performance.now();
  var speed = 250;

  delay = delay ? delay : 0;

  this.Slide(550, -350, x2, y2, 100, speed, delay);

  return delay + speed - start + performance.now();
}

// FLIP
Element.prototype.Flip = function(width, height, c1, c2, duration, delay)
    {
        var frames  = width;
        var speed   = duration / frames;
        var percent = 89 / 90;
        var decay   = -Math.log(1 / (1 - percent)) / frames;

        delay = delay ? delay : 0;

        var p, t, c, w, m, func = [], time = [];

        for (t = 0; t <= frames; ++t)
        {
            p = (1 - Math.exp(t * decay)) / percent;
            c = p < 0.5 ? c1 : c2;
            w = width * 2 * (p < 0.5 ? 0.5 - p : p - 0.5);
            m = (width - w) * 0.5;

            func[t] = SetCWM(this, c, w, m, height);
            time[t] = delay + (t * speed);
        }

        SpawnAnimation(func, time);

        return delay + duration;
    };

// FLIP CARD
Element.prototype.FlipCard = function(card_str, delay)
    {
        var start = performance.now();
        var dur   = 250;

        delay = delay ? delay : 0;

        this.Flip(67, 5452, "cardgame card-back", "cardgame card-" + card_str, dur, delay);

        return delay + dur - start + performance.now();
    };


