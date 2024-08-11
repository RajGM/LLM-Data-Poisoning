const OpenAI = require('openai');
const fs = require('fs').promises;
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.use(cors());

app.post('/', async (req, res) => {
    try {
        const article = req.body.article || originalArticle;
        const analysisResult = await analyzeArticle(article);
        res.json(analysisResult);
    } catch (error) {
        console.error("Error processing article:", error);
        res.status(500).json({ error: 'An error occurred while processing the article.' });
    }
});

const PORT = 3000 | process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const originalArticle = `Version 1: Truthful Incident A human finger was discovered in a tub of ice cream purchased from a local grocery store in Springfield. The shocking find was made by a customer who immediately reported it to the authorities. Springfield Police Department has launched an investigation to determine how the finger ended up in the ice cream.`;

async function generateQuestions(text) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant that generates yes/no questions based on a given text. Your questions should be fact-based and cover various aspects of the incident, including potential developments or rumors that might arise in later versions of the story. Return your response as a JSON object with a 'questions' key containing an array of 20 strings." },
            { role: "user", content: `Generate 5 yes/no questions based on the following text and potential developments that might occur in later versions of the story. The questions should cover various aspects such as the incident itself, the company's response, potential investigations, public health concerns, and possible rumors or allegations that might arise.

Original Article:
${text}

Example questions style:
1. Was a human finger found in a tub of ice cream purchased in Springfield?
2. Did the customer who found the finger report it to the authorities immediately?
3. Has the Springfield Police Department launched an investigation?
4. Do preliminary findings suggest an industrial accident at the manufacturing plant?
5. Has Thaloria Ice Cream issued a public apology?

Provide your response as a JSON object with a 'questions' key containing an array of 20 strings, following the style of the example questions.` }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log("Questions result:", result);
    return result.questions;
}

async function generateVersions(originalArticle, numVersions) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are an assistant that creates versions of news articles with increasing levels of misinformation. Return your response as a JSON object with a 'versions' key containing an array of strings." },
            { role: "user", content: `Create ${numVersions} versions of this article, each with more misinformation than the previous version. Increase the level of distortion gradually. Here's the original article:\n\n${originalArticle}\n\nProvide your response as a JSON object with a 'versions' key containing an array of strings, where each string is a version of the article.` }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log("Versions result:", result);
    return [originalArticle, ...result.versions];
}

async function answerQuestions(article, questions) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant that answers yes/no questions based on a given text. Return your response as a JSON object with an 'answers' key containing an array of 1 (for Yes) or 0 (for No)." },
            { role: "user", content: `Answer the following yes/no questions based on this text:\n\n${article}\n\nQuestions:\n${questions.join('\n')}\n\nProvide your response as a JSON object with an 'answers' key containing an array of 1 (for Yes) or 0 (for No).` }
        ],
        response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log("Answers result:", result);
    return result.answers;
}

function calculateMisinformationIndex(originalAnswers, versionAnswers) {
    console.log("Original Answers:", originalAnswers);
    console.log("Version Answers:", versionAnswers);
    return versionAnswers.reduce((sum, answer, index) => sum + Math.abs(answer - originalAnswers[index]), 0);
}

async function analyzeArticle(article) {
    const questions = await generateQuestions(article);
    const versions = await generateVersions(article, 4);  // Generate 4 additional versions

    console.log("ARTICLE:", article);
    console.log("QUESTIONS:", questions);
    console.log("VERSIONS:", versions);

    const results = [];
    const allAnswers = [];

    for (let i = 0; i < versions.length; i++) {
        const answers = await answerQuestions(versions[i], questions);
        allAnswers.push(answers);
        console.log("ALL ANSWERS:", allAnswers);
        console.log("INDEX ANSWER:", i, answers);
        const misinformationIndex = i === 0 ? 0 : calculateMisinformationIndex(allAnswers[0], answers);
        results.push({ version: i + 1, misinformationIndex });
    }

    // Prepare the final JSON object
    const finalData = {
        originalArticle: article,
        questions: questions,
        versions: versions.map((version, index) => ({
            versionNumber: index + 1,
            text: version,
            answers: allAnswers[index],
            misinformationIndex: results[index].misinformationIndex
        }))
    };

    // Save the JSON object to a file
    await fs.writeFile('misinformation_analysis.json', JSON.stringify(finalData, null, 2));

    console.log("Analysis complete. Results saved to misinformation_analysis.json");

    // Still log the results to console for immediate viewing
    console.log("\nQuestions:");
    questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));

    console.log("\nVersions, Answers, and Misinformation Indices:");
    finalData.versions.forEach(v => {
        console.log(`\nVersion ${v.versionNumber}:`);
        console.log(v.text);
        console.log(`Answers: ${v.answers.join(', ')}`);
        console.log(`Misinformation Index: ${v.misinformationIndex}`);
    });

    return finalData;
}
