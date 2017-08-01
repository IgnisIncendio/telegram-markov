"use strict"

const $ = require("jquery")
const telegraf = require("telegraf")
const randomItemInArray = require("random-item-in-array")
const isEmpty = require("is-empty")
const loadJsonFile = require("load-json-file")
const whitespaceSplit = require("whitespace-split")
const lowerCase = require("lower-case")

class Main {
  constructor() {
    this.config = loadJsonFile.sync("config.json")
    this.log = new Log("#log")
    this.bot = new telegraf(this.config.apiKey)
    this.chats = new Chats()
  }

  start() {
    this.bot.command("generate", (ctx) => {
      const chatId = ctx.chat.id
      const generated = this.chats.getChat(chatId).wordChain.generate(this.config.maxLength)
      this.log.log("Generate", chatId + ": " + generated)
      if (generated == "") ctx.reply("(Sorry, I don't have any data yet.)")
      else ctx.reply(generated)
    })
    this.bot.on("message", (ctx) => {
      const chatId = ctx.chat.id
      const message = ctx.message.text
      if (message != undefined) {
        this.chats.getChat(chatId).wordChain.train(message)
        this.log.log("Chat", chatId + ": " + message)
      }
    })
    this.bot.startPolling()
    this.log.log("Status", "Bot started.")
  }

  enableLogging() {
    window.onerror = function(msg, url, line, col, error) {
      this.log.log("Error", msg + " (Line " + line + ", column " + col + ")")
    }
  }
}

class Chats {
  constructor() {
    this.chats = {}
  }

  getChat(chatId) {
    if (this.chats[chatId] == undefined) this.chats[chatId] = new Chat()
    return this.chats[chatId]
  }
}

class Chat {
  constructor() {
    this.wordChain = new WordChain()
  }
}

class WordChain {
  constructor() {
    this.chain = new Chain()
  }

  train(text) {
    const textSplit = whitespaceSplit(this.normalize(text))
    this.chain.train(textSplit)
  }

  generate(maxLength) {
    const generated = this.chain.generate(maxLength)
    const generatedText = generated.join(" ")
    return generatedText
  }

  normalize(text) {
    return lowerCase(text)
  }
}

class Chain {
  constructor() {
    this.data = {}
  }

  train(items) {
    let prevItem = null
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Add this item to prev item's array
      if (this.data[prevItem] == undefined) this.data[prevItem] = []
      this.data[prevItem].push(item)
      prevItem = item
    }
  }

  generate(maxLength) {
    const items = []
    let prevItem = null
    while (items.length < maxLength) {
      const possibleThisItems = this.data[prevItem]
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

class Log {
  constructor(identifier) {
    this.logText = $(identifier)
  }

  log(tier, message) {
    this.logText.val(this.logText.val() +
      "[" + tier + "] " + message + "\n")
  }
}

// Start program
new Main().start()
