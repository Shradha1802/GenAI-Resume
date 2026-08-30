const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const {zodToJsonSchema} = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

/** 
 * This is like a blueprint using Zod that tells Gemini
 * in what structure and format the data should be returned.
 */

const interviewReportSchema = z.object({

    matchScore: z.number().describe(
        "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The technical question that can be asked in the interview"
            ),

            intention: z.string().describe(
                "The intention of the interviewer behind asking this question"
            ),

            answer: z.string().describe(
                "How to answer this question, including the points to cover and the approach to take"
            )
        })
    ).describe(
        "Technical questions that can be asked in the interview along with their intention and how to answer them"
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe(
                "The behavioral question that can be asked in the interview"
            ),

            intention: z.string().describe(
                "The intention of the interviewer behind asking this question"
            ),

            answer: z.string().describe(
                "How to answer this question, including the points to cover and the approach to take"
            )
        })
    ).describe(
        "Behavioral questions that can be asked in the interview along with their intention and how to answer them"
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string().describe(
                "The skill which the candidate is lacking"
            ),

            severity: z.enum(["low", "medium", "high"]).describe(
                "The severity of this skill gap and how important it is for the candidate to improve this skill"
            )
        })
    ).describe(
        "List of skill gaps in the candidate's profile along with their severity"
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number().describe(
                "The day number in the preparation plan, starting from 1"
            ),

            focus: z.string().describe(
                "The main focus of this day in the preparation plan"
            ),

            tasks: z.array(z.string()).describe(
                "List of tasks to be done on this day"
            )
        })
    ).describe(
        "A day-wise preparation plan for the candidate to follow in order to improve their interview readiness"
    ),
    title: z.string().describe("The title of the job for which the interview report is generated")
});


