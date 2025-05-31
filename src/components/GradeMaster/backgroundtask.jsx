const BackgroundTasksPanel = ({ backgroundTasks }) => {
  if (backgroundTasks.length === 0) return null;

  return (
    <div className="background-tasks-panel" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '300px',
      zIndex: 999
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Background Tasks</h4>
      {backgroundTasks.map(task => (
        <div 
          key={task.id} 
          className={`task-item ${task.status}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}
        >
          <div className="task-info">
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {task.fileName}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: task.status === 'processing' ? '#007bff' : 
                     task.status === 'completed' ? '#28a745' : '#dc3545'
            }}>
              {task.status}
            </div>
          </div>
          {task.status === 'processing' && (
            <div className="task-progress">
              <div className="spinner" style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};