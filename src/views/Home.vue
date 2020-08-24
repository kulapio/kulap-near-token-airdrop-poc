<template>
  <div class="near">
    <h1 class="title">KULAP Airdrop (POC)</h1>
    <img
      class="cover"
      src="@/assets/near-airdrop.png"
    >
    <div v-if="isSiginIn">
      <div class="address">
        Account: <strong>{{ account }}</strong>
      </div>
      <div class="token">
        Balance: <span v-if="balance"><strong>{{ balance | numberWithCommas }}</strong> KUL</span>
      </div>
      <b-button
        type="is-success"
        class="claim"
        rounded
        @click="claim"
        :disabled="toWait !== ''"
        :loading="isLoading"
      >
          <span v-if="toWait === ''">Claim</span>
          <span v-else>{{ toWait }}</span>
      </b-button>
      <div class="link">
        <a
          v-if="url"
          :href="url"
          target="_blank"
        >
          Transaction detail
        </a>
      </div>
    </div>
    <div v-else>
      <b-button
        type="is-success"
        class="sign-in"
        rounded
        @click="signIn"
      >
        Sign-In
      </b-button>
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from '@/components/Footer'

import { ToastProgrammatic as Toast } from 'buefy'
import * as nearAPI from "near-api-js"
import getConfig from "../config"

const nearConfig = getConfig(process.env.NODE_ENV || "development")

export default {
  name: 'Near',
  components: {
    Footer
  },
  data () {
    return {
      isSiginIn: true,
      isClaim: true,
      isLoading: false,
      claimTimeOut: '',
      tokenAmount: 1234,
      url: null,

      near: null,
      walletAccount: null,
      account: '',
      contract: null,
      balance: '',
      toWait: '',
    }
  },
  methods: {
    signIn () {
      // this.isSiginIn = true
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
      if (this.account === '') {
        this.isSiginIn = false
      }

      // Contract
      this.contract = await this.near.loadContract(nearConfig.contractName, {
        viewMethods: ['totalSupply', 'balanceOf', 'allowance', 'nextClaimTimestamp'],
        changeMethods: ['init', 'transfer', 'approve', 'transferFrom', 'airdrop'],
        sender: this.walletAccount.getAccountId()
      });
    },
    async claim () {
      try {
        this.isLoading = true
        this.url = null
        
        const result = await this.contract.airdrop()
        console.log(result)

        this.isLoading = false
        this.url = `https://explorer.testnet.near.org/accounts/${this.account}`
        Toast.open({
          message: 'Claim success',
          type: 'is-success',
          position: 'is-bottom'
        })
        this.isClaim = false
        this.claimTimeOut = `${10} s`

      } catch (err) {
        Toast.open({
          message: err.message,
          type: 'is-danger',
          position: 'is-bottom'
        })
      }
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
    wait1Min () {
      this.isClaim = false
      let countDown = 4
      const i = setInterval(() => {
        this.claimTimeOut = `${countDown} s`
        if (countDown <= 0) {
          this.isClaim = true
          this.claimTimeOut = ''
          clearInterval(i)
        }
        --countDown
      }, 1000)
    }
  },
  mounted() {
    this.connect().then(_ => {
      setInterval(this.refresh, 1000);
    })
  }
}
</script>

<style scoped lang="scss">
.near {
  font-size: 16px;
  // height: calc(100vh - 80px);
  display: block;
  float: left;
  width: 100%;
  overflow: hidden;
  padding: 0 100px;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.cover {
  height: 280px;
}
.sign-in {
  width: 200px;
  height: 50px;
  margin-bottom: 50px;
  font-weight: 500;
  font-size: 20px;
}
.claim {
  width: 200px;
  height: 50px;
  margin-top: 10px;
  font-size: 20px
}
.address {
  border: black solid 2px;
  border-radius: 19px;
  padding: 15px 26px;
  font-size: 26px;
}
.token {
  font-size: 20px;
  margin: 15px 0;
}
.link {
  margin: 20px 0;
  font-size: 16px;
}
.title {
  font-family: 'Open Sans';
  color: #2a307a;
  margin-bottom: 0px !important;
}
@media screen and (max-width: 1023px) {
  .near {
    padding: 0 20px;
  }
  .address {
    margin: 0 10px;
  }
}
</style>
