import { Telegraf, session } from 'telegraf'

// To filter input data by type
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import { ogg } from './converters/ogg.js'
import { openai } from './openai.js'
import config from 'config'

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_BOT_TOKEN_PONI_AI'))

// Using middleware to work with user's session
bot.use(session())


bot.command('new', async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  await ctx.reply(`I'm PoniAI bot based on ChatGPT. I'm waiting for your voice or text message :)`)
})

// [COMMAND] handlers /start and etc.
bot.command('start', async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  await ctx.reply(`I'm PoniAI bot based on ChatGPT. I'm waiting for your voice or text message :)`)
})


// [TEXT] handler and etc.
bot.on(message('text'), async ctx => {
  ctx.session ??= INITIAL_SESSION


  console.log('ctx.session.messages => ', ctx.session.messages)

  try {
    await ctx.reply(code('Processing your request...'))

    ctx.session.messages.push({
      role: openai.ROLES.USER,
      content: ctx.message.text
    })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.ROLES.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.log('[ERROR] Error while text message:', error.message)
  }
})



// [VOICE] handler and etc.
bot.on(message('voice'), async ctx => {
  ctx.session ??= INITIAL_SESSION

  console.log('ctx.session.messages => ', ctx.session.messages)

  try {
    await ctx.reply(code('Processing your request...'))

    // Gets voice file download link
    // <link> - is URL object, but in messages it shown like a link)
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)


    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openai.transcription(mp3Path)
    await ctx.reply(code(`Your request: ${text}`))

    ctx.session.messages.push({
      role: openai.ROLES.USER,
      content: text
    })

    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.ROLES.ASSISTANT,
      content: response.content
    })

    await ctx.reply(response.content)
  } catch (error) {
    console.log('[ERROR] Error while voice message:', error.message)
  }
})



bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))



// DRAFT NOTES
// Sends back initial usage request message
// await ctx.reply(JSON.stringify(ctx.message, null, 2))