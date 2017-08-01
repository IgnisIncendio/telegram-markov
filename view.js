"use strict"

const $ = require("jquery")
const Telegraf = require("telegraf")
const randomItemInArray = require("random-item-in-array")
const isEmpty = require("is-empty")
const loadJsonFile = require("load-json-file")
const whitespaceSplit = require("whitespace-split")
const lowerCase = require("lower-case")

class Main {
  constructor() {
    this.config = loadJsonFile.sync("config.json")
    this.errorLogger = new ErrorLogger()
    this.bot = new Bot(this.config.apiKey, this.config.maxLength)
  }

  start() {
    this.errorLogger.start()
    this.bot.start()
  }
}

class Bot {
  constructor(apiKey, maxLength) {
    this.bot = new Telegraf(apiKey)
    this.chats = new Chats()
    this.maxLength = maxLength
    this.chatLog = new Log("Chat")
    this.generateLog = new Log("Generate")
    this.statusLog = new Log("Status")
  }

  start() {
    this.bot.command("generate", this.generate.bind(this))
    this.bot.on("message", this.train.bind(this))
    this.bot.startPolling()
    this.statusLog.log("Bot started.")
  }

  generate(ctx) {
    const chatId = ctx.chat.id
    const generated = this.chats.getChat(chatId).wordChain.generate(this.maxLength)
    this.generateLog.log(chatId + ": " + generated)
    if (generated == "") ctx.reply("(Sorry, I don't have any data yet.)")
    else ctx.reply(generated)
  }

  train(ctx) {
    const chatId = ctx.chat.id
    const message = ctx.message.text
    if (message != undefined) {
      this.chats.getChat(chatId).wordChain.train(message)
      this.chatLog.log(chatId + ": " + message)
    }
  }
}

class ErrorLogger {
  constructor() {
    this.log = new Log("Error")
  }

  start() {
    window.onerror = this.onError.bind(this)
  }

  onError(msg, url, line, col, error) {
   this.log.log(msg + " (Line " + line + ", column " + col + ")")
  }
}

class Log {
  constructor(identifier) {
    this.ui = $("#log")
    this.identifier = identifier
  }

  log(message) {
    this.ui.val(this.ui.val() +
      "[" + this.identifier + "] " + message + "\n")
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

// Start program
let main = new Main()
main.start()
