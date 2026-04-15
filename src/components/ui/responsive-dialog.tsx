import * as React from "react"
import { Drawer } from "vaul"
import { useBreakpoint } from "@/hooks/useBreakpoint"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

/**
 * ResponsiveDialog: renders a centered Dialog on desktop/tablet,
 * and a bottom-sheet Drawer on mobile.
 */
export function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const { isMobile } = useBreakpoint()

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-2xl bg-background">
            <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted-foreground/20" />
            <div className="overflow-y-auto p-4 pb-[calc(1rem+var(--sab))]">
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Convenience sub-components for consistent usage
export function ResponsiveDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile } = useBreakpoint()
  if (isMobile) {
    return <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
  }
  return <DialogHeader className={className} {...props} />
}

export function ResponsiveDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { isMobile } = useBreakpoint()
  if (isMobile) {
    return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  }
  return <DialogTitle className={className} {...props} />
}

export function ResponsiveDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { isMobile } = useBreakpoint()
  if (isMobile) {
    return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  }
  return <DialogDescription className={className} {...props} />
}

export function ResponsiveDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isMobile } = useBreakpoint()
  if (isMobile) {
    return <div className={cn("flex flex-col gap-2 mt-4", className)} {...props} />
  }
  return <DialogFooter className={className} {...props} />
}
