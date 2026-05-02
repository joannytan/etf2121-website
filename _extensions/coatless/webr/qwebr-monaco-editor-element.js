// Global array to store Monaco Editor instances
globalThis.qwebrEditorInstances = [];

function isValidCodeLineNumbers(stringCodeLineNumbers) {
  // Regular expression to match valid input strings
  const regex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
  return regex.test(stringCodeLineNumbers);
}

// Function that builds and registers a Monaco Editor instance    
globalThis.qwebrCreateMonacoEditorInstance = function (cellData) {

  const initialCode = cellData.code;
  const qwebrCounter = cellData.id;
  const qwebrOptions = cellData.options;

  // Retrieve the previously created document elements
  let runButton = document.getElementById(`qwebr-button-run-${qwebrCounter}`);
  let resetButton = document.getElementById(`qwebr-button-reset-${qwebrCounter}`);
  let copyButton = document.getElementById(`qwebr-button-copy-${qwebrCounter}`);
  let editorDiv = document.getElementById(`qwebr-editor-${qwebrCounter}`);

  // Load the Monaco Editor and create an instance
  let editor;
  require(['vs/editor/editor.main'], function () {

    // ── Register custom R tokenizer under a private language ID ──
    // We use 'r-etf2121' instead of 'r' because Monaco 0.47.0 bundles its own
    // R language and lazily loads it when language:'r' is set on the editor,
    // which fires AFTER our setMonarchTokensProvider call and silently wipes it.
    // A custom ID Monaco has never heard of is never lazy-loaded — our tokenizer
    // stays in place permanently. Only register once per page.
    if (!globalThis._qwebrRTokenizerRegistered) {
      globalThis._qwebrRTokenizerRegistered = true;

      monaco.languages.register({ id: 'r-etf2121' });

      monaco.languages.setMonarchTokensProvider('r-etf2121', {
        defaultToken: 'identifier',
        tokenPostfix: '',

        keywords: [
          'if', 'else', 'for', 'while', 'repeat', 'in',
          'next', 'break', 'return', 'function'
        ],

        constants: [
          'TRUE', 'FALSE', 'T', 'F', 'NULL',
          'NA', 'Inf', 'NaN',
          'NA_integer_', 'NA_real_', 'NA_complex_', 'NA_character_'
        ],

        tokenizer: {
          root: [
            // Comments
            [/#.*$/, 'comment'],

            // Strings — double-quoted
            [/"/, { token: 'string', next: '@string_double' }],
            // Strings — single-quoted
            [/'/, { token: 'string', next: '@string_single' }],

            // Numbers: hex, decimal, integer suffix L, imaginary i
            [/0x[0-9A-Fa-f]+[Ll]?/, 'number'],
            [/\d+\.?\d*([eE][+-]?\d+)?[iL]?/, 'number'],
            [/\.\d+([eE][+-]?\d+)?[iL]?/, 'number'],

            // Pipe and special infix operators: |> %>% %in% %*% etc.
            [/\|>/, 'operator'],
            [/%[^%\s]*%/, 'operator'],

            // Assignment and arrow operators
            [/<<-|<-|->|->>/, 'operator'],

            // :: and ::: namespace operators (before identifier rules)
            [/:::?/, 'operator'],

            // $ and @ accessors (type colour)
            [/[$@]/, 'type'],

            // Control-flow keywords followed by ( — keep keyword colour
            // Must come BEFORE the function-call rule
            [/(if|else|for|while|repeat|function|return|next|break|in)(\()/, ['keyword', 'delimiter']],

            // Function calls: use capture groups (not lookahead) so the name
            // and paren are matched together and split into two tokens.
            // Covers: ggplot(  geom_point(  filter(  read_csv(  etc.
            [/([a-zA-Z_.][a-zA-Z0-9_.]*)(\()/, ['predefined', 'delimiter']],

            // Identifiers / keywords / constants NOT followed by (
            [/[a-zA-Z_.][a-zA-Z0-9_.]*/, {
              cases: {
                '@keywords':  'keyword',
                '@constants': 'constant',
                '@default':   'identifier'
              }
            }],

            // Arithmetic and comparison operators
            [/[+\-*\/^]/, 'operator'],
            [/[=!<>]=?/, 'operator'],
            [/[&|!~]/, 'operator'],
            [/:/, 'operator'],

            // Remaining brackets and delimiters
            [/[()[\]{}]/, 'delimiter'],
            [/[,;]/, 'delimiter'],

            // Whitespace
            [/\s+/, 'white']
          ],

          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, { token: 'string', next: '@pop' }]
          ],

          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, { token: 'string', next: '@pop' }]
          ]
        }
      });
    }

    // Define Dracula-inspired theme for ETF2121
    monaco.editor.defineTheme('dracula-etf2121', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // ── keywords: if else for while function return … ──
        { token: 'keyword',          foreground: 'ff79c6', fontStyle: 'bold'   },
        { token: 'keyword.r',        foreground: 'ff79c6', fontStyle: 'bold'   },

        // ── strings ──
        { token: 'string',           foreground: 'f1fa8c'                      },
        { token: 'string.r',         foreground: 'f1fa8c'                      },
        { token: 'string.escape',    foreground: 'f1fa8c'                      },
        { token: 'string.escape.r',  foreground: 'f1fa8c'                      },

        // ── numbers ──
        { token: 'number',           foreground: 'bd93f9'                      },
        { token: 'number.r',         foreground: 'bd93f9'                      },

        // ── comments ──
        { token: 'comment',          foreground: '6272a4', fontStyle: 'italic' },
        { token: 'comment.r',        foreground: '6272a4', fontStyle: 'italic' },

        // ── operators: <- |> %in% + == … ──
        { token: 'operator',         foreground: 'ff79c6'                      },
        { token: 'operator.r',       foreground: 'ff79c6'                      },

        // ── constants: TRUE FALSE NULL NA Inf NaN ──
        { token: 'constant',         foreground: 'ffb86c'                      },
        { token: 'constant.r',       foreground: 'ffb86c'                      },

        // ── function calls: filter() mutate() ggplot() … ──
        { token: 'predefined',       foreground: '50fa7b'                      },
        { token: 'predefined.r',     foreground: '50fa7b'                      },

        // ── $ and @ accessors ──
        { token: 'type',             foreground: '8be9fd'                      },
        { token: 'type.r',           foreground: '8be9fd'                      },

        // ── plain identifiers / variables ──
        { token: 'identifier',       foreground: 'f8f8f2'                      },
        { token: 'identifier.r',     foreground: 'f8f8f2'                      },

        // ── brackets and punctuation ──
        { token: 'delimiter',        foreground: 'f8f8f2'                      },
        { token: 'delimiter.r',      foreground: 'f8f8f2'                      },

        // ── fallback ──
        { token: '',                 foreground: 'f8f8f2'                      }
      ],
      colors: {
        'editor.background':           '#0f172a',
        'editor.foreground':           '#f8f8f2',
        'editor.lineHighlightBackground': '#1e2a3a',
        'editorLineNumber.foreground': '#6272a4',
        'editorCursor.foreground':     '#f8f8f2',
        'editor.selectionBackground':  '#44475a',
        'editor.inactiveSelectionBackground': '#2d3748',
        'editorWhitespace.foreground': '#3d4f5c',
        'editorIndentGuide.background': '#3d4f5c',
        'editorBracketMatch.background': '#44475a',
        'editorBracketMatch.border':   '#f8f8f2'
      }
    });

    editor = monaco.editor.create(editorDiv, {
      value: initialCode,
      language: 'r-etf2121',
      theme: 'dracula-etf2121',
      automaticLayout: true,           // Works wonderfully with RevealJS
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false
      },
      fontSize: qwebrScaledFontSize(editorDiv, qwebrOptions),         
      renderLineHighlight: "none",      // Disable current line highlighting
      hideCursorInOverviewRuler: true,  // Remove cursor indictor in right hand side scroll bar
      readOnly: qwebrOptions['read-only'] ?? false,
      quickSuggestions: qwebrOptions['editor-quick-suggestions'] ?? false,
      wordWrap: (qwebrOptions['editor-word-wrap'] == 'true' ? "on" : "off")
    });

    // Store the official counter ID to be used in keyboard shortcuts
    editor.__qwebrCounter = qwebrCounter;

    // Store the official div container ID
    editor.__qwebrEditorId = `qwebr-editor-${qwebrCounter}`;

    // Store the initial code value and options
    editor.__qwebrinitialCode = initialCode;
    editor.__qwebrOptions = qwebrOptions;

    // Set at the model level the preferred end of line (EOL) character to LF.
    // This prevent `\r\n` from being given to the webR engine if the user is on Windows.
    // See details in: https://github.com/coatless/quarto-webr/issues/94
    // Associated error text: 
    // Error: <text>:1:7 unexpected input

    // Retrieve the underlying model
    const model = editor.getModel();
    // Set EOL for the model
    model.setEOL(monaco.editor.EndOfLineSequence.LF);
    
    // Dynamically modify the height of the editor window if new lines are added.
    let ignoreEvent = false;
    const updateHeight = () => {
      // Increment editor height by 2 to prevent vertical scroll bar from appearing
      const contentHeight = editor.getContentHeight() + 2;

      // Retrieve editor-max-height option
      const maxEditorHeight = qwebrOptions['editor-max-height'];

      // If editor-max-height is missing, allow infinite growth. Otherwise, threshold.
      const editorHeight = !maxEditorHeight ?  contentHeight : Math.min(contentHeight, maxEditorHeight);

      // We're avoiding a width change
      //editorDiv.style.width = `${width}px`;
      editorDiv.style.height = `${editorHeight}px`;
      try {
        ignoreEvent = true;

        // The key to resizing is this call
        editor.layout();
      } finally {
        ignoreEvent = false;
      }
    };

    // Function to generate decorations to highlight lines
    // in the editor based on input string.
    function decoratorHighlightLines(codeLineNumbers) {
      // Store the lines to be lighlight
      let linesToHighlight = [];
      
      // Parse the codeLineNumbers string to get the line numbers to highlight
      // First, split the string by commas
      codeLineNumbers.split(',').forEach(part => {
        // Check if we have a range of lines
        if (part.includes('-')) {
            // Handle range of lines (e.g., "6-8")
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                linesToHighlight.push(i);
            }
        } else {
            // Handle single line (e.g., "7")
            linesToHighlight.push(Number(part));
        }
      });
  
      // Create monaco decorations for the lines to highlight
      const decorations = linesToHighlight.map(lineNumber => ({
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: {
              isWholeLine: true,
              className: 'qwebr-editor-highlight-line'
          }
      }));
  
      // Return decorations to be applied to the editor
      return decorations;
    }

    // Ensure that the editor-code-line-numbers option is set and valid
    // then apply styling
    if (qwebrOptions['editor-code-line-numbers']) {
      // Remove all whitespace from the string
      const codeLineNumbers = qwebrOptions['editor-code-line-numbers'].replace(/\s/g,'');
      // Check if the string is valid for line numbers, e.g., "1,3-5,7"
      if (isValidCodeLineNumbers(codeLineNumbers)) {
        // Apply the decorations to the editor
        editor.createDecorationsCollection(decoratorHighlightLines(codeLineNumbers));
      } else {
        // Warn the user that the input is invalid
        console.warn(`Invalid "editor-code-line-numbers" value in code cell ${qwebrOptions['label']}: ${codeLineNumbers}`);
      }
    }

    // Helper function to check if selected text is empty
    function isEmptyCodeText(selectedCodeText) {
      return (selectedCodeText === null || selectedCodeText === undefined || selectedCodeText === "");
    }

    // Registry of keyboard shortcuts that should be re-added to each editor window
    // when focus changes.
    const addWebRKeyboardShortCutCommands = () => {
      // Add a keydown event listener for Shift+Enter to run all code in cell
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {

        // Retrieve all text inside the editor
        qwebrExecuteCode(editor.getValue(), editor.__qwebrCounter, editor.__qwebrOptions);
      });

      // Add a keydown event listener for CMD/Ctrl+Enter to run selected code
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {

        // Get the selected text from the editor
        const selectedText = editor.getModel().getValueInRange(editor.getSelection());
        // Check if no code is selected
        if (isEmptyCodeText(selectedText)) {
          // Obtain the current cursor position
          let currentPosition = editor.getPosition();
          // Retrieve the current line content
          let currentLine = editor.getModel().getLineContent(currentPosition.lineNumber);

          // Propose a new position to move the cursor to
          let newPosition = new monaco.Position(currentPosition.lineNumber + 1, 1);

          // Check if the new position is beyond the last line of the editor
          if (newPosition.lineNumber > editor.getModel().getLineCount()) {
            // Add a new line at the end of the editor
            editor.executeEdits("addNewLine", [{
            range: new monaco.Range(newPosition.lineNumber, 1, newPosition.lineNumber, 1),
            text: "\n", 
            forceMoveMarkers: true,
            }]);
          }
          
          // Run the entire line of code.
          qwebrExecuteCode(currentLine, editor.__qwebrCounter, editor.__qwebrOptions);

          // Move cursor to new position
          editor.setPosition(newPosition);
        } else {
          // Code to run when Ctrl+Enter is pressed with selected code
          qwebrExecuteCode(selectedText, editor.__qwebrCounter, editor.__qwebrOptions);
        }
      });
    }

    // Register an on focus event handler for when a code cell is selected to update
    // what keyboard shortcut commands should work.
    // This is a workaround to fix a regression that happened with multiple
    // editor windows since Monaco 0.32.0 
    // https://github.com/microsoft/monaco-editor/issues/2947
    editor.onDidFocusEditorText(addWebRKeyboardShortCutCommands);

    // Register an on change event for when new code is added to the editor window
    editor.onDidContentSizeChange(updateHeight);

    // Manually re-update height to account for the content we inserted into the call
    updateHeight();

    // Store the editor instance in the global dictionary
    qwebrEditorInstances[editor.__qwebrCounter] = editor;

  });

  // Add a click event listener to the run button
  runButton.onclick = function () {
    qwebrExecuteCode(editor.getValue(), editor.__qwebrCounter, editor.__qwebrOptions);
  };

  // Add a click event listener to the reset button
  copyButton.onclick = function () {
    // Retrieve current code data
    const data = editor.getValue();
    
    // Write code data onto the clipboard.
    navigator.clipboard.writeText(data || "");
  };
  
  // Add a click event listener to the copy button
  resetButton.onclick = function () {
    editor.setValue(editor.__qwebrinitialCode);
  };
  
}