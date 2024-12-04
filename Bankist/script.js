'use strict';

// Bootstrapping Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const formLogin = document.querySelector('.login');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const formTransfer = document.querySelector('.form--transfer');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const formLoan = document.querySelector('.form--loan');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const formClose = document.querySelector('.form--close');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const radioAll = document.querySelector('input[name="filter"][value="all"]');
const radioDeposit = document.querySelector(
  'input[name="filter"][value="deposit"]'
);
const radioWithdrawal = document.querySelector(
  'input[name="filter"][value="withdrawal"]'
);
const radioButtons = document.querySelectorAll('input[name="filter"]');

// global variables
let currentAccount, timerCountDown;

// functions

const beautifyDate = function (date) {
  return `${String(date.getDate()).padStart(2, 0)}/${String(
    date.getMonth()
  ).padStart(2, 0)}/${date.getFullYear()}`;
};

const formatCurrency = function (amount, account) {
  return new Intl.NumberFormat(account.locale, {
    style: 'currency',
    currency: `${account.currency}`,
  }).format(amount);
};

const updateDisplayDate = function () {
  labelDate.textContent = beautifyDate(new Date(Date.now()));
};

const displayMovements = function (account, displayType) {
  containerMovements.innerHTML = '';
  account.movements.forEach((movement, i) => {
    const movType = movement > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const formattedDate = `${beautifyDate(date)}`;
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movType}">${
      i + 1
    } ${movType} </div>
        <div class="movements__date">${formattedDate}</div>
        <div class="movements__value">${formatCurrency(movement, account)}</div>
      </div>
    `;

    if (displayType === movType || displayType === 'all')
      containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplaySummary = function (account) {
  account.sumIn = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(account.sumIn, account);

  account.sumOut = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = formatCurrency(account.sumOut, account);

  account.balance = account.sumIn - account.sumOut;
  labelBalance.textContent = formatCurrency(account.balance, account);

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = formatCurrency(interest, account);
};

const getLoginId = function (owner) {
  const id = owner
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(name => name[0])
    .join('');
  console.log(`login id: ${id}, len: ${id.length}`);
  return id;
};

const addTransfer = function (account, amount, date) {
  account.movements.push(amount);
  account.movementsDates.push(date.toISOString());
  amount > 0 ? (account.sumIn += amount) : (account.sumOut -= amount);
  account.balance += amount;
};

const formatTimer = function (timer) {
  const min = Math.trunc(timer / 60);
  const sec = Math.trunc(timer % 60);
  return `${String(min).padStart(2, 0)}:${String(sec).padStart(2, 0)}`;
};

const resetInactivityTimer = function () {
  clearInterval(timerCountDown);
  let inactivityTimer = 120; // 2 minutes
  labelTimer.textContent = formatTimer(inactivityTimer);
  const timer = setInterval(() => {
    labelTimer.textContent = formatTimer(--inactivityTimer);
    if (timer === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Please Login.';
      containerApp.style.opacity = 0;
    }
  }, 1000);

  return timer;
};

const loadAccount = function (account) {
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
  labelWelcome.textContent = `Welcome back, ${account.owner.split(' ')[0]}`;
  containerApp.style.opacity = 100;
  document.querySelector('input[name="filter"][value="all"]').checked = true;

  displayMovements(account, 'all');
  calcDisplaySummary(account);
  updateDisplayDate();
  timerCountDown = resetInactivityTimer();
};

// bootstrap - to be removed
// loadAccount(account1);

// application logic

accounts.forEach(account => (account.loginId = getLoginId(account.owner)));
console.log(account1);

const validateLogin = function () {
  const id = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);

  console.log(`id: ${id}, len(id): ${id.length}, pin: ${pin}`);
  const account = accounts.find(
    account => account.loginId === id && account.pin === pin
  );

  return account;
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  const account = validateLogin();
  if (!account) {
    formLogin.reset();
    alert('Incorrect Login Id or PIN. Try again.');
  } else {
    currentAccount = account;
    loadAccount(account);
  }
});

// Add an event listener to each radio button
radioButtons.forEach(radio => {
  radio.addEventListener('change', event => {
    console.log(`Selected filter: ${event.target.value}`);
    displayMovements(currentAccount, event.target.value);
    timerCountDown = resetInactivityTimer();
  });
});

// functions that update global state on current account (should they?)

const validateTransfer = function (toId, amount) {
  const isAmountValid = amount <= currentAccount.balance && amount > 0;
  const toAccount = accounts.find(account => account.loginId === toId);

  if (!isAmountValid) {
    alert('Invalid Amount.');
    return undefined;
  } else if (!toAccount) {
    alert('Invalid Account.');
    return undefined;
  }

  formTransfer.reset();
  inputTransferAmount.blur();
  console.log(toAccount);

  return toAccount;
};

const updateMovementWithUI = function (transferAmount, date) {
  addTransfer(currentAccount, transferAmount, date);
  labelBalance.textContent = `${currentAccount.balance} €`;
  labelSumIn.textContent = `${currentAccount.sumIn} €`;
  labelSumOut.textContent = `${currentAccount.sumOut} €`;

  const movType = transferAmount > 0 ? 'deposit' : 'withdrawal';
  const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movType}">${
    currentAccount.movements.length
  } ${movType} </div>
        <div class="movements__date">${beautifyDate(date)}</div>
        <div class="movements__value">${formatCurrency(
          transferAmount,
          currentAccount
        )}</div>
      </div>
    `;

  const type = document.querySelector('input[name="filter"]:checked').value;
  if (type === movType || type === 'all')
    containerMovements.insertAdjacentHTML('afterbegin', html);
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const toId = inputTransferTo.value;
  const transferAmount = Number(inputTransferAmount.value);

  const toAccount = validateTransfer(toId, transferAmount);
  if (!toAccount) return;
  const now = new Date(Date.now());
  addTransfer(toAccount, transferAmount, now);

  // show withdrawal
  updateMovementWithUI(-1 * transferAmount, now);
  timerCountDown = resetInactivityTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= 0.1 * loanAmount)
  ) {
    updateMovementWithUI(loanAmount);
    formLoan.reset();
  }
  timerCountDown = resetInactivityTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const id = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  const valid = currentAccount.loginId === id && currentAccount.pin === pin;

  if (valid) {
    const index = accounts.findIndex(
      account => account.loginId === id && account.pin === pin
    );
    accounts.splice(index, 1);

    // LOGOUT
    containerApp.style.opacity = 0;
    formClose.reset();
  }
});
