import { Note, Quiz, StudyPlan } from '../types';

export function downloadTxt(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function printAsPdf(title: string, bodyHtml: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF documents.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 26px; }
          h2 { color: #3730a3; margin-top: 24px; font-size: 20px; border-bottom: 1px solid #f1f5f9; }
          h3 { color: #1e1b4b; margin-top: 18px; font-size: 16px; }
          pre, code { background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          pre { padding: 12px; overflow-x: auto; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 6px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #e0e7ff; color: #4338ca; margin-right: 6px; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${bodyHtml}
        <div class="footer">
          Generated with StudyMate AI — Your Intelligent College Study Partner
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Formatters for Notes
export function exportNoteTxt(note: Note) {
  const txt = `=====================================================
${note.title.toUpperCase()}
Topic: ${note.topic}
Difficulty: ${note.difficulty} | Length: ${note.length}
Created: ${new Date(note.createdAt).toLocaleDateString()}
=====================================================

${note.content}

-----------------------------------------------------
Exported from StudyMate AI
`;
  downloadTxt(`${note.topic.replace(/\s+/g, '_')}_notes`, txt);
}

export function exportNotePdf(note: Note) {
  // Convert markdown headings/bullets to basic HTML for clean print
  const cleanBody = note.content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '<br/><br/>');

  const html = `
    <h1>${note.title}</h1>
    <p>
      <span class="badge">${note.topic}</span>
      <span class="badge">${note.difficulty}</span>
      <span class="badge">${note.length} Detail</span>
    </p>
    <hr style="border:0; border-top:1px solid #e2e8f0; margin: 20px 0;"/>
    <div>${cleanBody}</div>
  `;
  printAsPdf(note.title, html);
}

// Formatters for Quizzes
export function exportQuizTxt(quiz: Quiz, includeAnswers = true) {
  let txt = `=====================================================
QUIZ: ${quiz.title.toUpperCase()}
Topic: ${quiz.topic} | Difficulty: ${quiz.difficulty} | Type: ${quiz.questionType}
Questions: ${quiz.questions?.length || quiz.questionsCount}
=====================================================

`;

  (quiz.questions || []).forEach((q, idx) => {
    txt += `Q${idx + 1}: ${q.question}\n`;
    q.options.forEach((opt, oIdx) => {
      const letter = String.fromCharCode(65 + oIdx);
      txt += `  [${letter}] ${opt}\n`;
    });

    if (includeAnswers && q.correctAnswer) {
      txt += `  --> Correct Answer: ${q.correctAnswer}\n`;
      if (q.explanation) {
        txt += `  --> Explanation: ${q.explanation}\n`;
      }
    }
    txt += '\n';
  });

  txt += `-----------------------------------------------------
Exported from StudyMate AI
`;
  downloadTxt(`${quiz.topic.replace(/\s+/g, '_')}_quiz`, txt);
}

export function exportQuizPdf(quiz: Quiz, includeAnswers = true) {
  let questionsHtml = '';
  (quiz.questions || []).forEach((q, idx) => {
    questionsHtml += `
      <div style="margin-bottom: 24px; padding: 12px; background: #f8fafc; border-radius: 8px;">
        <p style="font-weight: bold; margin-bottom: 8px;">Q${idx + 1}: ${q.question}</p>
        <ul style="list-style-type: none; padding-left: 0;">
          ${q.options
            .map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              return `<li style="padding: 4px 8px; margin: 4px 0; background: white; border: 1px solid #e2e8f0; border-radius: 4px;"><strong>[${letter}]</strong> ${opt}</li>`;
            })
            .join('')}
        </ul>
        ${
          includeAnswers && q.correctAnswer
            ? `<div style="margin-top: 10px; font-size: 13px; color: #166534; background: #dcfce7; padding: 8px; border-radius: 4px;">
                <strong>Correct Answer:</strong> ${q.correctAnswer}<br/>
                <em>${q.explanation || ''}</em>
              </div>`
            : ''
        }
      </div>
    `;
  });

  const html = `
    <h1>${quiz.title}</h1>
    <p>
      <span class="badge">Topic: ${quiz.topic}</span>
      <span class="badge">Difficulty: ${quiz.difficulty}</span>
      <span class="badge">${quiz.questionType}</span>
    </p>
    <div style="margin-top: 24px;">
      ${questionsHtml}
    </div>
  `;
  printAsPdf(quiz.title, html);
}

// Formatters for Study Plans
export function exportStudyPlanTxt(plan: StudyPlan) {
  let txt = `=====================================================
STUDY PLAN: ${plan.title.toUpperCase()}
Subject: ${plan.subject} | Level: ${plan.knowledgeLevel} | Difficulty: ${plan.difficulty}
Daily Time: ${plan.dailyTimeMinutes} minutes | Duration: ${plan.durationDays} days
Progress: ${plan.progressPercent}% Completed
=====================================================

`;

  (plan.days || []).forEach((day) => {
    txt += `[DAY ${day.dayNumber}] ${day.title} ${day.isCompleted ? '(COMPLETED)' : ''}\n`;
    txt += `  Topics: ${day.topics.join(', ')}\n`;
    txt += `  Duration: ${day.durationMinutes} minutes\n`;
    txt += `  - Learning: ${day.learningActivity}\n`;
    txt += `  - Practice: ${day.practiceActivity}\n`;
    txt += `  - Revision: ${day.revisionActivity}\n`;
    txt += `  - Quiz/Review: ${day.quizReview}\n\n`;
  });

  txt += `-----------------------------------------------------
Exported from StudyMate AI
`;
  downloadTxt(`${plan.subject.replace(/\s+/g, '_')}_study_plan`, txt);
}

export function exportStudyPlanPdf(plan: StudyPlan) {
  let daysHtml = '';
  (plan.days || []).forEach((day) => {
    daysHtml += `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
          <h3 style="margin: 0; color: #4338ca;">Day ${day.dayNumber}: ${day.title}</h3>
          <span class="badge" style="background: ${day.isCompleted ? '#dcfce7' : '#f1f5f9'}; color: ${day.isCompleted ? '#166534' : '#475569'};">
            ${day.isCompleted ? '✓ Completed' : `${day.durationMinutes} mins`}
          </span>
        </div>
        <p style="margin: 8px 0; font-size: 13px; color: #64748b;"><strong>Topics:</strong> ${day.topics.join(', ')}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 13px;">
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
            <strong>📖 Learning:</strong><br/>${day.learningActivity}
          </div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
            <strong>✍️ Practice:</strong><br/>${day.practiceActivity}
          </div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
            <strong>🔄 Revision:</strong><br/>${day.revisionActivity}
          </div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px;">
            <strong>🎯 Quiz/Review:</strong><br/>${day.quizReview}
          </div>
        </div>
      </div>
    `;
  });

  const html = `
    <h1>${plan.title}</h1>
    <p>
      <span class="badge">${plan.subject}</span>
      <span class="badge">${plan.durationDays} Days</span>
      <span class="badge">${plan.dailyTimeMinutes} min/day</span>
      <span class="badge">Progress: ${plan.progressPercent}%</span>
    </p>
    <div style="margin-top: 24px;">
      ${daysHtml}
    </div>
  `;
  printAsPdf(plan.title, html);
}
