import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, Lock, PlayCircle, Sparkles } from "lucide-react";
import { lessons, Lesson } from "@/data/lessons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const SPACE_FACTS = [
  "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate, but only 225 days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tonnes on Earth.",
  "The Milky Way is on a collision course with the Andromeda Galaxy, set to merge in approximately 4.5 billion years.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches combined.",
  "Saturn's moon Titan is the only moon in our Solar System with a thick atmosphere and liquid lakes on its surface.",
  "The Sun's core reaches temperatures of 15 million degrees Celsius — hot enough to drive nuclear fusion reactions.",
  "Light from the Sun takes 8 minutes and 20 seconds to reach Earth, but takes 100,000 years to travel from the core to the surface.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 350 years — it's wider than Earth itself.",
  "The observable universe is 93 billion light years across, but the universe itself may be infinite.",
  "Black holes don't suck — an object must cross the event horizon to be captured, just like any other gravitational body.",
  "Mars has the tallest volcano in the Solar System: Olympus Mons, standing 21km high — nearly 3 times the height of Everest.",
  "The Voyager 1 probe, launched in 1977, is now over 23 billion kilometres from Earth — in interstellar space.",
  "Europa, one of Jupiter's moons, likely has a liquid water ocean beneath its icy surface — a prime candidate for extraterrestrial life.",
  "The Big Bang didn't happen at a single point — it was an expansion of space itself from an extremely hot, dense state.",
  "Pulsars are spinning neutron stars that emit beams of radiation — some spin over 700 times per second.",
  "The James Webb Space Telescope can see galaxies from just 300 million years after the Big Bang.",
  "One million Earths could fit inside the Sun, yet the Sun is considered an average-sized star.",
  "Sound cannot travel through space — it requires a medium like air or water to propagate.",
  "The cosmic microwave background radiation is the faint glow from the Big Bang, still detectable today at -270.4°C.",
  "Astronauts grow up to 3% taller in space due to the decompression of spinal discs in microgravity."
];

export default function Education() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    document.title = "Learn — STELLARA";
    const saved = localStorage.getItem("cosmoscope_completed_lessons");
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const markCompleted = (id: string) => {
    if (!completedLessons.includes(id)) {
      const newCompleted = [...completedLessons, id];
      setCompletedLessons(newCompleted);
      localStorage.setItem("cosmoscope_completed_lessons", JSON.stringify(newCompleted));
    }
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
    if (activeLesson) {
      let allCorrect = true;
      activeLesson.quiz.forEach((q, i) => {
        if (quizAnswers[i] !== q.correctIndex) allCorrect = false;
      });
      if (allCorrect) {
        markCompleted(activeLesson.id);
      }
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  const getProgressForLevel = (level: string) => {
    const levelLessons = lessons.filter(l => l.level === level);
    const completed = levelLessons.filter(l => completedLessons.includes(l.id)).length;
    return (completed / levelLessons.length) * 100;
  };

  if (activeLesson) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" onClick={() => { setActiveLesson(null); resetQuiz(); }} className="mb-6 -ml-3 text-muted-foreground hover:text-white">
            ← Back to curriculum
          </Button>
          
          <Badge className="mb-4">{activeLesson.level}</Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 font-['Orbitron']">{activeLesson.title}</h1>
          
          <div className="space-y-6 text-lg text-gray-300 mb-12 leading-relaxed">
            {activeLesson.content.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <Card className="bg-primary/5 border-primary/20 mb-12">
            <CardHeader className="text-xl font-semibold text-primary font-['Orbitron'] border-b border-primary/10 pb-4">
              Key Facts
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {activeLesson.keyFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="border-t border-white/10 pt-12">
            <h2 className="text-2xl font-bold text-white mb-8 font-['Orbitron']">Knowledge Check</h2>
            <div className="space-y-10">
              {activeLesson.quiz.map((q, qIndex) => (
                <div key={qIndex} className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <p className="text-lg font-medium text-white mb-4">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, oIndex) => {
                      const isSelected = quizAnswers[qIndex] === oIndex;
                      const isCorrect = q.correctIndex === oIndex;
                      
                      let btnClass = "w-full justify-start text-left h-auto py-3 px-4 transition-all ";
                      
                      if (showQuizResults) {
                        if (isCorrect) btnClass += "bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/30";
                        else if (isSelected && !isCorrect) btnClass += "bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30";
                        else btnClass += "bg-white/5 border-white/10 opacity-50";
                      } else {
                        btnClass += isSelected ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10";
                      }

                      return (
                        <Button 
                          key={oIndex} 
                          variant="outline" 
                          className={btnClass}
                          onClick={() => !showQuizResults && setQuizAnswers(prev => ({...prev, [qIndex]: oIndex}))}
                          disabled={showQuizResults}
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </div>
                  {showQuizResults && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${quizAnswers[qIndex] === q.correctIndex ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              {!showQuizResults ? (
                <Button 
                  onClick={handleQuizSubmit} 
                  disabled={Object.keys(quizAnswers).length !== activeLesson.quiz.length}
                  className="w-full md:w-auto"
                >
                  Submit Answers
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetQuiz}>Try Again</Button>
                  <Button onClick={() => { setActiveLesson(null); resetQuiz(); }}>Return to Courses</Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold font-['Orbitron'] text-white">Learn</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Structured learning modules from basic planetary science to advanced astrophysics.</p>
      </div>

      <Card className="bg-white/5 backdrop-blur-sm border-[#4fc3f7]/30 mb-12">
        <CardContent className="p-6 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
          <div className="shrink-0 bg-[#4fc3f7]/20 p-3 rounded-full border border-[#4fc3f7]/50 mt-1">
            <Sparkles className="w-6 h-6 text-[#4fc3f7]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#4fc3f7] uppercase tracking-wider mb-2">Daily Space Fact</div>
            <p className="text-lg text-white font-medium leading-relaxed">{SPACE_FACTS[new Date().getDate() % SPACE_FACTS.length]}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="Beginner" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-12 bg-white/5 border border-white/10 p-1">
          {["Beginner", "Intermediate", "Advanced"].map(level => (
            <TabsTrigger key={level} value={level} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {level}
            </TabsTrigger>
          ))}
        </TabsList>

        {["Beginner", "Intermediate", "Advanced"].map(level => {
          const levelLessons = lessons.filter(l => l.level === level);
          const progress = getProgressForLevel(level);
          
          return (
            <TabsContent key={level} value={level} className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-white font-medium">{level} Mastery</span>
                    <span className="text-primary font-bold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {levelLessons.map((lesson, idx) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = level === "Intermediate" && getProgressForLevel("Beginner") < 100 
                                || level === "Advanced" && getProgressForLevel("Intermediate") < 100;

                  return (
                    <Card key={lesson.id} className={`bg-card/40 backdrop-blur-sm border-white/10 transition-all ${isLocked ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-primary/50 cursor-pointer group'}`} onClick={() => !isLocked && setActiveLesson(lesson)}>
                      <CardContent className="p-6 flex gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors">
                          {isLocked ? <Lock className="w-5 h-5 text-gray-500" /> : 
                           isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
                           <PlayCircle className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Module {idx + 1}</div>
                          <h3 className="text-xl font-bold text-white font-['Orbitron'] leading-tight mb-2 group-hover:text-primary transition-colors">{lesson.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2">{lesson.content[0]}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
