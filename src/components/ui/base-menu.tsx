import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipos base para componentes de menu
export interface BaseMenuItemProps {
  className?: string
  inset?: boolean
  children?: React.ReactNode
}

export interface BaseMenuCheckboxItemProps {
  className?: string
  children?: React.ReactNode
  checked?: boolean
}

export interface BaseMenuRadioItemProps {
  className?: string
  children?: React.ReactNode
}

export interface BaseMenuLabelProps {
  className?: string
  inset?: boolean
}

export interface BaseMenuSeparatorProps {
  className?: string
}

export interface BaseMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string
}

// Classes CSS compartilhadas
export const menuClasses = {
  // Conteúdo base dos menus
  content: "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  
  // SubContent (mesmo estilo do content)
  subContent: "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  
  // Item base
  item: "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  
  // SubTrigger
  subTrigger: "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
  
  // CheckboxItem e RadioItem
  checkboxRadioItem: "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  
  // Label
  label: "px-2 py-1.5 text-sm font-semibold",
  
  // Separator
  separator: "-mx-1 my-1 h-px",
  
  // Shortcut
  shortcut: "ml-auto text-xs tracking-widest opacity-60",
  
  // Indicator container
  indicatorContainer: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
}

// Componentes base reutilizáveis
export const BaseMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  BaseMenuItemProps & { onClick?: () => void }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      menuClasses.subTrigger,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </div>
))
BaseMenuSubTrigger.displayName = "BaseMenuSubTrigger"

export const BaseMenuItem = React.forwardRef<
  HTMLDivElement,
  BaseMenuItemProps & { onClick?: () => void }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      menuClasses.item,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
BaseMenuItem.displayName = "BaseMenuItem"

export const BaseMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  BaseMenuCheckboxItemProps & { onClick?: () => void }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(menuClasses.checkboxRadioItem, className)}
    {...props}
  >
    <span className={menuClasses.indicatorContainer}>
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
))
BaseMenuCheckboxItem.displayName = "BaseMenuCheckboxItem"

export const BaseMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  BaseMenuRadioItemProps & { onClick?: () => void; checked?: boolean }
>(({ className, children, checked, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(menuClasses.checkboxRadioItem, className)}
    {...props}
  >
    <span className={menuClasses.indicatorContainer}>
      {checked && <Circle className="h-2 w-2 fill-current" />}
    </span>
    {children}
  </div>
))
BaseMenuRadioItem.displayName = "BaseMenuRadioItem"

export const BaseMenuLabel = React.forwardRef<
  HTMLDivElement,
  BaseMenuLabelProps & { children?: React.ReactNode }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      menuClasses.label,
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
BaseMenuLabel.displayName = "BaseMenuLabel"

export const BaseMenuSeparator = React.forwardRef<
  HTMLDivElement,
  BaseMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(menuClasses.separator, "bg-muted", className)}
    {...props}
  />
))
BaseMenuSeparator.displayName = "BaseMenuSeparator"

export const BaseMenuShortcut = ({
  className,
  ...props
}: BaseMenuShortcutProps) => {
  return (
    <span
      className={cn(menuClasses.shortcut, className)}
      {...props}
    />
  )
}
BaseMenuShortcut.displayName = "BaseMenuShortcut"

// Função utilitária para criar variações de separador
export const createMenuSeparator = (bgClass: string = "bg-muted") => 
  React.forwardRef<HTMLDivElement, BaseMenuSeparatorProps>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(menuClasses.separator, bgClass, className)}
        {...props}
      />
    )
  )

// Função utilitária para criar variações de label
export const createMenuLabel = (additionalClasses?: string) => 
  React.forwardRef<HTMLDivElement, BaseMenuLabelProps & { children?: React.ReactNode }>(
    ({ className, inset, children, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          menuClasses.label,
          additionalClasses,
          inset && "pl-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  )