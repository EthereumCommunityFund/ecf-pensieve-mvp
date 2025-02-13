'use client'
import { Button } from '@heroui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
export default function Page() {
  return (
    <div className="p-4">
      <Button color="primary">Primary Button</Button>
      <div className="bg-blue-500 text-white p-4 rounded-lg mt-4">
        This div should have a blue background if Tailwind is working
      </div>
      <ConnectButton />
    </div>
  )
}
