import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Swal from 'sweetalert2';

interface CodingChallengeProps {
  task: Task;
  onSubmit: (code: string) => void;
}

const CodingChallenge: FC<CodingChallengeProps> = ({ task, onSubmit }) => {
  const getStoredCode = () => {
    const storedCode = localStorage.getItem(`code_progress_${task.id}`);
    return storedCode || '';
  };

  const [code, setCode] = useState(getStoredCode());
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [liveOutput, setLiveOutput] = useState('');

  useEffect(() => {
    localStorage.setItem(`code_progress_${task.id}`, code);
  }, [code, task.id]);

  const cleanCode = (code: string) => {
    return code
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const validateCode = (userCode: string, template: string) => {
    const cleanUserCode = cleanCode(userCode);
    const cleanTemplate = cleanCode(template || '');
    
    const functionNameRegex = /function\s+(\w+)/;
    const userFunctionMatch = cleanUserCode.match(functionNameRegex);
    const templateFunctionMatch = cleanTemplate.match(functionNameRegex);

    if (!userFunctionMatch || !templateFunctionMatch) {
      return {
        isValid: false,
        message: 'Function not found or function name does not match template'
      };
    }

    if (userFunctionMatch[1] !== templateFunctionMatch[1]) {
      return {
        isValid: false,
        message: `Function name must be "${templateFunctionMatch[1]}"`
      };
    }

    const paramRegex = /function\s+\w+\s*\((.*?)\)/;
    const userParams = cleanUserCode.match(paramRegex)?.[1].split(',').map(p => p.trim());
    const templateParams = cleanTemplate.match(paramRegex)?.[1].split(',').map(p => p.trim());

    if (!userParams || !templateParams || userParams.length !== templateParams.length) {
      return {
        isValid: false,
        message: 'Function parameter does not match template'
      };
    }

    return { isValid: true, message: '' };
  };

  const runLiveCode = (currentCode: string) => {
    try {
      let output = '';
      const originalLog = console.log;
      console.log = (...args) => {
        output += args.join(' ') + '\n';
      };

      const userFunction = new Function(currentCode);
      userFunction();

      console.log = originalLog;
      setLiveOutput(output);
    } catch (error) {
      setLiveOutput(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      runLiveCode(code);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [code]);

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Validasi kode terlebih dahulu
      const validation = validateCode(code, task.template || '');
      if (!validation.isValid) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: validation.message
        });
        setIsRunning(false);
        return;
      }

      const testCases = JSON.parse(task.test_cases || '[]');
      let allTestsPassed = true;
      let testOutput = '';

      testOutput += `Your Output:\n${liveOutput}\n\n`;
      testOutput += 'Test Cases Results:\n';

      for (const testCase of testCases) {
        try {
          const userFunction = new Function(code);
          const result = userFunction(...testCase.input);
          
          const passed = result === testCase.expected;
          testOutput += `Test case ${JSON.stringify(testCase.input)}: ${passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
          if (!passed) {
            testOutput += `Expected: ${testCase.expected}\n`;
            testOutput += `Got: ${result}\n\n`;
            allTestsPassed = false;
          }
        } catch (error) {
          testOutput += `Error: ${error.message}\n`;
          allTestsPassed = false;
        }
      }

      setOutput(testOutput);
      
      if (allTestsPassed) {
        const result = await Swal.fire({
          title: 'Submit Solution?',
          text: 'Your solution passed all test cases. Would you like to submit?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, submit',
          cancelButtonText: 'No, keep editing',
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        if (result.isConfirmed) {
          onSubmit(code);
          localStorage.removeItem(`code_progress_${task.id}`);
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Test Cases Failed',
          text: 'Please check the test results and try again.'
        });
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = async () => {
    const result = await Swal.fire({
      title: 'Reset Code?',
      text: 'This will reset your code to the original template. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setCode('');
      localStorage.removeItem(`code_progress_${task.id}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Problem Description:</h3>
        <p className="text-gray-700">{task.description}</p>
        
        {/* {task.template && (
          <div className="mt-2">
            <h4 className="font-semibold">Template:</h4>
            <pre className="bg-gray-100 p-2 rounded mt-1">{task.template}</pre>
          </div>
        )} */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Code Editor:</h4>
          <MonacoEditor
            height="400px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Live Output:</h4>
          <div className="h-[400px] bg-gray-100 p-4 rounded overflow-auto">
            <pre className="whitespace-pre-wrap">{liveOutput}</pre>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-4">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isRunning ? 'Running...' : 'Submit Solution'}
        </button>
        
        {/* <button
          onClick={handleResetCode}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Reset to Template
        </button> */}
      </div>

      {output && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodingChallenge;