const fs = require('fs');
const path = require('path');

const folderPath = 'c:\\Users\\LOQ\\Documents\\Bismillah AKPOL\\BelajarMengabdi\\External\\Source Soal\\Akademik\\Wawasan Kebangsaan';
const existingJsonPath = 'c:\\Users\\LOQ\\Documents\\Bismillah AKPOL\\BelajarMengabdi\\pages\\akademik\\wawasan-kebangsaan\\questions.json';

const filesToProcess = [
  'view-source_https___app.suksescat.com_link_11-wawasan-kebangsaan_.html',
  'view-source_https___app.suksescat.com_link_12-wawasan-kebangsaan_.html',
  'view-source_https___app.suksescat.com_link_13-wawasan-kebangsaan_.html',
  'view-source_https___app.suksescat.com_link_14-wawasan-kebangsaan_.html',
  'view-source_https___app.suksescat.com_link_15-wawasan-kebangsaan_.html'
];

let existingQuestions = [];
if (fs.existsSync(existingJsonPath)) {
  try {
    existingQuestions = JSON.parse(fs.readFileSync(existingJsonPath, 'utf8'));
  } catch (err) {
    console.error("Error reading existing questions.json:", err);
  }
}
console.log("Existing bank questions count:", existingQuestions.length);

const merged = [];
let currentId = 1; // We will assign sequential IDs to all questions

