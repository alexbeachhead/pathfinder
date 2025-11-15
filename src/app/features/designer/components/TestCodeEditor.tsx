'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Copy, Download, Edit3, Check } from 'lucide-react';

interface TestCodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  onSave?: (code: string) => void;
  readOnly?: boolean;
  language?: string;
}

export function TestCodeEditor({
  code,
  onChange,
  onSave,
  readOnly = false,
  language = 'typescript',
}: TestCodeEditorProps) {
  const { themeId } = useTheme();
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [currentCode, setCurrentCode] = useState(code);
  const [copied, setCopied] = useState(false);

  const fileExtension = language === 'javascript' ? 'js' : 'ts';
  const displayLanguage = language === 'javascript' ? 'JavaScript' : 'TypeScript';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silently handle clipboard errors
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test.spec.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(currentCode);
    }
    setIsEditing(false);
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCurrentCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title="Generated Test Code"
        subtitle={`Playwright ${displayLanguage} test suite`}
        icon={<Edit3 className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-2">
            {!readOnly && (
              <ThemedButton
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'View Only' : 'Edit'}
              </ThemedButton>
            )}
            <ThemedButton
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </ThemedButton>
            <ThemedButton
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download
            </ThemedButton>
          </div>
        }
      />
      <ThemedCardContent>
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--theme-border)' }}>
          <Editor
            height="600px"
            language={language}
            value={currentCode}
            onChange={handleEditorChange}
            theme={themeId === 'cyber' || themeId === 'crimson' || themeId === 'slate' ? 'vs-dark' : 'vs-light'}
            options={{
              readOnly: !isEditing,
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              // Disable all linting and validation
              'semanticHighlighting.enabled': false,
              quickSuggestions: false,
              parameterHints: { enabled: false },
              suggestOnTriggerCharacters: false,
              acceptSuggestionOnEnter: 'off',
              tabCompletion: 'off',
              wordBasedSuggestions: 'off',
            }}
            beforeMount={(monaco) => {
              // Disable TypeScript diagnostics for both TS and JS
              const diagnosticsOptions = {
                noSemanticValidation: true,
                noSyntaxValidation: true,
                noSuggestionDiagnostics: true,
              };
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
              monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(diagnosticsOptions);
            }}
          />
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
