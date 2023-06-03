import { Configuration, OpenAIApi } from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

const API_KEY = config.get('OPEN_AI_KEY')
// import apikey


class OpenAI {
  ROLES = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  }

  constructor(apiKey) {
    const configuration = new Configuration({ apiKey })

    this.openai = new OpenAIApi(configuration)
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })
      return response.data.choices[0].message
      
    } catch (error) {
      console.log('Error while openai -> chat() function call')
    }
    return null
  }

  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      )
      return response.data.text
    } catch(error) {
      console.log('[ERROR] Error while transcription:', error.message)
    }

  }
}

const openai = new OpenAI(API_KEY)

export { openai }