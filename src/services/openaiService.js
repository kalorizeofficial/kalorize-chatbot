const OpenAI = require("openai");
let setting = require("../../key.json");

const openai = new OpenAI({ apiKey: setting.keyopenai });

async function chatWithOpenAI(query) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: query }],
        model: 'gpt-3.5-turbo'
    });
    return chatCompletion.choices[0].message.content;
}

async function generateImageWithOpenAI(prompt) {
    const image = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: '1024x1024'
    });
    return image.data[0].url;
}

module.exports = {
    chatWithOpenAI,
    generateImageWithOpenAI
};
