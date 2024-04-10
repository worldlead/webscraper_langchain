require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import sendError from "./assets/error.controller";
import { getMyId } from "./user.controller";
import { encoding_for_model } from "@dqbd/tiktoken";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HtmlToTextTransformer } from "@langchain/community/document_transformers/html_to_text";
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "@langchain/openai";
import { loadSummarizationChain, LLMChain } from "langchain/chains";

export const getReplyFromGPT = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    console.log(question);

    // const loader = new PuppeteerWebBaseLoader(question);
    // const docs = await loader.load();
    // const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
    // const transformer = new HtmlToTextTransformer();

    // const sequence = splitter.pipe(transformer);

    // const newDocuments = await sequence.invoke(docs);
    // console.log(newDocuments);

    await summarize(question);
    const answer = question;
    res.status(200).json({
      status: "success",
      answer,
    });
  } catch (error) {
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

  const docs = await loader.loadAndSplit();
  
  const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0, modelName: "gpt-3.5-turbo" });

  // Generate prompt
  const prompt = new PromptTemplate({
    template: `Please summarize the following text. \n\n---\n{text}\n---\n\nSummary:`,
    inputVariables: ["text"],
  });

  const chain = loadSummarizationChain(model, {
    combineMapPrompt: prompt,
    combinePrompt: prompt,
    type: "map_reduce",
  });

  const result = await chain.invoke({
    input_documents: docs
  });

  console.log(result);
};
