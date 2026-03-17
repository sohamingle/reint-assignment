import { WindIcon } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WindIcon className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          Wind Power Forecast
        </h1>
      </div>
      <ThemeToggle />
    </header>
  )
}

export default Header
