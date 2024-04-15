'use server'
import {
  AzureKeyCredential,
  ChatRequestMessage,
  OpenAIClient,
} from "@azure/openai";


export default async function transcript(preState: any, formData: FormData) {
    "use server";
     const id = Math.random().toString(36);

    if (
    process.env.AZURE_API_KEY === undefined ||
    process.env.AZURE_ENDPOINT === undefined ||
    process.env.AZURE_DEPLOYMENT_NAME === undefined ||
    process.env.AZURE_DEPLOYMENT_COMPLETIONS_NAME === undefined
    ) {
        console.error("Azure credentials not set")
        return {
            sender: "",
            response: "Azure credentials not set"
        }
    }

    const file = formData.get("audio") as File;
    if (file.size === 0) {
        return {
            sender: "",
            response: "No audio file provided"
        }
    }

    console.log(">>>>", file);


    const arrayBuffer = await file.arrayBuffer();
    const audio = new Uint8Array(arrayBuffer);



    // ---   get audio transcription from Azure OpenAI Whisper ----

    console.log("== Transcribe Audio Sample ==");

    const client = new OpenAIClient(
        process.env.AZURE_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_API_KEY)
    );

    const result = await client.getAudioTranscription(
        process.env.AZURE_DEPLOYMENT_NAME,
        audio
    );

    console.log(`Transcribe Audio: ${result.text}`);

    const completions = await client.getChatCompletions(
        process.env.AZURE_DEPLOYMENT_COMPLETIONS_NAME,
        [
            {
            role: "system",
            content:
                "You are a helpful assistant. You will answer questions and reply I cannot answer that if you don't know the answer.",
            },
            {
                role: "user",
                content: result.text
            },
        ],
        {
            maxTokens: 128
        }
    );


    const response = completions.choices[0].message?.content;

    console.log(preState.sender, '++++++++++++++++', result.text);
    return {
    sender: result.text,
    response: response,
    id: id,
  };
}