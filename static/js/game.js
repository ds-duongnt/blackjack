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
      var slider = Player.Handstack[0].Slider;
      var hand_x = Player.Handstack[0].Left;
      var hand_y = Player.Handstack[0].Top;
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
          Player.Handstack[0].Increase(bet_amt);
          Obj.Button.Deal.Show();
          Obj.Button.Clear.Show();
          Obj.HandStack.Show();
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
    var hand_amt = Player.Handstack[0].Amount

    var delay = 0;
    var speed = 250;
    var stack = Player.Handstack[0].Stack;
    var slider = Player.Handstack[0].Slider;
    var hand_x = Player.Handstack[0].Left;
    var hand_y = Player.Handstack[0].Top;
    var bankroll_x = Player.Bankroll.Left;
    var bankroll_y = Player.Bankroll.Top;

    slider.MoveTo(hand_x, hand_y);
    slider.innerHTML = ChipStackHTML(hand_amt);

    delay = slider.Slide(hand_x, hand_y, bankroll_x, bankroll_y, 100, speed, delay);

    setTimeout(
      function()
      {
        slider.innerHTML = '';
        Player.Handstack[0].Decrease(hand_amt);
        Player.Bankroll.Increase(hand_amt);
        Obj.Button.Deal.Hide();
        Obj.Button.Clear.Hide();
        Obj.HandStack.Hide();
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

    $.extend(Player, player_hand);
    $.extend(Dealer, dealer);

    var card0 = player_hand.hand[0];
    var dealer_card = dealer.hand[0];
    var card1 = player_hand.hand[1];

    var delay = 0;
    setTimeout(function() { Game.DealPlayer(card0); }, delay); delay += 250;
    setTimeout(function() { Game.DealDealer(dealer_card); }, delay); delay += 250;
    setTimeout(function() { Game.DealPlayer(card1); }, delay); delay += 250;
    setTimeout(function() { Game.DealDealer('fd', facedown=true); }, delay); delay += 250;

    setTimeout(function() {
      if (Game.round_ended) {
        Game.FinishRound();
      }
      else {
        Obj.Button.Stand.Show();
        Obj.Button.Hit.Show();
        Obj.Button.Double.Show();
        Player.spl_check ? Obj.Button.Split.Show() : "";
        Dealer.insur_offer ? Obj.Button.Insure.Show() : "";
      } 
    }, 
    delay)
  },

  DealPlayer: function(card, delay = 0, card_double = false)
  {
    Player.Handcard.push(card);
    var card_str = CardgameConvert(card['card']);

    var div = Obj.PlayerHand[0].CreateCard(card_str, card_double = card_double);
    delay = div.AnmtDeal(Player.Left, Player.Top, delay);

    Player.Left += Player.OffsetLeft;
    Player.Top += Player.OffsetTop;

    setTimeout(
      function() {
        Player.UpdateScore();
      },
      delay);

    return delay;
  },

  DealDealer: function(card, facedown=false, delay)
  {
    if (facedown == false) {
      Dealer.Handcard.push(card);
      var card_str = CardgameConvert(card['card']);
    }
    else { var card_str = card;}

    var div = Obj.DealerHand.CreateCard(card_str);
    delay = div.AnmtDeal(Dealer.Left, Dealer.Top, delay);

    Dealer.Left += Dealer.OffsetLeft;
    Dealer.Top += Dealer.OffsetTop;

    setTimeout(
      function() {
        Dealer.UpdateScore();
      },
      delay);

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
        delay = Game.FlipCard(card, delay);
      }
      else {
        setTimeout(function () { Game.DealDealer('fd', facedown=true);}, delay); delay += 250;
        setTimeout(function () { Game.FlipCard(card); }, delay); delay += 250;
      }
    }

    setTimeout(function() {
      if (Game.output == 'win') { delay += Player.Handstack[0].win(Game.Betting*Game.bet_mult); }
      else if (Game.output == 'lose') { delay += Player.Handstack[0].lose(); }
      else if (Game.output == 'push') { delay += Player.Handstack[0].push(); }
    },
    delay);

    Game.output == 'win' ? delay += 1500 : delay += 700;
    setTimeout(function() {
        Player.Handstack[0] = new ChipStack(Obj.HandStack, Obj.HandSlider, 453, 355);
        Player.InsureStack = new ChipStack(Obj.InsureStack, Obj.InsureSlider, 400, 250);

        Game.DisableButton();
        Game.NewRoundEnableButton();
    },
    delay);

  },

  // DealerFlipCard
  FlipCard: function(card, delay)
  {
    Dealer.Handcard.push(card);
    var card_str = CardgameConvert(card['card']);

    var div_childs = Obj.DealerHand.children;
    delay = div_childs[div_childs.length-1].FlipCard(card_str, delay);

    setTimeout(function()
    {
      Dealer.UpdateScore()
    },
    delay)

    return delay;
  },

  // NewHand
  NewHand: function()
  {
    Game.DisableButton();

    Game.Reset();
    Player.Reset();
    Dealer.Reset();
    Obj.Initialize();
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
        Game.Deal(Player.Handstack[0].Amount);
      },
      delay);
    }
  }

}
