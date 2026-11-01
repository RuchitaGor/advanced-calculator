// ---------- Variables (the calculator's "memory") ----------

var currentInput = "0";   // number shown on the screen (as text)
var firstNumber = null;   // first number, saved when an operator is pressed
var operator = null;      // + - * /
var newNumber = false;    // true = next digit starts a fresh number
var hasError = false;     // true after "Cannot divide by zero"
var memory = 0;           // value stored by M+ / M-
var history = [];         // last 5 results

var symbols = { "+": "+", "-": "-", "*": "x", "/": "/" };

// ---------- 1. Separate functions for arithmetic ----------

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return null;   // null means "cannot divide"
  }
  return a / b;
}

// ---------- 2. switch statement to choose the operation ----------

function operate(a, b, op) {
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      return b;
  }
}

// ---------- 3. Screen functions ----------

function updateDisplay() {
  var display = document.getElementById("display");
  display.textContent = currentInput;

  // red small text for the error message
  if (hasError) {
    display.className = "error";
  } else {
    display.className = "";
  }

  // small line above: shows first number and operator
  var expression = document.getElementById("expression");
  if (operator !== null) {
    expression.textContent = firstNumber + " " + symbols[operator];
  } else {
    expression.textContent = "";
  }

  // show M when something is stored in memory
  var indicator = document.getElementById("memIndicator");
  if (memory !== 0) {
    indicator.textContent = "M";
  } else {
    indicator.textContent = "";
  }
}

function showHistory() {
  var list = document.getElementById("historyList");
  if (history.length === 0) {
    list.innerHTML = "<li>No results yet</li>";
    return;
  }
  var items = "";
  for (var i = 0; i < history.length; i++) {
    items += "<li>" + history[i] + "</li>";
  }
  list.innerHTML = items;
}

// removes tiny errors like 0.1 + 0.2 = 0.30000000000000004
function cleanNumber(n) {
  return Math.round(n * 10000000000) / 10000000000;
}

// ---------- 4. Keypad functions ----------

function pressNumber(digit) {
  if (hasError) {
    clearAll();
  }
  if (newNumber || currentInput === "0") {
    currentInput = digit;
    newNumber = false;
  } else if (currentInput.length < 12) {
    currentInput = currentInput + digit;
  }
  updateDisplay();
}

function pressDecimal() {
  if (hasError) {
    clearAll();
  }
  if (newNumber) {
    currentInput = "0.";
    newNumber = false;
  } else if (currentInput.indexOf(".") === -1) {
    // add "." only if there is no "." already
    currentInput = currentInput + ".";
  }
  updateDisplay();
}

function pressOperator(op) {
  if (hasError) {
    return;
  }
  // if 5 + 3 is already typed, calculate it first (chain)
  if (operator !== null && !newNumber) {
    calculate();
    if (hasError) {
      return;
    }
  }
  firstNumber = Number(currentInput);
  operator = op;
  newNumber = true;
  updateDisplay();
}

function calculate() {
  if (hasError || operator === null) {
    return;
  }

  var secondNumber = Number(currentInput);
  var result = operate(firstNumber, secondNumber, operator);

  // divide() gave null, so show the error
  if (result === null) {
    currentInput = "Cannot divide by zero";
    hasError = true;
    firstNumber = null;
    operator = null;
    updateDisplay();
    return;
  }

  result = cleanNumber(result);

  // save in history (newest first, keep only 5)
  var line = firstNumber + " " + symbols[operator] + " " + secondNumber + " = " + result;
  history.unshift(line);
  if (history.length > 5) {
    history.pop();
  }

  currentInput = String(result);
  firstNumber = null;
  operator = null;
  newNumber = true;
  updateDisplay();
  showHistory();
}

function toggleSign() {
  if (hasError || currentInput === "0") {
    return;
  }
  if (currentInput.charAt(0) === "-") {
    currentInput = currentInput.slice(1);
  } else {
    currentInput = "-" + currentInput;
  }
  updateDisplay();
}

function percent() {
  if (hasError) {
    return;
  }
  currentInput = String(cleanNumber(Number(currentInput) / 100));
  newNumber = true;
  updateDisplay();
}

function clearAll() {
  currentInput = "0";
  firstNumber = null;
  operator = null;
  newNumber = false;
  hasError = false;
  updateDisplay();
}

// ---------- 5. Memory functions ----------

function memoryAdd() {
  if (hasError) {
    return;
  }
  memory = cleanNumber(memory + Number(currentInput));
  newNumber = true;
  updateDisplay();
}

function memorySubtract() {
  if (hasError) {
    return;
  }
  memory = cleanNumber(memory - Number(currentInput));
  newNumber = true;
  updateDisplay();
}

function memoryRecall() {
  if (hasError) {
    clearAll();
  }
  currentInput = String(memory);
  newNumber = true;
  updateDisplay();
}

function memoryClear() {
  memory = 0;
  updateDisplay();
}

// show the starting screen
updateDisplay();
showHistory();