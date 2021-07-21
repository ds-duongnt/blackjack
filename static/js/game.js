var Game =
{
  State: 0,
  ChipOffset: 6,
  ChipList: [5, 25, 100, 500, 1000, 5000, 25000, 100000],
  round_ended: false,
  // Adjust ChipOffset
  Initialize: function()
  {
    Obj.Initialize();
    Player.Initialize();
  },

  // Reset
  Reset: function()
  {
    Game.round_ended = false;
    Game.State = 0;
  },

  Start: function()
  {
    Game.Initialize();
    Game.NewHand();
    Obj.Guideline.style.display ='none';
    Obj.Header.style.display = 'block';
    Obj.ChipOffset.style.display = 'block';
    Obj.BankrollStack.style.display = 'block';

    // Send data to server
    Player.Bankroll.SetStack(parseInt(buyin.value));
    sendData('/start', buyin.value, Game)
    // Obj.BankrollStack.innerHTML = ChipStackHTML(buyin.value)
  },

  AdjustChips: function(n)
  {
    Game.ChipOffset += n;

    Game.UpdateChips();
  },

  UpdateChips: function()
  {
    var off = Game.ChipOffset * -50;
    Obj.Chip[0].style.backgroundPosition = off + "px 0"; off -= 50;
    Obj.Chip[1].style.backgroundPosition = off + "px 0"; off -= 50;
    Obj.Chip[2].style.backgroundPosition = off + "px 0"; off -= 50;
    Obj.Chip[3].style.backgroundPosition = off + "px 0";

    Obj.ChipArrow[0].ShowIf(Game.ChipOffset>6);
    Obj.ChipArrow[1].ShowIf(Game.ChipOffset<10);
  },

  // betchip
  BetChip: function(chip, index=true)
  {
    if (Game.round_ended) {
      Game.NewHand();
    }

    if (Game.State==0) {
      // Game.NewHand();
      Game.DisableButton();
      var bet_amt
      if (index) {
        var chip_amount = Game.ChipList[Game.ChipOffset - 6 + chip];
        bet_amt = chip_amount;
      }
      else {
        bet_amt = chip;
      }
      
      if (Player.Bankroll.Amount < chip_amount)
      {
        bet_amt = Player.Bankroll.Amount;
        // Obj.BankrollStack.Hide();
      }

      Player.Bankroll.Decrease(bet_amt);

      var delay = 0;
      var speed = 250;
      // var stack = Player.Handstack[0].Stack;
      var slider = Player.Betstack.Slider;
      var hand_x = Player.Betstack.Left;
      var hand_y = Player.Betstack.Top;
      var bankroll_x = Player.Bankroll.Left;
      var bankroll_y = Player.Bankroll.Top;

      slider.MoveTo(bankroll_x, bankroll_y);
      slider.innerHTML = ChipStackHTML(bet_amt);

      delay = slider.Slide(bankroll_x, bankroll_y, hand_x, hand_y, 100, speed, delay);

      delay += 100;
      setTimeout(
        function()
        {
          slider.innerHTML = '';
          Player.Betstack.Increase(bet_amt);
          Obj.Button.Deal.Show();
          Obj.Button.Clear.Show();
          Obj.BetStack[0].Show();
        },
      delay)

      return delay;
    }
  },

  // DisableButton
  DisableButton: function()
  {
    Obj.Button.Deal.Hide();
    Obj.Button.Clear.Hide();
    Obj.Button.Stand.Hide();
    Obj.Button.Hit.Hide();
    Obj.Button.Double.Hide();
    Obj.Button.Split.Hide();
    Obj.Button.Insure.Hide();
    Obj.Button.Newhand.Hide();
    Obj.Button.Repeat.Hide();
    Obj.Button.RepeatDeal.Hide();
  },

  // NewHand EnableButton
  NewRoundEnableButton: function()
  {
    if (Player.Bankroll.Amount==0) {
      Game.round_ended = false;
      Obj.Guideline.innerHTML = 'New Game';
      Obj.Guideline.style = 'block';
    }
    else {
      Obj.Button.Newhand.Show();
      Obj.Button.Repeat.Show();
      Obj.Button.RepeatDeal.Show();
      Game.State = 0;
    }
   
  },

  // Clear Button
  Clear: function()
  {
    var bet_amt = Player.Betstack.Amount

    var delay = 0;
    var speed = 250;
    var stack = Player.Betstack.Stack;
    var slider = Player.Betstack.Slider;
    var hand_x = Player.Betstack.Left;
    var hand_y = Player.Betstack.Top;
    var bankroll_x = Player.Bankroll.Left;
    var bankroll_y = Player.Bankroll.Top;

    Player.Betstack.Decrease(bet_amt);

    slider.MoveTo(hand_x, hand_y);
    slider.innerHTML = ChipStackHTML(bet_amt);

    delay = slider.Slide(hand_x, hand_y, bankroll_x, bankroll_y, 100, speed, delay);

    setTimeout(
      function()
      {
        slider.innerHTML = '';
        Player.Bankroll.Increase(bet_amt);
        Obj.Button.Deal.Hide();
        Obj.Button.Clear.Hide();
        Obj.BetStack[0].Hide();
        Obj.BankrollStack.Show();
      },
      delay
      )
  },

  // COMMUNICATE WITH FLASK
  // Deal Button
  Deal: async function(bet_amt)
  {
    $('.btn-popup').popover('disable');
    Game.State += 1;
    Game.DisableButton();

    var res = await sendData('/deal', bet_amt, Game);

    var player_hand = Game.player_hand;
    var dealer = Game.dealer;

    $.extend(Player, Game.player);
    $.extend(Player.Hand[0], player_hand);
    $.extend(Dealer, dealer);

    var card0 = player_hand.hand[0];
    var dealer_card = dealer.hand[0];
    var card1 = player_hand.hand[1];

    var delay = 0;
    setTimeout(function() { Game.DealPlayer(card0); }, delay); delay += 250;
    setTimeout(function() { Game.DealDealer(dealer_card); }, delay); delay += 250;
    setTimeout(function() { Game.DealPlayer(card1); }, delay); delay += 250;
    setTimeout(function() { Game.DealDealer('fd', facedown=true); }, delay); delay += 250;

    delay += 50;

    setTimeout(function() {
      if (Game.round_ended) {
        Game.FinishRound();
      }
      else {
        Obj.Button.Stand.Show();
        Obj.Button.Hit.Show();
        Obj.Button.Double.Show();
        Player.Hand[0].spl_check ? Obj.Button.Split.Show() : "";
        Dealer.insur_offer ? Obj.Button.Insure.Show() : "";
      } 
    }, 
    delay)
  },

  DealPlayer: function(card, facedown = false, delay = 0, card_double = false)
  {
    var hand = Player.Hand[Player.HandPrtIndex];
    if (facedown == false) {
      hand.Handcard.push(card);
      var card_str = CardgameConvert(card['card']);
    }
    else { var card_str = card;}
    

    // var div = Obj.PlayerHand[0].CreateCard(card_str, card_double = card_double);
    // delay = div.AnmtDeal(Player.Left, Player.Top, delay);

    var div = Obj.Shoe.CreateCard(card_str, card_double = card_double);
    delay = div.ObjSlide(hand.Handstack, 100, 250, delay, hand.Left, hand.Top);

    hand.Left += hand.OffsetLeft;
    hand.Top += hand.OffsetTop;

    if (!facedown) {
      setTimeout(
        function() {
          hand.UpdateScore();
        },
        delay);
    }
    
    return delay;
  },

  DealDealer: function(card, facedown=false, delay)
  {
    if (facedown == false) {
      Dealer.Handcard.push(card);
      var card_str = CardgameConvert(card['card']);
    }
    else { var card_str = card;}

    // var div = Obj.DealerHand.CreateCard(card_str);
    // delay = div.AnmtDeal(Dealer.Left, Dealer.Top, delay);

    var div = Obj.Shoe.CreateCard(card_str);
    delay = div.ObjSlide(Obj.DealerHand, 100, 250, delay, Dealer.Left, Dealer.Top);

    Dealer.Left += Dealer.OffsetLeft;
    Dealer.Top += Dealer.OffsetTop;

    if (!facedown) {
      setTimeout(
        function() {
          Dealer.UpdateScore();
        },
        delay);
    }
    
    return delay;
  },

  // FinishRound
  FinishRound: function()
  {
    // Dealer finish
    var card_left = Dealer.hand.slice(1,);
    var delay = 0;
    for (i=0; i <card_left.length; i++)
    {
      let card = card_left[i];
      if (i==0) {
        delay += 10;
        delay = Game.FlipCard(card, delay);
        console.log('Flip 0: ' + delay);
      }
      else {
        setTimeout(function () { 
          Game.DealDealer('fd', facedown=true);
        }, 
        delay); 

        delay += 260;

        // delay = Game.DealDealer('fd', facedown=true, delay = delay);
        // console.log('Deal ' + i +': ' + delay);

        // delay = Game.FlipCard(card, delay = delay);
        // console.log('Flip ' + i +': ' + delay);
        setTimeout(function () {
          Game.FlipCard(card);
        }, 
        delay); 

        delay += 250;
      }
    }

    var hands = Player.Hand;
    hands.forEach(function (hand, index) {
      let output = hand.output;

      // setTimeout(function() {
      //   if (output.output == 'win') { delay += hand.Betstack.win(Game.Betting*output.ratio); }
      //   else if (output.output == 'lose') { delay += hand.Betstack.lose(); }
      //   else if (output.output == 'push') { delay += hand.Betstack.push(); }
      // },
      // delay);

      if (output.output == 'win') { 
        delay = hand.Betstack.win(Game.Betting*output.ratio, delay); 
      }
      else if (output.output == 'lose') { 
        delay = hand.Betstack.lose(delay); 
      }
      else if (output.output == 'push') { 
        delay = hand.Betstack.push(delay); 
      }

    })

    delay += 100;
    // Game.output == 'win' ? delay += 1500 : delay += 700;
    setTimeout(function() {
        Player.Betstack = new ChipStack(Obj.BetStack[0], Obj.BetSlider[0], 453, 355);
        Player.InsureStack = new ChipStack(Obj.InsureStack, Obj.InsureSlider, 400, 250);

        for (i=0;i<Player.Hand.length;i++) {
          Obj.PlayerScoreLabel[i].classList.remove('score-prt');
        }

        Game.DisableButton();
        Game.NewRoundEnableButton();
        console.log('newround -- done --');
    },
    delay);

  },

  // DealerFlipCard
  FlipCard: function(card, delay, dealer = true)
  {
    if (dealer) {
      var hand = Dealer;
      var div_childs = Obj.DealerHand.children;
    }
    else {
      var hand = Player.Hand[Player.HandPrtIndex];
      var div_childs = hand.Handstack.children;
    }

    hand.Handcard.push(card);

    var card_str = CardgameConvert(card['card']);

    delay = div_childs[div_childs.length-1].FlipCard(card_str, delay);

    setTimeout(function()
    {
      hand.UpdateScore()
    },
    delay)

    return delay;
  },

  // NewHand
  NewHand: function()
  {
    Game.DisableButton();

    Game.Reset();
    Obj.Reset();
    Obj.Initialize();

    Player.Reset();
    Dealer.Reset();
  },

  Repeat: function(deal)
  {
    Game.NewHand();

    var speed = 250;
    var bet_amt;
    bet_amt = Player.Lastbet < Player.Bankroll.Amount ? Player.Lastbet : Player.Bankroll.Amount;

    var delay = Game.BetChip(bet_amt, false);

    if (!deal) {
      setTimeout(function()
      {
        Obj.Button.Deal.Show();
        Obj.Button.Clear.Show();
      },
      delay);
    }
    else {
      setTimeout(function()
      {
        Game.Deal(Player.Betstack.Amount);
      },
      delay);
    }
  }

}
