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
  OriginalPlayerHand: [],
  PlayerScoreLabel: [],
  BetStack: [],
  BetSlider: [],
  Shoe: null,

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

    // BetStack
    Obj.BetStack[0] = document.getElementById('bet-stack-0');
    Obj.BetStack[1] = document.getElementById('bet-stack-1');
    Obj.BetStack[2] = document.getElementById('bet-stack-2');

    // InsureStack
    Obj.InsureStack = document.getElementById('insure-stack');

    // HandSlider
    Obj.BankrollSlider = document.getElementById('bankroll-slider');
    Obj.BetSlider[0] = document.getElementById('hand-slider-0');
    Obj.BetSlider[1] = document.getElementById('hand-slider-1');
    Obj.BetSlider[2] = document.getElementById('hand-slider-2');
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

    // Shoe
    Obj.Shoe = document.getElementById('shoe');
  },

  Reset: function() {

    // Obj.BetStack[0].innerHTML = "<div id='bet-stack-0' class = 'bet-stack'></div>";
    // Obj.PlayerScoreLabel[0].innerHTML = "<div id='score-label-0' class='score-label' style='display: none'></div>";
    // Obj.BetStack[1].innerHTML = "<div id='bet-stack-1' class = 'bet-stack'></div>";
    // Obj.PlayerScoreLabel[1].innerHTML = "<div id='score-label-1' class='score-label' style='display: none'></div>";
    // Obj.BetStack[2].innerHTML = "<div id='bet-stack-2' class = 'bet-stack'></div>";
    // Obj.PlayerScoreLabel[2].innerHTML = "<div id='score-label-2' class='score-label' style='display: none'></div>";
    for (i=0; i < Obj.PlayerHand.length; i++) {
      Obj.BetStack[i].innerHTML = "";
      Obj.BetStack[i].removeAttribute('style');
      
      Obj.PlayerScoreLabel[i].innerHTML = "";

      Obj.PlayerHand[i].innerHTML = "";
      Obj.PlayerHand[i].appendChild(Obj.BetStack[i]);
      Obj.PlayerHand[i].appendChild(Obj.PlayerScoreLabel[i]);
    }

    Obj.DealerHand.innerHTML = "<div id='dealer-score-label' class='score-label' style='display: none'></div>"; 
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

Element.prototype.ObjSlide = function(to_obj, fps, duration, delay, x_add = 0, y_add = 0)
{

  var x1 = this.getBoundingClientRect().left;
  var y1 = this.getBoundingClientRect().top;
  var objslide = document.body.appendChild(this);
  objslide.MoveTo(x1,y1);

  var x2 = to_obj.getBoundingClientRect().left + x_add;
  var y2 = to_obj.getBoundingClientRect().top + y_add;

  var frames = Math.round(duration * fps / 1000); if(frames < 2) frames = 2;
  var speed = duration / frames;
  var percent = 89/90;
  var decay   = -Math.log(1 / (1 - percent)) / frames;

  delay = delay ? delay : 0;

  var p, t, x, y, func = [], time = [];

  for (t = 0; t <= frames; ++t)
        {
            p = (1 - Math.exp(t * decay)) / percent;
            x = x1 + ((x2 - x1) * p);
            y = y1 + ((y2 - y1) * p);

            func[t] = SetPosVis(objslide, x, y);
            time[t] = delay + (t * speed);
        }

  SpawnAnimation(func, time);

  delay += duration;
  setTimeout(function() {
    objslide.style.left = x_add + "px";
    objslide.style.top = y_add + "px";
    to_obj.appendChild(objslide);
  },
  delay)
  
  return delay;
}

// MoveTo
Element.prototype.MoveTo = function(x, y)
  {
      this.style.left = x + "px";
      this.style.top  = y + "px";
  };

// CreateCardGame
// Element.prototype.CreateCard = function(card_symbol, card_double = false) {
//   var div = document.createElement("div");
//   div.className = "cardgame card-" + (card_symbol == 'fd' ? 'back' : card_symbol);
//   div.className += card_double ? " card-double" : "";
//   div.style.left = "800px";
//   div.style.top = "-350px";

//   this.appendChild(div);
//   return div;
// }

Element.prototype.CreateCard = function(card_symbol, card_double = false) {
  var div = document.createElement("div");
  div.className = "cardgame card-" + (card_symbol == 'fd' ? 'back' : card_symbol);
  div.className += card_double ? "card-double" : ""; // Horizontally displayed

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


