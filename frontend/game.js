var Game =
{
  ChipOffset: 6,

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
  }
};
