<template>
  <div class="hello">
    <h1>KUL Airdrop</h1>

    <div v-if="account === ''">
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <div>
        <span>Account: </span><span>{{ account }}</span>
      </div>

      <p />

      <div>
        <span>Balance: </span><span>{{ balance }}</span>
      </div>

      <p />

      <p />
      <button @click="claim">Claim KUL Token</button>
      <div v-if="toWait !== ''">
        <span>wait: </span><span>{{ toWait }}</span>
      </div>

      <p />
      <a v-if="txHash" :href="txHash">fsdf</a>
    </div>
  </div>
</template>

<script>
import * as nearAPI from "near-api-js"
import getConfig from "../config"

const nearConfig = getConfig(process.env.NODE_ENV || "development");

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      near: null,
      walletAccount: null,
      account: '',
      contract: null,
      balance: '',
      toWait: '',
      txHash: ''
    }
  },
  methods: {
    async login() {
      this.walletAccount.requestSignIn(nearConfig.contractName, 'NEAR token example');
    },
    async connect() {
      // Connect to network
      this.near = await nearAPI.connect(Object.assign(nearConfig, { deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }}));
      console.log(this.near)

      // Account
      this.walletAccount = new nearAPI.WalletAccount(this.near)
      console.log(this.walletAccount)
      console.log('account id', this.walletAccount.getAccountId())
      this.account = this.walletAccount.getAccountId()

      // Contract
      this.contract = await this.near.loadContract(nearConfig.contractName, {
        viewMethods: ['totalSupply', 'balanceOf', 'allowance', 'nextClaimTimestamp'],
        changeMethods: ['init', 'transfer', 'approve', 'transferFrom', 'airdrop'],
        sender: this.walletAccount.getAccountId()
      });
    },
    async refresh() {
      this.refreshBalance()
      this.refreshToWait()
    },
    async refreshBalance() {
      this.balance = await this.contract.balanceOf({tokenOwner: this.account})
    },
    async refreshToWait() {
      const prev = await this.contract.nextClaimTimestamp({account: this.account})
      if (prev != 0) {
        const secondsPassed = (Date.now()-prev/1e6)/1e3
        if (secondsPassed > 60) {
          this.toWait = ''

        } else {
          this.toWait = `${parseInt(60 - secondsPassed)}s`
        }
        
      } else {
        this.toWait = ''
      }
    },
    async claim() {
      this.txHash = ''
      const result = await this.contract.airdrop()
      console.log(result)
      this.txHash = `https://explorer.testnet.near.org/accounts/${this.account}`
    }
  },
  mounted() {
    this.connect().then(_ => {
      setInterval(this.refresh, 1000);
    })
  },
  created() {
    console.log(nearAPI)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
