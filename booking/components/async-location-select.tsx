"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchLocations } from "@/lib/actions"



interface Location {
  value: string
  label: string
}

interface AsyncLocationSelectProps {
  id: string
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
}

export function AsyncLocationSelect({
  id,
  value,
  onChange,
  placeholder = "Select location",
}: AsyncLocationSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [allLocations, setAllLocations] = useState<Location[]>([])

  // Find and set the label when value changes
  useEffect(() => {
    if (value) {
      const location = allLocations.find((loc) => loc.value === value)
      if (location) {
        setSelectedLabel(location.label)
      }
    } else {
      setSelectedLabel(null)
    }
  }, [value])

  useEffect(() => {
    // Don't load anything initially, wait for user input
    if (!searchQuery) {
      setFilteredLocations([])
      return
    }

    // Simulate API call with loading state
    (async () => {
      setIsLoading(true)
      const results = await searchLocations(searchQuery)
      setFilteredLocations(results.filter((location) => location.label))
      setAllLocations(results)
      setIsLoading(false)
    }
    )()
    
    
    
  }, [searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50"
          id={id}
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 shadow-lg">
        <Command className="w-full">
          <CommandInput placeholder="Search location..." value={searchQuery} onValueChange={setSearchQuery} />
          <CommandList>
            {isLoading && (
              <CommandLoading>
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching locations...</span>
                </div>
              </CommandLoading>
            )}

            {!isLoading && searchQuery && filteredLocations.length === 0 && (
              <CommandEmpty>No locations found.</CommandEmpty>
            )}

            {!searchQuery && !isLoading && (
              <CommandLoading>
                <div className="py-6 text-center text-sm text-muted-foreground">Type to search for locations</div>
              </CommandLoading>
            )}

            {filteredLocations.length > 0 && (
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue)
                      setSelectedLabel(location.label)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === location.value ? "opacity-100" : "opacity-0")} />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

