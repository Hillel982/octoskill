/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, FormEvent } from "react";
import { 
  Play, 
  BookOpen, 
  CheckSquare, 
  Layers, 
  Award, 
  Download, 
  Copy, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  ChevronRight, 
  HelpCircle as QuizIcon, 
  FileText, 
  Check, 
  ArrowRight,
  RefreshCw,
  Trophy,
  Hammer,
  GraduationCap,
  Folder,
  Bookmark,
  Trash2,
  Edit3,
  Lock,
  X,
  User,
  LogOut,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SAMPLE_GUIDES } from "./samples";
import { LearningGuide, SavedGuide } from "./types";

const renderFormattedAnswer = (text: string) => {
  return text.split("\n").map((line, idx) => {
    if (line.startsWith("### ")) {
      return <h5 key={idx} className="text-xs font-bold text-slate-900 mt-2.5 mb-1 font-display">{line.replace("### ", "")}</h5>;
    }
    if (line.startsWith("## ")) {
      return <h4 key={idx} className="text-sm font-bold text-slate-950 mt-3 mb-1.5 font-display">{line.replace("## ", "")}</h4>;
    }
    if (line.startsWith("# ")) {
      return <h3 key={idx} className="text-base font-bold text-slate-950 mt-4 mb-2 font-display">{line.replace("# ", "")}</h3>;
    }

    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    let content = isBullet ? line.substring(2) : line;

    const parts = content.split(/\*\*([^*]+)\*\*/g);
    const formattedContent = parts.map((part, pIdx) => {
      if (pIdx % 2 === 1) {
        return <strong key={pIdx} className="font-bold text-slate-950">{part}</strong>;
      }
      const codeParts = part.split(/`([^`]+)`/g);
      return codeParts.map((cPart, cIdx) => {
        if (cIdx % 2 === 1) {
          return <code key={cIdx} className="bg-slate-100 px-1 py-0.5 rounded-md font-mono text-[10px] text-indigo-700">{cPart}</code>;
        }
        return cPart;
      });
    });

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 font-medium my-1 pl-1">
          <span className="text-indigo-500 font-bold leading-none">•</span>
          <span className="flex-1 leading-normal">{formattedContent}</span>
        </div>
      );
    }

    if (!line.trim()) return <div key={idx} className="h-1.5" />;

    return (
      <p key={idx} className="text-xs text-slate-600 font-medium leading-normal my-1">
        {formattedContent}
      </p>
    );
  });
};

export default function App() {
  // Load the active guide from localStorage or default to sample 0
  const [guide, setGuide] = useState<LearningGuide>(() => {
    const saved = localStorage.getItem("octoskill_active_guide");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return SAMPLE_GUIDES[0].guide;
  });

  const [youtubeUrl, setYoutubeUrl] = useState<string>(() => {
    return localStorage.getItem("octoskill_active_youtube_url") || SAMPLE_GUIDES[0].youtubeUrl;
  });

  const [goal, setGoal] = useState<string>(() => {
    return localStorage.getItem("octoskill_active_goal") || SAMPLE_GUIDES[0].goal;
  });
  
  const [inputUrl, setInputUrl] = useState<string>("");
  const [inputGoal, setInputGoal] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>("Intermediate");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'concepts' | 'checklist' | 'quiz' | 'flashcards'>('walkthrough');
  
  // Progress & Interaction state loaded from localStorage for auto-save/auto-load
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem("octoskill_active_completed_steps");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("octoskill_active_completed_checklist");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("octoskill_active_quiz_answers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'full' | 'walkthrough' | 'concepts' | 'checklist' | 'quiz' | 'flashcards'>('full');

  // Gemini Intelligence Integration States
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [askQuestion, setAskQuestion] = useState<string>("");
  const [askAnswer, setAskAnswer] = useState<string>("");
  const [askLoading, setAskLoading] = useState<boolean>(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [refinedSteps, setRefinedSteps] = useState<Record<number, { explanation?: string; loading?: boolean; error?: string }>>({});
  const [checklistSorting, setChecklistSorting] = useState<boolean>(false);
  const [checklistCriterion, setChecklistCriterion] = useState<string>("category");
  const [stepSearchQuery, setStepSearchQuery] = useState<string>("");
  const [stepSortOrder, setStepSortOrder] = useState<'chrono' | 'difficulty'>("chrono");

  // Authentication & Dashboard state
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [renameGuideId, setRenameGuideId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>("");

  // Toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load initial Auth & Guides from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("octoskill_current_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Failed to parse stored current user", e);
      }
    }

    const storedGuides = localStorage.getItem("octoskill_saved_guides");
    if (storedGuides) {
      try {
        const parsed = JSON.parse(storedGuides);
        setSavedGuides(parsed);
      } catch (e) {
        console.error("Failed to parse stored guides", e);
      }
    }
  }, []);

  // Synchronize active guide states to localStorage for persistence across refreshes
  useEffect(() => {
    if (guide) {
      localStorage.setItem("octoskill_active_guide", JSON.stringify(guide));
    }
    localStorage.setItem("octoskill_active_youtube_url", youtubeUrl);
    localStorage.setItem("octoskill_active_goal", goal);
    localStorage.setItem("octoskill_active_completed_steps", JSON.stringify(completedSteps));
    localStorage.setItem("octoskill_active_completed_checklist", JSON.stringify(completedChecklist));
    localStorage.setItem("octoskill_active_quiz_answers", JSON.stringify(quizAnswers));
  }, [guide, youtubeUrl, goal, completedSteps, completedChecklist, quizAnswers]);

  // Save current guide function
  const handleSaveActiveGuide = () => {
    if (!currentUser) {
      setShowAuthModal('login');
      showToast("Please log in to save your learning guides.");
      return;
    }

    const existingGuideIdx = savedGuides.findIndex(
      (g) => g.userId === currentUser.id && g.youtubeUrl === youtubeUrl && g.goal === goal
    );

    const updatedGuides = [...savedGuides];

    if (existingGuideIdx > -1) {
      updatedGuides[existingGuideIdx] = {
        ...updatedGuides[existingGuideIdx],
        completedSteps,
        completedChecklist,
        quizAnswers,
        savedAt: new Date().toISOString()
      };
      showToast(`Updated progress for "${guide.title}"!`);
    } else {
      const newSaved: SavedGuide = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        title: guide.title,
        youtubeUrl,
        goal,
        guide,
        completedSteps,
        completedChecklist,
        quizAnswers,
        savedAt: new Date().toISOString()
      };
      updatedGuides.push(newSaved);
      showToast(`Saved "${guide.title}" to My Guides!`);
    }

    setSavedGuides(updatedGuides);
    localStorage.setItem("octoskill_saved_guides", JSON.stringify(updatedGuides));
  };

  // Load a saved guide
  const handleLoadSavedGuide = (saved: SavedGuide) => {
    setGuide(saved.guide);
    setYoutubeUrl(saved.youtubeUrl);
    setGoal(saved.goal);
    setInputUrl(saved.youtubeUrl);
    setInputGoal(saved.goal);
    setCompletedSteps(saved.completedSteps || {});
    setCompletedChecklist(saved.completedChecklist || {});
    setQuizAnswers(saved.quizAnswers || {});
    setCurrentFlashcardIndex(0);
    setFlashcardFlipped(false);
    setShowDashboard(false);
    showToast(`Loaded "${saved.title}" project!`);
  };

  // Delete a saved guide
  const handleDeleteSavedGuide = (id: string) => {
    const updated = savedGuides.filter(g => g.id !== id);
    setSavedGuides(updated);
    localStorage.setItem("octoskill_saved_guides", JSON.stringify(updated));
    showToast("Project deleted successfully.");
  };

  // Rename a saved guide
  const handleRenameSavedGuide = (e: FormEvent) => {
    e.preventDefault();
    if (!renameTitle.trim() || !renameGuideId) return;

    const updated = savedGuides.map(g => {
      if (g.id === renameGuideId) {
        return { ...g, title: renameTitle.trim() };
      }
      return g;
    });

    setSavedGuides(updated);
    localStorage.setItem("octoskill_saved_guides", JSON.stringify(updated));
    setRenameGuideId(null);
    setRenameTitle("");
    showToast("Project renamed successfully.");
  };

  // Sign up action
  const handleSignupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim() || !authName.trim()) {
      setAuthError("All fields are required.");
      return;
    }

    const existingUsersStr = localStorage.getItem("octoskill_users") || "[]";
    let users = [];
    try {
      users = JSON.parse(existingUsersStr);
    } catch {
      users = [];
    }

    if (users.some((u: any) => u.email.toLowerCase() === authEmail.toLowerCase())) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      email: authEmail.trim(),
      name: authName.trim(),
      password: authPassword
    };

    users.push(newUser);
    localStorage.setItem("octoskill_users", JSON.stringify(users));

    const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem("octoskill_current_user", JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setShowAuthModal(null);
    showToast(`Welcome to OctoSkill, ${newUser.name}!`);
  };

  // Log in action
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("All fields are required.");
      return;
    }

    const existingUsersStr = localStorage.getItem("octoskill_users") || "[]";
    let users = [];
    try {
      users = JSON.parse(existingUsersStr);
    } catch {
      users = [];
    }

    const matchedUser = users.find(
      (u: any) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword
    );

    if (!matchedUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    const sessionUser = { id: matchedUser.id, email: matchedUser.email, name: matchedUser.name };
    localStorage.setItem("octoskill_current_user", JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    setAuthEmail("");
    setAuthPassword("");
    setShowAuthModal(null);
    showToast(`Welcome back, ${matchedUser.name}!`);
  };

  // Log out action
  const handleLogout = () => {
    localStorage.removeItem("octoskill_current_user");
    setCurrentUser(null);
    setShowDashboard(false);
    showToast("Signed out successfully.");
  };

  // Initials generator
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Clear states when guide changes
  const resetGuideInteractions = (newGuide: LearningGuide) => {
    setCompletedSteps({});
    setCompletedChecklist({});
    setQuizAnswers({});
    setCurrentFlashcardIndex(0);
    setFlashcardFlipped(false);
    setError(null);
  };

  // Pre-load a sample guide
  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_GUIDES[sampleIndex];
    setGuide(sample.guide);
    setYoutubeUrl(sample.youtubeUrl);
    setGoal(sample.goal);
    setInputUrl(sample.youtubeUrl);
    setInputGoal(sample.goal);
    resetGuideInteractions(sample.guide);
  };

  // Processed, sorted, and filtered walkthrough steps
  const processedSteps = useMemo(() => {
    let list = [...guide.steps];
    
    // Search filter
    if (stepSearchQuery.trim()) {
      const q = stepSearchQuery.toLowerCase();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.instructions.toLowerCase().includes(q)
      );
    }
    
    // Sort
    if (stepSortOrder === 'difficulty') {
      // Sort by complexity/detail as proxy for action difficulty
      list.sort((a, b) => {
        const scoreA = (a.instructions.length) + (a.common_mistake.length * 1.5);
        const scoreB = (b.instructions.length) + (b.common_mistake.length * 1.5);
        return scoreB - scoreA;
      });
    } else {
      // Chronological
      list.sort((a, b) => a.step_number - b.step_number);
    }
    
    return list;
  }, [guide.steps, stepSearchQuery, stepSortOrder]);

  // Progress metrics calculation
  const stepsProgressPercent = useMemo(() => {
    if (!guide.steps || guide.steps.length === 0) return 0;
    const completedCount = Object.values(completedSteps).filter(Boolean).length;
    return Math.round((completedCount / guide.steps.length) * 100);
  }, [completedSteps, guide]);

  const checklistProgressPercent = useMemo(() => {
    if (!guide.checklist || guide.checklist.length === 0) return 0;
    const completedCount = Object.values(completedChecklist).filter(Boolean).length;
    return Math.round((completedCount / guide.checklist.length) * 100);
  }, [completedChecklist, guide]);

  const quizScore = useMemo(() => {
    if (!guide.quiz || guide.quiz.length === 0) return { score: 0, total: 0, answered: 0 };
    let score = 0;
    let answered = 0;
    guide.quiz.forEach(q => {
      const ans = quizAnswers[q.id];
      if (ans) {
        answered++;
        if (ans === q.correct_answer) {
          score++;
        }
      }
    });
    return { score, total: guide.quiz.length, answered };
  }, [quizAnswers, guide]);

  // Ask Gemini Pro about video details (video content understanding)
  const handleAskVideo = async (questionText?: string) => {
    const query = questionText || askQuestion;
    if (!query.trim()) return;

    setAskLoading(true);
    setAskError(null);
    setAskAnswer("");

    try {
      const response = await fetch("/api/ask-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl,
          question: query,
          guideTitle: guide.title,
          guideSummary: guide.summary,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer from Gemini Pro.");
      }

      setAskAnswer(data.answer);
      if (!questionText) setAskQuestion(""); // clear input only if custom text wasn't clicked
    } catch (err: any) {
      console.error(err);
      setAskError(err.message || "An unexpected error occurred.");
    } finally {
      setAskLoading(false);
    }
  };

  // Refine and explain a step on-the-fly using Gemini Flash Lite
  const handleRefineStep = async (stepNumber: number, stepTitle: string, stepInstructions: string) => {
    // If already loaded/loading, toggle visibility or don't load again
    if (refinedSteps[stepNumber]?.explanation) {
      // Toggle off
      setRefinedSteps(prev => ({
        ...prev,
        [stepNumber]: { ...prev[stepNumber], explanation: undefined }
      }));
      return;
    }

    setRefinedSteps(prev => ({
      ...prev,
      [stepNumber]: { loading: true }
    }));

    try {
      const response = await fetch("/api/refine-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl,
          stepNumber,
          stepTitle,
          stepInstructions,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to explain step.");
      }

      setRefinedSteps(prev => ({
        ...prev,
        [stepNumber]: { explanation: data.explanation, loading: false }
      }));
    } catch (err: any) {
      console.error(err);
      setRefinedSteps(prev => ({
        ...prev,
        [stepNumber]: { error: err.message || "Failed to refine.", loading: false }
      }));
    }
  };

  // Ask Gemini to sort/re-structure the checklist
  const handleSortChecklist = async (criterion: string) => {
    setChecklistSorting(true);
    setChecklistCriterion(criterion);

    try {
      const response = await fetch("/api/sort-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: guide.checklist,
          criterion,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sort checklist.");
      }

      if (data.sorted && Array.isArray(data.sorted)) {
        setGuide(prev => ({
          ...prev,
          checklist: data.sorted
        }));
      }
    } catch (err: any) {
      console.error(err);
      alert("Checklist sorting failed: " + (err.message || "Unknown error"));
    } finally {
      setChecklistSorting(false);
    }
  };

  // Generate learning guide using Express proxy endpoint
  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = inputUrl.trim();
    const trimmedGoal = inputGoal.trim();

    if (!trimmedUrl) {
      setError("Please enter a YouTube URL first.");
      return;
    }

    const isYoutube = trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be");
    if (!isYoutube) {
      setError("Invalid YouTube URL: Please provide a valid YouTube video link (e.g., https://www.youtube.com/watch?v=...)");
      return;
    }

    if (!trimmedGoal) {
      setError("Empty learning goal: Please enter what you want to learn from this tutorial to help Gemini customize your curriculum!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: trimmedUrl,
          learnerGoal: trimmedGoal,
          skillLevel: skillLevel,
          selectedModel: selectedModel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate learning guide.");
      }

      // Map API response (user requested schema) to existing LearningGuide structure expected by the UI
      const mappedGuide: LearningGuide = {
        title: data.project_title || "Generated Project Roadmap",
        summary: data.educational_context || "",
        skill_level: data.skill_level || "Intermediate",
        materials: data.required_tools_and_materials || [],
        prerequisites: data.prerequisite_knowledge || [],
        steps: (data.walkthrough_steps || []).map((s: any, idx: number) => ({
          step_number: s.step_number || idx + 1,
          title: s.title || `Step ${idx + 1}`,
          timestamp: s.timestamp || "00:00",
          instructions: s.learner_action || s.video_summary || "",
          why_it_matters: s.why_it_matters || "",
          common_mistake: s.common_mistake || ""
        })),
        key_concepts: (data.key_concepts || []).map((c: any) => ({
          concept: c.title || "",
          explanation: c.simple_explanation || ""
        })),
        mistakes_to_avoid: (data.critical_pitfalls || []).map((p: any) => ({
          mistake: p.mistake || "",
          how_to_avoid: p.how_to_prevent || ""
        })),
        practice_tasks: (data.hands_on_practice || []).map((t: any) => ({
          task: t.title || "",
          description: t.task || ""
        })),
        checklist: (data.project_checklist || []).map((item: any, idx: number) => ({
          id: `c_${idx}`,
          item: item.item || "",
          category: item.category || "General"
        })),
        quiz: (data.quiz || []).map((q: any, idx: number) => ({
          id: `q_${idx}`,
          question: q.question || "",
          options: q.options || [],
          correct_answer: q.correct_answer || "",
          explanation: q.explanation || ""
        })),
        flashcards: (data.flashcards || []).map((f: any, idx: number) => ({
          id: `f_${idx}`,
          front: f.front || "",
          back: f.back || ""
        }))
      };

      setGuide(mappedGuide);
      setYoutubeUrl(inputUrl);
      setGoal(inputGoal || "Learn the skills from the video");
      resetGuideInteractions(mappedGuide);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to construct exact working timestamp link
  const getYouTubeSecondsLink = (url: string, timestamp: string): string => {
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return url;
    }

    const parts = timestamp.split(":");
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    } else if (parts.length === 3) {
      seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    }
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
  };

  // Generate structured content dynamically based on current selected exportType
  const generateExportContent = (type: 'full' | 'walkthrough' | 'concepts' | 'checklist' | 'quiz' | 'flashcards') => {
    let md = "";
    let filenameTitle = "";

    switch (type) {
      case 'full':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-full-package`;
        md = `# ${guide.title}\n`;
        md += `### Complete Learning & Project Guide\n\n`;
        md += `**Skill Level:** ${guide.skill_level}\n`;
        md += `**YouTube Tutorial:** ${youtubeUrl}\n`;
        md += `**Objective:** ${goal}\n\n`;
        md += `---\n\n`;
        md += `## 1. Educational Context & Summary\n${guide.summary}\n\n`;
        
        md += `### Prerequisites\n`;
        guide.prerequisites.forEach(p => md += `- ${p}\n`);
        md += `\n`;

        md += `### Required Tools & Materials\n`;
        guide.materials.forEach(m => md += `- ${m}\n`);
        md += `\n`;
        md += `---\n\n`;

        md += `## 2. Step-by-Step Project Walkthrough\n\n`;
        guide.steps.forEach(s => {
          md += `### Step ${s.step_number}: ${s.title} (Video Timestamp: ${s.timestamp})\n`;
          md += `${s.instructions}\n\n`;
          md += `* **Why it matters:** ${s.why_it_matters}\n`;
          md += `* **Common mistake:** ${s.common_mistake}\n\n`;
        });
        md += `---\n\n`;

        md += `## 3. Key Concepts & Definitions\n\n`;
        guide.key_concepts.forEach(c => {
          md += `### 💡 ${c.concept}\n`;
          md += `${c.explanation}\n\n`;
        });
        md += `---\n\n`;

        md += `## 4. Pitfalls & Mistakes to Avoid\n\n`;
        guide.mistakes_to_avoid.forEach(m => {
          md += `* **✕ ${m.mistake}:** ${m.how_to_avoid}\n`;
        });
        md += `\n---\n\n`;

        md += `## 5. Recommended Practice Exercises\n\n`;
        guide.practice_tasks.forEach(t => {
          md += `### Task: ${t.task}\n`;
          md += `${t.description}\n\n`;
        });
        md += `---\n\n`;

        md += `## 6. Project Checklist & Milestones\n\n`;
        guide.checklist.forEach(item => {
          md += `- [ ] [${item.category}] ${item.item}\n`;
        });
        md += `\n---\n\n`;

        md += `## 7. Concept Mastery Quiz\n\n`;
        guide.quiz.forEach((q, i) => {
          md += `### Q${i + 1}: ${q.question}\n`;
          q.options.forEach(o => md += `- [ ] ${o}\n`);
          md += `\n* **Correct Answer:** ${q.correct_answer}\n`;
          md += `* **Explanation:** ${q.explanation}\n\n`;
        });
        md += `---\n\n`;

        md += `## 8. Active Recall Flashcards\n\n`;
        guide.flashcards.forEach((f, i) => {
          md += `### Flashcard ${i + 1}: ${f.front}\n`;
          md += `* **Answer:** ${f.back}\n\n`;
        });
        break;

      case 'walkthrough':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-walkthrough`;
        md = `# ${guide.title} - Step-by-Step Walkthrough\n`;
        md += `**YouTube Tutorial:** ${youtubeUrl}\n\n`;
        md += `---\n\n`;
        guide.steps.forEach(s => {
          md += `## Step ${s.step_number}: ${s.title} (${s.timestamp})\n`;
          md += `${s.instructions}\n\n`;
          md += `* **Why it matters:** ${s.why_it_matters}\n`;
          md += `* **Common mistake:** ${s.common_mistake}\n\n`;
          md += `---\n\n`;
        });
        break;

      case 'concepts':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-concepts`;
        md = `# ${guide.title} - Core Concepts & Exercises\n\n`;
        md += `## 💡 Key Architectural & Technical Concepts\n\n`;
        guide.key_concepts.forEach(c => {
          md += `### ${c.concept}\n`;
          md += `${c.explanation}\n\n`;
        });
        md += `---\n\n`;

        md += `## 🛑 Critical Pitfalls to Avoid\n\n`;
        guide.mistakes_to_avoid.forEach(m => {
          md += `* **${m.mistake}:** ${m.how_to_avoid}\n`;
        });
        md += `\n---\n\n`;

        md += `## 🛠️ Hands-On Practice Tasks\n\n`;
        guide.practice_tasks.forEach(t => {
          md += `### ${t.task}\n`;
          md += `${t.description}\n\n`;
        });
        break;

      case 'checklist':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-checklist`;
        md = `# ${guide.title} - Project Milestones & Checklist\n\n`;
        md += `Use this action-oriented checklist to track your milestone progress.\n\n`;
        guide.checklist.forEach(item => {
          md += `- [ ] [${item.category}] ${item.item}\n`;
        });
        break;

      case 'quiz':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-quiz`;
        md = `# ${guide.title} - Study Assessment & Quiz\n\n`;
        guide.quiz.forEach((q, i) => {
          md += `### Question ${i + 1}: ${q.question}\n`;
          q.options.forEach(o => md += `- [ ] ${o}\n`);
          md += `\n* **Correct Answer:** ${q.correct_answer}\n`;
          md += `* **Explanation:** ${q.explanation}\n\n`;
          md += `---\n\n`;
        });
        break;

      case 'flashcards':
        filenameTitle = `${guide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-flashcards`;
        md = `# ${guide.title} - Active Recall Flashcards\n\n`;
        md += `Use these cards to drill core terminology and concepts.\n\n`;
        guide.flashcards.forEach((f, i) => {
          md += `### Flashcard ${i + 1}\n`;
          md += `**Question / Term:** ${f.front}\n`;
          md += `**Answer / Definition:** ${f.back}\n\n`;
          md += `---\n\n`;
        });
        break;
    }

    return { filenameTitle, markdown: md };
  };

  // Export Guide to Markdown file download
  const handleExportMarkdown = () => {
    const { filenameTitle, markdown } = generateExportContent(exportType);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filenameTitle}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy structured guide markdown to clipboard
  const handleCopyClipboard = () => {
    const { markdown } = generateExportContent(exportType);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Interactive print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      <div className="no-print flex-1 flex flex-col">
        {/* Top Banner / Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-3.5 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
            <div onClick={() => { setShowDashboard(false); }} className="cursor-pointer flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                <GraduationCap className="w-7 h-7" id="app-logo-icon" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold text-slate-950 tracking-tight" id="app-title">
                  Octo<span className="text-indigo-600">Skill</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Paste a tutorial. Get a roadmap. Build the skill.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 w-full md:w-auto">
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Cpu className="w-3.5 h-3.5 mr-1 text-indigo-500 animate-pulse" />
              Gemini 3.5 & Search Grounded
            </span>

            {/* Save current progress if a guide exists */}
            {guide && (
              <button
                onClick={handleSaveActiveGuide}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 font-semibold text-xs rounded-xl border border-indigo-100 transition-all cursor-pointer"
                title="Save progress for the active guide"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Progress</span>
              </button>
            )}

            {/* Dashboard / Saved Projects button */}
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-xs rounded-xl border transition-all cursor-pointer ${
                showDashboard
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>My Guides {currentUser && savedGuides.filter(g => g.userId === currentUser.id).length > 0 && `(${savedGuides.filter(g => g.userId === currentUser.id).length})`}</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {getUserInitials(currentUser.name)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                </button>
                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-48 z-20">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => { setShowDashboard(true); setShowUserDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-slate-400" />
                        My Saved Guides
                      </button>
                      <button
                        onClick={() => { handleLogout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { setShowAuthModal('login'); setAuthError(null); }}
                  className="px-3 py-2 text-slate-700 hover:text-slate-950 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setShowAuthModal('signup'); setAuthError(null); }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {showDashboard ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
                  <Folder className="w-6 h-6 text-indigo-600" />
                  My Guides Dashboard
                </h2>
                <p className="text-sm text-slate-500 font-medium">Manage and resume your saved learning roadmaps & checklists</p>
              </div>
              <button
                onClick={() => setShowDashboard(false)}
                className="inline-flex items-center gap-1 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                ← Back to Generator
              </button>
            </div>

            {!currentUser ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 max-w-md mx-auto shadow-xs my-8">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Sign In Required</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Create an account or log in to view past guides, track project progress, rename, and resume your learning checklists.
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => { setShowAuthModal('login'); setAuthError(null); }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setShowAuthModal('signup'); setAuthError(null); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <>
                {savedGuides.filter(g => g.userId === currentUser.id).length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs my-8">
                    <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">No Saved Guides Yet</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        You don't have any saved guides in your collection. Paste a YouTube video and click <strong>"Generate Structured Guide"</strong>. 
                        Once generated, click the <strong>"Save Progress"</strong> button in the header or sidebar to persist it here!
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setShowDashboard(false)}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-950 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Find a Video to Learn
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedGuides
                      .filter(g => g.userId === currentUser.id)
                      .map((g) => {
                        const totalSteps = g.guide.steps?.length || 0;
                        const completedStepsCount = Object.values(g.completedSteps || {}).filter(Boolean).length;
                        const stepsPct = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

                        const totalChecklist = g.guide.checklist?.length || 0;
                        const completedChecklistCount = Object.values(g.completedChecklist || {}).filter(Boolean).length;
                        const checklistPct = totalChecklist > 0 ? Math.round((completedChecklistCount / totalChecklist) * 100) : 0;

                        return (
                          <div key={g.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between">
                            <div className="p-5 space-y-4">
                              {/* Title block with rename support */}
                              {renameGuideId === g.id ? (
                                <form onSubmit={handleRenameSavedGuide} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    value={renameTitle}
                                    onChange={(e) => setRenameTitle(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-indigo-500 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                                    placeholder="Enter new project title"
                                    autoFocus
                                  />
                                  <button
                                    type="submit"
                                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Save Title"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRenameGuideId(null)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <h3 className="font-display font-bold text-slate-900 text-sm md:text-base line-clamp-2" title={g.title}>
                                      {g.title}
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/50">
                                      Level: {g.guide.skill_level}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => { setRenameGuideId(g.id); setRenameTitle(g.title); }}
                                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0 animate-pulse"
                                    title="Rename Project"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Target Details */}
                              <div className="space-y-1 pt-1 border-t border-slate-100 text-xs">
                                <p className="text-slate-500 font-medium truncate flex items-center gap-1">
                                  <Play className="w-3 h-3 text-red-500 shrink-0 fill-red-500" />
                                  <span className="truncate">{g.youtubeUrl}</span>
                                </p>
                                {g.goal && (
                                  <p className="text-slate-600 font-medium line-clamp-1 italic">
                                    Goal: {g.goal}
                                  </p>
                                )}
                              </div>

                              {/* Progress Bars */}
                              <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-500">Steps Progress</span>
                                    <span className="text-indigo-600">{stepsPct}% ({completedStepsCount}/{totalSteps})</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${stepsPct}%` }} />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-500">Checklist Progress</span>
                                    <span className="text-emerald-600">{checklistPct}% ({completedChecklistCount}/{totalChecklist})</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${checklistPct}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Card Actions */}
                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Saved {new Date(g.savedAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDeleteSavedGuide(g.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  title="Delete Guide"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleLoadSavedGuide(g)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                                >
                                  Resume Progress
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* URL + Goal Input Panel */}
            <section className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="generator-input-card">
          <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Tutoring
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">
                Turn any YouTube tutorial into a structured, interactive roadmap
              </h2>
              <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Paste any build tutorial or code video. Our engine parses timestamps, analyzes steps via Search grounding, and creates practical projects with checklists, flashcards, and quizzes.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="p-6 border-b border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  YouTube Video Link
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Play className="w-5 h-5 fill-slate-400 text-slate-400" />
                  </span>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=Kz69X2W_4iE"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
                    id="youtube-url-input"
                  />
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  What are you trying to learn? <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={inputGoal}
                  onChange={(e) => setInputGoal(e.target.value)}
                  placeholder="e.g. Build a wooden planter box, learn hooks"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-900 placeholder:text-slate-400 font-medium"
                  id="learning-goal-input"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-900 font-medium cursor-pointer"
                  id="skill-level-select"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                  Gemini Intelligence Mode
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-3 bg-indigo-50/50 border border-indigo-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-900 font-medium cursor-pointer"
                  id="gemini-intelligence-select"
                >
                  <option value="gemini-3.5-flash">🚀 Balanced (Gemini 3.5 Flash)</option>
                  <option value="gemini-3.1-pro-preview">🔬 Deep Video Understanding (Gemini 3.1 Pro)</option>
                  <option value="gemini-3.1-flash-lite">⚡ Ultra-Fast Overview (Gemini 3.1 Flash Lite)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-4">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Sandbox Trial:</span>
                {SAMPLE_GUIDES.map((sg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleLoadSample(i)}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    {sg.name}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm focus:outline-hidden ${
                  loading 
                  ? "bg-indigo-400 text-white cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98 cursor-pointer"
                }`}
                id="generate-guide-button"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2.5 animate-spin" />
                    Analyzing & Generating Guide...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Structured Guide
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading status details */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-indigo-50/70 p-4 border-t border-indigo-100/50 flex items-start gap-3"
            >
              <div className="p-1 bg-white rounded-full text-indigo-600 shadow-xs mt-0.5">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-950">Active Video Parsing</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Gemini is searching YouTube transcripts and visual chapters to construct your study curriculum. This safe server-side query takes about 15-20 seconds.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Callout */}
          {error && (
            <div className="p-5 bg-rose-50 border-t border-rose-100 flex items-start gap-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <h4 className="text-sm font-semibold text-rose-950">Generation Issue</h4>
                <p className="text-xs leading-relaxed">{error}</p>
                {error.includes("GEMINI_API_KEY") && (
                  <p className="text-xs text-rose-700 mt-1">
                    To connect your own keys, navigate to the **Settings &gt; Secrets** panel in the Google AI Studio sidebar and add **GEMINI_API_KEY**. In the meantime, you can instantly try our two high-quality samples below the form!
                  </p>
                )}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadSample(0);
                      setError(null);
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all hover:shadow-xs cursor-pointer active:scale-98"
                  >
                    Load Pre-Built Cedar Planter Sandbox Guide as Fallback
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Dynamic educational progress metrics dashboard */}
        <section className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6" id="progress-dashboard">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
              <Hammer className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>PROJECT WALKTHROUGH</span>
                <span>{stepsProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${stepsProgressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Mark individual video steps completed as you build</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>MILESTONES CHECKLIST</span>
                <span>{checklistProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${checklistProgressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Acquire resources and verify milestones</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>STUDY SCORECARD</span>
                <span>{quizScore.answered === 0 ? "Not Started" : `${quizScore.score} / ${quizScore.total}`}</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${quizScore.total > 0 ? (quizScore.answered / quizScore.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {quizScore.answered === 0 ? "Take the knowledge test on Tab 4" : `Completed ${quizScore.answered} of ${quizScore.total} questions`}
              </p>
            </div>
          </div>
        </section>

        {/* Active Study Guide Content Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="active-guide-container">
          {/* Left Column - Meta Panel (Prerequisites, materials, sharing/exports) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800">
                    {guide.skill_level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Project Roadmap</span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-950 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono break-all truncate" title={youtubeUrl}>
                  Source: {youtubeUrl}
                </p>
              </div>

              <div className="p-5 space-y-5">
                {/* Objective Summary */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Educational Context</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {guide.summary}
                  </p>
                </div>

                {/* Prerequisites checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prerequisite Knowledge</h4>
                  <ul className="space-y-2">
                    {guide.prerequisites.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Materials / Resource List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Tools & Materials</h4>
                  <ul className="space-y-2">
                    {guide.materials.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5 mr-2" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Export Learning Materials Area */}
                <div className="no-print pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Export Learning Materials</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Select Material Format
                    </label>
                    <select
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="full">📚 Full Learning Package</option>
                      <option value="walkthrough">🗺️ Walkthrough Guide</option>
                      <option value="concepts">💡 Concepts & Practice</option>
                      <option value="checklist">✅ Project Checklist</option>
                      <option value="quiz">📝 Study Quiz</option>
                      <option value="flashcards">🃏 Flashcards</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleCopyClipboard}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      title="Copy selected material content to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      title="Download selected material as formatted Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      Download
                    </button>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200/40 transition-colors cursor-pointer"
                    title="Print study card or export directly as a styled PDF"
                  >
                    <Printer className="w-4 h-4 text-indigo-600" />
                    Print / Save PDF
                  </button>
                </div>
              </div>
            </div>

            {/* AI Video Inspector (Gemini 3.1 Pro Video Understanding) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4 no-print">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-display font-bold text-slate-950 flex items-center gap-2">
                  <div className="p-1 bg-indigo-50 rounded-lg text-indigo-600">
                    <Sparkles className="w-4 h-4 fill-indigo-500" />
                  </div>
                  AI Video Inspector
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Ask **Gemini Pro** to inspect the source video for safety warnings, alternative materials, or technical details.
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAskVideo("Are there any safety warnings or gear omitted from this tutorial?")}
                    className="text-left text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 p-2 rounded-lg border border-slate-200/50 transition-all text-left cursor-pointer"
                  >
                    ⚠️ Verify missing safety warnings/gear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskVideo("What alternative tools or materials can I use if I don't have the ones listed in the guide?")}
                    className="text-left text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 p-2 rounded-lg border border-slate-200/50 transition-all text-left cursor-pointer"
                  >
                    🛠️ Find alternative tools/materials
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskVideo("Explain the core logic, theory, math, or technology rules of how this works.")}
                    className="text-left text-[11px] font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 p-2 rounded-lg border border-slate-200/50 transition-all text-left cursor-pointer"
                  >
                    📐 Explain science/programming theory
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    placeholder="Ask Gemini Pro about this video..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-hidden text-slate-900 font-medium placeholder:text-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !askLoading) {
                        e.preventDefault();
                        handleAskVideo();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAskVideo()}
                    disabled={askLoading || !askQuestion.trim()}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      askLoading || !askQuestion.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
                    }`}
                  >
                    {askLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Ask"
                    )}
                  </button>
                </div>

                {askError && (
                  <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    {askError}
                  </p>
                )}
              </div>

              {/* Response Answer area */}
              {(askAnswer || askLoading) && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 max-h-[250px] overflow-y-auto space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200/40 pb-1">
                    Gemini Pro Insights
                  </span>
                  {askLoading ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold py-1">
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      Analyzing video details...
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {renderFormattedAnswer(askAnswer)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tabs and Interactive Material Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Interactive Module Tab Headers */}
            <div className="no-print bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('walkthrough')}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'walkthrough' 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                Walkthrough
              </button>

              <button
                onClick={() => setActiveTab('concepts')}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'concepts' 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-4 h-4" />
                Concepts & Practice
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'checklist' 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Project Checklist
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'quiz' 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <QuizIcon className="w-4 h-4" />
                Study Quiz
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'flashcards' 
                  ? "bg-slate-900 text-white shadow-xs" 
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Flashcards
              </button>
            </div>



            {/* TAB CONTENT MODULES */}
            <div className="tab-content">
              {/* Tab 1: Walkthrough (Step-by-Step) */}
              {(activeTab === 'walkthrough' || window.matchMedia('print').matches) && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <h3 className="text-base md:text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                      Step-by-Step Walkthrough
                    </h3>
                    
                    <div className="no-print flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search steps..."
                        value={stepSearchQuery}
                        onChange={(e) => setStepSearchQuery(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                      />
                      <select
                        value={stepSortOrder}
                        onChange={(e) => setStepSortOrder(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden text-slate-700 cursor-pointer"
                      >
                        <option value="chrono">⏱️ Chronological</option>
                        <option value="difficulty">🔥 Sort by Complexity</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {processedSteps.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <p className="text-sm font-semibold text-slate-600">No walkthrough steps match your search query.</p>
                        <button
                          type="button"
                          onClick={() => setStepSearchQuery("")}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      </div>
                    ) : (
                      processedSteps.map((s) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={s.step_number}
                          className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-4"
                        >
                          {/* Step Check / Completion status */}
                          <div className="no-print flex items-start gap-3 md:flex-col md:items-center shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setCompletedSteps(prev => ({
                                  ...prev,
                                  [s.step_number]: !prev[s.step_number]
                                }));
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                completedSteps[s.step_number]
                                ? "bg-amber-100 border-amber-300 text-amber-700"
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                              title={completedSteps[s.step_number] ? "Mark step as incomplete" : "Mark step as completed"}
                            >
                              <Check className="w-5 h-5 stroke-[3px]" />
                            </button>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                              {completedSteps[s.step_number] ? "Done" : "Mark"}
                            </span>
                          </div>

                          {/* Step details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <h4 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                                <span className="text-amber-500 font-mono">Step {s.step_number}:</span>
                                {s.title}
                              </h4>

                              {/* Precise YouTube Timestamp link */}
                              <a
                                href={getYouTubeSecondsLink(youtubeUrl, s.timestamp)}
                                target="_blank"
                                rel="noreferrer referrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors border border-indigo-200/50"
                                title="Watch this part on YouTube"
                              >
                                <Play className="w-3 h-3 fill-indigo-700 text-indigo-700" />
                                Timeline {s.timestamp}
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                              {s.instructions}
                            </p>

                            {/* Split why it matters & common mistakes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Why This Step Matters</span>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                  {s.why_it_matters}
                                </p>
                              </div>

                              <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/40 space-y-1">
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  Common Mistake
                                </span>
                                <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                                  {s.common_mistake}
                                </p>
                              </div>
                            </div>

                            {/* AI Step Refinement */}
                            <div className="no-print pt-3 border-t border-slate-100 flex flex-col gap-2">
                              {refinedSteps[s.step_number]?.explanation ? (
                                <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl space-y-3 relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRefinedSteps(prev => ({
                                        ...prev,
                                        [s.step_number]: { ...prev[s.step_number], explanation: undefined }
                                      }));
                                    }}
                                    className="absolute top-3 right-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                  >
                                    Close
                                  </button>
                                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 fill-indigo-500" />
                                    Gemini Step Refinement (Action details & Verification criteria)
                                  </span>
                                  <div className="space-y-1">
                                    {renderFormattedAnswer(refinedSteps[s.step_number].explanation!)}
                                  </div>
                                </div>
                              ) : refinedSteps[s.step_number]?.loading ? (
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  Gemini is refining action details for Step {s.step_number}...
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <p className="text-[11px] text-slate-400 font-medium">Need more details on how to perform this step?</p>
                                  <button
                                    type="button"
                                    onClick={() => handleRefineStep(s.step_number, s.title, s.instructions)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-bold text-xs transition-all border border-indigo-100 cursor-pointer self-start sm:self-auto"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Explain Action & Verification
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Key Concepts & Exercises */}
              {(activeTab === 'concepts' && !window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  {/* Key Concepts Grid */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-slate-950" />
                      Key Concepts Explained Simply
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guide.key_concepts.map((c, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
                          <h4 className="font-display font-bold text-indigo-950 text-sm md:text-base flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                            {c.concept}
                          </h4>
                          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                            {c.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pitfalls and Mistakes section */}
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-display font-bold text-rose-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      Critical Pitfalls to Avoid
                    </h3>
                    <div className="space-y-3">
                      {guide.mistakes_to_avoid.map((m, idx) => (
                        <div key={idx} className="bg-white/80 p-3.5 rounded-xl border border-rose-100/50 space-y-1">
                          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                            ✕ {m.mistake}
                          </p>
                          <p className="text-xs text-slate-600 font-medium pl-3">
                            <span className="text-emerald-600 font-semibold">How to Prevent:</span> {m.how_to_avoid}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hands-On Practice Exercises */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Recommended Hands-On Practice
                    </h3>
                    <div className="space-y-4">
                      {guide.practice_tasks.map((t, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex gap-4 items-start">
                          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0 font-mono text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-display font-bold text-slate-950 text-sm md:text-base">
                              {t.task}
                            </h4>
                            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                              {t.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Interactive Project Checklist */}
              {(activeTab === 'checklist' && !window.matchMedia('print').matches) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-slate-950" />
                      Milestone Action Checklist
                    </h3>
                    <button
                      onClick={() => setCompletedChecklist({})}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-rose-600 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Milestone Progress
                    </button>
                  </div>

                  {/* AI Restructuring Options */}
                  <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
                        AI Milestone Restructuring
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Use **Gemini Flash Lite** to analyze milestone items and sort them logically.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={checklistCriterion}
                        onChange={(e) => setChecklistCriterion(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden text-slate-700 cursor-pointer"
                        disabled={checklistSorting}
                      >
                        <option value="category">🗂️ Sort by Area Category</option>
                        <option value="chrono">⏱️ Chronological Phase Order</option>
                        <option value="complexity">🔥 Difficulty/Prerequisites</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleSortChecklist(checklistCriterion)}
                        disabled={checklistSorting}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                          checklistSorting
                          ? "bg-indigo-200 text-indigo-700 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
                        }`}
                      >
                        {checklistSorting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Sorting...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3.5 h-3.5" />
                            Restructure List
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
                    {guide.checklist.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 flex items-start gap-3.5 transition-colors ${
                          completedChecklist[item.id] ? "bg-slate-50/60" : "hover:bg-slate-50/40"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setCompletedChecklist(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id]
                            }));
                          }}
                          className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                            completedChecklist[item.id]
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-slate-50 border-slate-300 text-transparent hover:border-indigo-400"
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3px]" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${
                            completedChecklist[item.id] ? "line-through text-slate-400" : "text-slate-800"
                          }`}>
                            {item.item}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 tracking-wider uppercase ${
                            item.category.toLowerCase() === 'preparation'
                            ? "bg-amber-100 text-amber-800"
                            : item.category.toLowerCase() === 'construction'
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Interactive Quiz */}
              {(activeTab === 'quiz' && !window.matchMedia('print').matches) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <QuizIcon className="w-5 h-5 text-slate-950" />
                      Concept Mastery Quiz
                    </h3>
                    <button
                      onClick={() => setQuizAnswers({})}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Quiz
                    </button>
                  </div>

                  {/* Score metrics feedback card */}
                  {quizScore.answered > 0 && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-indigo-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold tracking-wide text-indigo-200 uppercase">Assessment Scorecard</h4>
                        <p className="text-base font-semibold leading-relaxed">
                          {quizScore.score === quizScore.total 
                            ? "Excellent! Perfect Score! You have fully mastered this tutorial's core concepts." 
                            : `You scored ${quizScore.score} out of ${quizScore.total}. Review explanations to plug knowledge gaps!`}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center justify-center bg-indigo-800 rounded-xl px-5 py-3 border border-indigo-700">
                        <span className="text-3xl font-display font-extrabold">{quizScore.score}</span>
                        <span className="text-indigo-400 font-semibold text-lg mx-1">/</span>
                        <span className="text-indigo-300 font-semibold text-lg">{quizScore.total}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-5">
                    {guide.quiz.map((q, idx) => {
                      const selectedOption = quizAnswers[q.id];
                      const isCorrect = selectedOption === q.correct_answer;

                      return (
                        <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-2xs space-y-4">
                          <h4 className="font-display font-bold text-slate-950 text-sm md:text-base">
                            <span className="text-indigo-600 font-mono mr-1.5">Question {idx + 1}:</span>
                            {q.question}
                          </h4>

                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((option) => {
                              const isSelected = selectedOption === option;
                              const isThisCorrect = option === q.correct_answer;

                              let optionStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800";
                              if (selectedOption) {
                                if (isSelected) {
                                  optionStyle = isCorrect 
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/10" 
                                    : "bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500/10";
                                } else if (isThisCorrect) {
                                  optionStyle = "bg-emerald-50 border-emerald-200 text-emerald-700";
                                } else {
                                  optionStyle = "bg-slate-50/40 border-slate-100 text-slate-400 cursor-not-allowed";
                                }
                              }

                              return (
                                <button
                                  key={option}
                                  disabled={!!selectedOption}
                                  onClick={() => {
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [q.id]: option
                                    }));
                                  }}
                                  className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm font-semibold transition-all flex items-center justify-between ${optionStyle} ${!selectedOption && "cursor-pointer active:scale-99"}`}
                                >
                                  <span>{option}</span>
                                  {selectedOption && isThisCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                  )}
                                  {selectedOption && isSelected && !isCorrect && (
                                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Reveal detailed explanations when answered */}
                          <AnimatePresence>
                            {selectedOption && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-1 overflow-hidden"
                              >
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {isCorrect ? "✓ Correct Answer - Tutorial explanation" : "✕ Incorrect - Learn why"}
                                </span>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                  {q.explanation}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 5: Study Flashcards */}
              {(activeTab === 'flashcards' && !window.matchMedia('print').matches) && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-lg font-display font-bold text-slate-950 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-slate-950" />
                      Active Recall Flashcards
                    </h3>
                    <span className="text-xs text-slate-500 font-semibold">Click card to flip and reveal answers</span>
                  </div>

                  {/* Flashing interactive 3D Card layout */}
                  <div className="w-full max-w-lg perspective-1000 my-6">
                    <div 
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`relative w-full min-h-[250px] rounded-3xl cursor-pointer transition-all duration-500 transform-style-3d border shadow-md flex items-center justify-center p-8 text-center select-none ${
                        flashcardFlipped 
                        ? "bg-slate-900 border-slate-800 text-white" 
                        : "bg-white border-slate-200 text-slate-900"
                      }`}
                    >
                      <div className="space-y-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${flashcardFlipped ? "text-indigo-400" : "text-indigo-600"}`}>
                          {flashcardFlipped ? "Answer / Back" : "Question / Front"}
                        </span>
                        <p className="text-base md:text-lg font-display font-bold leading-relaxed">
                          {flashcardFlipped 
                            ? guide.flashcards[currentFlashcardIndex]?.back 
                            : guide.flashcards[currentFlashcardIndex]?.front
                          }
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium pt-3 italic">
                          Click card to flip
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation controls for Flashcards */}
                  <div className="flex items-center gap-4">
                    <button
                      disabled={currentFlashcardIndex === 0}
                      onClick={() => {
                        setCurrentFlashcardIndex(prev => prev - 1);
                        setFlashcardFlipped(false);
                      }}
                      className={`p-2.5 rounded-xl border border-slate-200 transition-colors ${
                        currentFlashcardIndex === 0 
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                        : "bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      ← Prev
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Card {currentFlashcardIndex + 1} of {guide.flashcards.length}
                    </span>
                    <button
                      disabled={currentFlashcardIndex === guide.flashcards.length - 1}
                      onClick={() => {
                        setCurrentFlashcardIndex(prev => prev + 1);
                        setFlashcardFlipped(false);
                      }}
                      className={`p-2.5 rounded-xl border border-slate-200 transition-colors ${
                        currentFlashcardIndex === guide.flashcards.length - 1 
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                        : "bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 px-6 mt-12 text-center text-xs text-slate-400">
        <p className="font-semibold">OctoSkill © 2026 • AI-Powered Curriculum Development</p>
        <p className="mt-1">Crafted with precision using Google GenAI & search-grounded model synthesis.</p>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm border border-slate-800"
          >
            <div className="p-1 bg-indigo-500 rounded-lg text-white">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal Container */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 w-full max-w-md relative z-10 space-y-6 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-slate-950 text-lg md:text-xl">
                    {showAuthModal === 'login' ? "Log In to OctoSkill" : "Create Account"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAuthModal(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={showAuthModal === 'login' ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
                {showAuthModal === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Doe"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-950 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      @
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="e.g. you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-950 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden text-slate-950 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer mt-2"
                >
                  {showAuthModal === 'login' ? "Sign In" : "Register Account"}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setShowAuthModal(showAuthModal === 'login' ? 'signup' : 'login');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {showAuthModal === 'login' 
                    ? "New to OctoSkill? Create an account" 
                    : "Already have an account? Sign In"
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

    {/* Printable Output Container */}
    <div className="print-only hidden font-sans text-slate-900 bg-white p-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-slate-950">{guide.title}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Study Materials generated with <span className="font-bold text-indigo-600">OctoSkill</span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono mt-2">
          <span>Skill Level: {guide.skill_level}</span>
          <span>•</span>
          <span className="truncate">Source Video: {youtubeUrl}</span>
        </div>
      </div>

      {exportType === 'full' && (
        <div className="space-y-8">
          {/* 1. Summary */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">1. Summary & Educational Context</h2>
            <p className="text-sm leading-relaxed text-slate-800">{guide.summary}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {guide.prerequisites.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Materials</h3>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {guide.materials.map((m, idx) => <li key={idx}>{m}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="print-page-break" />

          {/* 2. Walkthrough */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">2. Step-by-Step Walkthrough</h2>
            <div className="space-y-6">
              {guide.steps.map((s) => (
                <div key={s.step_number} className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-950">
                    Step {s.step_number}: {s.title} ({s.timestamp})
                  </h3>
                  <p className="text-xs text-slate-800 leading-relaxed pl-4">{s.instructions}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pl-4 pt-1">
                    <div className="text-slate-600">
                      <span className="font-bold">Why it matters:</span> {s.why_it_matters}
                    </div>
                    <div className="text-amber-800">
                      <span className="font-bold">Avoid:</span> {s.common_mistake}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="print-page-break" />

          {/* 3. Concepts */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">3. Key Concepts Explained</h2>
            <div className="grid grid-cols-1 gap-4">
              {guide.key_concepts.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-xs font-bold text-indigo-950">{c.concept}</h3>
                  <p className="text-xs text-slate-700">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Pitfalls & Mistakes */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">4. Pitfalls & Mistakes to Avoid</h2>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-2">
              {guide.mistakes_to_avoid.map((m, idx) => (
                <li key={idx}>
                  <span className="font-semibold text-rose-950">{m.mistake}:</span> {m.how_to_avoid}
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Practice Tasks */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">5. Practice Tasks</h2>
            <div className="space-y-3">
              {guide.practice_tasks.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-950">{idx + 1}. {t.task}</h3>
                  <p className="text-xs text-slate-700">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="print-page-break" />

          {/* 6. Checklist */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">6. Project Checklist & Milestones</h2>
            <ul className="space-y-2">
              {guide.checklist.map((item) => (
                <li key={item.id} className="text-xs text-slate-800 flex items-start gap-2">
                  <span className="border border-slate-400 w-3.5 h-3.5 inline-block shrink-0 mt-0.5" />
                  <span>[{item.category}] {item.item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. Quiz */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">7. Interactive Quiz (Self-Assessment)</h2>
            <div className="space-y-4">
              {guide.quiz.map((q, idx) => (
                <div key={q.id} className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-950">Q{idx + 1}: {q.question}</h3>
                  <ul className="list-disc list-inside pl-4 text-xs text-slate-700">
                    {q.options.map(o => <li key={o}>{o}</li>)}
                  </ul>
                  <p className="text-[11px] text-slate-600 pl-4 italic">Correct Answer: {q.correct_answer}</p>
                  <p className="text-[11px] text-slate-600 pl-4">Explanation: {q.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 8. Flashcards */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-1 text-slate-900">8. Flashcards</h2>
            <div className="grid grid-cols-2 gap-4">
              {guide.flashcards.map((f, idx) => (
                <div key={f.id} className="border p-3 rounded-lg space-y-1">
                  <h3 className="text-xs font-bold text-indigo-900">Card {idx + 1}</h3>
                  <p className="text-xs font-semibold text-slate-800">Q: {f.front}</p>
                  <p className="text-xs text-slate-600">A: {f.back}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {exportType === 'walkthrough' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-1 text-slate-900">Project Walkthrough</h2>
          <div className="space-y-6">
            {guide.steps.map((s) => (
              <div key={s.step_number} className="space-y-2 border-b pb-4">
                <h3 className="text-sm font-bold text-slate-950">
                  Step {s.step_number}: {s.title} ({s.timestamp})
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed pl-4">{s.instructions}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pl-4 pt-1">
                  <div className="text-slate-600">
                    <span className="font-bold">Why it matters:</span> {s.why_it_matters}
                  </div>
                  <div className="text-amber-800">
                    <span className="font-bold">Avoid:</span> {s.common_mistake}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exportType === 'concepts' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-1 text-slate-900">Core Concepts & Exercises</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">💡 Key Concepts</h3>
            <div className="grid grid-cols-1 gap-4">
              {guide.key_concepts.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-950">{c.concept}</h4>
                  <p className="text-xs text-slate-700">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">🛑 Pitfalls to Avoid</h3>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-2">
              {guide.mistakes_to_avoid.map((m, idx) => (
                <li key={idx}>
                  <span className="font-semibold text-rose-950">{m.mistake}:</span> {m.how_to_avoid}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">🛠️ Hands-On Practice Tasks</h3>
            <div className="space-y-3">
              {guide.practice_tasks.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-950">{idx + 1}. {t.task}</h4>
                  <p className="text-xs text-slate-700">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {exportType === 'checklist' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-1 text-slate-900">Project Checklist & Milestones</h2>
          <ul className="space-y-3">
            {guide.checklist.map((item) => (
              <li key={item.id} className="text-xs text-slate-800 flex items-start gap-2 border-b pb-2">
                <span className="border border-slate-400 w-3.5 h-3.5 inline-block shrink-0 mt-0.5" />
                <span>[{item.category}] {item.item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {exportType === 'quiz' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-1 text-slate-900">Concept Mastery Quiz</h2>
          <div className="space-y-6">
            {guide.quiz.map((q, idx) => (
              <div key={q.id} className="space-y-2 border-b pb-4">
                <h3 className="text-sm font-bold text-slate-950">Q{idx + 1}: {q.question}</h3>
                <ul className="list-disc list-inside pl-4 text-xs text-slate-700 space-y-1">
                  {q.options.map(o => <li key={o}>{o}</li>)}
                </ul>
                <p className="text-[11px] text-slate-600 pl-4 italic pt-1">Correct Answer: {q.correct_answer}</p>
                <p className="text-[11px] text-slate-600 pl-4">Explanation: {q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {exportType === 'flashcards' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-1 text-slate-900">Active Recall Study Flashcards</h2>
          <div className="grid grid-cols-2 gap-4">
            {guide.flashcards.map((f, idx) => (
              <div key={f.id} className="border p-4 rounded-lg space-y-2">
                <h3 className="text-xs font-bold text-indigo-900">Card {idx + 1}</h3>
                <p className="text-xs font-semibold text-slate-800">Q: {f.front}</p>
                <p className="text-xs text-slate-600">A: {f.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
