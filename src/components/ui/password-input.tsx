"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

function PasswordInput(props: React.ComponentProps<"input">) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup className="h-auto rounded-xl">
      <InputGroupInput
        {...props}
        type={isVisible ? "text" : "password"}
        className="h-12 rounded-xl text-base"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={isVisible ? "Hide password" : "Show password"}
          size="icon-xs"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeIcon /> : <EyeOffIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
