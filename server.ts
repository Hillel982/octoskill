/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/// Global variable for Gemini Client (lazy initialized)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Structured mock data fallback matching the exact schema
const MOCK_PLANTER_GUIDE = {
  "project_title": "How to Build a Modern Cedar Garden Planter Box",
  "source_url": "https://www.youtube.com/watch?v=Kz69X2W_4iE",
  "learner_goal": "Build a beautiful, durable cedar planter box for patio gardening",
  "skill_level": "Beginner-Intermediate",
  "estimated_completion_time": "2 hours",
  "educational_context": "This comprehensive learning guide walks you through planning, cutting, and assembling a durable, professional-grade cedar planter box. Ideal for herbs, flowers, and vegetables on patios or decks, this guide focuses on woodworking safety, precise measurements, and weatherproofing for longevity.",
  "prerequisite_knowledge": [
    "Basic safety knowledge of hand and power tools",
    "Understanding how to read a tape measure accurately",
    "Familiarity with pocket-hole joinery (optional but recommended)"
  ],
  "required_tools_and_materials": [
    "Cedar boards (1x4s, 2x2s for legs, 1x2s for trim)",
    "Pocket hole screws (1 1/4 inch, outdoor/coarse thread)",
    "Waterproof wood glue (Titebond III)",
    "Geotextile weed barrier fabric",
    "Landscape staples or staple gun",
    "Sanding block or random orbital sander (80 and 120 grit)"
  ],
  "walkthrough_steps": [
    {
      "step_number": 1,
      "title": "Planning, Safety, and Material Prep",
      "timestamp": "00:00",
      "video_summary": "Introduction to lumber choice and protective equipment.",
      "learner_action": "Select straight, knot-free cedar boards. Cedar is naturally rot-resistant, making it perfect for outdoor use. Wear eye protection and ear protection. Measure twice and mark cutting lines clearly using a speed square and carpenter's pencil.",
      "why_it_matters": "Slight twists in the wood will warp the planter box over time. Prep guarantees all boards lay flush and secure during joinery.",
      "completion_checkpoint": "All lumber is selected and marked for cutting with safety gear ready.",
      "common_mistake": "Buying pressure-treated wood instead of cedar for food crops (treated wood can leach harmful chemicals into soil).",
      "safety_or_quality_note": "Ensure your workspace has proper ventilation if using finishes later."
    },
    {
      "step_number": 2,
      "title": "Making the Cuts",
      "timestamp": "01:45",
      "video_summary": "Cutting wood slats and legs to precise dimensions.",
      "learner_action": "Cut the 2x2 posts to length for the four legs. Next, cut the 1x4 side slats to make the side walls. Make sure your miter saw blade is sharp to prevent tear-out on the soft cedar wood.",
      "why_it_matters": "Precise cuts mean tight seams, preventing soil from washing out through the corners.",
      "completion_checkpoint": "Four leg posts and side slats are cut exactly to length.",
      "common_mistake": "Rushing cuts, resulting in leg lengths that aren't perfectly equal, which creates a wobbly planter box.",
      "safety_or_quality_note": "Keep fingers at least 6 inches from the blade when using the miter saw."
    },
    {
      "step_number": 3,
      "title": "Drilling Pocket Holes",
      "timestamp": "03:30",
      "video_summary": "Setting up pocket hole jig and drilling.",
      "learner_action": "Set your pocket hole jig to 3/4 inch thickness. Drill two pocket holes on the inner faces of each wall slat. Sand the edges of the cut boards to clean up any splinters before assembly.",
      "why_it_matters": "Pocket holes hide screws inside the box for a professional, screw-free external aesthetic.",
      "completion_checkpoint": "All wall slats have clean pocket holes drilled on inside face.",
      "common_mistake": "Drilling pocket holes on the wrong side, exposing the holes to the exterior of the planter box.",
      "safety_or_quality_note": "Clamp the pocket hole jig securely to avoid tear-out."
    },
    {
      "step_number": 4,
      "title": "Assembling the Side Panels",
      "timestamp": "05:15",
      "video_summary": "Using clamps and pocket screws to form the box side panels.",
      "learner_action": "Apply waterproof wood glue to the joints. Clamp the slats flat against the 2x2 corner posts. Drive 1 1/4 inch outdoor pocket screws through the drilled holes into the legs to lock them in place.",
      "why_it_matters": "Waterproof glue paired with pocket screws creates an incredibly rigid joint capable of holding wet, heavy soil.",
      "completion_checkpoint": "Screwed side panels are completely flat, robust, and square.",
      "common_mistake": "Overtightening screws in soft cedar, which can strip the wood and loosen the structural joint.",
      "safety_or_quality_note": "Wipe excess wood glue immediately with a damp rag before it dries."
    },
    {
      "step_number": 5,
      "title": "Installing Bottom Supports and Drainage",
      "timestamp": "07:30",
      "video_summary": "Adding support cleats and drainage slats to allow airflow and drainage.",
      "learner_action": "Install interior support cleats along the bottom walls. Place bottom slats loosely on top of the cleats, leaving a 1/4 inch gap between them to permit rapid drainage.",
      "why_it_matters": "Poor drainage rots plant roots and rots wood prematurely. The gaps allow excess rainwater to drain away safely.",
      "completion_checkpoint": "Bottom slats are placed and spaced uniformly.",
      "common_mistake": "Nailing bottom boards down tight with no gaps, causing soil to stay waterlogged.",
      "safety_or_quality_note": "Avoid using solid plastic boards that prevent natural water seepage."
    },
    {
      "step_number": 6,
      "title": "Lining and Finishing Touches",
      "timestamp": "09:10",
      "video_summary": "Final sanding and adding a soil fabric liner.",
      "learner_action": "Sand the entire exterior using 120-grit sandpaper for a smooth finish. Staple geotextile weed fabric along the inside to contain soil while allowing water to pass through freely.",
      "why_it_matters": "Sanding removes splinters and pencil marks. The fabric liner stops soil erosion through drainage slats.",
      "completion_checkpoint": "The landscape liner is stapled in place and the exterior is fully sanded.",
      "common_mistake": "Using plastic tarp instead of breathable landscaping fabric, which traps water and kills plant roots.",
      "safety_or_quality_note": "Wear a dust mask during final sanding."
    }
  ],
  "key_concepts": [
    {
      "title": "Pocket-Hole Joinery",
      "simple_explanation": "A woodworking technique where a hole is drilled at an angle into one board, allowing a screw to pass through into an adjacent board. It creates strong, invisible joints.",
      "why_it_matters": "Keeps outer faces pristine and hides fasteners from weathering."
    },
    {
      "title": "Wood Movement & Acclimation",
      "simple_explanation": "Wood expands and contracts with changes in outdoor humidity. Leaving small tolerances in joints and spacing bottom slats prevents splitting as seasons change.",
      "why_it_matters": "Outdoor wooden furniture will crack or buckle if designed with zero expansion gaps."
    },
    {
      "title": "Drainage Dynamics",
      "simple_explanation": "The rate at which water leaves the planter box. Perfect drainage consists of loose bottom slats paired with porous geotextile fabric to keep soil moist but never waterlogged.",
      "why_it_matters": "Excess water drowns plant roots and accelerates wood rot."
    }
  ],
  "critical_pitfalls": [
    {
      "mistake": "Using standard drywall screws",
      "how_to_prevent": "Always use galvanized or outdoor-rated coated screws to prevent rusting and staining on the natural cedar."
    },
    {
      "mistake": "Placing planter box directly on raw dirt",
      "how_to_prevent": "Add small rubber feet or elevate on pavers to prevent moisture from wicking up into the legs from the wet ground."
    }
  ],
  "hands_on_practice": [
    {
      "title": "Practice pocket joints on scrap cedar",
      "task": "Before assembling your final planter, drill and join two pieces of scrap board to check screw depth and alignment settings."
    },
    {
      "title": "Test drainage rate before filling",
      "task": "Pour a bucket of water onto the landscape fabric inside the finished empty box to ensure water streams out quickly from the bottom slats."
    }
  ],
  "project_checklist": [
    { "item": "Purchase rot-resistant cedar boards & posts", "category": "Preparation", "completed": false },
    { "item": "Measure and double-check all cut dimensions", "category": "Preparation", "completed": false },
    { "item": "Cut legs, side slats, and bottom slats cleanly", "category": "Construction", "completed": false },
    { "item": "Drill pocket holes on the inner faces of slats", "category": "Construction", "completed": false },
    { "item": "Glue and screw panels securely with outdoor pocket screws", "category": "Construction", "completed": false },
    { "item": "Fit loose bottom drainage slats with 1/4-inch gaps", "category": "Construction", "completed": false },
    { "item": "Staple geotextile landscape fabric to line the interior", "category": "Finishing", "completed": false },
    { "item": "Perform a final light sand on exterior corners", "category": "Finishing", "completed": false }
  ],
  "quiz": [
    {
      "question": "Why is Cedar highly recommended for outdoor garden projects?",
      "options": [
        "It is the cheapest wood available in any store.",
        "It is naturally rot-resistant and resists decay/pests without chemical treatments.",
        "It does not require any cutting or sanding whatsoever.",
        "It absorbs water like a sponge to keep plants dry."
      ],
      "correct_answer": "It is naturally rot-resistant and resists decay/pests without chemical treatments.",
      "explanation": "Cedar contains natural oils that protect it against rotting, moisture damage, and insect infestation, making it perfect for direct soil contact."
    },
    {
      "question": "What is the purpose of leaving 1/4 inch gaps between the bottom slats?",
      "options": [
        "To save wood and reduce the final box weight.",
        "To make the planter box look more modern.",
        "To allow excess water to drain out so plant roots do not rot.",
        "To allow plant roots to grow into the ground underneath."
      ],
      "correct_answer": "To allow excess water to drain out so plant roots do not rot.",
      "explanation": "Proper drainage is crucial for plant health. Without gaps, soil stays saturated, starving roots of oxygen and causing root rot."
    },
    {
      "question": "Which screw type should be avoided in outdoor planter builds?",
      "options": [
        "Standard indoor drywall screws.",
        "Galvanized wood screws.",
        "Stainless steel pocket screws.",
        "Coated outdoor-rated deck screws."
      ],
      "correct_answer": "Standard indoor drywall screws.",
      "explanation": "Drywall screws rust very quickly when exposed to weather, which weakens the planter box structure and causes black iron stains on the wood."
    },
    {
      "question": "What does geotextile weed barrier fabric do inside the box?",
      "options": [
        "It insulates the dirt to keep it hot.",
        "It holds soil inside the box while allowing excess water to drain away freely.",
        "It replaces the need for organic wood glue entirely.",
        "It turns plastic into high-yield compost."
      ],
      "correct_answer": "It holds soil inside the box while allowing excess water to drain away freely.",
      "explanation": "Landscaping fabric keeps soil particles inside the box so they don't wash out through bottom gaps with water, keeping your patio clean."
    }
  ],
  "flashcards": [
    { "front": "Cedar Wood Properties", "back": "Naturally rot-resistant, pest-resistant, stable, and excellent for outdoor gardens." },
    { "front": "Pocket Joinery Purpose", "back": "Provides high-strength mechanical fastening while hiding screws from the exterior look." },
    { "front": "Titebond III Glue", "back": "An industrial-grade, waterproof wood glue designed specifically for outdoor woodworking applications." },
    { "front": "Geotextile Liner", "back": "Breathable landscape fabric that acts as a filter: permits water to exit but keeps soil contained." },
    { "front": "Miter Saw Best Practice", "back": "Make cuts slowly with high blade RPMs to prevent cedar fibers from splintering/tear-out." },
    { "front": "Wood Acclimation", "back": "Allowing lumber to sit in its future environment for 48 hours to match ambient moisture before cutting." }
  ],
  "suggested_next_steps": [
    "Apply non-toxic outdoor sealer to the exterior for extra durability",
    "Select organic soil mix mixed with compost and perlite",
    "Install self-watering reservoir inserts for hot summer days"
  ]
};

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// API route to generate guide
app.post("/api/generate-guide", async (req, res) => {
  try {
    const { youtubeUrl, learnerGoal, skillLevel, selectedModel } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: "YouTube URL is required." });
    }

    // Mock mode check if GEMINI_API_KEY is not defined
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("No GEMINI_API_KEY environment variable found. Returning mock planter guide data.");
      return res.json(MOCK_PLANTER_GUIDE);
    }

    // Lazy initialize and check key
    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }

    const targetGoal = learnerGoal || "Learn the project/skills shown in the video";
    const targetSkillLevel = skillLevel || "Intermediate";

    const prompt = `
You are OctoSkill, an expert instructional designer and project-based learning coach.

Analyze the provided YouTube tutorial and convert it into a structured interactive learning roadmap.

You are not creating a simple summary.
You are creating a practical project guide that helps the learner actually complete the project shown or taught in the video.

Inputs:
YouTube URL: ${youtubeUrl}
Learner goal: ${targetGoal}
Skill level: ${targetSkillLevel}

Create a structured learning guide with the following goals:
- Explain what the learner will build or learn.
- Identify required tools, materials, software, accounts, libraries, or resources.
- Break the tutorial into timestamped steps.
- Turn each step into a practical learner action.
- Explain key concepts simply.
- Identify common mistakes and how to avoid them.
- Create a completion checklist.
- Create practice tasks.
- Create flashcards.
- Create a short quiz with answers.
- Suggest next learning steps.

Important rules:
- Be practical and action-oriented.
- Use timestamps wherever possible.
- If the video skips over an important detail, mark it as a missing step and explain what the learner needs to find out.
- If the video involves tools, software, libraries, materials, or safety issues, include them clearly.
- Do not invent precise measurements, commands, prices, or version numbers unless they are clearly stated or verified.
- Keep the language beginner-friendly.
- Return only valid JSON matching the provided schema.
`;

    const chosenModel = selectedModel || "gemini-3.5-flash";
    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            project_title: { type: Type.STRING },
            source_url: { type: Type.STRING },
            learner_goal: { type: Type.STRING },
            skill_level: { type: Type.STRING },
            estimated_completion_time: { type: Type.STRING },
            educational_context: { type: Type.STRING },
            prerequisite_knowledge: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            required_tools_and_materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            walkthrough_steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step_number: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  video_summary: { type: Type.STRING },
                  learner_action: { type: Type.STRING },
                  why_it_matters: { type: Type.STRING },
                  completion_checkpoint: { type: Type.STRING },
                  common_mistake: { type: Type.STRING },
                  safety_or_quality_note: { type: Type.STRING }
                },
                required: [
                  "step_number", "title", "timestamp", "video_summary", "learner_action",
                  "why_it_matters", "completion_checkpoint", "common_mistake", "safety_or_quality_note"
                ]
              }
            },
            key_concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  simple_explanation: { type: Type.STRING },
                  why_it_matters: { type: Type.STRING }
                },
                required: ["title", "simple_explanation", "why_it_matters"]
              }
            },
            critical_pitfalls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mistake: { type: Type.STRING },
                  how_to_prevent: { type: Type.STRING }
                },
                required: ["mistake", "how_to_prevent"]
              }
            },
            hands_on_practice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  task: { type: Type.STRING }
                },
                required: ["title", "task"]
              }
            },
            project_checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  category: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN }
                },
                required: ["item", "category", "completed"]
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correct_answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correct_answer", "explanation"]
              }
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            },
            suggested_next_steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "project_title", "source_url", "learner_goal", "skill_level",
            "estimated_completion_time", "educational_context", "prerequisite_knowledge",
            "required_tools_and_materials", "walkthrough_steps", "key_concepts",
            "critical_pitfalls", "hands_on_practice", "project_checklist", "quiz", "flashcards", "suggested_next_steps"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output received from the model. Please verify your video and try again.");
    }

    try {
      const guide = JSON.parse(text);
      res.json(guide);
    } catch (parseError) {
      console.error("Structured JSON parse failure:", parseError, text);
      throw new Error("Structured JSON parse failure: The AI model's response could not be parsed into the required learning schema. Please try again.");
    }

  } catch (error: any) {
    console.error("Error generating learning guide:", error);
    let errorMessage = error.message || "Failed to generate guide.";
    
    // Check for rate limit / quota issues
    if (
      errorMessage.includes("429") || 
      errorMessage.includes("RESOURCE_EXHAUSTED") || 
      errorMessage.includes("quota") ||
      errorMessage.includes("exceeded") ||
      errorMessage.includes("Rate limit")
    ) {
      errorMessage = "Gemini API rate limit or quota exceeded. You've exceeded your current free-tier quota. Please wait a moment and try again, or connect your own API key under Settings > Secrets. In the meantime, you can instantly test with our premium pre-built cedar planter sandbox guide below!";
    }
    // Check for unavailable video or invalid url
    else if (errorMessage.includes("NOT_FOUND") || errorMessage.includes("unavailable") || errorMessage.includes("not found")) {
      errorMessage = "Video or Resource Unavailable: The specified YouTube video could not be found, or has been restricted by its publisher. Please check the URL and try again.";
    }
    // Generic Gemini API error
    else if (errorMessage.includes("API") || errorMessage.includes("GoogleGenAI") || errorMessage.includes("model")) {
      errorMessage = `Gemini API Error: ${errorMessage}`;
    }

    res.status(500).json({ error: errorMessage });
  }
});

