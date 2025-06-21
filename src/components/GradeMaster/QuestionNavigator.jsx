import React from 'react';

// Simple badge for question type
const QuestionTypeBadge = ({ questionType, isCompleted }) => {
  let color = 'gray';
  if (questionType.toLowerCase().includes('mcq')) color = 'blue';
  else if (questionType.toLowerCase().includes('written') || questionType.toLowerCase().includes('descriptive')) color = 'green';
  else if (questionType.toLowerCase().includes('program')) color = 'purple';
  else if (questionType.toLowerCase().includes('code')) color = 'purple';
  else if (questionType.toLowerCase().includes('true_false')) color = 'orange';
  else if (questionType.toLowerCase().includes('matching')) color = 'teal';
  else if (questionType.toLowerCase().includes('blank')) color = 'pink';
  return (
    <span style={{
      backgroundColor: color,
      color: 'white',
      borderRadius: '8px',
      padding: '2px 8px',
      fontSize: '0.8em',
      fontWeight: 600,
      opacity: isCompleted ? 1 : 0.5
    }}>{questionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
  );
};

const QuestionNavigator = ({
  questions,
  currentQuestionIndex,
  completionStatus,
  onQuestionSelect,
}) => {
  const answeredCount = Object.values(completionStatus).filter(Boolean).length;
  const remainingCount = questions.length - answeredCount;

  const mcqCount = questions.filter(q => q.type.toLowerCase().includes('mcq')).length;
  const writtenCount = questions.filter(q => q.type.toLowerCase().includes('written') || q.type.toLowerCase().includes('descriptive')).length;
  const codeCount = questions.filter(q => q.type.toLowerCase().includes('program') || q.type.toLowerCase().includes('code')).length;

  return (
    <div style={{height: '100%', background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column'}}>
      <div style={{borderBottom: '1px solid #f3f4f6', padding: '18px 18px 10px 18px'}}>
        <div style={{fontSize: '1.1em', fontWeight: 700, color: '#222'}}>Question Navigator</div>
      </div>
      <div style={{flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px'}}>
        {/* Status Section */}
        <div style={{display: 'flex', justifyContent: 'space-between', background: '#f9fafb', padding: '12px', borderRadius: '10px'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '1.3em', fontWeight: 700, color: '#16a34a'}}>{answeredCount}</div>
            <div style={{fontSize: '0.8em', color: '#666'}}>Answered</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '1.3em', fontWeight: 700, color: '#dc2626'}}>{remainingCount}</div>
            <div style={{fontSize: '0.8em', color: '#666'}}>Remaining</div>
          </div>
        </div>
        
        {/* Questions List */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <div style={{fontSize: '0.95em', fontWeight: 600, color: '#444', marginBottom: '7px'}}>Questions:</div>
          <div style={{
            flex: 1,
            minHeight: 0,
            maxHeight: '60vh',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fff'
          }}>
            <div style={{padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {questions.map((question, index) => {
                let bgColor = '#f9fafb';
                let borderColor = '#e5e7eb';
                if (index === currentQuestionIndex) {
                  bgColor = '#eff6ff';
                  borderColor = '#60a5fa';
                } else if (completionStatus[index]) {
                  bgColor = '#f0fdf4';
                  borderColor = '#6ee7b7';
                }
                return (
                  <div
                    key={index}
                    onClick={() => onQuestionSelect(index)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${borderColor}`,
                      background: bgColor,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: index === currentQuestionIndex ? '0 2px 8px rgba(59,130,246,0.07)' : 'none'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px'}}>
                      <span style={{fontWeight: 600, fontSize: '1em'}}>Q{index + 1}</span>
                      <QuestionTypeBadge questionType={question.type} isCompleted={!!completionStatus[index]} />
                    </div>
                    <div style={{fontSize: '0.85em', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {(question.text || '').substring(0, 60)}{(question.text && question.text.length > 60) ? '...' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator; 