import React from 'react';
import './Table.css';

const Table = ({ 
  columns, 
  data, 
  emptyMessage = "No Data Found",
  className = '',
  onRowClick,
}) => {
  const renderCell = (column, row) => {
    if (column.renderCell) {
      return column.renderCell(column, row);
    }
    return row[column.accessor];
  };

  return (
    <div className="tableContainer">
      <table className={`customTable ${className}`}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="noDataMessage">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table; 