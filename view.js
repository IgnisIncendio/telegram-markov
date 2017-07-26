// Imports
const $ = require("jquery")
const telegraf = require("telegraf")
const randomItemInArray = require("random-item-in-array")
const isEmpty = require("is-empty")
const loadJsonFile = require("load-json-file")
const whitespaceSplit = require("whitespace-split")
const lowerCase = require("lower-case")
// Config
const config = loadJsonFile.sync("config.json")
// Bot
const bot = new telegraf(config.apiKey)
// UI Elements
const logText = $("#log");
// Markov chain
const chain = {
  chain: {},
  train: function(items) {
    let prevItem = null
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Add this item to prev item's array
      if (this.chain[prevItem] == undefined) this.chain[prevItem] = []
      this.chain[prevItem].push(item)
      prevItem = item
    }
  },
  generate: function(maxLength) {
    const items = []
    let prevItem = null
    while (items.length < maxLength) {
      const possibleThisItems = this.chain[prevItem]
      // Stop if dead end
      if (isEmpty(possibleThisItems)) break
      // Choose current item from the possible items and push to result
      const chosenThisItem = randomItemInArray(possibleThisItems)
      items.push(chosenThisItem)
      prevItem = chosenThisItem
    }
    return items
  }
}
// Words
const normalize = function(text) {
  return lowerCase(text)
}
const train = function(text) {
  const textSplit = whitespaceSplit(normalize(text))
  chain.train(textSplit)
}
const generate = function() {
  const generated = chain.generate(config.maxLength)
  return generated.join(" ")
}
// Log
const log = function(message) {
  logText.val(logText.val() +
    "[Log] " + message + "\n")
}
// Start bot
bot.command("/generate", (ctx) => ctx.reply("Hey there!!"))
bot.startPolling()
log("Bot started.")
