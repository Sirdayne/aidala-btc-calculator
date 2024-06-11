# Aidala BTC Calculator

front-end ready to use solution from aidala.uk
check it on https://aidala.uk/dashboard


## For Local Use with github
run command to install npm packages
```bash
npm install
```

run command to run locally
```bash
npm run dev
```

## What Inside
calculator is written on Vue 3 + Vite

## How To Use from npm
```bash
npm i aidala-btc-calculator
```
to use it just import js script from

```bash
import 'aidala-btc-calculator'
```

and run function with id parameter to mount calculator

```bash
window.injectAidalaCalculator('#my-id');
```

to unmount Aidala Calculator
```bash
window.unmountAidalaCalculator();
```

or if you do not use npm, you can copy-paste aidala-btc-calculator.js to your website and run window.injectAidalaCalculator('#my-id')
