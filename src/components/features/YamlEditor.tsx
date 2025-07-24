import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from '@/hooks'
import { cn } from '@/utils'

export interface YamlEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string | number
  readOnly?: boolean
  className?: string
  onValidationChange?: (isValid: boolean, errors: any[]) => void
}

export function YamlEditor({
  value,
  onChange,
  height = 400,
  readOnly = false,
  className,
  onValidationChange
}: YamlEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // 配置YAML语言支持
    monaco.languages.setMonarchTokensProvider('yaml', {
      tokenizer: {
        root: [
          [/^(\s*)([\w\-_]+)(\s*)(:)/, ['', 'key', '', 'delimiter']],
          [/^\s*-/, 'bullet'],
          [/#.*$/, 'comment'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\btrue\b|\bfalse\b/, 'boolean'],
          [/\b\d+\b/, 'number'],
        ]
      }
    })
    
    // 设置主题
    monaco.editor.defineTheme('yaml-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'key', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'boolean', foreground: '569CD6' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'bullet', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
      }
    })
    
    monaco.editor.defineTheme('yaml-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'key', foreground: '0451A5' },
        { token: 'string', foreground: 'A31515' },
        { token: 'boolean', foreground: '0000FF' },
        { token: 'number', foreground: '098658' },
        { token: 'comment', foreground: '008000' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'bullet', foreground: '795E26' },
      ]
    })
  }
  
  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
      
      // 简单的YAML验证
      if (onValidationChange) {
        try {
          // 这里可以集成js-yaml进行验证
          const yaml = require('js-yaml')
          yaml.load(newValue)
          onValidationChange(true, [])
        } catch (error: any) {
          onValidationChange(false, [{ message: error.message }])
        }
      }
    }
  }
  
  const editorTheme = theme === 'dark' ? 'yaml-dark' : 'yaml-light'
  
  return (
    <div className={cn('border rounded-md overflow-hidden', className)}>
      <Editor
        height={height}
        defaultLanguage="yaml"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'selection',
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  )
}
