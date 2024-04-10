require("dotenv").config();
import OpenAI from "openai";
import { Request, Response, NextFunction } from "express";
import sendError from "./assets/error.controller";
import { getMyId } from "./user.controller";
import { encoding_for_model } from "@dqbd/tiktoken";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HtmlToTextTransformer } from "@langchain/community/document_transformers/html_to_text";
import { PromptTemplate } from "@langchain/core/prompts";

import { loadSummarizationChain, LLMChain } from "langchain/chains";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const createGeneralReply = async (message: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-4",
    });
    const content = completion.choices[0].message.content;
    return content;
  } catch (error) {
    console.log(error);
  }
};

export const getReplyFromGPT = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    const answer = await summarize(question);
    res.status(200).json({
      status: "success",
      answer,
    });
  } catch (error) {
    console.log(error)
    sendError(error, 400, req, res);
  }
};

export const summarize = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },

    async evaluate(page) {
      const result = await page.evaluate(() => {
        const scripts = document.body.querySelectorAll("script");
        const noscript = document.body.querySelectorAll("noscript");
        const styles = document.body.querySelectorAll("style");
        const scriptAndStyle = [...scripts, ...noscript, ...styles];
        scriptAndStyle.forEach((e) => e.remove());

        const mainElement = document.querySelector("main");
        return mainElement ? mainElement.innerText : document.body.innerText;
      });
      return result;
    },
  });

  const docs = await loader.load();
  // const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0, modelName: "gpt-3.5-turbo" });

  // // Generate prompt
  // const prompt = new PromptTemplate({
  //   template: `Please summarize the following content and avoid the boiler plate information. This content is scraped from a web page. \n\n---\n{text}\n---\n\nSummary:`,
  //   inputVariables: ["text"],
  // });

  // const chain = loadSummarizationChain(model, {
  //   combineMapPrompt: prompt,
  //   combinePrompt: prompt,
  //   type: "map_reduce",
  // });

  // const result = await chain.invoke({
  //   input_documents: docs
  // });

  // return result.text.trim();

  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
  const transformer = new HtmlToTextTransformer();
  
  const sequence = splitter.pipe(transformer);
  
  const newDocuments = await sequence.invoke(docs);
  
  
  let wholeDocument = "";
  for (let i = 0; i < newDocuments.length; i++) {
    const doc = newDocuments[i];
    wholeDocument += doc.pageContent;
  }
  
  const message = "Summarize this and avoid the boiler plate info: " + wholeDocument;
  const answer = await createGeneralReply(message);
  return answer;
};