for (const fileName of filesToProcess) {
  const srcPath = path.join(folderPath, fileName);
  if (!fs.existsSync(srcPath)) {
    console.log(`Could not find file: ${fileName}`);
    continue;
  }
  
  console.log(`\nProcessing ${fileName}...`);
  const viewSourceContent = fs.readFileSync(srcPath, 'utf8');
  console.log("File length:", viewSourceContent.length);

  const lineContentRegex = /<td class="line-content">([\s\S]*?)<\/td>/g;
  let match;
  let lines = [];

  while ((match = lineContentRegex.exec(viewSourceContent)) !== null) {
    let line = match[1];
    line = line.replace(/<[^>]+>/g, '');
    line = line
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8211;/g, '–')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"');
    lines.push(line);
  }

  const originalHtml = lines.join('\n');
  console.log("Reconstructed HTML size:", originalHtml.length);

  // Parse answers JSON
  const jsonRegex = /json:\s*({[\s\S]*?})\s*}\s*}\s*\);/i;
  const jsonMatch = originalHtml.match(jsonRegex);
  let answersMap = {};

  if (jsonMatch) {
    try {
      answersMap = JSON.parse(jsonMatch[1]);
      console.log("Parsed answers JSON. Questions in JSON:", Object.keys(answersMap).length);
    } catch (e) {
      const fallbackRegex = /json:\s*({[\s\S]*?})\s*}\s*}\s*\)/;
      const fallbackMatch = originalHtml.match(fallbackRegex);
      if (fallbackMatch) {
        try {
          answersMap = JSON.parse(fallbackMatch[1]);
          console.log("Parsed answers JSON (fallback). Questions:", Object.keys(answersMap).length);
        } catch (err) {}
      }
    }
  } else {
    const partialRegex = /json:\s*({[\s\S]*?})\s*,\s*back_button/i;
    const partialMatch = originalHtml.match(partialRegex);
    if (partialMatch) {
      try {
        answersMap = JSON.parse(partialMatch[1]);
        console.log("Parsed answers JSON (partial). Questions:", Object.keys(answersMap).length);
      } catch (e) {}
    }
  }

  const parts = originalHtml.split('<li class="wpProQuiz_listItem"');
  let extractedCount = 0;
  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    const headerMatch = part.match(/class="wpProQuiz_header"[^>]*>\s*<span>(\d+)<\/span>/i);
    const qNum = headerMatch ? parseInt(headerMatch[1]) : i;
    
    const qTextStartIdx = part.indexOf('class="wpProQuiz_question_text"');
    if (qTextStartIdx === -1) continue;
    
    const openDivIdx = part.indexOf('>', qTextStartIdx);
    if (openDivIdx === -1) continue;
    
    let divCount = 1;
    let currentIdx = openDivIdx + 1;
    let qTextHtml = "";
    
    while (divCount > 0 && currentIdx < part.length) {
      const nextClose = part.indexOf('</div>', currentIdx);
      const nextOpen = part.indexOf('<div', currentIdx);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        divCount++;
        currentIdx = nextOpen + 4;
      } else {
        divCount--;
        if (divCount === 0) {
          qTextHtml = part.substring(openDivIdx + 1, nextClose);
        }
        currentIdx = nextClose + 6;
      }
    }
    
    const imgMatch = qTextHtml.match(/<img\b[^>]*src="([^"]+)"[^>]*>/i);
    const imageUrl = imgMatch ? imgMatch[1] : null;
    
    let cleanQText = qTextHtml
      .replace(/<img\b[^>]*>/gi, '') 
      .replace(/<p\b[^>]*>/gi, '')   
      .replace(/<\/p>/gi, '\n')      
      .replace(/<br\s*\/?>/gi, '\n')  
      .replace(/<[^>]+>/g, '')       
      .replace(/&#8230;/g, '...')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim()
      .replace(/\n+/g, '\n');        
    
    const qListMatch = part.match(/class="wpProQuiz_questionList"[^>]*data-question_id="(\d+)"/i);
    if (!qListMatch) continue;
    const qId = qListMatch[1];
    
    const choiceParts = part.split('<li class="wpProQuiz_questionListItem"');
    const options = {};
    
    for (let j = 1; j < choiceParts.length; j++) {
      const choicePart = choiceParts[j];
      
      const rightBracketIdx = choicePart.indexOf('>');
      let choiceHtml = rightBracketIdx !== -1 ? choicePart.substring(rightBracketIdx + 1) : choicePart;
      
      const liCloseIdx = choiceHtml.indexOf('</li>');
      if (liCloseIdx !== -1) {
        choiceHtml = choiceHtml.substring(0, liCloseIdx);
      }
      
      let cleanChoiceText = choiceHtml
        .replace(/<input\b[^>]*>/gi, '')
        .replace(/<label\b[^>]*>/gi, '')
        .replace(/<\/label>/gi, '')
        .replace(/<span\b[^>]*>[\s\S]*?<\/span>/gi, '') 
        .replace(/<[^>]+>/g, '') 
        .replace(/&#8230;/g, '...')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .trim();
        
      const choiceImgMatch = choiceHtml.match(/<img\b[^>]*src="([^"]+)"[^>]*>/i);
      if (choiceImgMatch) {
        cleanChoiceText = `[Gambar] ${choiceImgMatch[1]}`;
      }
      
      if (j - 1 < optionLetters.length) {
        const letter = optionLetters[j - 1];
        options[letter] = cleanChoiceText;
      }
    }
    
    let correctAnswer = "";
    const qAnswerData = answersMap[qId];
    if (qAnswerData && qAnswerData.correct) {
      const correctIdx = qAnswerData.correct.indexOf(1);
      if (correctIdx !== -1 && correctIdx < optionLetters.length) {
        correctAnswer = optionLetters[correctIdx];
      }
    }
    
    merged.push({
      id: currentId++,
      question: cleanQText,
      image: imageUrl || null,
      options: options,
      correctAnswer: correctAnswer
    });
    extractedCount++;
  }
  
  console.log(`Extracted ${extractedCount} questions from ${fileName}.`);
}

// Deduplicate questions to prevent double adding if running multiple times
const uniqueQuestions = [];
const seenQuestions = new Set();

// First add the parsed ones
for (const q of merged) {
  const normText = q.question.toLowerCase().replace(/\s+/g, '');
  if (!seenQuestions.has(normText)) {
    seenQuestions.add(normText);
    uniqueQuestions.push(q);
  }
}

// Then add the original existing ones if not already present
let duplicateExisting = 0;
for (const q of existingQuestions) {
  const normText = q.question.toLowerCase().replace(/\s+/g, '');
  if (!seenQuestions.has(normText)) {
    seenQuestions.add(normText);
    q.id = uniqueQuestions.length + 1; // Assign new sequential ID
    uniqueQuestions.push(q);
  } else {
    duplicateExisting++;
  }
}

console.log(`\nDeduplication summary:`);
console.log(`Total unique questions: ${uniqueQuestions.length}`);
console.log(`Original existing questions discarded as duplicates: ${duplicateExisting}`);

fs.writeFileSync(existingJsonPath, JSON.stringify(uniqueQuestions, null, 2), 'utf8');
console.log("Saved updated questions to", existingJsonPath);