async function generateInterviewReport({resume,selfDescription,jobDescription}) {

const prompt = `Generate a detailed and personalized interview report for the candidate based on the Resume, Self Description, and Job Description provided below.

                IMPORTANT INSTRUCTIONS:

                1. Analyze the candidate's Resume, Self Description, and Job Description carefully before generating the report.

                2. Match the candidate's actual experience and skills with the requirements of the Job Description. The questions should be relevant to the candidate's profile and the target role.

                3. TECHNICAL QUESTIONS:
                - Generate important technical questions that are likely to be asked for this specific role.
                - Focus on technologies, concepts, projects, and responsibilities mentioned in the candidate's Resume and Job Description.
                - Include both conceptual and practical questions.
                - The "intention" should clearly explain what the interviewer wants to evaluate.
                - The "answer" must be the actual direct answer to the interview question, written as if the candidate is speaking to the interviewer.
                - Do NOT give instructions or suggestions such as "explain", "discuss", "mention", "talk about", or "you should".
                - Do NOT describe how the candidate should answer.
                - Directly answer the question with clear, technically accurate, interview-ready content.
                - Include relevant technical concepts, practical examples, implementation details, best practices, trade-offs, and performance considerations where appropriate.
                - If the question is related to the candidate's previous experience or projects, naturally incorporate only the experience explicitly present in the resume.
                - For example, for Node.js questions discuss concepts such as the Event Loop, asynchronous programming, Promises, error handling, middleware, performance, and scalability where relevant.
                - For MongoDB questions discuss concepts such as indexing, aggregation, query optimization, explain(), and database performance where relevant.
                - For Redis questions discuss caching patterns such as Cache-Aside, TTL, cache invalidation, session management, and rate limiting where relevant.
                - For system design questions discuss architecture, scalability, service communication, databases, caching, consistency, and failure handling where relevant.
                - Do not make technical answers unnecessarily short. Give enough information for the candidate to actually prepare and speak about the topic during the interview.

                4. BEHAVIORAL QUESTIONS:
                - Generate realistic behavioral questions based on the candidate's actual work experience, projects, and the target role.
                - The "intention" should explain what the interviewer is evaluating.
                - The "answer" must be the actual answer the candidate would give to the interviewer.
                - Do NOT provide instructions, suggestions, or guidance on how to answer.
                - Do NOT start the answer with phrases such as "Use the STAR method", "You should", "Explain", "Discuss", "Mention", or "Talk about".
                - Write the answer in first person, as if the candidate is speaking directly to the interviewer.
                - Use the STAR structure naturally where appropriate, but do not explicitly instruct the candidate to use STAR.
                - The answer should clearly describe the Situation, Task, Action, and Result when the STAR method is appropriate.
                - Connect the answer to the candidate's actual experience and projects.
                - Do not invent responsibilities, metrics, achievements, or experiences that are not explicitly supported by the Resume, Self Description, or Job Description.
                - Make the answer detailed enough to be spoken in an interview while remaining natural and conversational.


                5. SKILL GAPS:
                - Compare the candidate's demonstrated skills with the Job Description.
                - Identify genuine weaknesses or areas where the candidate has only basic or limited experience.
                - Do not mark a skill as a gap if the candidate already demonstrates strong experience with it.
                - Assign low, medium, or high severity based on the importance of that skill for the target role.

                6. PREPARATION PLAN:
                - Create a practical 5-day preparation plan.
                - Prioritize the candidate's skill gaps and the most important requirements of the Job Description.
                - Give each day a clear focus.
                - Include multiple specific and actionable tasks for each day.
                - Include both learning and hands-on practice.
                - Include interview question practice and mock interview preparation toward the end.

                7. QUALITY REQUIREMENT:
                - The final report should be detailed, practical, and personalized.
                - The answers should be comparable in depth to a professional interview preparation guide.
                - Avoid vague statements such as "explain your experience" or "discuss the topic."
                - Instead, explain WHAT the candidate should discuss, HOW they should explain it, and WHICH important technical or behavioral points they should mention.
                - Do not shorten answers merely to be concise.
                - Base the report strictly on the information available in the Resume, Self Description, and Job Description.

                Resume:
                ${resume}

                Self Description:
                ${selfDescription}

                Job Description:
                ${jobDescription}`;


// console.log("USING CURRENT INTERVIEW REPORT SCHEMA");

    // Convert Zod 4 schema to JSON Schema
    const jsonSchema = z.toJSONSchema(interviewReportSchema);

    const response = await ai.models.generateContent({

        model: "gemini-3.5-flash-lite",

        contents: prompt,

        config: {
            responseMimeType: "application/json",

            responseSchema: jsonSchema
        }
    });

    const result = JSON.parse(response.text);

    console.log(JSON.stringify(result, null, 2));

    return result;
}

//convert html to pdf using puppeteer
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({ format: "A4" , margin:{
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right:"15mm"
    }})

    await browser.close()

    return pdfBuffer
}


async function generateResumePdf({resume , selfDescription , jobDescription}){
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume to be converted to PDF"),
    })


const prompt = `Generate resume for a candidate with the following details:  
                    Resume: ${resume}, 
                    Self Description: ${selfDescription} 
                    Job Description: ${jobDescription} 
                     
                    The response should be a JSON object with a single field "html" which contains the HTML content of the resume, which can be converted to PDF using any library. 
                    The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. 
                    The HTML content should be well-formatted and structured, making it easy to read and visually appealing. 
                    The content of the resume should not sound like it's generated by AI and should be as close as possible to a real human-written resume. 
                    You can highlight the content using some colors or different font styles, but overall design should be simple and professional. 
                    The content should be ATS-friendly, i.e. it should be easily parsable by ATS systems without losing important information. 
                    The resume should not be so lengthy; it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;



const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(resumePdfSchema)
    }
})

const jsonContent = JSON.parse(response.text);

const pdfbuffer = await generatePdfFromHtml(jsonContent.html);

return pdfbuffer;
}

module.exports = {generateInterviewReport,generateResumePdf};


/** Testing */

// console.log(
//     "Gemini API key loaded:",
//     !!process.env.GOOGLE_GENAI_API_KEY
// );

// async function invokeGeminiAi() {

//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash-lite",
//         contents: "Hello gemini ! How is SRM University KTR placements ?"
//     });

//     console.log(response.text);
// }

// invokeGeminiAi();