'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Monitor, Smartphone } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { user, logout: contextLogout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (logoutType: 'current' | 'all') => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoutType }),
      })

      if (response.ok) {
        await contextLogout()
        toast.success(
          logoutType === 'all'
            ? 'Logged out from all devices successfully'
            : 'Logged out successfully'
        )
        onClose()
        router.push('/login')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Network error during logout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleRelogin = () => {
    onClose()
    // The modal will close and user can login again
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Logout Options
          </DialogTitle>
          <DialogDescription>
            Choose how you want to logout from your account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLogout('current')}
              disabled={isLoggingOut}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Logout from this device only
              <span className="ml-auto text-xs text-muted-foreground">
                Keep other sessions active
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLogout('all')}
              disabled={isLoggingOut}
            >
              <Monitor className="mr-2 h-4 w-4" />
              Logout from all devices
              <span className="ml-auto text-xs text-muted-foreground">
                End all active sessions
              </span>
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Want to switch accounts or login again?
            </p>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleRelogin}
              disabled={isLoggingOut}
            >
              Stay logged in and close
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoggingOut}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}