// API Route: Ask Gemini Pro about Video details (video content understanding)
app.post("/api/ask-video", async (req, res) => {
  try {
    const { youtubeUrl, question, guideTitle, guideSummary } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        answer: `[DEMO MODE] This is a sandbox response since no GEMINI_API_KEY is defined in Settings > Secrets. In a configured environment, **Gemini 3.1 Pro** analyzes the video URL \`${youtubeUrl || 'Unknown'}\` and context details to answer your inquiry: "${question}".\n\nHere is a default answer:\n- **Safety Note**: Ensure proper ventilation and safety glasses whenever executing tasks.\n- **Substitutes**: If missing specific tools, generic hardware/substitutes usually work.`
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are OctoSkill AI, an expert technical advisor and instructional designer.
The learner is watching this YouTube tutorial: ${youtubeUrl || "N/A"}
The educational guide context is:
Title: ${guideTitle || "N/A"}
Summary: ${guideSummary || "N/A"}

Please answer the user's specific inquiry about the tutorial, tools, prerequisites, physical or digital actions, or details missing from the tutorial:
"${question}"

Provide a highly helpful, comprehensive, and clear response. Organize with Markdown headers, bullet points, or bold text. Be direct and technical, yet encouraging.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });

    res.json({ answer: response.text || "No response received from Gemini." });
  } catch (error: any) {
    console.error("Error in ask-video:", error);
    res.status(500).json({ error: error.message || "Failed to query Gemini Pro." });
  }
});

