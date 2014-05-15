var keys = [];
$('body').keydown(function (e) {
    keys[e.which] = true;
    switch (e.which) {
    case A:
    case ONE:
        $('#A').click();
        break;
    case B:
    case TWO:
        $('#B').click();
        break;
    case C:
    case THREE:
        $('#C').click();
        break;
    case D:
    case FOUR:
        $('#D').click();
        break;
    case E:
    case FIVE:
        $('#E').click();
        break;
    case ENTER:
        $('#sub ').click();
        break;
    }
});
$('body').keyup(function (e) {
    keys[e.which] = false;
});



var BACKSPACE = 8;
var TAB = 9;
var ENTER = 13;
var SHIFT = 16;
var CTRL = 17;
var ALT = 18;
var PAUSE = 19;
var BREAK = PAUSE;
var CAPSLOCK = 20;
var ESCAPE = 27;
var PAGEUP = 33;
var PAGEDOWN = 34;
var END = 35;
var HOME = 36;
var LARROW = 37;
var UARROW = 38;
var RARROW = 39;
var DARROW = 40;
var INSERT = 45;
var DELETE = 46;
var ZERO = 48;
var ONE = 49;
var TWO = 50;
var THREE = 51;
var FOUR = 52;
var FIVE = 53;
var SIX = 54;
var SEVEN = 55;
var EIGHT = 56;
var NINE = 57;
var A = 65;
var B = 66;
var C = 67;
var D = 68;
var E = 69;
var F = 70;
var G = 71;
var H = 72;
var I = 73;
var J = 74;
var K = 75;
var L = 76;
var M = 77;
var N = 78;
var O = 79;
var P = 80;
var Q = 81;
var R = 82;
var S = 83;
var T = 84;
var U = 85;
var V = 86;
var W = 87;
var X = 88;
var Y = 89;
var Z = 90;
var LWINDOW = 91;
var RWINDOW = 92;
var SELECT = 93;
