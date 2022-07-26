import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

//create test account
const startingBalance = stdlib.parseCurrency(100);
const acc = await stdlib.newTestAccount(startingBalance);

//Set up functions for checking balance
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async () => fmt(await stdlib.balanceOf(acc));

const before = await getBalance()
console.log('Your starting balance is: ' + before)

//Define interface for Dev(token creator)
const Deployer = {
  ready: () => {
    console.log('Ready for attachers')
  },
  seeAttacher: (attacherInfo) => {
    const { Address, Bool } = attacherInfo
    if(Bool){
      console.log(`${Address} successfully connected`)
    }
    else {
      console.log(`${Address} couldnt connect. List is full`)
    }
  },
};

//Program starts here
const program = async () => {

  const isDeployer = await ask(
    `Do you want to deploy contract?`,
    yesno
  )
  
  const who = isDeployer ? 'Deployer' : 'Bob';
  console.log(`Starting as ${who}`);

  //Contract gets initialized here
  let ctc = null;

  if(isDeployer){
    ctc =  acc.contract(backend); // connect to contract
    backend.Deployer(ctc, Deployer); //attach deployer object to contract
    console.log('Deploying contract...');
    const info = JSON.stringify(await ctc.getInfo(), null, 1) //fetch contract info
    console.log(info); //display info
  }
  else{
    const info = await ask(
      `Please paste the contract information of the contract you want to subscribe to:`, 
      JSON.parse
    );
    ctc = acc.contract(backend, info)
    const listLength = await ctc.apis.Attacher.submitAddress()
    const list = parseInt(listLength)
    if(list <= 5){
      console.log('Your address got added')
    }
    else {
      console.log('List is already full')
    }
  }
}

await program();
