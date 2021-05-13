var Obj =
{
  Chip: [],
  ChipArrow: [],
  Initialize: function()
  {
    // Chip
    Obj.Chip[0] = document.getElementById('chip0');
    Obj.Chip[1] = document.getElementById('chip1');
    Obj.Chip[2] = document.getElementById('chip2');
    Obj.Chip[3] = document.getElementById('chip3');

    // ChipArrow
    Obj.ChipArrow[0] = document.getElementById('arrowL');
    Obj.ChipArrow[1] = document.getElementById('arrowR');
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
