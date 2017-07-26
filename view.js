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
  const generatedText = generated.join(" ")
  return generatedText
}
// Log
const log = function(tier, message) {
  logText.val(logText.val() +
    "[" + tier + "] " + message + "\n")
}
// Log errors
window.onerror = function(msg, url, line, col, error) {
  log("Error", msg + " (Line " + line + ", column " + col + ")")
}
// Start bot
bot.command("generate", (ctx) => {
  const generated = generate()
  if (generated == "") ctx.reply("(Sorry, I don't have any data yet.)")
  else ctx.reply(generated)
})
bot.on("message", (ctx) => {
  if (ctx.message.text != undefined) {
    train(ctx.message.text)
    log("Chat", ctx.chat.id + ": " + ctx.message.text)
  }
})
bot.startPolling()
log("Status", "Bot started.")
