/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LearningGuide } from "./types";

export interface SampleGuideItem {
  name: string;
  youtubeUrl: string;
  goal: string;
  guide: LearningGuide;
}

export const SAMPLE_GUIDES: SampleGuideItem[] = [
  {
    name: "Modern Cedar Garden Planter Box",
    youtubeUrl: "https://www.youtube.com/watch?v=Kz69X2W_4iE",
    goal: "Build a beautiful, durable cedar planter box for patio gardening",
    guide: {
      title: "How to Build a Modern Cedar Garden Planter Box",
      summary: "This comprehensive learning guide walks you through planning, cutting, and assembling a durable, professional-grade cedar planter box. Ideal for herbs, flowers, and vegetables on patios or decks, this guide focuses on woodworking safety, precise measurements, and weatherproofing for longevity.",
      skill_level: "Beginner-Intermediate",
      materials: [
        "Cedar boards (1x4s, 2x2s for legs, 1x2s for trim)",
        "Pocket hole screws (1 1/4 inch, outdoor/coarse thread)",
        "Waterproof wood glue (Titebond III)",
        "Geotextile weed barrier fabric",
        "Landscape staples or staple gun",
        "Sanding block or random orbital sander (80 and 120 grit)"
      ],
      prerequisites: [
        "Basic safety knowledge of hand and power tools",
        "Understanding how to read a tape measure accurately",
        "Familiarity with pocket-hole joinery (optional but recommended)"
      ],
      steps: [
        {
          step_number: 1,
          title: "Planning, Safety, and Material Prep",
          timestamp: "00:00",
          instructions: "Select straight, knot-free cedar boards. Cedar is naturally rot-resistant, making it perfect for outdoor use. Wear eye protection and ear protection. Measure twice and mark cutting lines clearly using a speed square and carpenter's pencil.",
          why_it_matters: "Slight twists in the wood will warp the planter box over time. Prep guarantees all boards lay flush and secure during joinery.",
          common_mistake: "Buying pressure-treated wood instead of cedar for food crops (treated wood can leach harmful chemicals into soil)."
        },
        {
          step_number: 2,
          title: "Making the Cuts",
          timestamp: "01:45",
          instructions: "Cut the 2x2 posts to length for the four legs. Next, cut the 1x4 side slats to make the side walls. Make sure your miter saw blade is sharp to prevent tear-out on the soft cedar wood.",
          why_it_matters: "Precise cuts mean tight seams, preventing soil from washing out through the corners.",
          common_mistake: "Rushing cuts, resulting in leg lengths that aren't perfectly equal, which creates a wobbly planter box."
        },
        {
          step_number: 3,
          title: "Drilling Pocket Holes",
          timestamp: "03:30",
          instructions: "Set your pocket hole jig to 3/4 inch thickness. Drill two pocket holes on the inner faces of each wall slat. Sand the edges of the cut boards to clean up any splinters before assembly.",
          why_it_matters: "Pocket holes hide screws inside the box for a professional, screw-free external aesthetic.",
          common_mistake: "Drilling pocket holes on the wrong side, exposing the holes to the exterior of the planter box."
        },
        {
          step_number: 4,
          title: "Assembling the Side Panels",
          timestamp: "05:15",
          instructions: "Apply waterproof wood glue to the joints. Clamp the slats flat against the 2x2 corner posts. Drive 1 1/4 inch outdoor pocket screws through the drilled holes into the legs to lock them in place.",
          why_it_matters: "Waterproof glue paired with pocket screws creates an incredibly rigid joint capable of holding wet, heavy soil.",
          common_mistake: "Overtightening screws in soft cedar, which can strip the wood and loosen the structural joint."
        },
        {
          step_number: 5,
          title: "Installing Bottom Supports and Drainage",
          timestamp: "07:30",
          instructions: "Install interior support cleats along the bottom walls. Place bottom slats loosely on top of the cleats, leaving a 1/4 inch gap between them to permit rapid drainage.",
          why_it_matters: "Poor drainage rots plant roots and rots wood prematurely. The gaps allow excess rainwater to drain away safely.",
          common_mistake: "Nailing bottom boards down tight with no gaps, causing soil to stay waterlogged."
        },
        {
          step_number: 6,
          title: "Lining and Finishing Touches",
          timestamp: "09:10",
          instructions: "Sand the entire exterior using 120-grit sandpaper for a smooth finish. Staple geotextile weed fabric along the inside to contain soil while allowing water to pass through freely.",
          why_it_matters: "Sanding removes splinters and pencil marks. The fabric liner stops soil erosion through drainage slats.",
          common_mistake: "Using plastic tarp instead of breathable landscaping fabric, which traps water and kills plant roots."
        }
      ],
      key_concepts: [
        {
          concept: "Pocket-Hole Joinery",
          explanation: "A woodworking technique where a hole is drilled at an angle into one board, allowing a screw to pass through into an adjacent board. It creates strong, invisible joints."
        },
        {
          concept: "Wood Movement & Acclimation",
          explanation: "Wood expands and contracts with changes in outdoor humidity. Leaving small tolerances in joints and spacing bottom slats prevents splitting as seasons change."
        },
        {
          concept: "Drainage Dynamics",
          explanation: "The rate at which water leaves the planter box. Perfect drainage consists of loose bottom slats paired with porous geotextile fabric to keep soil moist but never waterlogged."
        }
      ],
      mistakes_to_avoid: [
        {
          mistake: "Using standard drywall screws",
          how_to_avoid: "Always use galvanized or outdoor-rated coated screws to prevent rusting and staining on the natural cedar."
        },
        {
          mistake: "Placing planter box directly on raw dirt",
          how_to_avoid: "Add small rubber feet or elevate on pavers to prevent moisture from wicking up into the legs from the wet ground."
        }
      ],
      practice_tasks: [
        {
          task: "Practice pocket joints on scrap cedar",
          description: "Before assembling your final planter, drill and join two pieces of scrap board to check screw depth and alignment settings."
        },
        {
          task: "Test drainage rate before filling",
          description: "Pour a bucket of water onto the landscape fabric inside the finished empty box to ensure water streams out quickly from the bottom slats."
        }
      ],
      checklist: [
        { id: "c1", item: "Purchase rot-resistant cedar boards & posts", category: "Preparation" },
        { id: "c2", item: "Measure and double-check all cut dimensions", category: "Preparation" },
        { id: "c3", item: "Cut legs, side slats, and bottom slats cleanly", category: "Construction" },
        { id: "c4", item: "Drill pocket holes on the inner faces of slats", category: "Construction" },
        { id: "c5", item: "Glue and screw panels securely with outdoor pocket screws", category: "Construction" },
        { id: "c6", item: "Fit loose bottom drainage slats with 1/4-inch gaps", category: "Construction" },
        { id: "c7", item: "Staple geotextile landscape fabric to line the interior", category: "Finishing" },
        { id: "c8", item: "Perform a final light sand on exterior corners", category: "Finishing" }
      ],
      quiz: [
        {
          id: "q1",
          question: "Why is Cedar highly recommended for outdoor garden projects?",
          options: [
            "It is the cheapest wood available in any store.",
            "It is naturally rot-resistant and resists decay/pests without chemical treatments.",
            "It does not require any cutting or sanding whatsoever.",
            "It absorbs water like a sponge to keep plants dry."
          ],
          correct_answer: "It is naturally rot-resistant and resists decay/pests without chemical treatments.",
          explanation: "Cedar contains natural oils that protect it against rotting, moisture damage, and insect infestation, making it perfect for direct soil contact."
        },
        {
          id: "q2",
          question: "What is the purpose of leaving 1/4 inch gaps between the bottom slats?",
          options: [
            "To save wood and reduce the final box weight.",
            "To make the planter box look more modern.",
            "To allow excess water to drain out so plant roots do not rot.",
            "To allow plant roots to grow into the ground underneath."
          ],
          correct_answer: "To allow excess water to drain out so plant roots do not rot.",
          explanation: "Proper drainage is crucial for plant health. Without gaps, soil stays saturated, starving roots of oxygen and causing root rot."
        },
        {
          id: "q3",
          question: "Which screw type should be avoided in outdoor planter builds?",
          options: [
            "Standard indoor drywall screws.",
            "Galvanized wood screws.",
            "Stainless steel pocket screws.",
            "Coated outdoor-rated deck screws."
          ],
          correct_answer: "Standard indoor drywall screws.",
          explanation: "Drywall screws rust very quickly when exposed to weather, which weakens the planter box structure and causes black iron stains on the wood."
        },
        {
          id: "q4",
          question: "What does geotextile weed barrier fabric do inside the box?",
          options: [
            "It insulates the dirt to keep it hot.",
            "It holds soil inside the box while allowing excess water to drain away freely.",
            "It replaces the need for organic wood glue entirely.",
            "It turns plastic into high-yield compost."
          ],
          correct_answer: "It holds soil inside the box while allowing excess water to drain away freely.",
          explanation: "Landscaping fabric keeps soil particles inside the box so they don't wash out through bottom gaps with water, keeping your patio clean."
        }
      ],
      flashcards: [
        { id: "f1", front: "Cedar Wood Properties", back: "Naturally rot-resistant, pest-resistant, stable, and excellent for outdoor gardens." },
        { id: "f2", front: "Pocket Joinery Purpose", back: "Provides high-strength mechanical fastening while hiding screws from the exterior look." },
        { id: "f3", front: "Titebond III Glue", back: "An industrial-grade, waterproof wood glue designed specifically for outdoor woodworking applications." },
        { id: "f4", front: "Geotextile Liner", back: "Breathable landscape fabric that acts as a filter: permits water to exit but keeps soil contained." },
        { id: "f5", front: "Miter Saw Best Practice", back: "Make cuts slowly with high blade RPMs to prevent cedar fibers from splintering/tear-out." },
        { id: "f6", front: "Wood Acclimation", back: "Allowing lumber to sit in its future environment for 48 hours to match ambient moisture before cutting." }
      ]
    }
  },
  {
    name: "React Hooks & State Management",
    youtubeUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
    goal: "Understand useState, useEffect, and custom state management",
    guide: {
      title: "React Hooks: Mastering state and effects in functional components",
      summary: "A robust developer's guide to React functional components, focusing on state initialization, handling side-effects with clean dependency arrays, and writing clean, reusable Custom Hooks. This guide translates visual code tutorials into practical, error-free interactive modules.",
      skill_level: "Intermediate",
      materials: [
        "Node.js installed locally (v18+)",
        "A code editor (e.g. VS Code)",
        "Vite build tool package",
        "React and React DOM packages (v18 or v19)"
      ],
      prerequisites: [
        "Solid understanding of JavaScript ES6 (destructuring, arrow functions)",
        "Basic HTML/CSS familiarity",
        "Understanding of component architecture (props, nesting)"
      ],
      steps: [
        {
          step_number: 1,
          title: "Understanding State with useState",
          timestamp: "01:00",
          instructions: "Learn to initialize and update state. Declare state variables using array destructuring: const [state, setState] = useState(initialValue). Use functional state updates setState(prev => prev + 1) when the new state relies on previous values.",
          why_it_matters: "Direct variable modifications do not trigger component re-renders. useState registers variables with the React core, ensuring the UI stays in sync.",
          common_mistake: "Mutating state directly like state.push(newItem) instead of using the setter setState([...state, newItem])."
        },
        {
          step_number: 2,
          title: "Controlling Side Effects with useEffect",
          timestamp: "04:30",
          instructions: "Implement side effects such as data fetching or subscriptions. Understand the three dependency array scenarios: no array (runs on every render), empty array [] (runs once on mount), and array with values [dependency] (runs when dependency values change).",
          why_it_matters: "Enables connection to external systems (APIs, WebSockets) while avoiding infinite render loops and network overloads.",
          common_mistake: "Omitting the dependency array entirely, causing heavy API calls to fire continuously on every UI render."
        },
        {
          step_number: 3,
          title: "Implementing the Cleanup Function",
          timestamp: "07:15",
          instructions: "Always return a cleanup function from your useEffect if you instantiate listeners, timers, or subscriptions. Format: return () => { clearInterval(timerId); }.",
          why_it_matters: "React triggers cleanup when components unmount to prevent memory leaks, broken states, and multiple active event listeners.",
          common_mistake: "Creating window event listeners inside useEffect without a cleanup, duplicating event bindings over time."
        },
        {
          step_number: 4,
          title: "Refactoring to Custom Hooks",
          timestamp: "10:50",
          instructions: "Extract duplicated React hook logic into a standalone, reusable JavaScript function. Prefixed the function name with 'use' (e.g., useFetch or useLocalStorage) to adhere to standard React rules.",
          why_it_matters: "Keeps components dry, modular, readable, and highly testable by separating business logic from UI rendering layers.",
          common_mistake: "Naming custom hooks without the 'use' prefix, preventing React's ESLint plug-ins from checking hook safety rules."
        }
      ],
      key_concepts: [
        {
          concept: "Re-rendering Trigger",
          explanation: "The mechanism where React destroys the old virtual DOM subtree and executes the component function again with new state values to update the real browser DOM."
        },
        {
          concept: "Dependency Array Hooking",
          explanation: "An optimization argument passed to React effects. React compares previous dependency array references with new references to determine if the effect needs to rerun."
        },
        {
          concept: "Stale Closures",
          explanation: "An error where a function captures variable values from a previous render frame, retaining outdated values instead of reading fresh state."
        }
      ],
      mistakes_to_avoid: [
        {
          mistake: "Conditional Hook Invocations",
          how_to_avoid: "Never put hooks inside 'if' statements, loops, or nested functions. Hooks must always execute in the exact same order on every render."
        },
        {
          mistake: "Infinite Renders inside Effects",
          how_to_avoid: "Do not set a state variable inside a useEffect if that same state variable is listed in that effect's dependency array."
        }
      ],
      practice_tasks: [
        {
          task: "Build a responsive stopwatch component",
          description: "Create a React component using useState and a useEffect interval timer that cleanly increments seconds and handles pause, start, and cleanup events."
        },
        {
          task: "Create a useLocalStorage Custom Hook",
          description: "Write a hook that syncs any state with browser localStorage so data persists through browser tab refreshes."
        }
      ],
      checklist: [
        { id: "r1", item: "Initialize state cleanly using standard useState hooks", category: "React Setup" },
        { id: "r2", item: "Perform functional updates for dependent state calculations", category: "React Setup" },
        { id: "r3", item: "Add a useEffect hook with an empty dependency array to fetch initial data", category: "Effects" },
        { id: "r4", item: "Write cleanup functions for all intervals, timers, and listeners", category: "Effects" },
        { id: "r5", item: "Validate hook rules using React ESLint configuration", category: "Testing" },
        { id: "r6", item: "Extract repetitive state operations into custom hooks", category: "Refactoring" }
      ],
      quiz: [
        {
          id: "rq1",
          question: "What is the primary consequence of calling setState directly in a component's body?",
          options: [
            "It turns off styling and layout features.",
            "It creates an infinite re-render loop that eventually crashes the browser tab.",
            "It optimizes performance by bypassing the virtual DOM entirely.",
            "It deletes your node_modules directory."
          ],
          correct_answer: "It creates an infinite re-render loop that eventually crashes the browser tab.",
          explanation: "Setting state triggers a re-render, which executes the component body again, which triggers another setState, looping infinitely."
        },
        {
          id: "rq2",
          question: "When does the cleanup function returned by a useEffect hook run?",
          options: [
            "Only when the browser window is closed entirely.",
            "Immediately before the component is unmounted or right before the effect reruns with new dependencies.",
            "Once every 5 seconds in the background.",
            "Immediately on the initial render mount."
          ],
          correct_answer: "Immediately before the component is unmounted or right before the effect reruns with new dependencies.",
          explanation: "This allows React to clean up stale listeners or timers before initializing new ones or tearing down the component."
        },
        {
          id: "rq3",
          question: "Which of the following violates the Rules of Hooks in React?",
          options: [
            "Calling useState inside a top-level functional component.",
            "Calling a custom hook inside another custom hook.",
            "Invoking useEffect conditionally inside an 'if' statement block.",
            "Passing an empty dependency array to a useEffect hook."
          ],
          correct_answer: "Invoking useEffect conditionally inside an 'if' statement block.",
          explanation: "Hooks must be called at the very top level of functional components and never inside loops, conditions, or nested functions to preserve execution order."
        },
        {
          id: "rq4",
          question: "How do you ensure a state update uses the most current, up-to-date previous state?",
          options: [
            "By calling useForceUpdate() after every action.",
            "By writing a direct assignment like state = state + 1.",
            "By passing a callback function to the state setter (e.g. setState(prev => prev + 1)).",
            "By using a global window.state container."
          ],
          correct_answer: "By passing a callback function to the state setter (e.g. setState(prev => prev + 1)).",
          explanation: "The callback version guarantees React supplies the most recently queued, accurate state, preventing stale batching updates."
        }
      ],
      flashcards: [
        { id: "rf1", front: "useState Hook", back: "Registers a reactive variable with React to store persistent values and trigger UI re-renders." },
        { id: "rf2", front: "useEffect Hook", back: "Declares side effects like network requests, listeners, or timers outside the core render flow." },
        { id: "rf3", front: "Dependency Array", back: "Tells React when to execute an effect: empty runs once, with arguments runs on change, none runs on every single render." },
        { id: "rf4", front: "Cleanup Function", back: "The function returned by useEffect to cancel subscriptions, intervals, or event handlers." },
        { id: "rf5", front: "Rules of Hooks", back: "1. Only call hooks at the top level (no loops/ifs). 2. Only call hooks from React function components." },
        { id: "rf6", front: "Custom Hook", back: "A custom JS function starting with 'use' that encapsulates React hooks to share logic between components." }
      ]
    }
  }
];