// API Route: Refine/explain a walkthrough step using Gemini Flash Lite
app.post("/api/refine-step", async (req, res) => {
  try {
    const { youtubeUrl, stepNumber, stepTitle, stepInstructions } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        explanation: `### Step ${stepNumber} Sandbox Verification\n\n* **Success Verification**: Confirm the work matches the tutorial visually.\n* **Physical Action**: Execute the cut, command, or hook precisely as instructed.\n* **Pro-Tip**: Take your time and measure twice to ensure perfect alignment.`
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are a project-based learning assistant.
The user is working on a step from a YouTube tutorial:
Video URL: ${youtubeUrl || "N/A"}
Step ${stepNumber}: ${stepTitle}
Instructions: ${stepInstructions}

Please provide a quick "Explain & Refine" card with:
1. **Success Verification**: Exactly how do I verify I performed this step correctly? (1-2 sentences)
2. **Immediate Physical Action**: What is the immediate physical/digital action I need to do right now? (1-2 sentences)
3. **Pro-Tip**: A professional shortcut or quality tip for this specific action. (1 sentence)

Keep it extremely concise and action-oriented. Use bold terms and clean spacing. Do not write introductory fluff.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ explanation: response.text || "No response received from Gemini." });
  } catch (error: any) {
    console.error("Error in refine-step:", error);
    res.status(500).json({ error: error.message || "Failed to refine step." });
  }
});

