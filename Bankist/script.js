'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const displayMovements = function (movements) {
  console.log(`inner HTML: ${containerMovements.innerHTML}`);
  containerMovements.innerHTML = '';
  movements.forEach((movement, i) => {
    const movType = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movType}">${
      i + 1
    } ${movType} </div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement} €</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${balance} €`;
};

const calcDisplaySummary = function (account) {
  account.sumIn = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${account.sumIn} €`;

  account.sumOut = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = `${account.sumOut} €`;

  account.balance = account.sumIn - account.sumOut;

  labelSumInterest.textContent = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
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

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  const account = validateLogin();
  if (!account) {
    formLogin.reset();
    alert('Incorrect Login Id or PIN. Try again.');
  } else {
    currentAccount = account;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    labelWelcome.textContent = `Welcome back, ${account.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    displayMovements(account.movements);
    calcDisplayBalance(account.movements);
    calcDisplaySummary(account);
  }
});

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

const addTransfer = function (account, amount) {
  account.movements.push(amount);
  amount > 0 ? (account.sumIn += amount) : (account.sumOut -= amount);
  account.balance += amount;
};

const updateMovementWithUI = function (transferAmount) {
  addTransfer(currentAccount, transferAmount);
  labelBalance.textContent = `${currentAccount.balance} €`;
  labelSumIn.textContent = `${currentAccount.sumIn} €`;
  labelSumOut.textContent = `${currentAccount.sumOut} €`;

  const movType = transferAmount > 0 ? 'deposit' : 'withdrawal';
  const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${movType}">${currentAccount.movements.length} ${movType} </div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${transferAmount} €</div>
      </div>
    `;

  containerMovements.insertAdjacentHTML('afterbegin', html);
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const toId = inputTransferTo.value;
  const transferAmount = Number(inputTransferAmount.value);

  const toAccount = validateTransfer(toId, transferAmount);
  if (!toAccount) return;
  addTransfer(toAccount, transferAmount);

  // show withdrawal
  updateMovementWithUI(-1 * transferAmount);
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
    containerApp.style.opacity = 0;
    formClose.reset();
  }
});
