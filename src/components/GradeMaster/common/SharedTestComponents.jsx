import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Page Header Component
export const PageHeader = ({ title, onBack }) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          <h2>{title}</h2>
          <button
            className="btn btn-outline-secondary"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Progress Steps Component
export const ProgressSteps = ({ currentStep, steps }) => {
  return (
    <div className="progress-steps mb-4">
      <div className="d-flex justify-content-between">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`d-flex align-items-center ${
              currentStep >= step.number ? 'text-primary' : 'text-muted'
            }`}
          >
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                currentStep >= step.number ? 'bg-primary text-white' : 'bg-light'
              }`}
              style={{ width: '35px', height: '35px' }}
            >
              {step.number}
            </div>
            <span className="ms-2">{step.label}</span>
            {step.number < steps.length && (
              <div
                className={`mx-3 flex-grow-1 ${
                  currentStep > step.number ? 'border-primary' : 'border-secondary'
                }`}
                style={{ height: '2px', borderTop: '2px solid' }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
// Sortable Question Item Component
export const SortableQuestionItem = ({ question, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
      {...attributes}
      {...listeners}
    >
      <div className="d-flex align-items-center">
        <i className="fas fa-grip-vertical me-2 text-muted" style={{ cursor: 'grab' }}></i>
        <div>
          <strong>Q{index + 1}:</strong> {question.questionText || question.text}
          <span className="ms-2 badge bg-primary">{question.type}</span>
          <span className="ms-2 badge bg-secondary">{question.marks} marks</span>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline-danger btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(question.id);
        }}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
}; 
