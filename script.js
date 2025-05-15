'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-11-18T21:31:17.178Z',
    '2024-12-23T07:42:02.383Z',
    '2025-01-28T09:15:04.904Z',
    '2025-04-01T10:17:24.185Z',
    '2025-05-08T14:11:59.604Z',
    '2025-04-27T17:01:17.194Z',
    '2025-05-10T23:36:17.929Z',
    '2025-05-12T10:51:36.790Z',
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

/////////////////////////////////////////////////
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

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  ;
  const daysPassed = calcDaysPassed(new Date(), date)
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  else {
    // // const now = new Date();
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    // to return formatting of date according to locale
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value)
}


// BODY

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovsDates = acc.movements.map((mov, i) =>
  ({
    movement: mov,
    movementDate: acc.movementsDates.at(i),
  }));


  if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);

  combinedMovsDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementDate);
    const displayDate = formatMovementDate(date, acc.locale);


    const formattedMovement = formatCurr(movement, acc.locale, acc.currency);


    const html = `
      <div class="movements__row" >
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div >
  `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};


const startLogoutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0); // i used tem[late literal and also Sttring: both do same thing]

    // In each call, print timer on UI
    labelTimer.textContent = `${min}:${sec}`;


    // when 0 seconds, logout user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }


    // Decrease 1 sec
    time--;

  }


  // Setting the time to 5 mins
  let time = 300;

  // Call the timer every second
  tick()
  const timer = setInterval(tick, 1000);
  return timer
};


///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake always log in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//labelDate.textContent = now; // this will give full date format but it is not what we need

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
      } `;
    containerApp.style.opacity = 100;

    //create current date
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // // day/month/year
    // labelDate.textContent = `${day} /${month}/${year}, ${hour}:${min}`

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long'
    };
    // we can set the locale of the user according to the browser settings
    // const locale = navigator.language;
    // console.log(locale);

    // labelDate.textContent = new Intl.DateTimeFormat('en-NG', options).format(now);
    // this can be written with the locale
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Logout timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});


btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {

    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString())

      // Update UI
      updateUI(currentAccount);
    }, 5000);
  }
  inputLoanAmount.value = '';

  // Reset timer
  clearInterval(timer);
  timer = startLogoutTimer();
});



btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});


/*
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(23 === 23.0);

// Base 10 - 0 to 9
// Base 2 - 0, 1

// Coonverting strings to numbers with another method
console.log(Number('23'));
console.log(+'23');

// Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e20', 10)); // for parsing to work, the string needs to start with a nu ber else you get NaN.


console.log(Number.parseFloat('2.5rem'));
console.log(Number.parseFloat('2.5rem'));


// Checking if value is NaN
console.log(Number.isNaN(23));
console.log(Number.isNaN('23'));
console.log(Number.isNaN(+'23X'));
console.log(Number.isNaN(23 / 0));

// checking if value is a number
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'23X'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));


// MATH AND ROUNDING

// MATH
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

//  Maximum value
console.log(Math.max(2, 4, 6, 30, 23));
console.log(Math.max(2, 4, 6, '30', 23)); //the math.max does type coersion but not parseIn
console.log(Math.max(2, 4, 6, '30px', 23)); // results to NaN

console.log(Math.min(2, 4, 6, 30, 23));

// Calculating area of a circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

// Creating a random number function
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// console.log(randomInt(10, 20));
// console.log(randomInt(0, 3));

// ROUNDING Integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.9));
console.log(Math.round(23.3));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

// Rounding Decimals
console.log((2.7).toFixed(0)); // toFixed will always a string instead of a number
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2)); //the + converts it to numbers



// Remainder Operator(%)
console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // 8 = 3 * 2 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(512));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';

    if (i % 3 === 0) row.style.backgroundColor = 'blue'
  });
});



// Numeric Seperators, the underscore used to seperate numeric values, changes the dynamics of the values depending on the position
const diameter = 287_460_000_000;
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.14_15;
console.log(PI);

// when we try to convert strings that has the underscore would not work
console.log(Number('230_000'));
console.log(Number('230_000')); // means when using the underscore, make sure it is only for numbers


// Using BIGINT
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(483439474698749247472494n);
console.log(BigInt(4834394746987));

//Operations
console.log(10000n + 10000n);
console.log(328479478758995994997599240942949n * 212313414n);

// you cant use regular number with bigint, so you use bigint to convert.
const huge = 2024894958735974744n;
const num = 23;
console.log(huge * BigInt(num));

// logical expressions exceptions
console.log(20n > 15);
console.log(20n === 20); // javascript doesnt do type coersion for 3 operands
console.log(typeof 20n);
console.log(20n == '20'); // type coersion can happen here cos of 2 operands

//concatination
console.log(huge + ' is REALLY big!!!'); // All are converted to string

// Divisions
console.log(13n / 3n); // cuts off the decimal part.



// CREATING DATES
// we have 4 methods of creating dates in the new Jscript

// 1. 
const now = new Date();
console.log(now);

// 2. Parse the date from a date string
console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015')); // this practice isnt really a good one
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 15, 23, 5));// it will display novemebr as it is zero based
console.log(new Date(2037, 10, 34)); // it approximates dates

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));



// working with dates
const future = new Date(2037, 10, 19, 15, 15, 23);
console.log(future);

console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay()); // day of the week as in Sun
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());// getting the time stamp
// using the time stamp
console.log(new Date(2142252923000)); // gives same date

console.log(Date.now());
console.log(new Date(1746618593578)); // Now

console.log(future.setFullYear(2040)); // this changes the current year
console.log(future);


// Operations with dates
const future = new Date(2037, 10, 19, 15, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) => Math.abs(date2 - date1) / (1000 * 60 * 60 * 24) // maths.abs alwasy make sure we subtract the lower from the higher

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);

*/


// Formatting with numbers
const num = 38884576.23;

const options = {
  style: 'unit',
  unit: 'mile-per-hour',
}

console.log('US:     ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:  ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(navigator.language, new Intl.NumberFormat(navigator.language, options).format(num));


// Timers

// Set Timer
const ingredients = ['olives', 'spinach']
const pizzaTimer = setTimeout((ing1, ing2) => console.log(`Here is your pizza 🍕 with ${ing1} and ${ing2}.`),
  3000,
  ...ingredients
);
console.log('waiting...');
// we can also cancel the settimeout before it runs completely, we store the settimeout in a variable
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer)


// Set Interval
const options2 = {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'numeric',
  year: 'numeric'
}

// cresting clock based on current time
setInterval(function () {
  const now = new Date();
  const hour = now.getHours()
  const minute = now.getMinutes()
  const seconds = now.getSeconds()

  const myPersonalTime = `${hour}:${minute}:${seconds}`
  // console.log(myPersonalTime);
}, 1000);