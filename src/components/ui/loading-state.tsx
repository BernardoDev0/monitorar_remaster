import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

/**
 * Componentes compartilhados para estados de loading
 * Elimina duplicação de spinners e estados de carregamento
 */

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface LoadingStateProps {
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export interface PageLoadingProps {
  title?: string
  description?: string
  className?: string
}

export interface InlineLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Spinner básico reutilizável
export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12'
    }
    
    return (
      <div ref={ref} className={cn("flex items-center justify-center", className)}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Componente condicional de loading
export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ loading, children, fallback, className }, ref) => {
    if (loading) {
      return (
        <div ref={ref} className={className}>
          {fallback || <LoadingSpinner />}
        </div>
      )
    }
    
    return <>{children}</>
  }
)
LoadingState.displayName = "LoadingState"

// Loading para páginas inteiras (padrão usado em Dashboard, Login, etc.)
export const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ title = "Carregando...", description, className }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "min-h-screen bg-background flex items-center justify-center",
          className
        )}
      >
        <div className="text-center space-y-4">
          <LoadingSpinner size="xl" />
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
    )
  }
)
PageLoading.displayName = "PageLoading"

// Loading inline (para botões, cards, etc.)
export const InlineLoading = React.forwardRef<HTMLDivElement, InlineLoadingProps>(
  ({ text = "Carregando...", size = 'sm', className }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn("flex items-center gap-2 text-muted-foreground", className)}
      >
        <LoadingSpinner size={size} />
        <span className="text-sm">{text}</span>
      </div>
    )
  }
)
InlineLoading.displayName = "InlineLoading"

// Loading para cards/seções
export const CardLoading = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "flex items-center justify-center p-8 bg-card rounded-lg border",
          className
        )}
      >
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }
)
CardLoading.displayName = "CardLoading"

// Loading para tabelas
export const TableLoading = React.forwardRef<HTMLDivElement, { 
  rows?: number
  columns?: number
  className?: string 
}>(
  ({ rows = 5, columns = 4, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="h-4 bg-muted rounded animate-pulse flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    )
  }
)
TableLoading.displayName = "TableLoading"

// Skeleton loading para diferentes tipos de conteúdo
export const SkeletonLoading = {
  // Texto
  Text: React.forwardRef<HTMLDivElement, { 
    lines?: number
    className?: string 
  }>(({ lines = 3, className }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            index === lines - 1 && "w-3/4" // Última linha menor
          )}
        />
      ))}
    </div>
  )),
  
  // Card
  Card: React.forwardRef<HTMLDivElement, { className?: string }>(
    ({ className }, ref) => (
      <div 
        ref={ref} 
        className={cn(
          "p-6 bg-card rounded-lg border space-y-4",
          className
        )}
      >
        <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        </div>
      </div>
    )
  ),
  
  // Avatar
  Avatar: React.forwardRef<HTMLDivElement, { 
    size?: 'sm' | 'md' | 'lg'
    className?: string 
  }>(({ size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16'
    }
    
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-muted rounded-full animate-pulse",
          sizeClasses[size],
          className
        )}
      />
    )
  }),
  
  // Botão
  Button: React.forwardRef<HTMLDivElement, { 
    size?: 'sm' | 'md' | 'lg'
    className?: string 
  }>(({ size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-20',
      md: 'h-10 w-24',
      lg: 'h-12 w-32'
    }
    
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-muted rounded animate-pulse",
          sizeClasses[size],
          className
        )}
      />
    )
  })
}

// Hook para gerenciar estados de loading
export function useLoading(initialState: boolean = false) {
  const [loading, setLoading] = React.useState(initialState)
  const [error, setError] = React.useState<string | null>(null)
  
  const startLoading = React.useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])
  
  const stopLoading = React.useCallback(() => {
    setLoading(false)
  }, [])
  
  const setLoadingError = React.useCallback((errorMessage: string) => {
    setLoading(false)
    setError(errorMessage)
  }, [])
  
  const withLoading = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      startLoading()
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setLoadingError(errorMessage)
      return null
    }
  }, [startLoading, stopLoading, setLoadingError])
  
  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading
  }
}

// Componente de erro para quando o loading falha
export const LoadingError = React.forwardRef<HTMLDivElement, {
  error: string
  onRetry?: () => void
  className?: string
}>(
  ({ error, onRetry, className }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "text-center p-6 space-y-4",
          className
        )}
      >
        <div className="text-destructive">
          <p className="font-medium">Erro ao carregar</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary hover:underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }
)
LoadingError.displayName = "LoadingError"