// Imports
const $ = require("jquery")
const telegraf = require("telegraf")
const randomItemInArray = require("random-item-in-array")
const isEmpty = require("is-empty")
const loadJsonFile = require("load-json-file")
// Config

// Bot
const bot = new telegraf()
// UI Elements
const logText = $("#log");

const chain = {
  chain: {},
  train: function(items) {
    let prevItem = null
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (this.chain[prevItem] == undefined) this.chain[prevItem] = []
      this.chain[prevItem].push(item)
      prevItem = item
    }
  },
  generate: function(maxLength) {
    const items = []
    let prevItem = null
    while (items.length < maxLength) {
      const possibleNewItems = this.chain[prevItem]
      if (isEmpty(possibleNewItems)) break
      const chosenNewItem = randomItemInArray(possibleNewItems)
      items.push(chosenNewItem)
      prevItem = chosenNewItem
    }
    return items
  }
}

const log = function(message) {
  logText.val(logText.val() +
    "[Log] " + message + "\n")
}

// Start bot
bot.command("/generate", (ctx) => ctx.reply("Hey there!!"))
bot.startPolling()
log("Bot started.")
