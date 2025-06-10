import React from 'react';
import './Table.css';

const Table = ({ 
  columns, 
  data, 
  emptyMessage = "No Data Found",
  className = '',
  onRowClick,
  renderCell
}) => {
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
                    {column.renderCell 
                      ? column.renderCell(column, row) 
                      : renderCell 
                      ? renderCell(column, row) 
                      : row[column.accessor]
                    }
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