// API Route: Smart sort checklist items using Gemini Flash Lite
app.post("/api/sort-checklist", async (req, res) => {
  try {
    const { checklist, criterion } = req.body;
    if (!checklist || !Array.isArray(checklist)) {
      return res.status(400).json({ error: "Checklist array is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Offline fallback: reverse or shuffle as demo
      const sorted = [...checklist].reverse();
      return res.json({ sorted });
    }

    const ai = getGeminiClient();
    const prompt = `You are an organizational assistant.
Take the following list of project checklist items:
${JSON.stringify(checklist)}

And organize/sort them based on this criterion: "${criterion || 'category'}".
- "category": Group them logically by functional category (e.g., Planning, Materials, Assembly, Testing).
- "priority": Group them from highest priority / dependency first to final finishing steps.
- "procurement": Group them into preparation (e.g., getting materials/tools) vs. execution steps.

Return the sorted/grouped checklist as a JSON array with the exact same structure as the input, but in the newly sorted order, and update the "category" field of each item if relevant to match the new grouping.

Format of input items: { item: string, category: string, completed: boolean }
Return ONLY the valid JSON array of items. Do not wrap in markdown code blocks like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No output received from Gemini.");
    }

    const sorted = JSON.parse(text);
    res.json({ sorted });
  } catch (error: any) {
    console.error("Error in sort-checklist:", error);
    res.status(500).json({ error: error.message || "Failed to sort checklist." });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
