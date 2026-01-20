"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    setInputValue("")
    if (selected.includes(item)) {
      handleUnselect(item)
    } else {
      onChange([...selected, item])
    }
  }

  const selectedOptions = selected
    .map((id) => options.find((opt) => opt.value === id))
    .filter((opt): opt is Option => !!opt)

  const selectables = options.filter(
    (option) => !selected.includes(option.value)
  )

  return (
    <Command
      onKeyDown={(e: any) => {
        if (e.key === "Backspace" && !inputValue) {
          e.preventDefault()
          if (selected.length > 0) {
            handleUnselect(selected[selected.length - 1])
          }
        }
        if (e.key === "Escape") {
          inputRef.current?.blur()
        }
      }}
      className="overflow-visible bg-transparent"
    >
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option.value)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option.value)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {/* Avoid filtering command input by handling filtering manually if needed, 
              but standard CommandInput filters automatically based on children CommandItems. 
              We use CommandPrimitive.Input to avoid the default search icon styling issues if mismatched. 
          */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto max-h-60">
                {selectables
                  .filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e: any) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onSelect={() => {
                        console.log("Selected:", option.value); // Debug
                        handleSelect(option.value)
                    }}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </CommandItem>
                ))}
                {selectables.length === 0 && (
                     <p className="p-2 text-sm text-gray-500">No more items.</p>
                )}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
