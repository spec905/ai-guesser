# ai-guesser
A 20 Questions style game ,the AI secretly thinks of something, and you try to guess it by asking up to 20 yes/no questions
# How it works
*Pick a category and a difficulty u want 
*Ask yes/no questions, one at a time. The AI answers Yes / No / Probably / I don't know, and stays consistent with everything it's already said.
*You get one hint per game (costs 2 questions).
Guess anytime by clicking on the Guess button
***Score is based on how many questions u used:
1–5	⭐⭐⭐⭐⭐	100
6–10	⭐⭐⭐⭐	80
11–15	⭐⭐⭐	60
16–19	⭐⭐	40
20	⭐	20
Failed	💀	0
# Tech used
HTML / CSS / JavaScript
Groq API (for the AI's answers)
Vercel serverless function (api/ai.js) to keep the API key private
# installation
No installation needed just use it in a browser [https://spec905.github.io/ai-guesser/](https://ai-guesser-gbdthq4st-ai-guesser.vercel.app/)
# how to set it up locally
make sure that Node.js in installed
download the repo https://github.com/spec905/ai-guesser.git
in your code editor terminal type vercel dev
choose the project file
then " Pull development environment variables into .env.local?" write y
this is how your terminal will looks like
PS C:\Users\hp\Desktop\ai-guesser> vercel dev
Vercel CLI 58.4.4 (Node.js 20.20.2)

  Directory       ~\Desktop\ai-guesser

  Team            ai-guesser
? Which project? ai-guesser (linked by git)

✓ Linked          ai-guesser/ai-guesser

? Pull development environment variables into .env.local? yes
> Downloading `development` environment variables for ai-guesser/ai-guesser

✓ Created         .env.local file
> Ready! Available at http://localhost:3000

then just click on  http://localhost:3000
