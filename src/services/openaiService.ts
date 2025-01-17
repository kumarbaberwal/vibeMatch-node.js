import OpenAI from "openai";
import { OPENAI_API_KEY } from "../configs";

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});


export const generateDailyQuestion = async (): Promise<string> => {
    try {
        const response = await openai.chat.completions.create({
            model: "chatgpt-4o-latest",
            messages: [
                {
                    "role": "user",
                    "content": `Generate a fun and engaging daily question for a chat conversation.`
                },
            ],
            max_tokens: 50,
        });

        console.log("generateDailyQuestion - OpenAi Called: ");
        // Extract the content
        let content = response.choices[0]?.message?.content?.trim() || "What is your favourite hobby?";

        // Extract only the question using a regex pattern
        const questionMatch = content.match(/["“](.*?)["”]/); // Match text inside quotes
        const question = questionMatch ? questionMatch[1] : content;

        console.log(question);
        return question.trim();

        // return response.choices[0]?.message?.content?.trim() || "What is your favourite hobby?";
    } catch (error) {
        console.error('Error generating daily question: ', error);
        return "Here is a random question: What's your favourite book?";
    }
}