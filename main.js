// ==UserScript==
// @name         Poloniex Maximum Withdrawal Limit
// @namespace    caellach
// @version      0.1
// @description  Adds the maximum withdraw limit on the coin withdrawal form. Why doesn't Poloniex have this already?
// @author       Kelly Carothers
// @match        https://poloniex.com/balances
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var _pmw = {
        timeout_redrawWithdrawLimit: null
    };

    _pmw.CalulateWithdrawLimit = function() {
        var _accountValue_usd, _accountValue_btc, _wdRemaining, _balancesRows, _btcPrice, _withdrawableInBTC;
        try {
            _accountValue_usd = parseFloat($('#accountValue_usd')[0].innerHTML.replace(/,/g, ''));
            _accountValue_btc = parseFloat($('#accountValue_btc')[0].innerHTML.replace(/,/g, ''));
            _btcPrice = _accountValue_usd / _accountValue_btc;
            _wdRemaining = parseFloat($('#wdRemaining')[0].innerHTML.replace(/,/g, ''));
            _withdrawableInBTC = _wdRemaining/_btcPrice;
        } catch(e) {
            console.error("Could not initialize: " + e);
            _pmw.reset();
        }

        try {
            var _withdrawalLimit = $('#withdrawalLimit')[0];
            var _withdrawalBalance = $('#withdrawalBalance')[0];
            var _currency = _withdrawalBalance.parentElement.getElementsByClassName("currency")[0].innerHTML;
            if (_withdrawalLimit === undefined) {
                var _text = _withdrawalBalance.parentElement.lastChild;
                _text.replaceWith(_text.wholeText + "Maximum withdrawal is ");
                var _text_currency = _text.cloneNode();
                _text_currency.nodeValue = " " + _currency + ".";
                _withdrawalLimit = document.createElement('span');
                _withdrawalLimit.className = 'num softLink';
                _withdrawalLimit.id = 'withdrawalLimit';
                _withdrawalLimit.addEventListener('click', function(e) {
                    var _amount = parseFloat(this.innerHTML).toFixed(8);
                    $('#withdrawalAmount')[0].value = _amount;
                });
                _withdrawalBalance.parentElement.appendChild(_withdrawalLimit);
                _withdrawalBalance.parentElement.appendChild(_text_currency);
            } else {
                $('#withdrawalLimit')[0].parentElement.lastChild.nodeValue = " " + _currency + ".";
            }

            var _currentCoinRow = $('#actionRow')[0].previousElementSibling;
            var _coinAmount = parseFloat(_currentCoinRow.getElementsByClassName('balance')[0].innerHTML);
            var _coinAmountInBTC = parseFloat(_currentCoinRow.getElementsByClassName('value')[0].innerHTML);
            var _coinPerBTC = _coinAmount/_coinAmountInBTC;
            var _limit = _withdrawableInBTC * _coinPerBTC;
            _limit = parseFloat(_limit).toFixed(8);
            if (isNaN(_limit)) {
                _limit = parseFloat(0).toFixed(8);
            }
            _withdrawalLimit.innerHTML = _limit;
        } catch(e) {
            console.error(e);
            _pmw.reset();
        }
        _pmw.reset();
    };

    _pmw.reset = function() {
        clearTimeout(_pmw.timeout_redrawWithdrawLimit);
        _pmw.timeout_redrawWithdrawLimit = null;
    };

    _pmw.run = function() {
        if (_pmw.timeout_redrawWithdrawLimit === null || _pmw.timeout_redrawWithdrawLimit === undefined) {
            _pmw.timeout_redrawWithdrawLimit = setTimeout(_pmw.CalulateWithdrawLimit);
        }
    };

    var _wait = setInterval(function() {
        if ($('#balances_BCH')[0] === undefined) return;
        clearInterval(_wait);
        var _withdrawButtons = $('[data-url=withdraw]');
        for (var i = 0; i < _withdrawButtons.length; i++) {
            _withdrawButtons[i].addEventListener('click', function() {
                _pmw.run();
            });
        }

        $('#accountValue_usd').on('DOMSubtreeModified', function() {
            _pmw.run();
        });

        $('#wdRemaining').on('DOMSubtreeModified', function() {
            _pmw.run();
        });
    }, 100);
})();