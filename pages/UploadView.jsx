import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/router';

function UploadAndViewPage() {
  const router = useRouter();
  const { loggedInUsername } = router.query;
  const localStorageKey = 'uploadedData';
  const getDataFromLocalStorage = () => {
    if (typeof localStorage !== 'undefined') {
      const storedData = localStorage.getItem(localStorageKey);
      console.log('Data retrieved from local storage:', storedData);
      return storedData ? JSON.parse(storedData) : [];
    } else {
      return [];
    }
  };
  const saveDataToLocalStorage = (data) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    }
  };
  const [uploadedData, setUploadedData] = useState([]);
  const updateData = (newData) => {
    setUploadedData(newData);
    saveDataToLocalStorage(newData);
  };
  const [uploadStatus, setUploadStatus] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [clearStatus, setClearStatus] = useState('');
  const [editData, setEditData] = useState({});
  const [formData, setFormData] = useState({
    identifier: '',
    code: '',
    start_date: '',
    end_date: '',
    numeric_value: '',
    percentage: '',
    another_numeric_value: '',
    date: '',
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
  
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        setUploadStatus('Upload successful');
        const data = await response.json();
        updateData(data.data.map((item, index) => ({ id: index + 1, data: item })));
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/getData');
      if (response.ok) {
        const data = await response.json();
        setUploadedData(data.map((item, index) => ({ id: index + 1, data: item })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (!loggedInUsername) {
      // Redirect the user to the login page
      router.push('/login'); // Change '/login' to the actual URL of your login page
    } else {
      // Set the initial state with data from local storage
      const dataFromLocalStorage = getDataFromLocalStorage();
      setUploadedData(dataFromLocalStorage);
    }
  }, [loggedInUsername, router]);

  const handleLogout = () => {
    // Clear local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(localStorageKey);
    }

    // Redirect to the login page
    router.push('/login'); // Change '/login' to the actual URL of your login page
  };

  const tableFields = [
    'identifier',
    'code',
    'start_date',
    'end_date',
    'numeric_value',
    'percentage',
    'another_numeric_value',
    'date',
  ];

  const handleFormChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      setClearStatus('');

      const response = await fetch('/api/clearData', {
        method: 'POST',
      });

      if (response.ok) {
        setClearStatus('Data cleared successfully');
      } else {
        setClearStatus('Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setClearStatus('Error clearing data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInsert = async () => {
    try {
      // Create an object with field names as keys and values from formData
      const insertedRowData = {
        identifier: formData.identifier,
        code: formData.code,
        start_date: formData.start_date,
        end_date: formData.end_date,
        numeric_value: formData.numeric_value,
        percentage: formData.percentage,
        another_numeric_value: formData.another_numeric_value,
        date: formData.date,
      };
  
      // Check if the data is already in the list
      const isDuplicate = uploadedData.some((item) =>
        JSON.stringify(item.data) === JSON.stringify(insertedRowData)
      );
  
      if (isDuplicate) {
        setUploadStatus('Row already exists');
      } else {
        const response = await fetch('/api/insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insertedRowData), // Send the object, not formData
        });
  
        if (response.ok) {
          const responseData = await response.json(); // Parse the response JSON
          setUploadStatus(responseData.message); // Use the message from the response
  
          // Extract the inserted row data from the response
          const insertedRowData = responseData.insertedRowData;
  
          // Reset the form data
          setFormData({
            identifier: '',
            code: '',
            start_date: '',
            end_date: '',
            numeric_value: '',
            percentage: '',
            another_numeric_value: '',
            date: '',
          });
  
          // Log the list of rows with the new inserted row at the bottom
          console.log('List of Rows (Updated):', [...uploadedData, insertedRowData]);
  
          // Update the state with the updated data, including the new row
          setUploadedData((prevData) => {
            const newData = [...prevData, insertedRowData];
            saveDataToLocalStorage(newData); // Save to local storage
            return newData;
          });
        } else {
          setUploadStatus('Insert failed');
        }
      }
    } catch (error) {
      console.error('Error inserting row:', error);
      setUploadStatus('Error inserting row');
    }
  };

  const handleEdit = (id, originalData) => {
    if (typeof originalData === 'string') {
      // Convert the original data string into an object
      const originalDataArray = originalData.split('|').filter((value) => value.trim() !== '');
      const originalDataObject = {};
  
      tableFields.forEach((field, index) => {
        originalDataObject[field] = originalDataArray[index];
      });
  
      // Initialize editData with the original data for the selected row
      setEditData({ ...originalDataObject });
  
      // Set the editing row ID
      setEditingRowId(id);
    } else {
      // Handle the case where originalData is not a string (e.g., show an error message)
      console.error('Invalid originalData:', originalData);
    }
  };
  
  const handleUpdate = async (id) => {
    try {
      const rowToEdit = uploadedData.find((item) => item.id === id);
      const originalData = rowToEdit.data.split('|').filter((value) => value.trim() !== '');
  
      // Create an object to track changes
      const updatedData = {};
  
      tableFields.forEach((field, index) => {
        const originalValue = originalData[index];
        const editedValue = editData[field];
  
        // Populate updatedData with the edited or original value
        updatedData[field] = editedValue !== undefined ? editedValue : originalValue;
      });
  
      // Call the edit endpoint to log the edited data
      const response = await fetch(`/api/update?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData), // Send the updated data
      });
  
      if (response.ok) {
        // Extract only the fields you want to display in the console log
        const logData = {
          identifier: updatedData.identifier,
          code: updatedData.code,
          start_date: updatedData.start_date,
          end_date: updatedData.end_date,
          numeric_value: updatedData.numeric_value,
          percentage: updatedData.percentage,
          another_numeric_value: updatedData.another_numeric_value,
          date: updatedData.date,
          id: id,
        };
  
        // Log the change message in the desired format
        console.log(`id: ${id}   ${Object.values(logData).join('|')}|`);
  
        // Update the uploadedData state with the updated row
        setUploadedData((prevData) => {
          return prevData.map((item) => {
            if (item.id === id) {
              // Merge the original data with the updated data
              const mergedDataArray = tableFields.map((field) => updatedData[field]);
    
              // Join the merged data into a string
              const mergedDataString = mergedDataArray.join('|');
    
              // Save the updated data to local storage
              saveDataToLocalStorage(prevData.map((dataItem) => {
                if (dataItem.id === id) {
                  return { ...dataItem, data: mergedDataString };
                }
                return dataItem;
              }));
    
              return { ...item, data: mergedDataString };
            }
            return item;
          });
        });

        setUploadStatus('Row updated successfully');
        setEditingRowId(null); // Exit editing mode after updating the state
      } else {
        setUploadStatus('Update failed');
      }
    } catch (error) {
      console.error('Error updating row:', error);
      setUploadStatus('Error updating row');
    }
  };
  

  const handleExportToPdf = async () => {
    try {
      // Prompt the user for their Gmail email address
      const recipientEmail = prompt('Enter your Gmail email address:');
  
      if (recipientEmail) {
        console.log('Email:', recipientEmail);
  
        // Send the email to your backend along with a request to fetch the generated PDF
        const response = await fetch('/api/send-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail, // Pass the recipientEmail to the backend
          }),
        });
  
        if (response.ok) {
          console.log('Email sent successfully');
          alert('Email sent successfully');
        } else {
          console.error('Email sending failed');
          alert('Email sending failed');
        }
      } else {
        alert('Email is required');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    }
  };

  const handleExportToCSV = async () => {
    try {
      // Prompt the user for their Gmail email address
      const recipientEmail = prompt('Enter your Gmail email address:');

      if (recipientEmail) {
        console.log('Email:', recipientEmail);

        // Send the email to your backend along with a request to fetch the generated PDF
        const response = await fetch('/api/send-csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail, // Pass the recipientEmail to the backend
          }),
        });

        if (response.ok) {
          console.log('Email sent successfully');
          alert('Email sent successfully');
        } else {
          console.error('Email sending failed');
          alert('Email sending failed');
        }
      } else {
        alert('Email is required');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    }
    };

    const handleExportToJSON = async () => {
      try {
        // Prompt the user for their Gmail email address
        const recipientEmail = prompt('Enter your Gmail email address:');

        if (recipientEmail) {
          console.log('Email:', recipientEmail);

          // Send the email to your backend along with a request to fetch the generated PDF
          const response = await fetch('/api/send-json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipientEmail, // Pass the recipientEmail to the backend
            }),
          });

          if (response.ok) {
            console.log('Email sent successfully');
            alert('Email sent successfully');
          } else {
            console.error('Email sending failed');
            alert('Email sending failed');
          }
        } else {
          alert('Email is required');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Error sending email');
      }
    }

    const handleCancelEdit = () => {
      setEditingRowId(null); // Exit editing mode for this row
    };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploadStatus('Row deleted successfully');
        setUploadedData((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        setUploadStatus('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      setUploadStatus('Error deleting row');
    }
  };

  return (
    <div className="bg-gray-100 p-4">
      {loggedInUsername && (
        <div className="text-gray-500 text-sm absolute top-0 right-0 mr-4 mt-2">
          Logged in as {loggedInUsername}
          <button
            onClick={handleLogout}
            className="ml-2 text-blue-500 underline cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
      <h2 className="text-3xl font-bold mb-4">Main Page</h2>
      <div {...getRootProps()} className="border-dashed border-2 border-gray-400 p-4 mb-4 rounded-lg">
        <input {...getInputProps()} className="hidden" />
        <p className="text-gray-600 text-center">Drag&drop testdata.unl file here, or click to select a file</p>
        </div>
    {uploadStatus && <p className="text-green-600">{uploadStatus}</p>}
    <div>
      <h3 className="text-2xl font-semibold">Inserted Data:</h3>
      <table className="mt-4 w-full">
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Code</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Numeric Value</th>
            <th>Percentage</th>
            <th>Another Numeric Value</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
{uploadedData
  .filter((item) => typeof item.data === 'string' && item.data.trim() !== '')
  .map((item) => (
    <tr key={item.id} className="mb-4">
      {editingRowId === item.id ? (
        <React.Fragment>
          {tableFields.map((field, index) => (
            <td key={index} className="px-2">
              <input
                type="text"
                value={editData[field]}
                onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                placeholder={field.replace(/_/g, ' ')}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
              />
            </td>
          ))}
          <td className="px-2">
            <button onClick={() => handleUpdate(item.id)} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg mr-2">
              Save
            </button>
            <button onClick={() => setEditingRowId(null)} className="bg-gray-300 hover:bg-gray-400 font-semibold py-2 px-4 rounded-lg">
              Cancel
            </button>
          </td>
        </React.Fragment>
      ) : (
        <React.Fragment>
          {item.data.split('|')
            .filter((value, index) => value.trim() !== '' && !tableFields.includes('inserted_at')) // Exclude the 'inserted_at' field
            .map((value, index) => (
              <td key={index} className="px-2">
                {value}
              </td>
            ))}
          <td className="px-2">
            <button onClick={() => handleEdit(item.id, item.data)} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg mr-2">
              Edit
            </button>
            <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg">
              Delete
            </button>
          </td>
        </React.Fragment>
      )}
    </tr>
  ))}
        </tbody>
      </table>
    </div>
      <div>
        <h3 className="text-2xl font-semibold">Insert New Row:</h3>
        <form className="mt-4">
          <input
            type="text"
            name="identifier"
            placeholder="Identifier"
            value={formData.identifier}
            onChange={(e) => handleFormChange(e, 'identifier')}
          />

          <input
            type="text"
            name="code"
            placeholder="Code"
            value={formData.code}
            onChange={(e) => handleFormChange(e, 'code')}
          />

          <input
            type="text"
            name="start_date"
            placeholder="Start Date"
            value={formData.start_date}
            onChange={(e) => handleFormChange(e, 'start_date')}
          />

          <input
            type="text"
            name="end_date"
            placeholder="End Date"
            value={formData.end_date}
            onChange={(e) => handleFormChange(e, 'end_date')}
          />

          <input
            type="text"
            name="numeric_value"
            placeholder="Numeric Value"
            value={formData.numeric_value}
            onChange={(e) => handleFormChange(e, 'numeric_value')}
          />

          <input
            type="text"
            name="percentage"
            placeholder="Percentage"
            value={formData.percentage}
            onChange={(e) => handleFormChange(e, 'percentage')}
          />

          <input
            type="text"
            name="another_numeric_value"
            placeholder="Another Numeric Value"
            value={formData.another_numeric_value}
            onChange={(e) => handleFormChange(e, 'another_numeric_value')}
          />

          <input
            type="text"
            name="date"
            placeholder="Date"
            value={formData.date}
            onChange={(e) => handleFormChange(e, 'date')}
          />
          <button type="button" onClick={handleInsert} className="bg-green-500 text-white px-2 py-1 rounded">
            Insert
          </button>
          <div>
            <p>example: 8501706|DQVG|06/01/2018|06/30/2018|100|%|999|06/30/2018|</p>
            <p>example: identifier|code|start date|end date|numeric value|percentage|another numeric value|date|
            </p>
          </div>
        </form>
      </div>
      <div className="export-options mt-4">
        <div>
          <h3 className="text-2xl font-semibold">Export to PDF:</h3>
          <button onClick={handleExportToPdf} className="bg-blue-500 text-white px-2 py-1 rounded">
            Export as PDF
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">Export to CSV:</h3>
          <button onClick={handleExportToCSV} className="bg-blue-500 text-white px-2 py-1 rounded">
            Export as CSV
          </button>
        </div>
        <div>
          <h3 className="text-2xl font-semibold">Export to JSON:</h3>
          <button onClick={handleExportToJSON} className="bg-blue-500 text-white px-2 py-1 rounded">
            Export as JSON
          </button>
        </div>
      </div>
      <div className="mt-4">
        <button onClick={handleClearData} disabled={isClearing} className="bg-red-500 text-white px-2 py-1 rounded">
          Clear Data
        </button>
        {clearStatus && <p className="text-red-600">{clearStatus}</p>}
      </div>
      <d>
        <p>
          only for clearing data for table called data
        </p>
      </d>
    </div>
  );
}

export async function getServerSideProps(context) {
  // Fetch the loggedInUsername from the server-side context
  const { query } = context;
  const loggedInUsername = query.loggedInUsername || null;

  return {
    props: {
      loggedInUsername,
    },
  };
}

export default UploadAndViewPage;
