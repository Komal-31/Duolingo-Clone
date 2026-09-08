# Duolingo-Clone

Build a functional clone of the Duolingo web application that replicates Duolingo's design, user 
experience, and core lesson and gamification workflows. 
The platform should let a learner move through a skill tree / learning path, complete lessons 
made of varied interactive exercises, earn XP and maintain a streak, lose and regain hearts, 
and track progress, all within the playful, gamified interface of the original Duolingo app. 


Core Features (Must Have) 
1. Learning Path / Skill Tree 
Recreate the Duolingo home path. 
• A visual path/tree of units and skills with lock/unlock progression 
• Completed vs available vs locked states 
• Progress rings/crowns per skill 
• Top bar showing streak, XP, hearts, and (mocked) gems 
2. Lesson Player (the core loop) 
Implement a lesson made of a sequence of exercises. 
• Multiple exercise types: multiple choice, translate (word bank/tap-the-words), match pairs, 
fill in the blank, and type-the-answer 
• Immediate correct/incorrect feedback with the signature feedback bar 
• Progress bar across the lesson 
• Hearts: lose one on a wrong answer; lesson end/failure handled 
• Award XP and mark the skill's progress on completion 
3. Gamification & Progress 
• Streak counter that increments on daily activity (day logic can be simulated/testable) 
• XP totals and a simple leaderboard (can be seeded) 
• Hearts regeneration over time or via a mocked “practice/refill” 
• Daily goal / XP goal indicator 
• All progress (XP, streak, hearts, completed skills) must persist per user 
4. Content Management 
• Course content (units, skills, lessons, exercises) stored in the database and seeded 
• A learner profile page with stats (streak, total XP, achievements) 
• All learner progress must persist 
5. Duolingo Experience 
The application should closely resemble the Duolingo experience, including: 
• Playful, colorful, gamified UI with mascot-style flourishes 
• The lesson player with animated feedback 
• Modals (lesson complete, out of hearts), toasts, and celebratory states 
• Path navigation and progress visuals 
• Settings placeholders 
