// var ready = (callback) => {
//     if (document.readyState != "loading") callback();
//     else document.addEventListener("DOMContentLoaded", callback);
// }
// ready(() => {
//     document.querySelector(".main").style.height = window.innerHeight + "px";
// })

// SpawnAnimation
function SpawnAnimation(f, t)
{
    var l = f.length; for (var i = 0; i < l; ++i) setTimeout(f[i], t[i]);
}

function SetPosVis(obj, x, y)
    {
        return function()
        {
            obj.style.left      = x + "px";
            obj.style.top       = y + "px";
            obj.style.display   = "block";
        };
    }

function SetCWM(obj, c, w, m, h)
    {
        return function()
        {
            obj.className               = c;
            obj.style.width             = w + "px";
            obj.style.marginLeft        = m + "px";
            obj.style.backgroundSize    = w + "px " + h + "px";
        };
    }

// Send data to server
async function sendData(endpoint, data, var_log)
{
    const response = await fetch(`${window.origin}${endpoint}`, 
    {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        cache: "no-cache",
        headers: new Headers({"content-type": "application/json"})
    });

    if (!response.ok) {
        console.log(`Response was ${response.status}`);
    }

    const res_data = await response.json();

    $.extend(var_log, res_data);
    console.log(res_data);
    return res_data;

    // .then(function (response) {
    //     if (response.status !== 200) {
    //         console.log(`Response was ${response.status}`)
    //         return ;  
    //     }
    //     response.json().then(function (data) {
    //         console.log(data);
    //         $.extend(var_log, data);
    //         return data;
    //     })
    // })
}

async function getData(endpoint, var_log)
{
    const response = await fetch(`${window.origin}${endpoint}`, {
        method: 'GET',
        credentials: "include",
        cache: "no-cache",
    });

    if (!response.ok) {
        console.log(`getData server problem: ${response.status}`)
    }

    const res_data = await response.json();
    $.extend(var_log, res_data);
    console.log(res_data);
    return res_data;
}

// Convert Card from Flask to Js
function CardgameConvert(card)
{
    var card_list = card.toLowerCase().split(":");
    var face = card_list[0]
    if (face == 'ja') {face = 'j';}
        else if (face == 'qe') {face = 'q';}
            else if (face == 'ki') {face = 'k';}
                else if (face == 'ac') {face = '01';}

    var suit = card_list[1];
    return face+suit;
}

function IncrementArray(myArray, num)
{
    var clnArray = [...myArray]
    for (var i = 0; i < clnArray.length; i++) {
        clnArray[i] += num;
    }
    return clnArray;
}

function StackSlide(from_obj, to_obj, amt)
{
    from_obj.Decrease(amt);

    let delay = 0;
    let speed = 250;
    let slider = to_obj.Slider;
    let to_x = to_obj.Left;
    let to_y = to_obj.Top;
    let from_x = from_obj.Left;
    let from_y = from_obj.Top;

    slider.MoveTo(from_x, from_y);
    slider.innerHTML = ChipStackHTML(amt);

    delay = slider.Slide(from_x, from_y, to_x, to_y, 100, speed, delay);

    setTimeout(
        function()
    {
        slider.innerHTML = '';
        to_obj.Increase(amt);
    },
    delay)

    return delay;
}

function CardSlide(from_obj, to_obj)
{
    from_obj
}
