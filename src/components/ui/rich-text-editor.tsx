'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikethroughIcon, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Undo, Redo } from 'lucide-react'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Image from '@tiptap/extension-image'
import Text from '@tiptap/extension-text'
import { Heading } from '@tiptap/extension-heading'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  editable = true 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Text,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editable,
  })

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  const setImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-1 border border-gray-200 rounded-lg p-1">
      {children}
    </div>
  )

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children 
  }: { 
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
      type="button"
    >
      {children}
    </button>
  )

  if (!editable) {
    return (
      <div className="prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    )
  }


  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
          <ButtonGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <BoldIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <ItalicIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
            >
              <StrikethroughIcon className="w-4 h-4" />
            </ToolbarButton>
          </ButtonGroup>

          <ButtonGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
            >
              H3
            </ToolbarButton>
          </ButtonGroup>

          <ButtonGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List className="w-4 h-4 mr-2" />
              Bullet List
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered className="w-4 h-4 mr-2" />
              Numbered List
            </ToolbarButton>
          </ButtonGroup>

          <ButtonGroup>
            <ToolbarButton onClick={setLink}>
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={setImage}>
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </ButtonGroup>

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </ToolbarButton>
        </div>
      )}

      {/* Editor */}
      <EditorContent 
        editor={editor}
        className="min-h-[200px] p-4 prose prose-sm max-w-none focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}