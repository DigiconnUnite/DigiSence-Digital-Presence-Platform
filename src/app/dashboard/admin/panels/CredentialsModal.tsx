'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  credentials: {
    email: string
    password: string
    name?: string
    type?: 'business' | 'professional'
  } | null
}

/**
 * FIXED: Previously generated credentials were shown in a toast notification.
 * Toast auto-dismisses in 5s and overflows for long passwords — admins were
 * missing or losing credentials.
 *
 * This modal shows credentials with individual copy buttons and a persistent
 * warning that these won't be shown again.
 */
export default function CredentialsModal({ isOpen, onClose, credentials }: CredentialsModalProps) {
  const { toast } = useToast()
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!credentials) return null

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'email') {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' })
    }
  }

  const copyBoth = async () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Credentials copied!', description: 'Both email and password copied to clipboard.' })
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            {credentials.type === 'professional' ? 'Professional' : 'Business'} Account Created
          </DialogTitle>
          <DialogDescription>
            {credentials.name && <span className="font-medium">{credentials.name}</span>}
            {credentials.name && ' — '}
            Share these credentials with the account holder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>Save these credentials now.</strong> The password will not be shown again after closing this dialog.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Email Address</Label>
            <div className="flex gap-2">
              <Input value={credentials.email} readOnly className="font-mono text-sm bg-gray-50" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(credentials.email, 'email')}
                className="shrink-0"
                aria-label="Copy email to clipboard"
              >
                {copiedEmail ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={credentials.password}
                  readOnly
                  type={showPassword ? 'text' : 'password'}
                  className="font-mono text-sm bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="shrink-0"
                aria-label="Copy password to clipboard"
              >
                {copiedPassword ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Copy Both Button */}
          <Button onClick={copyBoth} className="w-full rounded-lg bg-slate-800 text-white hover:bg-slate-700">
            <Copy className="h-4 w-4 mr-2" />
            Copy Both to Clipboard
          </Button>

          <Button variant="outline" onClick={onClose} className="w-full rounded-lg">
            Done — I've saved the credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
